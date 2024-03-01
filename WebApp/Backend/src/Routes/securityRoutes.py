from fastapi import APIRouter
from fastapi import  HTTPException, Form
from fastapi import Depends, status
from fastapi.security import  OAuth2PasswordRequestForm

import os

from ..Controllers.securityController import Token, authenticate_user, create_access_token, create_user, get_user_deviceID
from datetime import  timedelta
from typing import Annotated
from pydantic import EmailStr


router = APIRouter()

#Route to get token for client to log in
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrecto",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    #Get user associated deviceID if exists in DB
    user_deviceID = get_user_deviceID(user)
    
    access_token_expires = timedelta(minutes=int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES")))
    
    #Include username and deviceId in token 
    access_token = create_access_token(
        data={"sub": user.username, "deviceID": user_deviceID}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

#Route to register user into db
@router.post("/register")
async def register_user(
    username: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...)
):
    created_user = await create_user(username, email, password)
    return created_user




