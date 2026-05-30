const db = require("../config/db");
const promiseDb = db.promise();

const ESTADOS_VALIDOS = ['Pagada', 'Pendiente', 'Cancelada'];
const METODOS_PAGO_VALIDOS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Pendiente'];

const ajustarStockFactura = async (idFactura, operacion) => {
    const [items] = await promiseDb.query(`
        SELECT id_medicamento, SUM(cantidad) AS cantidad
        FROM factura_detalle
        WHERE id_factura = ? AND id_medicamento IS NOT NULL
        GROUP BY id_medicamento
    `, [idFactura]);

    for (const item of items) {
        if (operacion === 'devolver') {
            await promiseDb.query(
                'UPDATE medicamento SET stock = stock + ? WHERE id_medicamento = ?',
                [item.cantidad, item.id_medicamento]
            );
            continue;
        }

        const [result] = await promiseDb.query(
            'UPDATE medicamento SET stock = stock - ? WHERE id_medicamento = ? AND stock >= ?',
            [item.cantidad, item.id_medicamento, item.cantidad]
        );
        if (result.affectedRows === 0) {
            throw new Error('Stock insuficiente para volver a activar la factura');
        }
    }
};

exports.crearFactura = async (req, res) => {
    const { id_paciente, id_consulta, detalles, metodo_pago, estado = 'Pendiente' } = req.body;
    let { impuestos = 0, total, subtotal, numero_factura } = req.body;

    if (!Number.isInteger(Number(id_paciente)) || Number(id_paciente) <= 0 || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ message: "Falta id_paciente o detalles de la factura." });
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ message: "Estado de factura no valido." });
    }
    if (metodo_pago && !METODOS_PAGO_VALIDOS.includes(metodo_pago)) {
        return res.status(400).json({ message: "Metodo de pago no valido." });
    }
    if (numero_factura && (typeof numero_factura !== 'string' || numero_factura.trim().length > 50)) {
        return res.status(400).json({ message: "Numero de factura no valido." });
    }

    try {
        await promiseDb.beginTransaction();
        const [pacientes] = await promiseDb.query('SELECT id_paciente FROM paciente WHERE id_paciente = ?', [id_paciente]);
        if (pacientes.length === 0) throw new Error('El paciente seleccionado no existe');
        if (id_consulta) {
            const [consultas] = await promiseDb.query(`
                SELECT con.id_consulta FROM consulta con
                JOIN cita c ON c.id_cita = con.id_cita
                WHERE con.id_consulta = ? AND c.id_paciente = ?
            `, [id_consulta, id_paciente]);
            if (consultas.length === 0) throw new Error('La consulta no pertenece al paciente seleccionado');
        }
        const medicamentos = new Map();
        const cantidades = new Map();

        for (const detalle of detalles) {
            const cantidad = Number(detalle.cantidad);
            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                throw new Error('Cada cantidad debe ser un entero mayor a cero');
            }
            if (detalle.id_medicamento) {
                cantidades.set(detalle.id_medicamento, (cantidades.get(detalle.id_medicamento) || 0) + cantidad);
            }
        }

        for (const [idMedicamento, cantidad] of cantidades) {
            const [rows] = await promiseDb.query(
                'SELECT id_medicamento, nombre, stock, precio FROM medicamento WHERE id_medicamento = ? FOR UPDATE',
                [idMedicamento]
            );
            if (rows.length === 0) throw new Error('Uno de los medicamentos ya no existe');
            if (rows[0].stock < cantidad) throw new Error(`Stock insuficiente para ${rows[0].nombre}`);
            medicamentos.set(String(idMedicamento), rows[0]);
        }

        const detallesToInsert = detalles.map((detalle) => {
            const cantidad = Number(detalle.cantidad);
            const medicamento = detalle.id_medicamento ? medicamentos.get(String(detalle.id_medicamento)) : null;
            const precio = medicamento ? Number(medicamento.precio) : Number(detalle.precio_unitario);
            const descripcion = medicamento ? medicamento.nombre : detalle.descripcion?.trim();
            if (!descripcion || descripcion.length > 255 || !Number.isFinite(precio) || precio < 0) {
                throw new Error('Cada detalle manual requiere descripcion y precio valido');
            }
            return {
                id_medicamento: medicamento?.id_medicamento || null,
                descripcion,
                cantidad,
                precio_unitario: precio,
                subtotal: cantidad * precio
            };
        });

        const calcSubtotal = detallesToInsert.reduce((sum, detalle) => sum + detalle.subtotal, 0);
        const calcImpuestos = Math.round(calcSubtotal * 12) / 100;
        impuestos = Number(impuestos);
        subtotal = Number(subtotal);
        total = Number(total);
        if (!Number.isFinite(subtotal) || !Number.isFinite(impuestos) || !Number.isFinite(total) ||
            Math.abs(calcSubtotal - subtotal) > 0.05 ||
            Math.abs(calcImpuestos - impuestos) > 0.05 ||
            Math.abs(calcSubtotal + calcImpuestos - total) > 0.05) {
            throw new Error('Los montos enviados no coinciden con el detalle de la factura');
        }

        numero_factura = numero_factura?.trim() || `FAC-${Date.now()}`;
        const descontarStock = estado !== 'Cancelada';
        const [resultFactura] = await promiseDb.query(`
            INSERT INTO factura
                (id_paciente, id_consulta, numero_factura, subtotal, impuestos, total, metodo_pago, estado, stock_descontado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id_paciente, id_consulta || null, numero_factura, calcSubtotal, calcImpuestos,
            calcSubtotal + calcImpuestos, metodo_pago || 'Pendiente', estado, descontarStock]);

        for (const detalle of detallesToInsert) {
            await promiseDb.query(`
                INSERT INTO factura_detalle
                    (id_factura, id_medicamento, descripcion, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [resultFactura.insertId, detalle.id_medicamento, detalle.descripcion,
                detalle.cantidad, detalle.precio_unitario, detalle.subtotal]);
        }

        if (descontarStock) {
            for (const [idMedicamento, cantidad] of cantidades) {
                await promiseDb.query('UPDATE medicamento SET stock = stock - ? WHERE id_medicamento = ?', [cantidad, idMedicamento]);
            }
        }

        await promiseDb.commit();
        res.status(201).json({ message: "Factura creada exitosamente", id_factura: resultFactura.insertId, numero_factura });
    } catch (error) {
        await promiseDb.rollback();
        res.status(400).json({ message: error.message || "Error interno al crear factura" });
    }
};

