const db = require("../config/db");
const promiseDb = db.promise();

exports.crearFactura = async (req, res) => {
    const { id_paciente, id_consulta, detalles, metodo_pago, estado } = req.body;
    let { subtotal, impuestos, total, numero_factura } = req.body;

    subtotal = parseFloat(subtotal) || 0;
    impuestos = parseFloat(impuestos) || 0;
    total = parseFloat(total) || 0;

    if (!id_paciente || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ message: "Falta id_paciente o detalles de la factura." });
    }

    try {
        await promiseDb.beginTransaction();

        let calcSubtotal = 0;
        const detallesToInsert = [];

        for (const det of detalles) {
            if (!det.descripcion || !det.cantidad || det.precio_unitario === undefined) {
                await promiseDb.rollback();
                return res.status(400).json({ message: "Detalles incompletos (requiere descripcion, cantidad, precio_unitario)." });
            }
            const detSubtotal = det.cantidad * parseFloat(det.precio_unitario);
            calcSubtotal += detSubtotal;
            detallesToInsert.push({ ...det, subtotal: detSubtotal });
        }

        // Validación de montos
        if (Math.abs(calcSubtotal - subtotal) > 0.05) {
            await promiseDb.rollback();
            return res.status(400).json({ message: "El subtotal provisto no coincide con la sumatoria de los detalles." });
        }

        const calcTotal = calcSubtotal + impuestos;
        if (Math.abs(calcTotal - total) > 0.05) {
            await promiseDb.rollback();
            return res.status(400).json({ message: "El total provisto no coincide con el subtotal + impuestos." });
        }

        // Generar número correlativo si no viene provisto
        if (!numero_factura) {
            numero_factura = `FAC-${Date.now()}`;
        }

        // Insertar la cabecera
        const queryFactura = `
            INSERT INTO factura (id_paciente, id_consulta, numero_factura, subtotal, impuestos, total, metodo_pago, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [resultFactura] = await promiseDb.query(queryFactura, [
            id_paciente,
            id_consulta || null,
            numero_factura,
            calcSubtotal,
            impuestos,
            calcTotal,
            metodo_pago || 'Pendiente',
            estado || 'Pendiente'
        ]);

        const id_factura = resultFactura.insertId;

        // Insertar los items
        const queryDetalle = `
            INSERT INTO factura_detalle (id_factura, descripcion, cantidad, precio_unitario, subtotal)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        for (const det of detallesToInsert) {
            await promiseDb.query(queryDetalle, [
                id_factura,
                det.descripcion,
                det.cantidad,
                det.precio_unitario,
                det.subtotal
            ]);
        }

        await promiseDb.commit();
        res.status(201).json({ 
            message: "Factura creada exitosamente", 
            id_factura: id_factura,
            numero_factura: numero_factura 
        });

    } catch (error) {
        await promiseDb.rollback();
        console.error("Error transaccional al crear factura:", error);
        res.status(500).json({ message: "Error interno al crear factura", error: error.message });
    }
};

exports.obtenerFacturas = async (req, res) => {
    try {
        const { id_paciente, estado } = req.query;
        let query = `
            SELECT f.*, p.nombre, p.apellido 
            FROM factura f 
            JOIN paciente p ON f.id_paciente = p.id_paciente 
            WHERE 1=1
        `;
        const queryParams = [];

        if (id_paciente) {
            query += " AND f.id_paciente = ?";
            queryParams.push(id_paciente);
        }

        if (estado) {
            query += " AND f.estado = ?";
            queryParams.push(estado);
        }

        query += " ORDER BY f.fecha_emision DESC";

        const [results] = await promiseDb.query(query, queryParams);
        res.json(results);
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        res.status(500).json({ message: "Error al obtener facturas", error: error.message });
    }
};

exports.obtenerFacturaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const queryFactura = `
            SELECT f.*, p.nombre, p.apellido, p.telefono, p.direccion 
            FROM factura f 
            JOIN paciente p ON f.id_paciente = p.id_paciente 
            WHERE f.id_factura = ?
        `;
        const [facturas] = await promiseDb.query(queryFactura, [id]);

        if (facturas.length === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        const facturaInfo = facturas[0];

        const queryDetalles = "SELECT * FROM factura_detalle WHERE id_factura = ?";
        const [detalles] = await promiseDb.query(queryDetalles, [id]);

        facturaInfo.detalles = detalles;

        res.json(facturaInfo);
    } catch (error) {
        console.error("Error al obtener factura:", error);
        res.status(500).json({ message: "Error al obtener factura", error: error.message });
    }
};

exports.actualizarEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ message: "Se requiere el nuevo estado" });
    }

    try {
        const query = "UPDATE factura SET estado = ? WHERE id_factura = ?";
        const [result] = await promiseDb.query(query, [estado, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        res.json({ message: "Estado de factura actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar factura:", error);
        res.status(500).json({ message: "Error al actualizar factura", error: error.message });
    }
};

exports.eliminarFactura = async (req, res) => {
    const { id } = req.params;

    try {
        const query = "DELETE FROM factura WHERE id_factura = ?";
        const [result] = await promiseDb.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        res.json({ message: "Factura anulada/eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar factura:", error);
        res.status(500).json({ message: "Error al eliminar factura", error: error.message });
    }
};
