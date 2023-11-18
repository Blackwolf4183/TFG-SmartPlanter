#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "arduino_secrets.h"

// WiFi
const char *ssid = SECRET_SSID; // Enter your WiFi name
const char *password = SECRET_PASS;  // Enter WiFi password

// MQTT Broker
const char *mqtt_broker = MQTT_BROKER;
const char *topic = "data";
const char *mqtt_username = MQTT_USER;
const char *mqtt_password = MQTT_PASSWORD;
const int mqtt_port = MQTT_PORT;

WiFiClient espClient;
PubSubClient client(espClient);

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
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(callback);
  while (!client.connected()) {
      String client_id = "esp8266-smartPlanter-";
      client_id += String(WiFi.macAddress());
      Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
      if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
          Serial.println("Public emqx mqtt broker connected");
      } else {
          Serial.print("failed with state ");
          Serial.print(client.state());
          delay(2000);
      }
  }
  //subscribe and publish
  client.subscribe(topic);
  client.publish(topic, "SmartPlanter up and running");
}

void callback(char *topic_received, byte *payload, unsigned int length) {


  //Send callback info to arduino nano
  if (!strcmp(topic_received, topic)) {
        if (!strncmp((char *)payload, "successful", length)) {
          //server accepted instruction
          Serial.println("c1");
        } else if (!strncmp((char *)payload, "error", length)) {
          //something went wrong on server
          Serial.println("c2");
        }
    }

}


void loop() {
  client.loop();
  delay(100);
  //client.publish(topic, values); 
}
