
from fastapi import  HTTPException, status

from ..database import create_supabase_client
from ..Controllers.deviceController import device_exists, device_belongs_to_user
from ..Models.VoteInfoModel import VoteInfo
from ..Models.ModelInfoModel import ModelInfo

#Machine Learning libraries
import pandas
import numpy as np
import matplotlib.pyplot as plt

from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import StratifiedShuffleSplit

from keras.models import Sequential
from keras.utils import to_categorical
from keras.layers import Dense
from keras.layers import LSTM, Dense, Input


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


# convert series to supervised learning
def series_to_supervised(data, n_in=1, n_out=1, dropnan=True):
    n_vars = 1 if type(data) is list else data.shape[1]
    df = pandas.DataFrame(data)
    cols, names = list(), list()
    # input sequence (t-n, ... t-1)
    for i in range(n_in, 0, -1):
        cols.append(df.shift(i))
        names += [('var%d(t-%d)' % (j+1, i)) for j in range(n_vars)]
        
    # forecast sequence (t, t+1, ... t+n)
    for i in range(0, n_out):
        cols.append(df.shift(-i))
        
    if i == 0:
        names += [('var%d(t)' % (j+1)) for j in range(n_vars)]
    else:
        names += [('var%d(t+%d)' % (j+1, i)) for j in range(n_vars)]

    # put it all together
    agg = pandas.concat(cols, axis=1)
    agg.columns = names
    # drop rows with NaN values
    if dropnan:
        agg.dropna(inplace=True)

    return agg

def prepare_dataset(data):
    #Import dataset as pandas format
    dataset = pandas.DataFrame(data)
    dataset.drop(['id','deviceid'], axis=1, inplace=True)

    #Set timestamp as index
    dataset.set_index('timestamp', inplace=True)

    # Ensure all data is float32 except the 'state' column
    for col in dataset.columns:
        if col != 'state':
            dataset[col] = dataset[col].astype('float32')

    # Separate the 'state' column
    state_column = dataset['state']
    # Drop the 'state' column from the dataset
    numerical_data = dataset.drop('state', axis=1)

    # Initialize and apply the MinMaxScaler
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_numerical_data = scaler.fit_transform(numerical_data)

    # Recombine the scaled numerical data with the 'state' column
    scaled_numerical_data = pandas.DataFrame(scaled_numerical_data, columns=numerical_data.columns, index=dataset.index)
    scaled_numerical_data['state'] = state_column

    # Now transform dataset into a supervised learning format if needed
    # For example, assuming series_to_supervised is a function you've defined or it's part of a package you are using:

    #INFO: second parameters determine how far to look back to make the prediction
    reframed = series_to_supervised(scaled_numerical_data, 48, 1)

    # Drop columns you don't want to predict
    # Update index to match dropped features after reframing if necessary
    reframed.drop(reframed.columns[[6,7,8,9,10]], axis=1, inplace=True)

    return reframed

def get_training_and_testing_sets(reframed): 
    values = reframed.values
    X = values[:, :-1]
    y = values[:, -1].astype(int)  # Ensure labels are integer

    sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    for train_index, test_index in sss.split(X, y):
        train_X, test_X = X[train_index], X[test_index]
        train_y, test_y = y[train_index], y[test_index]

    # Reshape input to be 3D [samples, timesteps, features]
    train_X = train_X.reshape((train_X.shape[0], 1, train_X.shape[1]))
    test_X = test_X.reshape((test_X.shape[0], 1, test_X.shape[1]))
    
    return train_X, train_y, test_X, test_y


def encode_states(train_y,test_y):
    # Convert labels to integer encodings
    label_encoder = LabelEncoder()
    train_y_encoded = label_encoder.fit_transform(train_y)
    test_y_encoded = label_encoder.transform(test_y)

    # Convert labels to one-hot encodings
    train_y_categorical = to_categorical(train_y_encoded)
    test_y_categorical = to_categorical(test_y_encoded)

    return train_y_categorical, test_y_categorical

