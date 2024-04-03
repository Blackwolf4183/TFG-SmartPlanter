from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.responses import JSONResponse

from typing import Annotated,List

from ..Controllers.securityController import User,get_current_user
from ..Controllers.plantController import (get_plant_lastest_readings, get_plant_historical_readings, create_plant_irrigation_registry,
                                            get_irrigation_data, get_plant_daily_consumption, create_plant_info_registry, get_plant_data,
                                            get_plant_list, retrieve_user_plant, get_plant_advice_data)

from ..Models.IrrigationModel import IrrigationForm, IrrigationData
from ..Models.PlantInfoModel import PlantInfo, PlantAdvice

router = APIRouter()


#Device data
@router.get("/latest-data")
async def get_latest_plant_data(device_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        latest_data = get_plant_lastest_readings(device_id, current_user)
        return {"data": latest_data}
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@router.get("/daily-consumption")
async def get_latest_plant_data(device_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        consumption = get_plant_daily_consumption(device_id, current_user)
        return {"consumption": consumption}
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

 
#Irrigation routes
@router.post("/irrigation")
async def create_irrigation_registry(irrigation_data: IrrigationForm, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        await create_plant_irrigation_registry(irrigation_data,current_user)
        return JSONResponse(content={"message": "Registro de riego creado existosamente"}, status_code=status.HTTP_201_CREATED)
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@router.get("/irrigation", response_model=IrrigationData)
async def get_irrigation_info(device_id:str, current_user: Annotated[User, Depends(get_current_user)]) -> IrrigationData:
    try:
        irrigation_data = await get_irrigation_data(device_id, current_user)
        return irrigation_data
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@router.post("")
async def create_plant_registry(device_id:str, plant_id:str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        await create_plant_info_registry(device_id, plant_id, current_user)
        return JSONResponse(content={"message": "Registro de planta creado existosamente"}, status_code=status.HTTP_201_CREATED)
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

#Plants data 
@router.get("/info", response_model=PlantInfo)
async def get_plant_info(device_id:str, current_user: Annotated[User, Depends(get_current_user)]) -> PlantInfo:
    try:
        plant_info = await get_plant_data(device_id, current_user)
        return plant_info
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.get("/advice", response_model=List[PlantAdvice])
async def get_plant_advice(device_id:str, current_user: Annotated[User, Depends(get_current_user)]) -> List[PlantAdvice]:
    try:
        plant_advice = await get_plant_advice_data(device_id, current_user)
        return plant_advice
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.get("/info/list", response_model=List[PlantInfo])
async def get_plant_list_info(current_user: Annotated[User, Depends(get_current_user)]) -> List[PlantInfo]:
    try:
        plant_list = await get_plant_list()
        return plant_list
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@router.get("/user-plant")
async def get_user_plant(device_id:str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        plant_id = await retrieve_user_plant(device_id, current_user)
        return {"plantId": plant_id}
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)