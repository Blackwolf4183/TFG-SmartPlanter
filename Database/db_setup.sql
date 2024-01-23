CREATE TABLE ArduinoData (
  id SERIAL PRIMARY KEY,
  SoilMoisture FLOAT CHECK (SoilMoisture >= 0.0 AND SoilMoisture <= 100.0), 
  Temperature FLOAT,
  AirHumidity FLOAT CHECK (AirHumidity >= 0.0 AND AirHumidity <= 100.0), 
  LightLevel FLOAT CHECK (LightLevel >= 0.0 AND LightLevel <= 100.0),
  WaterLevel  FLOAT CHECK (WaterLevel >= 0.0 ),
  IrrigationAmount  FLOAT CHECK (IrrigationAmount >= 0.0 ),
  TimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ClientID VARCHAR(50)
)

