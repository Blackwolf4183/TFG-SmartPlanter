import datetime

from fastapi import Depends, HTTPException, status

from ..database import create_supabase_client
from ..Controllers.deviceController import device_exists
from ..Controllers.plantController import IRRIGATION_TYPE_PROGRAMMED, IRRIGATION_TYPE_THRESHOLD
from ..Models.IrrigationModel import ESPIrrigationInfo

#Initialize supabase client
supabase = create_supabase_client()

def should_irrigate_plant(client_Id: str, soil_moisture: int) -> ESPIrrigationInfo:
    """
    Returns an object that specifies if the plant with given client_Id should be watered and the amount of water to be used

    Args:
        client_Id (str): Client_id (string) of the plant to be watered
        soil_moisture (int): Current measurement of soil humidity given by the ESP

    Raises:
        HTTPException: status_code=status.HTTP_404_NOT_FOUND detail="Dispositivo no encontrado"

    Returns:
        ESPIrrigationInfo: Information about if plant should be watered and amount for it
    """

    if not device_exists(key="clientid", value=client_Id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Get device ID
    device_query = supabase.from_("device").select("*").eq("clientid", client_Id).execute()
    device_id = device_query.data[0]["id"]

    #Search irrigation type based on device_id
    irrigation = supabase.from_("irrigation").select("*").eq("deviceid", device_id).execute()
    
    #print(irrigation.data)

    #If no irrigation data then do not water the plant
    if not (irrigation and irrigation.data):
        return ESPIrrigationInfo(shouldIrrigate=False, irrigationAmount=0)
    
    #Get irrigation type set for the device 
    irrigation_type = irrigation.data[0]["irrigationtype"]

    #Get irrigation amount for the device for later use
    irrigation_amount = irrigation.data[0]["irrigationamount"]

    if irrigation_type == IRRIGATION_TYPE_THRESHOLD :

        #Get threshold value 
        threshold = irrigation.data[0]["threshold"]

        #The humidity of the soil has dropped below the threshold value
        if soil_moisture < threshold:
            return ESPIrrigationInfo(shouldIrrigate=True, irrigationAmount=irrigation_amount)
        else:
            #No need to water the plant as it still is humid enough
            return ESPIrrigationInfo(shouldIrrigate=False, irrigationAmount=0)
        
    elif irrigation_type == IRRIGATION_TYPE_PROGRAMMED:

        #Get irrigationtimes records that are not completed and in the future
        irrigationtimes = supabase.from_("irrigationtimes").select("*").eq("deviceid", device_id).eq("completed",False).gte('Time', datetime.datetime.now()).order("Time",desc=False).execute()

        #Check there if are times set for the irrigation of the plant
        if not irrigationtimes.data or len(irrigationtimes.data) == 0:
            return ESPIrrigationInfo(shouldIrrigate=False, irrigationAmount=0)
        
        #print(irrigationtimes.data) #DEBUG

        #Check if time difference between current time and irrigation time is less or more than an hour
        # Convert string representation of irrigation time into a datetime object
        irrigation_time_str = irrigationtimes.data[0]["Time"]
        irrigation_time_obj = datetime.datetime.strptime(irrigation_time_str, '%H:%M:%S')

        current_time = datetime.datetime.now()

        # Set the date part of the current time to be the same as the irrigation time
        current_time = current_time.replace(year=irrigation_time_obj.year, 
                                            month=irrigation_time_obj.month, 
                                            day=irrigation_time_obj.day)

        #print("Current time is: ")
        #print(current_time)

        # Calculate the time difference
        time_difference = irrigation_time_obj - current_time

        # Check if the time difference is less than an hour
        if time_difference <= datetime.timedelta(hours=1):
            # Less than an hour remaining for irrigation
            print("###Less than an hour remaining for irrigation")
            #Set the completed field to True for the registry we have used
            supabase.table("irrigationtimes").update({"completed": True}).eq("id",irrigationtimes.data[0]["id"]).execute()

            #Return the corresponding object
            return ESPIrrigationInfo(shouldIrrigate=True, irrigationAmount=irrigation_amount) 
        else:
            # More than an hour remaining for irrigation
            print("###More than an hour remaining for irrigation")
            return ESPIrrigationInfo(shouldIrrigate=False, irrigationAmount=0) 



