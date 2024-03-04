from pydantic import BaseModel
from fastapi import Depends, HTTPException, status

from ..database import create_supabase_client
from ..Controllers.deviceController import device_exists, device_belongs_to_user

#Initialize supabase client
supabase = create_supabase_client()


def get_plant_lastest_readings(device_id: str, user):
    """
        Returns the last row registered in the DB from all sensor readings
    Args:
        device_id (str): 
        user (User): 

    Raises:
        HTTPException: status_code=404 detail="Device not found"
        HTTPException: status_code=401 detail="User doesn't have access to device"

    Returns:
        Json object with latest readings of sensors
    """
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User doesn't have access to device")
    
    #Call database function for latest readings
    latest_readings_function_result = supabase.rpc("get_latest_reading",{'givendeviceid':device_id}).execute()

    return latest_readings_function_result.data
    
def get_plant_historical_readings(device_id: str, user):
    """
        Returns historial readings of registered device
    Args:
        device_id (str):
        user (User):

    Raises:
        HTTPException: status_code=404 detail="Device not found"
        HTTPException: status_code=401 detail="User doesn't have access to device"

    Returns:
        Array of json objects with readings over time
    """
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User doesn't have access to device")
    
    #Call database function for latest readings
    historical_readings_function_result = supabase.rpc("get_historical_readings",{'givendeviceid':device_id}).execute()

    return historical_readings_function_result.data