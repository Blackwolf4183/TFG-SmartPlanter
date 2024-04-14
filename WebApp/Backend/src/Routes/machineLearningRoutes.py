from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.responses import JSONResponse

import os
from typing import Annotated

from ..Controllers.machineLearningController import register_plant_state, get_plant_vote_info
from ..Controllers.securityController import User,get_current_user
from ..Models.VoteInfoModel import VoteInfo

router = APIRouter()

@router.post("/vote")
async def vote_plant_state(device_id: str, plant_state: int,current_user: Annotated[User, Depends(get_current_user)]):
    try:
        await register_plant_state(device_id, plant_state, current_user)
        return JSONResponse(content={"message": "Se ha registrado el voto correctamente"}, status_code=status.HTTP_201_CREATED)
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@router.get("/vote", response_model=VoteInfo)
async def get_plant_today_state(device_id: str,current_user: Annotated[User, Depends(get_current_user)]) -> VoteInfo:
    try:
        vote_info = await get_plant_vote_info(device_id, current_user)
        return vote_info
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)