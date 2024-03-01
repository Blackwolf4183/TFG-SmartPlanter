from pydantic import BaseModel
from fastapi import Depends, HTTPException, status

from .securityController import get_password_hash, verify_password
from ..database import create_supabase_client


#Initialize supabase client
supabase = create_supabase_client()

class Device(BaseModel):
    id: int
    clientId: str

#Checks if device exists in database given one of its attributes
def device_exists(key: str = "clientid", value: str = None):
    device = supabase.from_("device").select("*").eq(key, value).execute()
    return len(device.data) > 0

#Creates device in DB
async def create_device(clientId, password):

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

#Checks device password and id and if correct, creates a row in DB linking the user to an existing device
async def link_user_to_device(device_id, device_password, user):

    #Password and device validation
    device = supabase.from_("device").select("*").eq("clientid", device_id).execute()

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