from datetime import datetime, timedelta
from typing import Annotated
from ..database import Session

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import os

#Models
from ..Models.user import User as UserModel



class Token(BaseModel):
    access_token: str
    token_type: str

#Data encoded by token
class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    id: int
    username: str
    email: str


class UserInDB(User):
    hashed_password: str

#password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


#Compares hash with password with an applied hash
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

#Hashes password
def get_password_hash(password):
    return pwd_context.hash(password)

#Gets UserInDb (only hashed password)
def get_user(username: str):
    db = Session()
    db_user = db.query(UserModel).filter(UserModel.username == username).first()

    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    else:
        user_in_db = UserInDB(
            id=db_user.id,
            username=db_user.username,
            disabled=db_user.disabled,
            reserved_space=db_user.reserved_space,
            hashed_password=db_user.hashed_password
        )
        return user_in_db



#Given username and password check if user exists and password is correct, then return user
def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

#Creates JWT token given data from user and expire time
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("SECRET_KEY"), algorithm=os.environ.get("ALGORITHM"))
    return encoded_jwt

#Returns user given token
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, os.environ.get("SECRET_KEY"), algorithms=[os.environ.get("ALGORITHM")])
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user






