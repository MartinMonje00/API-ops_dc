GRANT ALL PRIVILEGES ON ops_dc.* TO 'api_user'@'%';

FLUSH PRIVILEGES;


SET GLOBAL event_scheduler = ON;

CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(25) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
    contact_id char(36) DEFAULT (UUID()) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    charge VARCHAR(35) NULL,
    email VARCHAR(100) UNIQUE NULL,
    telefone INT(9) NULL,
    type VARCHAR(25) DEFAULT 'Cliente',
    notes VARCHAR(255) NULL
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
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tempLogsDailyKPIs (
    kpi_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    roomName VARCHAR(50) NOT NULL,
    targetDate DATE NOT NULL,
    avgTemp FLOAT(5,2) NOT NULL,
    maxTemp FLOAT(5,2) NOT NULL,
    minTemp FLOAT(5,2) NOT NULL,
    avgHumidity FLOAT(5,2) NOT NULL,
    totalReadings INT NOT NULL,
    UNIQUE KEY idx_room_date (roomName, targetDate)
);

CREATE TABLE IF NOT EXISTS tempLogsMonthlyKPIs (
    kpim_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    roomName VARCHAR(50) NOT NULL,
    targetYear INT NOT NULL,
    targetMonth INT NOT NULL,
    avgTemp FLOAT(5,2) NOT NULL,
    maxTemp FLOAT(5,2) NOT NULL,
    minTemp FLOAT(5,2) NOT NULL,
    UNIQUE KEY idx_room_month (roomName, targetYear, targetMonth)
);

DELIMITER $$

CREATE EVENT IF NOT EXISTS evt_archive_and_clean_telemetry
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE + INTERVAL 1 DAY))
DO
BEGIN
    INSERT INTO tempLogsDailyKPIs (roomName, targetDate, avgTemp, maxTemp, minTemp, avgHumidity, totalReadings)
    SELECT
        roomName,
        DATE(measuredAt) as targetDate,
        ROUND(AVG(tempC), 2) as avgTemp,
        MAX(tempC) as maxTemp,
        MIN(tempC) as minTemp,
        ROUND(AVG(humidityPercent), 2) as avgHumidity,
        COUNT(*) as totalReadings
    FROM tempLogs
    WHERE measuredAt >= CURRENT_DATE - INTERVAL 1 DAY
        AND measuredAt < CURRENT_DATE
    GROUP BY roomName, DATE(measuredAt)
    ON DUPLICATE KEY UPDATE
        avgTemp = VALUES(avgTemp), maxTemp = VALUES(maxTemp), minTemp = VALUES(minTemp), avgHumidity = VALUES(avgHumidity), totalReadings = VALUES(totalReadings);

    DELETE FROM tempLogs
    WHERE measuredAt < CURRENT_DATE - INTERVAL 30 DAY;
END$$

DELIMITER ;

--Simple dato de prueba (usuario, puede ser eliminado antes de la produccion)

INSERT INTO users (username, name, email, role)
VALUES (
    'aespinoza',
    'Alberto Espinoza',
    'developer@empresa.local',
    'Administrador'
);
