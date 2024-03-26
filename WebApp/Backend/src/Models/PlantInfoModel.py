from pydantic import BaseModel
from typing import Optional

class PlantInfo(BaseModel):
    plantId: int
    commonName: str
    scientificName: str
    imageUrl: str
    watering: str
    sunlight: str
    plantDescription: str
    careLevel: str
    maxTemp: Optional[int] = None
    minTemp: Optional[int] = None
    #TODO: falta poner consejos y otros datos
    

