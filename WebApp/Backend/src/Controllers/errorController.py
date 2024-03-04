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
        HTTPException: _description_
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        list of errors
    """

    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User doesn't have access to device")

    #Get device name to find errors based on "clientId" property
    device = supabase.from_("device").select("*").eq("id", device_id).execute()
    if len(device.data) == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User doesn't have access to device")

    #Textual name of the client
    client_id = device.data[0]["clientid"]

    errors = supabase.from_("errorlog")\
            .select("*")\
            .eq("clientid", client_id)\
            .order("errortime", desc=True)\
            .limit(10)\
            .execute()

    error_data = errors.data

    return error_data