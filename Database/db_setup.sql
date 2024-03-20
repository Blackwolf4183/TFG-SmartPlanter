CREATE TABLE Device (
  id SERIAL PRIMARY KEY,
  ClientID VARCHAR(50) UNIQUE, -- ClientID is set as primary key and unique
  Password VARCHAR(255)
);


CREATE TABLE ArduinoData (
  id SERIAL PRIMARY KEY,
  SoilMoisture FLOAT CHECK (SoilMoisture >= 0.0 AND SoilMoisture <= 100.0), 
  Temperature FLOAT,
  AirHumidity FLOAT CHECK (AirHumidity >= 0.0 AND AirHumidity <= 100.0), 
  LightLevel FLOAT CHECK (LightLevel >= 0.0 AND LightLevel <= 100.0),
  WaterLevel  FLOAT CHECK (WaterLevel >= 0.0 ),
  IrrigationAmount  FLOAT CHECK (IrrigationAmount >= 0.0 ),
  TimeStamp TIMESTAMP,
  ClientID VARCHAR(50) REFERENCES Device(ClientID) -- References the ClientID from Device table
);

CREATE TABLE ErrorLog (
  id SERIAL PRIMARY KEY,
  ErrorMessage VARCHAR(255),
  ErrorTime TIMESTAMP,
  Source VARCHAR(255),
  ClientID VARCHAR(50) REFERENCES Device(ClientID)
);

CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  Username VARCHAR(30),
  Password VARCHAR(255),
  Email VARCHAR(150)
);

CREATE TABLE UserPlant (
  id SERIAL PRIMARY KEY,
  UserID INT REFERENCES "user"(id),
  PlantReference VARCHAR(50)-- TODO: figure how to connect this to the plants api 
);

CREATE TABLE UserDevice (
  id SERIAL PRIMARY KEY,
  UserID INT REFERENCES "user"(id), -- References the id from User table
  DeviceID INT REFERENCES Device(id) -- References the id from Device table
);

CREATE TABLE Irrigation (
  id SERIAL PRIMARY KEY,
  DeviceID INT REFERENCES Device(id) UNIQUE NOT NULL,
  IrrigationType VARCHAR(50) NOT NULL,
  Threshold INT,
  EveryHours INT,
  IrrigationAmount FLOAT
);

CREATE TABLE IrrigationTimes (
  id SERIAL PRIMARY KEY,
  DeviceID INT REFERENCES Device(id) NOT NULL,
  "Time" TIME NOT NULL,
  Completed BOOLEAN NOT NULL DEFAULT FALSE
);

--FUNCTIONS

create or replace function get_latest_reading(givenDeviceId int4)
returns table(
  id int4,
  soilmoisture float,
  temperature float,
  airhumidity float,
  lightlevel float,
  "timestamp" timestamp,
  deviceId int4
)
language sql
as $$
  SELECT arduinodata.id, arduinodata.soilmoisture, arduinodata.temperature, arduinodata.airhumidity, arduinodata.lightlevel, timestamp, device.id as deviceId
  FROM arduinodata
  JOIN device ON arduinodata.clientid = device.clientid
  WHERE device.id = givenDeviceId
  ORDER BY timestamp DESC
  LIMIT 1;
$$;

--Example
--SELECT * FROM get_latest_reading(1);

create or replace function get_historical_readings(givenDeviceId int4)
returns table(
  id int4,
  soilmoisture float,
  temperature float,
  airhumidity float,
  lightlevel float,
  irrigationamount float, 
  "timestamp" timestamp,
  deviceId int4
)
language sql
as $$
  SELECT arduinodata.id, arduinodata.soilmoisture, arduinodata.temperature, arduinodata.airhumidity, arduinodata.lightlevel, arduinodata.irrigationamount ,timestamp, device.id as deviceId
  FROM arduinodata
  JOIN device ON arduinodata.clientid = device.clientid
  WHERE device.id = givenDeviceId;
$$;

--Example
--SELECT * FROM get_historical_readings(1);   

-- Procedure to set to false all completed fields in irrigationTimes table
CREATE OR REPLACE PROCEDURE update_irrigation_times()
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE irrigationtimes SET completed = FALSE;
END;
$$;

-- cron schedule to 00:00 every day
SELECT cron.schedule('0 0 * * *', 'CALL update_irrigation_times()');
-- Example call
--CALL update_irrigation_times();
