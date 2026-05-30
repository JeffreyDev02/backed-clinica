USE clinica_medica;

-- Ejecutar una sola vez si la base de datos ya existía antes del módulo de inventario.
DELIMITER //

DROP PROCEDURE IF EXISTS agregar_columna_si_falta//
CREATE PROCEDURE agregar_columna_si_falta(
    IN tabla VARCHAR(64),
    IN columna VARCHAR(64),
    IN definicion VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = tabla
          AND column_name = columna
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tabla, ' ADD COLUMN ', columna, ' ', definicion);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

CALL agregar_columna_si_falta('medicamento', 'stock', 'INT NOT NULL DEFAULT 0')//
CALL agregar_columna_si_falta('medicamento', 'precio', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00')//
CALL agregar_columna_si_falta('factura', 'stock_descontado', 'BOOLEAN NOT NULL DEFAULT FALSE')//
CALL agregar_columna_si_falta('factura_detalle', 'id_medicamento', 'INT NULL')//

ALTER TABLE factura
    MODIFY COLUMN fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP//

DROP PROCEDURE IF EXISTS agregar_fk_factura_medicamento_si_falta//
CREATE PROCEDURE agregar_fk_factura_medicamento_si_falta()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.key_column_usage
        WHERE table_schema = DATABASE()
          AND table_name = 'factura_detalle'
          AND column_name = 'id_medicamento'
          AND referenced_table_name = 'medicamento'
    ) THEN
        ALTER TABLE factura_detalle
            ADD CONSTRAINT fk_factura_detalle_medicamento
            FOREIGN KEY (id_medicamento) REFERENCES medicamento(id_medicamento)
            ON DELETE RESTRICT
            ON UPDATE CASCADE;
    END IF;
END//

CALL agregar_fk_factura_medicamento_si_falta()//
DROP PROCEDURE IF EXISTS agregar_fk_factura_medicamento_si_falta//
DROP PROCEDURE IF EXISTS agregar_columna_si_falta//

DELIMITER ;

-- Todos los valores monetarios almacenados por el sistema se interpretan como
-- quetzales guatemaltecos (GTQ). DECIMAL evita errores de redondeo de moneda.
