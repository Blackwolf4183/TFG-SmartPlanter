from pydantic import BaseModel
from typing import Optional
from datetime import date

class ModelInfo(BaseModel):
    last_trained: Optional[date] = None
    training: bool
    sensor_measurements: int
    can_train: bool
