#include <DHT.h>
#include <ESP8266WiFi.h>

#define DHTTYPE DHT11
#define DHTPIN 2
#define POWERSOILSENSORPIN 4
#define POWERPHOTOSENSORPIN 5
#define POWERPOTENTIOMETERPIN 12
#define BUTTONPIN 14
#define RELAYPIN 0
#define ANALOGPIN A0

DHT dht(DHTPIN, DHTTYPE);

void setup()
{
  pinMode(POWERSOILSENSORPIN, OUTPUT);
  pinMode(POWERPHOTOSENSORPIN, OUTPUT);
  pinMode(POWERPOTENTIOMETERPIN, OUTPUT);
  pinMode(RELAYPIN, OUTPUT);

  pinMode(BUTTONPIN, INPUT);

  //Set relay on low so it doesn't activate the water pump
  digitalWrite(RELAYPIN, LOW);

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

  //TODO: do one action or the other depending of value of buttonVal 

  if(buttonVal == 1)
  {
    Serial.println("Starting plant watering ");
    //Button manually pushed
    digitalWrite(RELAYPIN, HIGH);
    delay(3000); //TODO: change dinamically according to potentiometer value
    digitalWrite(RELAYPIN, LOW);
  }
 
  
  gatherData();
  deepSleepESP();
}

void deepSleepESP()
{
  digitalWrite(BUTTONPIN, LOW);
  delay(1000);

  Serial.println("Going to sleep for 10 seconds");
  ESP.deepSleep(10e6);
  
  Serial.println("Esto no se debería ver");
}

void gatherData()
{
  int lightLevelValue = analogReadPhotoResistor();
  Serial.print("Light level: ");
  Serial.println(lightLevelValue);

  delay(500);

  int soilMoistureSensor = analogReadSoilMoistureSensor();

  Serial.print("Soil Moisture: ");
  Serial.println(soilMoistureSensor);

  delay(500);

  int potentiometerValue = analogReadPotentiometer();

  Serial.print("Potentiometer: ");
  Serial.println(potentiometerValue);

  delay(500);

  digitalWriteLowAll();
  //checkTempHumidity();
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();;

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

void digitalWriteLowAll(){
  digitalWrite(POWERPHOTOSENSORPIN, LOW);
  digitalWrite(POWERSOILSENSORPIN, LOW);
  digitalWrite(POWERPOTENTIOMETERPIN, LOW);
  delay(100);
}

int analogReadPhotoResistor() {
  digitalWriteLowAll();
  digitalWrite(POWERPHOTOSENSORPIN, HIGH);
  delay(100);
  return analogRead(ANALOGPIN);
}

int analogReadSoilMoistureSensor() {
  digitalWriteLowAll();
  digitalWrite(POWERSOILSENSORPIN, HIGH);
  delay(100);
  return analogRead(ANALOGPIN);
}

int analogReadPotentiometer() {
  digitalWriteLowAll();
  digitalWrite(POWERPOTENTIOMETERPIN, HIGH);
  delay(100);
  return analogRead(ANALOGPIN);
}



void loop(){

}


