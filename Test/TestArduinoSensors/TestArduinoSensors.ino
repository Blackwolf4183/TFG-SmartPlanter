#include <DHT.h>

#define DHTTYPE DHT11
#define DHTPIN 2 // En nodemcu es pin D4
#define POWERSOILSENSORPIN 4 // pin D2
#define POWERPHOTOSENSORPIN 5 // pin D1
#define ANALOGPIN A0

DHT dht(DHTPIN, DHTTYPE);

void setup(){
  
  pinMode(POWERSOILSENSORPIN, OUTPUT);  
  pinMode(POWERPHOTOSENSORPIN, OUTPUT);  

  Serial.begin(9600);
  dht.begin();
}

int analogReadPhotoResistor(){
  digitalWrite(POWERPHOTOSENSORPIN, HIGH); 
  digitalWrite(POWERSOILSENSORPIN, LOW);
  delay(500);
  return analogRead(ANALOGPIN);
}

int analogReadSoilMoistureSensor(){
  digitalWrite(POWERPHOTOSENSORPIN, LOW); 
  digitalWrite(POWERSOILSENSORPIN, HIGH);
  delay(500);
  return analogRead(ANALOGPIN);
}

void loop()
{
  delay(2000);
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if(isnan(humidity) || isnan(temperature)){
    Serial.println("Error de sensor");
    return; 
  }

  Serial.print("Humidity: ");
  Serial.println(humidity);
  Serial.print("Temperature: ");
  Serial.println(temperature);
  
  int lightLevelValue = analogReadPhotoResistor();
  delay(200);
  int soilMoistureSensor = analogReadSoilMoistureSensor();
  delay(200);

  Serial.print("Light level: ");
  Serial.println(lightLevelValue);
  
  Serial.print("Soil Moisture: ");
  Serial.println(soilMoistureSensor);

  Serial.println("---------------------------------");
}