exports.obtenerFacturas = async (req, res) => {
    try {
        const { id_paciente, estado } = req.query;
        let query = `SELECT f.*, p.nombre, p.apellido FROM factura f
            JOIN paciente p ON f.id_paciente = p.id_paciente WHERE 1=1`;
        const params = [];
        if (id_paciente) { query += " AND f.id_paciente = ?"; params.push(id_paciente); }
        if (estado) { query += " AND f.estado = ?"; params.push(estado); }
        query += " ORDER BY f.fecha_emision DESC";
        const [results] = await promiseDb.query(query, params);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener facturas", error: error.message });
    }
};

exports.obtenerFacturaPorId = async (req, res) => {
    try {
        const [facturas] = await promiseDb.query(`
            SELECT f.*, p.nombre, p.apellido, p.telefono, p.direccion FROM factura f
            JOIN paciente p ON f.id_paciente = p.id_paciente WHERE f.id_factura = ?
        `, [req.params.id]);
        if (facturas.length === 0) return res.status(404).json({ message: "Factura no encontrada" });
        const [detalles] = await promiseDb.query("SELECT * FROM factura_detalle WHERE id_factura = ?", [req.params.id]);
        res.json({ ...facturas[0], detalles });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener factura", error: error.message });
    }
};

exports.actualizarEstado = async (req, res) => {
    const { estado } = req.body;
    if (!ESTADOS_VALIDOS.includes(estado)) return res.status(400).json({ message: "Estado de factura no valido" });
    try {
        await promiseDb.beginTransaction();
        const [rows] = await promiseDb.query('SELECT estado, stock_descontado FROM factura WHERE id_factura = ? FOR UPDATE', [req.params.id]);
        if (rows.length === 0) {
            await promiseDb.rollback();
            return res.status(404).json({ message: "Factura no encontrada" });
        }
        let stockDescontado = Boolean(rows[0].stock_descontado);
        if (estado === 'Cancelada' && stockDescontado) {
            await ajustarStockFactura(req.params.id, 'devolver');
            stockDescontado = false;
        } else if (estado !== 'Cancelada' && !stockDescontado) {
            await ajustarStockFactura(req.params.id, 'descontar');
            stockDescontado = true;
        }
        await promiseDb.query('UPDATE factura SET estado = ?, stock_descontado = ? WHERE id_factura = ?', [estado, stockDescontado, req.params.id]);
        await promiseDb.commit();
        res.json({ message: "Estado de factura actualizado exitosamente" });
    } catch (error) {
        await promiseDb.rollback();
        res.status(400).json({ message: error.message });
    }
};

exports.eliminarFactura = async (req, res) => {
    try {
        await promiseDb.beginTransaction();
        const [rows] = await promiseDb.query('SELECT stock_descontado FROM factura WHERE id_factura = ? FOR UPDATE', [req.params.id]);
        if (rows.length === 0) {
            await promiseDb.rollback();
            return res.status(404).json({ message: "Factura no encontrada" });
        }
        if (rows[0].stock_descontado) await ajustarStockFactura(req.params.id, 'devolver');
        await promiseDb.query("DELETE FROM factura WHERE id_factura = ?", [req.params.id]);
        await promiseDb.commit();
        res.json({ message: "Factura eliminada exitosamente" });
    } catch (error) {
        await promiseDb.rollback();
        res.status(500).json({ message: "Error al eliminar factura", error: error.message });
    }
};
