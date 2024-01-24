CREATE TABLE ArduinoData (
  id SERIAL PRIMARY KEY,
  SoilMoisture FLOAT CHECK (SoilMoisture >= 0.0 AND SoilMoisture <= 100.0), 
  Temperature FLOAT,
  AirHumidity FLOAT CHECK (AirHumidity >= 0.0 AND AirHumidity <= 100.0), 
  LightLevel FLOAT CHECK (LightLevel >= 0.0 AND LightLevel <= 100.0),
  WaterLevel  FLOAT CHECK (WaterLevel >= 0.0 ),
  IrrigationAmount  FLOAT CHECK (IrrigationAmount >= 0.0 ),
  TimeStamp timestamp,
  ClientID VARCHAR(50)
)

CREATE TABLE ErrorLog (
  id SERIAL PRIMARY KEY,
  ErrorMessage VARCHAR(255),
  ErrorTime TIMESTAMP,
  Source VARCHAR(255)
)