from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta
import math

from typing import List

from ..database import create_supabase_client
from ..Controllers.deviceController import device_exists, device_belongs_to_user

from ..Models.IrrigationModel import IrrigationForm, IrrigationData
from ..Models.PlantInfoModel import PlantInfo, PlantAdvice

#Initialize supabase client
supabase = create_supabase_client()

IRRIGATION_TYPE_THRESHOLD = "THRESHOLD"
IRRIGATION_TYPE_PROGRAMMED = "PROGRAMMED"
IRRIGATION_AMOUNT_MULTIPLIER = 16/1000 #16 ml/s for each millisecond
IRRIGATION_MAX_AMOUNT_ML = 200

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


def plant_exists(value: str) -> bool:
    """
    Checks if plant exists in database given its id

    Args:
        value (str, optional): value to search id.

    Returns:
        bool: true if device exists 
    """
    plant = supabase.from_("plantinfo").select("*").eq("id", value).execute()
    return len(plant.data) > 0

async def create_plant_info_registry(device_id:str, plant_id:str , user):
    """
    Creates association in DB between available plants in DB and device, if device has plant associated, then just update the plant

    Args:
        device_id (str): device_id
        plant_id (str): plant_id
        user (_type_): user

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"
        HTTPException: status_code=404 detail="No existe la planta indicada en nuestro sistema"
    """
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #Check if plant_id exists in DB
    if not plant_exists(plant_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No existe la planta indicada en nuestro sistema")

    #Delete previous registry (if existed)
    supabase.from_("deviceplant").delete().eq('deviceid',device_id).execute()

    #Get client id from device id
    device = supabase.from_("device").select("*").eq("id", device_id).execute()
    client_id = device.data[0]["clientid"]

    #Delete previous data from arduinodata table
    supabase.from_("arduinodata").delete().eq('clientid',client_id).execute()

    #Create new registry
    supabase.from_("deviceplant").insert({"deviceid": device_id, "plantid": plant_id}).execute()

    #Retrieve type of watering for plant and depending on it update the watering parameters
    #Get plant info
    plantinfo = supabase.from_("plantinfo").select("*").eq("id", plant_id).execute()

    #Get watering type
    watering_type = plantinfo.data[0]["watering"]

    if watering_type == "INFREQUENT":

        irrigation_data = IrrigationForm(
            deviceId=device_id,
            irrigationType=IRRIGATION_TYPE_PROGRAMMED,
            threshold= None,
            everyHours= 12,
            irrigationAmount= IRRIGATION_MAX_AMOUNT_ML/8)
        
        await create_plant_irrigation_registry(irrigation_data,user)

    elif watering_type == "MODERATE":
        irrigation_data = IrrigationForm(
            deviceId=device_id,
            irrigationType=IRRIGATION_TYPE_PROGRAMMED,
            threshold= None,
            everyHours= 12,
            irrigationAmount= IRRIGATION_MAX_AMOUNT_ML/4)
        
        await create_plant_irrigation_registry(irrigation_data,user)
    elif watering_type == "REGULAR":
        irrigation_data = IrrigationForm(
            deviceId=device_id,
            irrigationType=IRRIGATION_TYPE_PROGRAMMED,
            threshold= None,
            everyHours= 6,
            irrigationAmount= IRRIGATION_MAX_AMOUNT_ML/4)
        
        await create_plant_irrigation_registry(irrigation_data,user)
    elif watering_type == "FREQUENT":
        irrigation_data = IrrigationForm(
            deviceId=device_id,
            irrigationType=IRRIGATION_TYPE_PROGRAMMED,
            threshold= None,
            everyHours= 6,
            irrigationAmount= IRRIGATION_MAX_AMOUNT_ML/2)
        
        await create_plant_irrigation_registry(irrigation_data,user)


async def get_plant_data(device_id:str , user) -> PlantInfo:
    """Devuelve la información de la planta asociada un dispositivo

    Args:
        device_id (str): _description_
        user (_type_): _description_

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"
        HTTPException: status_code=404 detail="El usuario no ha escogido una planta aun"

    Returns:
        PlantInfo: _description_
    """
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")

    #Search plant associated with user by deviceId
    deviceplant = supabase.from_("deviceplant").select("*").eq("deviceid", device_id).execute()
    if len(deviceplant.data) == 0: 
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El usuario no ha escogido una planta aun")
    
    plant_id =deviceplant.data[0]["plantid"] 

    plantinfo_request = supabase.from_("plantinfo").select("*").eq("id", plant_id).execute()
    plantinfo_data = plantinfo_request.data[0]

    return PlantInfo(plantId=plantinfo_data["id"] ,commonName=plantinfo_data["commonname"] , scientificName=plantinfo_data["scientificname"] , 
                     imageUrl= plantinfo_data["imageurl"], watering= plantinfo_data["watering"],sunlight= plantinfo_data["sunlight"],
                    plantDescription= plantinfo_data["plantdescription"],careLevel= plantinfo_data["carelevel"],maxTemp= plantinfo_data["maxtemperature"],
                    minTemp= plantinfo_data["mintemperature"])

    
async def get_plant_list() -> List[PlantInfo]:
    plant_info_list = []
    plant_info_request = supabase.from_("plantinfo").select("*").execute()
    plant_info_data = plant_info_request.data
    
    for plant_data in plant_info_data:
        plant_info_list.append(
            PlantInfo(
                plantId=plant_data["id"],
                commonName=plant_data["commonname"],
                scientificName=plant_data["scientificname"],
                imageUrl=plant_data["imageurl"],
                watering=plant_data["watering"],
                sunlight=plant_data["sunlight"],
                plantDescription=plant_data["plantdescription"],
                careLevel=plant_data["carelevel"],
                maxTemp=plant_data["maxtemperature"],
                minTemp=plant_data["mintemperature"]
            )
        )
    
    return plant_info_list

async def retrieve_user_plant(device_id:str , user) -> int: 
    """Devuelve el plantId asociado a un dispositivo (null si no existe)

    Args:
        device_id (str): _description_
        user (_type_): _description_

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"

    Returns:
        int: plantId
    """
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #Get plantId for user
    deviceplant = supabase.from_("deviceplant").select("*").eq("deviceid", device_id).execute()
    if len(deviceplant.data) == 0: 
        return None
    else:
        return deviceplant.data[0]["plantid"]
    

async def get_plant_advice_data(device_id:str , user) -> List[PlantAdvice]:
    #Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    #Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #Get plantId for user
    deviceplant = supabase.from_("deviceplant").select("*").eq("deviceid", device_id).execute()
    plantId = deviceplant.data[0]["plantid"]

    #Get list of guides associated with plantId
    plantguide = supabase.from_("plantguide").select("*").eq("plantid", plantId).execute()

    plant_advice_list = []
    
    for guide in plantguide.data:
        print(guide)
        plant_advice_list.append(
            PlantAdvice(
                id=guide["id"],
                plantId=guide["plantid"],
                guideType=guide["guidetype"],
                description=guide["description"]
            )
        )

    return plant_advice_list

    

