from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta
import math

from ..database import create_supabase_client
from ..Controllers.deviceController import device_exists, device_belongs_to_user

from ..Models.IrrigationModel import IrrigationForm, IrrigationData

#Initialize supabase client
supabase = create_supabase_client()

IRRIGATION_TYPE_THRESHOLD = "THRESHOLD"
IRRIGATION_TYPE_PROGRAMMED = "PROGRAMMED"
IRRIGATION_AMOUNT_MULTIPLIER = 16/1000 #16 ml/s for each millisecond

def get_plant_lastest_readings(device_id: str, user):
    """
        Returns the last row registered in the DB from all sensor readings
    Args:
        device_id (str): 
        user (User): 

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"

    Returns:
        Json object with latest readings of sensors
    """
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #Call database function for latest readings
    latest_readings_function_result = supabase.rpc("get_latest_reading",{'givendeviceid':device_id}).execute()

    return latest_readings_function_result.data

def get_plant_daily_consumption(device_id: str, user):
    """
        Returns the amount of ml of water the plant has used today
    Args:
        device_id (str): 
        user (User): 

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"

    Returns:
        Json object with daily watering consumption
    """
    #Get historial data from plant
    historical_data = get_plant_historical_readings(device_id, user)
    # Get today's date in the format 'YYYY-MM-DD'
    today_date = datetime.now().strftime('%Y-%m-%d')

    # Filter the array to get objects corresponding to today's date
    filtered_data = [obj for obj in historical_data if obj['timestamp'].split('T')[0] == today_date]

    watering_sum = 0
    for obj in filtered_data:
        watering_sum += obj["irrigationamount"] 

    return watering_sum
 
def get_plant_historical_readings(device_id: str, user):
    """
        Returns historial readings of registered device
    Args:
        device_id (str):
        user (User):

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"

    Returns:
        Array of json objects with readings over time
    """
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #Call database function for latest readings
    historical_readings_function_result = supabase.rpc("get_historical_readings",{'givendeviceid':device_id}).execute()

    historical_data = historical_readings_function_result.data

    #Multiply irrigationtime by ml/s
    for obj in historical_data:
        obj['irrigationamount'] *= IRRIGATION_AMOUNT_MULTIPLIER

    return historical_data


async def create_plant_irrigation_registry(irrigation_data:IrrigationForm, user):
    """
        Creates in db a row in the table irrigation containing information about irrigation method, humidity threshold (if needed) and irrigation amount.
        Also if the method is "programmed", then creates automatically in the table irrigationTimes rows to register the hours the plant should be watered.

    Args:
        irrigation_data (IrrigationForm): Class containing information that the client should pass to specify the watering needs
        user (_type_): User

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"
        HTTPException: status_code=400 detail="Errores de validación"
    """
    #Check if device exists
    if not device_exists("id", irrigation_data.deviceId):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(irrigation_data.deviceId, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #Delete previous information about irrigation for device
    supabase.from_("irrigation").delete().eq('deviceid',irrigation_data.deviceId).execute()
    supabase.from_("irrigationtimes").delete().eq('deviceid',irrigation_data.deviceId).execute()

    try:
        #Check irrigation type selected by client 
        if irrigation_data.irrigationType == IRRIGATION_TYPE_THRESHOLD:

            #Validation on threshold 
            if irrigation_data.threshold == None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se ha establecido un umbral de riego")
            if irrigation_data.threshold < 1 or irrigation_data.threshold > 99:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El umbral de humedad para riego debe estar entre 1 y 100")

            #Create registry in irrigation table with threshold to value specified and irrigation amount
            irrigation = supabase.from_("irrigation")\
                    .insert({"deviceid": irrigation_data.deviceId, "irrigationtype": IRRIGATION_TYPE_THRESHOLD, "threshold": irrigation_data.threshold, 
                             "irrigationamount": irrigation_data.irrigationAmount * (1/IRRIGATION_AMOUNT_MULTIPLIER)})\
                    .execute()

            #If nothing comes back then there was an error creating it
            if not irrigation or not irrigation.data:  # Check if irrigation data exists
                raise HTTPException(status_code=500, detail="No se ha podido insertar el método de riego")
            
        elif irrigation_data.irrigationType == IRRIGATION_TYPE_PROGRAMMED:
            
            #Validation on irrigation hours
            if irrigation_data.everyHours == None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se ha establecido un intervalo de riego")
            if irrigation_data.everyHours < 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se puede poner un intervalo de riego menor a 1 hora")

            irrigation = supabase.from_("irrigation")\
                    .insert({"deviceid": irrigation_data.deviceId, "irrigationtype": IRRIGATION_TYPE_PROGRAMMED, "threshold": None,
                              "irrigationamount": irrigation_data.irrigationAmount * (1/IRRIGATION_AMOUNT_MULTIPLIER), "everyhours": irrigation_data.everyHours})\
                    .execute()
            
            #If nothing comes back then there was an error creating it
            if not irrigation or not irrigation.data:  # Check if device data exists
                raise HTTPException(status_code=500, detail="No se ha podido insertar el método de riego")
            
            #Create as many registries as times in a day we want the plant to be watered
            #For that we will divide in 24 hours in a day by the number of hours the user wants it's plant to be watered and create that number of registries
            times_to_water_plant = 24 / irrigation_data.everyHours

            # Define the initial time as midnight
            starting_hour = math.ceil(times_to_water_plant) / 2

            #No half hours
            if(starting_hour == int(starting_hour)):
                initial_time = datetime.strptime( str(int(starting_hour)) + ':00', '%H:%M')
            else:
                initial_time = datetime.strptime( str(int(starting_hour)) + ':30', '%H:%M')

            for _ in range(math.ceil(times_to_water_plant)):
                irrigation_times = supabase.from_("irrigationtimes")\
                        .insert({"deviceid": irrigation_data.deviceId, "Time": initial_time.strftime('%H:%M')})\
                        .execute()
                
                if not irrigation_times or not irrigation_times.data:  # Check if irrigation_times data exists
                    raise HTTPException(status_code=500, detail="No se ha podido insertar el método de riego")
                
                initial_time += timedelta(hours=irrigation_data.everyHours)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipo de irrigación incorrecto")
        
    except:
        #"Rollback" any inserts that may have been made
        supabase.from_("irrigation").delete().eq('deviceid',irrigation_data.deviceId).execute()
        supabase.from_("irrigationtimes").delete().eq('deviceid',irrigation_data.deviceId).execute()
        raise

        
async def get_irrigation_data(device_id:str, user) -> IrrigationData:
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #Retreive data from irrigation table
    irrigation = supabase.from_("irrigation").select("*").eq("deviceid", device_id).execute()

    if not irrigation or not irrigation.data:  # Check if irrigation data exists
        return IrrigationData(irrigationType="none", irrigationAmount=0)
    
    
    response_object = IrrigationData(irrigationType=irrigation.data[0]["irrigationtype"], threshold=irrigation.data[0]["threshold"], everyHours=irrigation.data[0]["everyhours"], irrigationAmount=irrigation.data[0]["irrigationamount"] * IRRIGATION_AMOUNT_MULTIPLIER)

    return response_object