from pydantic import BaseModel

class PredictionModel(BaseModel):
    prediction: str
    prediction_state: int
    increase_irrigation: bool
    decrease_irrigation: bool

