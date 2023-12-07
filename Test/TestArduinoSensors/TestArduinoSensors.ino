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
  
  digitalWrite(POWERPHOTOSENSORPIN, HIGH);  

  int lightLevelValue = analogRead(ANALOGPIN);
  Serial.print("Light level: ");
  Serial.println(lightLevelValue);

  digitalWrite(POWERPHOTOSENSORPIN, LOW);  
  
  delay(500);

  digitalWrite(POWERSOILSENSORPIN, HIGH);  

  int soilMoistureSensor = analogRead(ANALOGPIN);
  Serial.print("Soil Moisture: ");
  Serial.println(soilMoistureSensor);
  
  digitalWrite(POWERSOILSENSORPIN, LOW);  

  Serial.println("---------------------------------");
}
