#include <DHT.h>
#include <ESP8266WiFi.h>

#define DHTTYPE DHT11
#define DHTPIN 2
#define POWERSOILSENSORPIN 4
#define POWERPHOTOSENSORPIN 5
#define POWERPOTENTIOMETERPIN 12
#define BUTTONPIN 14
#define ANALOGPIN A0

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastActionTime = 0;
const unsigned long interval = 1000; // Interval between actions in milliseconds

// Define states for the state machine
enum State
{
  TEMP_HUMIDITY,
  PHOTO_RESISTOR,
  SOIL_MOISTURE,
  POTENTIOMETER,
  END_MEASUREMENTS,
};

State currentState = TEMP_HUMIDITY;


void setup()
{
  pinMode(POWERSOILSENSORPIN, OUTPUT);
  pinMode(POWERPHOTOSENSORPIN, OUTPUT);
  pinMode(POWERPOTENTIOMETERPIN, OUTPUT);

  pinMode(BUTTONPIN, INPUT);

  int buttonVal = digitalRead(BUTTONPIN);

  pinMode(BUTTONPIN, OUTPUT);
  digitalWrite(BUTTONPIN, HIGH);

  Serial.begin(9600);
  dht.begin();

  while (!Serial) { }

  Serial.println();
  Serial.println("ESP wakes up");
  
  Serial.println("---------------------------------");
  Serial.print("Button val: ");
  Serial.println(buttonVal);
}

int analogReadPhotoResistor()
{
  digitalWrite(POWERPHOTOSENSORPIN, HIGH);
  digitalWrite(POWERSOILSENSORPIN, LOW);
  digitalWrite(POWERPOTENTIOMETERPIN, LOW);
  return analogRead(ANALOGPIN);
}

int analogReadSoilMoistureSensor()
{
  digitalWrite(POWERPHOTOSENSORPIN, LOW);
  digitalWrite(POWERSOILSENSORPIN, HIGH);
  digitalWrite(POWERPOTENTIOMETERPIN, LOW);
  return analogRead(ANALOGPIN);
}

int analogReadPotentiometer()
{
  digitalWrite(POWERPHOTOSENSORPIN, LOW);
  digitalWrite(POWERSOILSENSORPIN, LOW);
  digitalWrite(POWERPOTENTIOMETERPIN, HIGH);
  return analogRead(ANALOGPIN);
}



void checkTempHumidity()
{
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature))
  {
    Serial.println("Error de sensor");
    // Handle error if needed
  }

  Serial.print("Humidity: ");
  Serial.println(humidity);
  Serial.print("Temperature: ");
  Serial.println(temperature);
}

void checkPhotoResistor()
{
  int lightLevelValue = analogReadPhotoResistor();

  Serial.print("Light level: ");
  Serial.println(lightLevelValue);
}

void checkSoilMoisture()
{
  int soilMoistureSensor = analogReadSoilMoistureSensor();

  Serial.print("Soil Moisture: ");
  Serial.println(soilMoistureSensor);
}

void checkPotentiometer()
{
  int potentiometerValue = analogReadPotentiometer();

  Serial.print("Potentiometer: ");
  Serial.println(potentiometerValue);
}


void loop()
{
  unsigned long currentTime = millis();
  

  // Check if the interval has passed since the last action
  if (currentTime - lastActionTime >= interval)
  {
    lastActionTime = currentTime;

    // Perform the action based on the current state
    switch (currentState)
    {
      case TEMP_HUMIDITY:
        checkTempHumidity();
        currentState = PHOTO_RESISTOR;
        break;

      case PHOTO_RESISTOR:
        checkPhotoResistor();
        currentState = SOIL_MOISTURE;
        break;

      case SOIL_MOISTURE:
        checkSoilMoisture();
        currentState = POTENTIOMETER;
        break;

      case POTENTIOMETER:
        checkPotentiometer();
        currentState = END_MEASUREMENTS;
        break;

      case END_MEASUREMENTS:
        //Send values captured to azure
        //....

        //Send arduino to deepSleep 
        //TEST
        digitalWrite(BUTTONPIN, LOW);
        delay(1000);

        Serial.println("Going to sleep for 10 seconds");
        ESP.deepSleep(10e6);
        
        Serial.println("Esto no se debería ver");
        currentState = TEMP_HUMIDITY;
        break;
    }
  }
}
