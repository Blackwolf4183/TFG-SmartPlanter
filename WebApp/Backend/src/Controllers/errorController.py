from ..database import create_supabase_client

from fastapi import Depends, HTTPException, status
from ..Controllers.deviceController import device_exists, device_belongs_to_user

#Initialize supabase client
supabase = create_supabase_client()

async def get_latest_errors(device_id: str, user):
    """
    Returns 10 latest errors from DB associated with device given 

    Args:
        device_id (str):
        user (User): 

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"

    Returns:
        list of errors
    """

    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")

    #Get device name to find errors based on "clientId" property
    device = supabase.from_("device").select("*").eq("id", device_id).execute()
    if len(device.data) == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")

    #Identifier for the client
    client_id = device.data[0]["clientid"]

    errors = supabase.from_("errorlog")\
            .select("*")\
            .eq("clientid", client_id)\
            .order("errortime", desc=True)\
            .limit(10)\
            .execute()

    error_data = errors.data

    return error_data

async def delete_error_data(device_id: str, user):
    """Deletes all error associated with a device

    Args:
        device_id (str): deviceId
        user (_type_): user

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"
    """
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #Get device name to find errors based on "clientId" property
    device = supabase.from_("device").select("*").eq("id", device_id).execute()
    if len(device.data) == 0:
        
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")

    #Identifier for the client
    client_id = device.data[0]["clientid"]

    #Delete errors from db where clientid === client_id
    supabase.from_("errorlog").delete().eq("clientid", client_id).execute()