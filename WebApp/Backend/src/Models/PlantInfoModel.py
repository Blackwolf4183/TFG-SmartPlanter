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

class PlantAdvice(BaseModel):
    id: int
    plantId: int
    guideType: str
    description: str    

