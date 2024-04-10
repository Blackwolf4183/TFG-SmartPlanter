from fastapi import APIRouter
from fastapi import  HTTPException, Form, status, Header
from fastapi import Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Annotated
from dotenv import load_dotenv
import os

from ..Controllers.deviceController import create_device
from ..Controllers.securityController import User,get_current_user
from ..Controllers import deviceController

load_dotenv()

router = APIRouter()

class DeviceLinkRequest(BaseModel):
    client_id: str
    device_password: str

def get_api_key(api_key: str = Header(...)):
    expected_api_key = os.environ.get("API_KEY")
    if api_key != expected_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )

#TODO: add another layer of protection to add devices
#Route to register device into db
#This route is only meant to be used for development, as devices should be registered once they are manufactured into the system
@router.post("/register")
async def register_device(
    clientId: str = Form(...),
    password: str = Form(...),
    api_key: str = Depends(get_api_key)  # Add the API Key dependency here
):
    created_device = await create_device(clientId, password)
    return created_device

#Route to link user to device in db
@router.post("/link")
async def link_user_to_device(request_data: DeviceLinkRequest, current_user: Annotated[User, Depends(get_current_user)]):

    try:
        device_id = await deviceController.link_user_to_device(request_data.client_id, request_data.device_password,current_user)
        return JSONResponse(content={"message": "Dispositivo emparejado existosamente", "deviceId": device_id}, status_code=status.HTTP_201_CREATED)
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"No se ha podido enlazar el usuario al dispositivo: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


#Route to change current user device
@router.patch("/")
async def change_user_device(request_data: DeviceLinkRequest, current_user: Annotated[User, Depends(get_current_user)]):

    try:
        device_id = await deviceController.change_user_device(request_data.client_id, request_data.device_password,current_user)
        return JSONResponse(content={"message": "Dispositivo emparejado existosamente", "deviceId": device_id}, status_code=status.HTTP_201_CREATED)
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"No se ha podido enlazar el usuario al dispositivo: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)