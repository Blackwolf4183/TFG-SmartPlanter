#uvicorn src.main:app --reload
#http://localhost:8000/docs#/default
# cd desktop/TFG-SmartPlanter/WebApp/Backend  

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

#routes
from .Routes import securityRoutes, errorRoutes, deviceRoutes, plantRoutes, espRoutes, machineLearningRoutes


load_dotenv()

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)


app.include_router(securityRoutes.router, prefix="/auth", tags=["Auth"])
app.include_router(errorRoutes.router, prefix="/errors", tags=["Errors"])
app.include_router(deviceRoutes.router, prefix="/devices", tags=["Devices"])
app.include_router(plantRoutes.router, prefix="/plants", tags=["Plants"])
app.include_router(espRoutes.router, prefix="/esp", tags=["ESP32"])
app.include_router(machineLearningRoutes.router, prefix="/ml", tags=["Machine Learning"])
