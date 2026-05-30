-- Completar los dos valores indicados antes de ejecutar como administrador.
-- Si el gateway corre en la misma computadora que MySQL, conservar localhost.
-- Para otro equipo de la red, reemplazar localhost con su IP privada exacta.
-- No guardar la contrasena real dentro del proyecto.

CREATE USER IF NOT EXISTS 'powerbi_reader'@'localhost'
    IDENTIFIED BY '<REEMPLAZAR_CONTRASENA_SEGURA>'
    REQUIRE SSL;

ALTER USER 'powerbi_reader'@'localhost'
    IDENTIFIED BY '<REEMPLAZAR_CONTRASENA_SEGURA>'
    REQUIRE SSL;

GRANT SELECT ON clinica_reportes.* TO 'powerbi_reader'@'localhost';

FLUSH PRIVILEGES;

