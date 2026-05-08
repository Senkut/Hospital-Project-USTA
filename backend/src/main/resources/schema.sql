CREATE TABLE IF NOT EXISTS universidad (
    id_universidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    ciudad VARCHAR(100),
    tipo_convenio VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS docente (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    id_universidad INT,
    programa_que_supervisa VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS estudiante (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    programa_academico VARCHAR(200),
    semestre_academico INT,
    id_universidad INT,
    induccion_completada BOOLEAN DEFAULT FALSE,
    fecha_induccion DATE,
    arl_vigencia_inicio DATE,
    arl_vigencia_fin DATE,
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS servicio_hospitalario (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    piso INT,
    capacidad_maxima_estudiantes INT DEFAULT 5
);

CREATE TABLE IF NOT EXISTS plan_practicas (
    id_plan INT AUTO_INCREMENT PRIMARY KEY,
    id_docente INT NOT NULL,
    id_universidad INT NOT NULL,
    semestre INT,
    mes INT,
    fecha_carga DATE
);

CREATE TABLE IF NOT EXISTS asignacion_practica (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    id_estudiante INT NOT NULL,
    id_servicio INT NOT NULL,
    dia_semana VARCHAR(20),
    hora_inicio TIME,
    hora_fin TIME,
    fecha_especifica DATE
);

CREATE TABLE IF NOT EXISTS registro_acceso (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_asignacion INT,
    timestamp_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timestamp_salida TIMESTAMP,
    horas_cumplidas DECIMAL(5,2),
    resultado_validacion VARCHAR(20),
    motivo_rechazo VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS registro_acceso_docente (
    id_registro_docente INT AUTO_INCREMENT PRIMARY KEY,
    id_docente INT NOT NULL,
    timestamp_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timestamp_salida TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerta (
    id_alerta INT AUTO_INCREMENT PRIMARY KEY,
    tipo_alerta VARCHAR(100),
    id_estudiante INT,
    id_docente INT,
    descripcion VARCHAR(500),
    timestamp_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resuelta BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS usuario_sistema (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(200) NOT NULL,
    rol VARCHAR(50) DEFAULT 'CONSULTA',
    activo BOOLEAN DEFAULT TRUE
);

ALTER TABLE docente ADD COLUMN IF NOT EXISTS rol VARCHAR(50) DEFAULT 'docente';
ALTER TABLE docente ADD COLUMN IF NOT EXISTS password VARCHAR(200);