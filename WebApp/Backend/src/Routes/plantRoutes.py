from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.responses import JSONResponse

from typing import Annotated

from ..Controllers.securityController import User,get_current_user

router = APIRouter()

#Route to get token for client to log in
@router.get("/")
async def get_lastest_errors(device_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        return {"errors": errors}
    except HTTPException as http_exception:
        return JSONResponse(content={"message": f"HTTP Error {http_exception.status_code}: {http_exception.detail}"}, status_code=http_exception.status_code)
    except Exception as e:
        return JSONResponse(content={"message": f"Failed to get errors: {str(e)}"}, status_code=500)
    


 
