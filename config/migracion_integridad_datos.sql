USE clinica_medica;

-- Ejecutar una sola vez. Antes de aplicar restricciones, revisar duplicados:
-- SELECT id_medico, fecha, hora, COUNT(*) FROM cita GROUP BY id_medico, fecha, hora HAVING COUNT(*) > 1;
-- SELECT id_paciente, fecha, hora, COUNT(*) FROM cita GROUP BY id_paciente, fecha, hora HAVING COUNT(*) > 1;
-- SELECT id_cita, COUNT(*) FROM consulta GROUP BY id_cita HAVING COUNT(*) > 1;
-- SELECT id_consulta, COUNT(*) FROM receta GROUP BY id_consulta HAVING COUNT(*) > 1;

ALTER TABLE paciente
    MODIFY COLUMN nombre VARCHAR(100) NOT NULL,
    MODIFY COLUMN apellido VARCHAR(100) NOT NULL,
    MODIFY COLUMN fecha_nacimiento DATE NOT NULL,
    MODIFY COLUMN telefono VARCHAR(20) NOT NULL,
    MODIFY COLUMN direccion VARCHAR(255) NOT NULL;

ALTER TABLE medico
    MODIFY COLUMN nombre VARCHAR(100) NOT NULL,
    MODIFY COLUMN apellido VARCHAR(100) NOT NULL,
    MODIFY COLUMN telefono VARCHAR(20) NOT NULL;

ALTER TABLE cita
    MODIFY COLUMN fecha DATE NOT NULL,
    MODIFY COLUMN hora TIME NOT NULL,
    MODIFY COLUMN estado ENUM('Normal','Urgente','Cancelada','Completada') NOT NULL;

ALTER TABLE consulta
    MODIFY COLUMN diagnostico TEXT NOT NULL,
    MODIFY COLUMN tratamiento TEXT NOT NULL;

ALTER TABLE receta
    MODIFY COLUMN fecha DATE NOT NULL;

DELIMITER //

DROP PROCEDURE IF EXISTS proteger_fk//
CREATE PROCEDURE proteger_fk(
    IN tabla VARCHAR(64),
    IN columna VARCHAR(64),
    IN tabla_referencia VARCHAR(64),
    IN columna_referencia VARCHAR(64),
    IN nuevo_nombre VARCHAR(64),
    IN definicion_columna VARCHAR(255)
)
BEGIN
    DECLARE fk_actual VARCHAR(64);
    DECLARE regla_borrado VARCHAR(20);
    SELECT k.CONSTRAINT_NAME, r.DELETE_RULE INTO fk_actual, regla_borrado
    FROM information_schema.KEY_COLUMN_USAGE k
    JOIN information_schema.REFERENTIAL_CONSTRAINTS r
      ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
     AND r.TABLE_NAME = k.TABLE_NAME
     AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
    WHERE k.CONSTRAINT_SCHEMA = DATABASE()
      AND k.TABLE_NAME = tabla
      AND k.COLUMN_NAME = columna
      AND k.REFERENCED_TABLE_NAME = tabla_referencia
    LIMIT 1;

    IF fk_actual IS NULL OR fk_actual <> nuevo_nombre OR regla_borrado <> 'RESTRICT' THEN
        IF fk_actual IS NOT NULL THEN
            SET @sql = CONCAT('ALTER TABLE ', tabla, ' DROP FOREIGN KEY ', fk_actual);
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;

        SET @sql = CONCAT(
            'ALTER TABLE ', tabla,
            ' MODIFY COLUMN ', columna, ' ', definicion_columna,
            ', ADD CONSTRAINT ', nuevo_nombre,
            ' FOREIGN KEY (', columna, ') REFERENCES ', tabla_referencia,
            '(', columna_referencia, ') ON DELETE RESTRICT ON UPDATE CASCADE'
        );
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

CALL proteger_fk('cita', 'id_paciente', 'paciente', 'id_paciente', 'fk_cita_paciente_restrict', 'INT NOT NULL')//
CALL proteger_fk('cita', 'id_medico', 'medico', 'id_medico', 'fk_cita_medico_restrict', 'INT NOT NULL')//
CALL proteger_fk('consulta', 'id_cita', 'cita', 'id_cita', 'fk_consulta_cita_restrict', 'INT NOT NULL')//
CALL proteger_fk('factura', 'id_paciente', 'paciente', 'id_paciente', 'fk_factura_paciente_restrict', 'INT NOT NULL')//
CALL proteger_fk('historial_medico', 'id_paciente', 'paciente', 'id_paciente', 'fk_historial_paciente_restrict', 'INT NOT NULL')//
CALL proteger_fk('receta_medicamento', 'id_medicamento', 'medicamento', 'id_medicamento', 'fk_receta_medicamento_restrict', 'INT NOT NULL')//

DROP PROCEDURE IF EXISTS proteger_fk//

DROP PROCEDURE IF EXISTS agregar_indice_unico_si_falta//
CREATE PROCEDURE agregar_indice_unico_si_falta(
    IN tabla VARCHAR(64),
    IN indice VARCHAR(64),
    IN columnas VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = tabla AND index_name = indice
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tabla, ' ADD UNIQUE KEY ', indice, ' (', columnas, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

CALL agregar_indice_unico_si_falta('cita', 'uq_cita_medico_horario', 'id_medico,fecha,hora')//
CALL agregar_indice_unico_si_falta('cita', 'uq_cita_paciente_horario', 'id_paciente,fecha,hora')//
CALL agregar_indice_unico_si_falta('consulta', 'uq_consulta_cita', 'id_cita')//
CALL agregar_indice_unico_si_falta('receta', 'uq_receta_consulta', 'id_consulta')//

DROP PROCEDURE IF EXISTS agregar_indice_unico_si_falta//

DELIMITER ;
