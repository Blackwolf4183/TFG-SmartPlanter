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

CREATE TABLE PlantInfo (
  id SERIAL PRIMARY KEY,
  PerenualID INT UNIQUE,
  CommonName VARCHAR(255),
  ScientificName VARCHAR(255),
  ImageUrl VARCHAR(255),
  Watering VARCHAR(255),
  Sunlight VARCHAR(255),
  PlantDescription VARCHAR,
  CareLevel VARCHAR,
  MinTemperature INT,
  MaxTemperature INT
);


CREATE TABLE PlantGuide (
  id SERIAL PRIMARY KEY,
  PlantID INT REFERENCES PlantInfo(id),
  GuideType VARCHAR(255),
  Description VARCHAR(255)
);

CREATE TABLE DevicePlant (
  id SERIAL PRIMARY KEY,
  DeviceID INT REFERENCES Device(id) UNIQUE, -- References the id from Device table
  PlantId INT REFERENCES PlantInfo(id)
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

CREATE TABLE plantstate (
  id SERIAL PRIMARY KEY,
  state INTEGER,
  recordeddate DATE,
  deviceid INTEGER REFERENCES Device(id)
);

CREATE TABLE ModelState (
  id SERIAL PRIMARY KEY,
  training boolean, 
  lastupdated DATE, 
  modelpath VARCHAR(100),
  accuracy FLOAT,
  DeviceID INT REFERENCES Device(id) UNIQUE -- References the id from Device table
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

CREATE OR REPLACE FUNCTION get_historical_readings(givenDeviceId int4)
RETURNS TABLE(
  id int4,
  soilmoisture float,
  temperature float,
  airhumidity float,
  lightlevel float,
  irrigationamount float, 
  "timestamp" timestamp,
  deviceId int4
)
LANGUAGE sql
AS $$
  SELECT arduinodata.id, 
         arduinodata.soilmoisture, 
         arduinodata.temperature, 
         arduinodata.airhumidity, 
         arduinodata.lightlevel, 
         arduinodata.irrigationamount,
         arduinodata."timestamp", 
         device.id as deviceId
  FROM arduinodata
  JOIN device ON arduinodata.clientid = device.clientid
  WHERE device.id = givenDeviceId
    AND arduinodata."timestamp" >= CURRENT_TIMESTAMP - INTERVAL '10 days';
$$;

--Example
--SELECT * FROM get_historical_readings(1);   

CREATE OR REPLACE FUNCTION get_readings_count(givenDeviceId int4)
RETURNS int
LANGUAGE sql
AS $$
  SELECT COUNT(*)
  FROM arduinodata
  JOIN device ON arduinodata.clientid = device.clientid
  WHERE device.id = givenDeviceId;
$$;

create or replace function get_used_states(givenDeviceId int4)
returns int
language sql
as $$
  SELECT COUNT(*)
  FROM (
      SELECT DISTINCT state
      FROM plantstate
      WHERE deviceid = 1
  ) AS distinct_states;
$$;


create or replace function  get_data_for_model(givenDeviceId int4)
returns table(
  id int4,
  soilmoisture float,
  temperature float,
  airhumidity float,
  lightlevel float,
  irrigationamount float,
  "timestamp" timestamp, 
  deviceid int4, 
  state int4 
)
language sql
as $$
  SELECT 
  ad.id, 
  ad.soilmoisture,
  ad.temperature,
  ad.airhumidity,
  ad.lightlevel,
  ad.irrigationamount,
  ad.timestamp, 
  dv.id as deviceID, 
  ps.state 
FROM 
  ArduinoData AS ad 
JOIN 
  Device AS dv ON ad.clientid = dv.clientid 
JOIN 
  PlantState AS ps ON dv.id = ps.deviceid 
    AND DATE(ad.timestamp) = ps.recordeddate 
WHERE 
  dv.id = givenDeviceId
ORDER BY 
  ad.timestamp DESC;
$$;

--Example use
--SELECT * FROM get_data_for_model(1);




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

-- Query to get data for model training
SELECT 
  ad.id, 
  ad.soilmoisture,
  ad.temperature,
  ad.airhumidity,
  ad.lightlevel,
  ad.irrigationamount,
  ad.timestamp, 
  dv.id as deviceID, 
  ps.state 
FROM 
  ArduinoData AS ad 
JOIN 
  Device AS dv ON ad.clientid = dv.clientid 
JOIN 
  PlantState AS ps ON dv.id = ps.deviceid 
    AND DATE(ad.timestamp) = ps.recordeddate 
WHERE 
  ad.clientId = 'SmartPlanter1' 
ORDER BY 
  ad.timestamp DESC;
