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
  Source VARCHAR(255)
);

CREATE TABLE User (
  id SERIAL PRIMARY KEY,
  Username VARCHAR(30),
  Password VARCHAR(255)
);

CREATE TABLE UserPlant (
  id SERIAL PRIMARY KEY,
  UserID INT REFERENCES User(id),
  PlantReference -- TODO: figure how to connect this to the plants api 
)

CREATE TABLE UserDevice (
  id SERIAL PRIMARY KEY,
  UserID INT REFERENCES User(id), -- References the id from User table
  DeviceID INT REFERENCES Device(id) -- References the id from Device table
);

