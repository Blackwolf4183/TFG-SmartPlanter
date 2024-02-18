from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.responses import JSONResponse

import os
from typing import Annotated

from ..Controllers.deviceController import create_device
from ..Controllers.securityController import User,get_current_user
from ..Controllers import deviceController

router = APIRouter()

#TODO: add another layer of protection to add devices
#Route to register device into db
@router.post("/register")
async def register_device(
    clientId: str = Form(...),
    password: str = Form(...)
):
    created_device = await create_device(clientId, password)
    return created_device

#Route to link user to device in db
@router.post("/link")
async def link_user_to_device(device_id, device_password, current_user: Annotated[User, Depends(get_current_user)]):

    try:
        await deviceController.link_user_to_device(device_id, device_password,current_user)
        return JSONResponse(content={"message": "Device linked successfully"}, status_code=201)
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to link user to device: {str(e)}"}, status_code=500)


