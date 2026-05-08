INSERT INTO universidad (nombre, ciudad, tipo_convenio) VALUES
('Universidad Santo Tomás', 'Tunja', 'convenio_marco'),
('UPTC', 'Tunja', 'convenio_marco');

INSERT INTO servicio_hospitalario (nombre, piso, capacidad_maxima_estudiantes) VALUES
('Pediatría', 3, 5),
('Urgencias', 1, 8),
('UCI', 2, 3),
('Cirugia', 4, 4);

INSERT INTO docente (cedula, nombre, apellido, id_universidad, programa_que_supervisa) VALUES
('11111111', 'Andrés', 'Rojas', 1, 'Medicina'),
('22222222', 'Clara', 'Mendoza', 1, 'Enfermería');

INSERT INTO estudiante (cedula, nombre, apellido, programa_academico, semestre_academico, id_universidad, induccion_completada, fecha_induccion, arl_vigencia_inicio, arl_vigencia_fin, estado) VALUES
('1234567', 'María', 'García', 'Medicina', 4, 1, TRUE, '2026-01-15', '2026-01-01', '2026-12-31', 'activo'),
('7654321', 'Carlos', 'López', 'Enfermería', 3, 1, FALSE, NULL, NULL, NULL, 'activo'),
('9999999', 'Ana', 'Torres', 'Medicina', 5, 2, TRUE, '2026-02-01', '2026-01-01', '2026-04-30', 'activo');

-- Plan de prácticas de prueba
INSERT INTO plan_practicas (id_docente, id_universidad, semestre, mes, fecha_carga)
VALUES (1, 1, 1, 5, CURRENT_DATE);

-- Asignación vigente para María García (cédula 1234567) — HOY, todo el día
INSERT INTO asignacion_practica 
(id_plan, id_estudiante, id_servicio, dia_semana, hora_inicio, hora_fin, fecha_especifica)
VALUES (1, 1, 1, NULL, '00:00:00', '23:59:00', CURRENT_DATE);

-- Ingreso del docente para hoy (requisito validación 5)
INSERT INTO registro_acceso_docente (id_docente, timestamp_entrada)
VALUES (1, CURRENT_TIMESTAMP);