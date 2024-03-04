from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.responses import JSONResponse

from typing import Annotated

from ..Controllers.securityController import User,get_current_user
from ..Controllers.plantController import get_plant_lastest_readings, get_plant_historical_readings

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
async def get_latest_plant_data(device_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        historical_data = get_plant_historical_readings(device_id, current_user)
        return {"data": historical_data}
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
