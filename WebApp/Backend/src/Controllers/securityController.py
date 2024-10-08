from datetime import datetime, timedelta
from typing import Annotated
from ..database import create_supabase_client

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import os

#Initialize supabase client
supabase = create_supabase_client()

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

class UserWithDevice(BaseModel):
    id: int
    username: str
    email: str
    deviceId: int

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

def get_user(username: str):
    """
    Gets UserInDb (only hashed password)

    Args:
        username (str): 

    Raises:
        HTTPException: status_code=status.HTTP_404_NOT_FOUND detail="User not found"

    Returns:
        UserInDb
    """

    user = supabase.from_("user").select("*").eq("username", username).execute()

    if user and user.data:
        inserted_user_data = user.data[0]
        user_in_db = UserInDB(
            id=inserted_user_data["id"],
            username=inserted_user_data["username"],
            email=inserted_user_data["email"],
            hashed_password=inserted_user_data["password"]
        )
        return user_in_db
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


def get_user_deviceID(user: UserInDB) -> str :
    """
    Returns None if user doesn't have a device associated, returns the device id if user has already device associated

    Args:
        user (UserInDB): User details

    """
    #Row from database representing connection between user and device
    user_device = supabase.from_("userdevice").select("*").eq("userid", user.id).execute()

    if len(user_device.data) > 0:
        return user_device.data[0]["deviceid"]
    else:
        return None



def authenticate_user(username: str, password: str):
    """
    Given username and password check if user exists and password is correct, then return user

    Args:
        username (str): username
        password (str): Plain password

    Returns:
        _type_: _description_
    """
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Creates JWT token given data from user and expire time

    Args:
        data (dict): Information to be encoded in token
        expires_delta (timedelta | None, optional): time to expire . Defaults to None.

    Returns:
        str: JWT with encoded information
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("SECRET_KEY"), algorithm=os.environ.get("ALGORITHM"))
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    """
    Returns user given token

    Raises:
        credentials_exception: HTTP 401 Could not validate credentials

    Returns:
        user
    """

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

def user_exists(key: str = "email", value: str = None) -> bool:
    """
    Checks if user exists in database based on a key and value 

    Args:
        key (str, optional): Key to look for in DB in users table. Defaults to "email".
        value (str, optional): Value to search for depending on the key. Defaults to None.

    Returns:
        bool: true if user exists
    """
    user = supabase.from_("user").select("*").eq(key, value).execute()
    return len(user.data) > 0


async def create_user(username: str, email: EmailStr, password: str):
    """
    Creates user in DB

    Args:
        username (str): 
        email (EmailStr):
        password (str): 

    Raises:
        HTTPException: status_code=400 detail="Email already registered"
        HTTPException: status_code=400 detail="Username already registered"
        HTTPException: status_code=500 detail="User could not be created"

    Returns:
        User if it was correctly inserted in DB
    """
    if user_exists(value=email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    if user_exists(key="username", value=username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    # Hash the password before storing it
    hashed_password = get_password_hash(password)

    # Add the new user to the database session
    user = supabase.from_("user")\
            .insert({"username": username, "email": email, "password": hashed_password})\
            .execute()

    #User object sent as response
    if user and user.data:  # Check if user data exists
        inserted_user_data = user.data[0]  # Access the first item in the list
        response_user = User(id=inserted_user_data["id"], username=inserted_user_data["username"], email=inserted_user_data["email"])
        return {"message": "User created successfully", "user": response_user}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User could not be created")





