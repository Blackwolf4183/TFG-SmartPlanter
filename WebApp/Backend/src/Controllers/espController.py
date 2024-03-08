from fastapi import Depends, HTTPException, status

from ..database import create_supabase_client
from ..Controllers.deviceController import device_exists, device_belongs_to_user
from ..Controllers.plantController import IRRIGATION_TYPE_PROGRAMMED, IRRIGATION_TYPE_THRESHOLD

#Initialize supabase client
supabase = create_supabase_client()

def should_irrigate_plant(client_Id: str) -> bool:
    
    if not device_exists(key="clientid", value=client_Id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Get device ID
    device_query = supabase.from_("device").select("*").eq("clientid", client_Id).execute()
    device_id = device_query.data[0]["id"]

    #Search irrigation type based on device_id
    irrigation = supabase.from_("irrigation").select("*").eq("deviceid", device_id).execute()
    print(irrigation.data)
    #If no irrigation data then do not water the plant
    if not (irrigation and irrigation.data):
        return False
    
    irrigation_type = irrigation.data[0]["irrigationtype"]

    #Get irrigation amount for later use
    irrigation_amount = irrigation.data[0]["irrigationamount"]

    #TODO: terminar logica
    if irrigation_type == IRRIGATION_TYPE_THRESHOLD :

        threshold = irrigation.data[0]["threshold"]
        

        #TODO: change
        return True
    elif irrigation_type == IRRIGATION_TYPE_PROGRAMMED:

        #TODO: change
        return True 
    return True

