from pydantic import BaseModel
from typing import Optional

class IrrigationForm(BaseModel):
    deviceId: int
    irrigationType: str
    threshold: Optional[int] = None
    everyHours: Optional[int] = None
    irrigationAmount: float

class IrrigationData(BaseModel):
    irrigationType: str
    threshold: Optional[int] = None
    everyHours: Optional[int] = None
    irrigationAmount: float

class ESPIrrigationInfo(BaseModel):
    shouldIrrigate: bool
    irrigationAmount: float