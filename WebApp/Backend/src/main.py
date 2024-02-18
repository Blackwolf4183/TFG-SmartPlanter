#uvicorn src.main:app --reload
#http://localhost:8000/docs#/default
# cd desktop/TFG-SmartPlanter/WebApp/Backend  

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from typing import Annotated

#routes
from .Routes import securityRoutes, errorRoutes, deviceRoutes, plantRoutes


load_dotenv()

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)


app.include_router(securityRoutes.router, prefix="/auth", tags=["auth"])
app.include_router(errorRoutes.router, prefix="/errors", tags=["errors"])
app.include_router(deviceRoutes.router, prefix="/devices", tags=["devices"])
app.include_router(deviceRoutes.router, prefix="/plants", tags=["plants"])
