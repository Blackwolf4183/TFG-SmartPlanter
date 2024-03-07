from pydantic import BaseModel
from typing import Optional

class IrrigationForm(BaseModel):
    deviceId: int
    irrigationType: str
    threshold: Optional[int] = None
    everyHours: Optional[int] = None
    irrigationAmount: float