def fit_model(train_X,train_y_categorical,test_X,test_y_categorical):
    model = Sequential()
    model.add(Input(shape=(train_X.shape[1], train_X.shape[2])))
    model.add(LSTM(50))
    model.add(Dense(train_y_categorical.shape[1], activation='softmax'))  # Output layer for categorical prediction
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    # fit network
    history = model.fit(train_X, train_y_categorical, epochs=50, batch_size=72, validation_data=(test_X, test_y_categorical), verbose=2, shuffle=False)

    return model

def cross_validate_model(model,test_X,test_y_categorical):
    yhat_probs = model.predict(test_X)
    yhat_classes = np.argmax(yhat_probs, axis=1)

    # Assuming test_y_categorical is one-hot encoded, convert it back to class labels for evaluation
    test_y_labels = np.argmax(test_y_categorical, axis=1)

    # Step 2: Evaluate the model
    accuracy = accuracy_score(test_y_labels, yhat_classes)
    print('Accuracy:', accuracy)

    # Print the confusion matrix
    cm = confusion_matrix(test_y_labels, yhat_classes)
    print('Confusion Matrix:\n', cm)

    return accuracy

def train_model_with_current_data(device_id: str, user):
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
    try: 

        # Check if the device exists
        if not device_exists("id", device_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
        
        # Check if device belongs to user
        if not device_belongs_to_user(device_id, user.id):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
        
        # Check if a record already exists in modelstate for this device
        existing_model_state = supabase.from_("modelstate").select("*").eq("deviceid", device_id).execute()
        
        # If no record exists, create one with 'trained' set to False
        if len(existing_model_state.data) == 0:
            supabase.from_("modelstate").insert({"deviceid": device_id, "training": False}).execute()

        #update model state to TRAINING
        supabase.from_("modelstate").update({"training": "true"}).eq("deviceid", device_id).execute()

        #Get dataset by querying the DB
        dataset_query = supabase.rpc("get_data_for_model",{'givendeviceid':device_id}).execute()

        #Drop uneccessary columns, scale the dataset and prepare its variables for training
        reframed = prepare_dataset(dataset_query.data)

        #Training and testing sets for cross validation
        train_X, train_y, test_X, test_y = get_training_and_testing_sets(reframed)

        train_y_categorical, test_y_categorical = encode_states(train_y,test_y)

        #fit model to data
        model = fit_model(train_X,train_y_categorical,test_X,test_y_categorical)

        model.summary()

        #Validation of model
        accuracy = cross_validate_model(model,test_X,test_y_categorical)

        #save model into file
        model_filename = f"./MLModels/model-{device_id}.keras" 
        model.save(model_filename)

        print(f"Model saved to {model_filename}")

        #update model state to not training
        supabase.from_("modelstate").update({"training": "false", "lastupdated":datetime.now().date().isoformat(), "modelpath": model_filename, "accuracy":accuracy}).eq("deviceid", device_id).execute()
    except:
        #Set model to not training in any case the training failed
        supabase.from_("modelstate").update({"training": "false"}).eq("deviceid", device_id).execute()

        device = supabase.from_("device").select("*").eq("id", device_id).execute()
        client_id = device.data[0]["clientid"]

        #Insert training error into errorlog table
        supabase.from_("errorlog").insert([{"errormessage": "Algo ha fallado durante el entrenamiento del modelo.", "errortime":datetime.now().isoformat(), "source":"API", "clientid": client_id}])


async def make_prediction_with_saved_model(device_id: str, user):
    # Check if the device exists
    if not device_exists("id", device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    
    # Check if device belongs to user
    if not device_belongs_to_user(device_id, user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El usuario no tiene acceso al dispositivo")
    
    # Check if a record already exists in modelstate for this device
    existing_model_state = supabase.from_("modelstate").select("*").eq("deviceid", device_id).execute()
    
    # If no record exists, create one with 'trained' set to False
    if len(existing_model_state.data) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se ha encontrado ningún modelo guardado para el usuario")
    
    #TODO: load model from path in existing_model_state
    
    #TODO: Take data from database and crop it to last 48 readings
    dataset_query = supabase.rpc("get_data_for_model",{'givendeviceid':device_id}).execute()
    #Drop uneccessary columns, scale the dataset and prepare its variables for training
    reframed = prepare_dataset(dataset_query.data)

    #TODO: make prediction with model

    #TODO: depending on model prediction create a custom response 