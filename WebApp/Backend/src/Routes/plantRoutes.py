from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.responses import JSONResponse

from typing import Annotated

from ..Controllers.securityController import User,get_current_user

router = APIRouter()

#TODO: 
@router.get("/")
async def still_to_do(device_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        return {"errors": errors}
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=500)
    


 
