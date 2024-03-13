from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.responses import JSONResponse

from ..Controllers.espController import should_irrigate_plant

from typing import Annotated


router = APIRouter()

#TODO: de momento lo dejamos abierto el endpoint, pero debería usar una API key para poder acceder de forma segura
@router.get("/irrigate")
async def get_should_irrigate_plant(client_id: str, soil_moisture: int):
    try:
        irrigate_result = should_irrigate_plant(client_id, soil_moisture)
        return irrigate_result
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)