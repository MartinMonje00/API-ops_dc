-- SCHEMATICS V1.3

USE ops_dc_test;

GRANT ALL PRIVILEGES ON ops_dc_test.* TO 'api_user'@'%';

FLUSH PRIVILEGES;


CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(128) NOT NULL,
    role VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    incident_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(70) NULL,
    affected_service VARCHAR(128) NULL,
    description TEXT NOT NULL,
    severity ENUM('Baja', 'Media', 'Alta', 'Critica') NOT NULL DEFAULT 'Baja',
    startedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endedAt DATETIME NULL,
    state ENUM('Abierto', 'Cerrado') NOT NULL DEFAULT 'Abierto',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logBook (
    log_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    user_id CHAR(36),
    category VARCHAR(50),
    description TEXT NOT NULL,
    state ENUM('Abierto', 'Archivado', 'Cerrado') NOT NULL DEFAULT 'Abierto',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE logBook ADD CONSTRAINT fk_logBook_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS tempLogs (
    temp_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    roomName VARCHAR(50) NOT NULL,
    tempC FLOAT(5,2) NOT NULL,
    humidityPercent DECIMAL(5,2) NOT NULL,
    notes TEXT NOT NULL,
    measuredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

USE ops_dc_test;

INSERT INTO users (name, email, password, role)
VALUES (
    'Alberto Espinoza',
    'developer@empresa.local',
    '$2b$10$UPfQzet9Lc2CMJnjFDHX6O5MCXyxRDDcZ25NnrgRhftfVFHXsZ/LO', --hash de contraseña 123456
    'admin'
);
/*
INSERT INTO incidents (name, type, affected_service, description, severity, state)
VALUES (
    '',
    '',
    '',
    '',
    '',
    ''
);

INSERT INTO logBook (category, description, state)
VALUES (
    '',
    '',
    ''
);

INSERT INTO tempLogs (roomName, tempC, humidityPercent, notes)
VALUES (
    '',
    '',
    '',
    ''
);
 Inserciones de prueba en desarrollo */