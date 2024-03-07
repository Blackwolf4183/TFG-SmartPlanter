from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.responses import JSONResponse

from typing import Annotated

from ..Controllers.securityController import User,get_current_user
from ..Controllers.plantController import get_plant_lastest_readings, get_plant_historical_readings, create_plant_irrigation_registry

from ..Models.IrrigationModel import IrrigationForm

router = APIRouter()


@router.get("/latest-data")
async def get_latest_plant_data(device_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        latest_data = get_plant_lastest_readings(device_id, current_user)
        return {"data": latest_data}
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@router.get("/historical-data")
async def get_historical_plant_data(device_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        historical_data = get_plant_historical_readings(device_id, current_user)
        return {"data": historical_data}
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
@router.post("/irrigation")
async def create_irrigation_registry(irrigation_data: IrrigationForm, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        await create_plant_irrigation_registry(irrigation_data,current_user)
        return JSONResponse(content={"message": "Registro de riego creado existosamente"}, status_code=status.HTTP_201_CREATED)
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)