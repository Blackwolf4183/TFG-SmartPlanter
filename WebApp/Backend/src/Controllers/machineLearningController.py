import datetime

from fastapi import  HTTPException, status

from ..database import create_supabase_client
from ..Controllers.deviceController import device_exists, device_belongs_to_user
from ..Models.VoteInfoModel import VoteInfo
from ..Models.ModelInfoModel import ModelInfo

from datetime import date

PLANT_STATES = [
    "Saludable",
    "Estresada",
    "Deshidratada",
    "Exceso de riego",
    "Deficiencia nutrientes",
    "Enferma"
]


#Initialize supabase client
supabase = create_supabase_client()

from fastapi import HTTPException, status
from datetime import datetime

async def register_plant_state(device_id: str, plant_state: int, user):
    """
    Creates registry in db with current date, device and plant_state 

    Args:
        device_id (str): Device ID
        plant_state (int): Plant state ID
        user (User): User object

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"
        HTTPException: status_code=400 detail="Estado de la planta no válido"
        HTTPException: status_code=409 detail="Ya existe un registro para el dispositivo hoy"
    """
    # Check if device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    # Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    # Validate plant_state
    if not isinstance(plant_state, int) or not (0 <= plant_state <= 5):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado de la planta no válido")
    
    # Today's date without time
    today_date = datetime.now().date()
    formatted_date = today_date.isoformat()

    # Check for an existing record for today
    existing_record = supabase.from_("plantstate").select("*").eq("deviceid", device_id).eq("recordeddate", formatted_date).execute()
    if existing_record.data and len(existing_record.data) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un registro para el dispositivo hoy")

    # Create a new record
    new_record = supabase.from_("plantstate").insert({
        "state": plant_state,
        "recordeddate": formatted_date,
        "deviceid": device_id
    }).execute()

    if not new_record.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al registrar el estado de la planta")


async def get_plant_vote_info(device_id: str, user) -> VoteInfo:
    """
    Returns information about user's vote for the current day.

    Args:
        device_id (str): Device ID
        user (User): User object

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"
        HTTPException: status_code=400 detail="Estado de la planta no válido"
    """
    # Check if the device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    

    # Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    # Today's date in ISO 8601 format ("YYYY-MM-DD")
    today_date = datetime.now().date().isoformat()

    # Retrieve the record for today
    response = supabase.from_("plantstate").select("*").eq("deviceid", device_id).eq("recordeddate", today_date).execute()
    vote_data = response.data

    # Construct the VoteInfo based on the retrieved data
    if vote_data and len(vote_data) > 0:
        vote_info = VoteInfo(hasVotedToday=True, vote=vote_data[0]['state'])
    else:
        # Return default values if no vote record exists
        vote_info = VoteInfo(hasVotedToday=False, vote=-1)

    return vote_info


async def get_current_model_info(device_id: str, user) -> ModelInfo:
    """
    Returns an object with information about model trained by user

    Args:
        device_id (str): Device ID
        user (User): User object

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"
        HTTPException: status_code=400 detail="Estado de la planta no válido"
    """

    # Check if the device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    # Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")

    #Retrieve number of records of arduino data
    count_query = supabase.rpc("get_readings_count",{'givendeviceid':device_id}).execute()
    count = count_query.data

    #Retrieve state from table modelstate table
    model_state = supabase.from_("modelstate").select("*").eq("deviceid", device_id).execute()

    #Get the amount of differnt votes user has used
    used_states = supabase.rpc("get_used_states",{'givendeviceid':device_id}).execute()
    used_states_count = used_states.data

    #A model can be trained if there are more than 300 records and 2 different states voted
    can_train_model = used_states_count >= 2 and count >= 300

    #Record exists holding information about previous model
    if len(model_state.data) > 0:
        return ModelInfo(last_trained = model_state.data[0]["lastupdated"], training = False, sensor_measurements = count, can_train=can_train_model)

    #Default response, no model previously trained
    return ModelInfo(last_trained = None, training = False, sensor_measurements= count, can_train=can_train_model)


async def train_model_with_current_data(device_id: str, user):
    """
    Trains a model using the data collected by the user
    Args:
        device_id (str): Device ID
        user (User): User object

    Raises:
        HTTPException: status_code=404 detail="Dispositivo no encontrado"
        HTTPException: status_code=401 detail="El usuario no tiene acceso al dispositivo"
        HTTPException: status_code=400 detail="Estado de la planta no válido"
    """
    # Check if the device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    # Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    #TODO: 
    