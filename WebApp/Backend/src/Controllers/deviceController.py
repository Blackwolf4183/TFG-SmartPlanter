from pydantic import BaseModel
from fastapi import Depends, HTTPException, status

from .securityController import get_password_hash, verify_password
from ..database import create_supabase_client


#Initialize supabase client
supabase = create_supabase_client()

class Device(BaseModel):
    id: int
    clientId: str


def device_exists(key: str = "clientid", value: str = None) -> bool:
    """
    Checks if device exists in database given one of its attributes

    Args:
        key (str, optional): attribute to look for in the db. Defaults to "clientid".
        value (str, optional): value to search attribute. Defaults to None.

    Returns:
        bool: true if device exists 
    """
    device = supabase.from_("device").select("*").eq(key, value).execute()
    return len(device.data) > 0


def device_belongs_to_user(device_id: str, user_id: str) -> bool:
    """
    Checks if user has associated device given deviceId(a number that identifies it) and userId

    Args:
        device_id (str): number that id's the device in the database
        user_id (str): user id

    Returns:
        bool: true if device belongs to user
    """
    #Retrieve row where userid == user.id && deviceId == device_id
    user_device = supabase.from_("userdevice").select("*").eq("deviceid", device_id).eq("userid", user_id).execute()
    return len(user_device.data) != 0

#Creates device in DB
async def create_device(clientId:str, password:str):
    """_summary_

    Args:
        clientId (str): _description_
        password (str): _description_

    Raises:
        HTTPException: status_code=500 detail="El dispositivo no ha podido ser creado"
        HTTPException: status_code=400 detail="El dispositivo ya está registrado"

    """

    if device_exists(value=clientId):
        raise HTTPException(status_code=400, detail="El dispositivo ya está registrado")

    # Hash the password before storing it
    hashed_password = get_password_hash(password)

    # Add the new device to the database session
    device = supabase.from_("device")\
            .insert({"clientid": clientId, "password": hashed_password})\
            .execute()

    #Device object sent as response
    if device and device.data:  # Check if device data exists
        inserted_device_data = device.data[0]  # Access the first item in the list
        response_device= Device(id=inserted_device_data["id"], clientId=inserted_device_data["clientid"])
        return {"message": "Dispositivo creado existosamente", "device": response_device}
    else:
        raise HTTPException(status_code=500, detail="El dispositivo no ha podido ser creado")

async def link_user_to_device(client_id:str, device_password:str, user) -> str:
    """
    Checks device password and id and if correct, creates a row in DB linking the user to an existing device

    Args:
        client_id (str):
        device_password (str): password for device  
        user (User): 

    Raises:
        HTTPException: status_code=400 detail="No hay un dispositivo registrado con tal id"
        HTTPException: status_code=401 detail="Contraseña incorrecta para el dispositivo"
        HTTPException: status_code=400 detail="El usuario ya tiene un dispositivo enlazado"
        HTTPException: status_code=500 detail="El dispositivo no ha podido ser enlazado con el usuario"
    """
    #Password and device validation
    device = supabase.from_("device").select("*").eq("clientid", client_id).execute()

    if(len(device.data) == 0):
        #No device registered with that id
        raise HTTPException(status_code=400, detail="No hay un dispositivo registrado con tal id")
    
    #Check if password is incorrect
    if(not verify_password(device_password, device.data[0]["password"])):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta para el dispositivo")
    
    #Check device not already linked with user (assumption that each user has only one device)
    exiting_userdevice = supabase.from_("userdevice").select("*").eq("userid", user.id).execute()
    if(len(exiting_userdevice.data) > 0):
        raise HTTPException(status_code=400, detail="El usuario ya tiene un dispositivo enlazado")

    #Passed filters, now we can insert the (user, device) pair in db
    user_device = supabase.from_("userdevice")\
            .insert({"userid": user.id, "deviceid": device.data[0]["id"]})\
            .execute()
    
    if not user_device or not user_device.data:  # Check if device data exists
        raise HTTPException(status_code=500, detail="El dispositivo no ha podido ser enlazado con el usuario")
    
    return device.data[0]["id"]