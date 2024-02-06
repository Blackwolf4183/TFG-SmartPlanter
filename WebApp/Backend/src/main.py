#uvicorn src.main:app --reload
#http://localhost:8000/docs#/default

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from typing import Annotated

#routes
from .Routes import securityRoutes


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
