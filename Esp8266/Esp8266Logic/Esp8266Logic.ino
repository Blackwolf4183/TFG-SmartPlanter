#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "arduino_secrets.h"

// WiFi
const char *ssid = SECRET_SSID; // Enter your WiFi name
const char *password = SECRET_PASS;  // Enter WiFi password

// MQTT Broker
String device_id = "Planter";
const char *mqtt_broker = MQTT_BROKER;
const char *topic = "data";
const char* mqtt_clientId = "Planter";
const char *mqtt_username = MQTT_USER;
const char *mqtt_password = MQTT_PASSWORD;
const int mqtt_port = MQTT_PORT;

WiFiClient espClient;
void callback(char* topic, byte* payload, unsigned int length);
PubSubClient mqtt_client(mqtt_broker, mqtt_port, callback, espClient);

void setup() {
  // Set software serial baud to 115200;
  Serial.begin(115200);
  // connecting to a WiFi network
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.println("Intentando conectar a red WIFI..");
  }
  Serial.println("Conectado a red wifi");
  //connecting to a mqtt broker
  mqtt_connect();
}

void mqtt_connect(){
// Loop until we're reconnected
  while (!mqtt_client.connected()) {
    Serial.println("Attempting MQTT connection...");
    // Attempt to connect
    //    if (mqtt_client.connect(mqtt_clientId, mqtt_user, mqtt_password)) {
    if (mqtt_client.connect(mqtt_clientId)) {
      Serial.println("MQTT Client Connected");
      mqtt_publish((char*)("Hi from " + device_id).c_str());
      // Subscribe
      mqtt_subscribe(topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqtt_client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void mqtt_publish(char * data) {
  mqtt_connect();
  if (mqtt_client.publish(topic, data))
    Serial.println("Publish \"" + String(data) + "\" ok");
  else
    Serial.println("Publish \"" + String(data) + "\" failed");
}
void mqtt_subscribe(const char * topic) {
  if (mqtt_client.subscribe(topic))
    Serial.println("Subscribe \"" + String(topic) + "\" ok");
  else
    Serial.println("Subscribe \"" + String(topic) + "\" failed");
}


void callback(char* topic, byte* payload, unsigned int length) {
  String command;
  Serial.print("\n\nMessage arrived [");
  Serial.print(topic);
  Serial.println("] ");
  for (int i = 0; i < length; i++)
    command += (char)payload[i];

  if (command.length() > 0)
    Serial.println("Command receive is : " + command);

  DynamicJsonDocument doc(1024);
  deserializeJson(doc, command);
  JsonObject obj = doc.as<JsonObject>();

  
}


void loop() {
  if (!mqtt_client.loop())
    mqtt_connect();

  delay(1000);
}