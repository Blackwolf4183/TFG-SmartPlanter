#pragma region Libraries

// C99 libraries
#include <cstdlib>
#include <stdbool.h>
#include <string.h>
#include <time.h>

// Libraries for MQTT client, WiFi connection and SAS-token generation.
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <base64.h>
#include <bearssl/bearssl.h>
#include <bearssl/bearssl_hmac.h>
#include <libb64/cdecode.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>

// Azure IoT SDK for C includes
#include <az_core.h>
#include <az_iot.h>
#include <azure_ca.h>

// Additional sample headers
#include "iot_configs.h"

//Sensors libraries
#include <DHT.h>

#pragma endregion Libraries

#pragma region process defined variables
// When developing for your own Arduino-based platform,
// please follow the format '(ard;<platform>)'.
#define AZURE_SDK_CLIENT_USER_AGENT "c%2F" AZ_SDK_VERSION_STRING "(ard;esp8266)"

// Utility macros and defines
#define sizeofarray(a) (sizeof(a) / sizeof(a[0]))
#define ONE_HOUR_IN_SECS 3600
#define NTP_SERVERS "pool.ntp.org", "time.nist.gov"
#define MQTT_PACKET_SIZE 1024
#pragma endregion process defined variables

#define MIN_ANALOG 0
#define MAX_ANALOG 1023
#define MAX_WATERING_TIME 12500 //In milliseconds
#define AIR_VALUE 500//Values used to compare the capacitive soil moisture sensor values
#define WATER_VALUE 100

// Pins used 
#define DHTTYPE DHT11
#define DHTPIN 2 //D4
#define POWERSOILSENSORPIN 4 //D2
#define POWERPHOTOSENSORPIN 5 //D1
#define POWERPOTENTIOMETERPIN 12 //D6
#define BUTTONPIN 14 //D5
#define RELAYPIN 0 //D3
#define ANALOGPIN A0

#pragma region IoT_configs to variables

// Translate iot_configs.h defines into variables used by the sample
static const char* ssid = IOT_CONFIG_WIFI_SSID;
static const char* password = IOT_CONFIG_WIFI_PASSWORD;
static const char* host = IOT_CONFIG_IOTHUB_FQDN;
static const char* device_id = IOT_CONFIG_DEVICE_ID;
static const char* device_key = IOT_CONFIG_DEVICE_KEY;
static const char* server_name = SMARTPLANTER_API;
static const int port = 8883;

#pragma endregion IoT_configs to variables

#pragma region memory allocation for variables

// Memory allocated for the sample's variables and structures.
static WiFiClientSecure wifi_client;
static X509List cert((const char*)ca_pem);
static PubSubClient mqtt_client(wifi_client);
static az_iot_hub_client client;
static char sas_token[200];
static uint8_t signature[512];
static unsigned char encrypted_signature[32];
static char base64_decoded_device_key[32];
static unsigned long next_telemetry_send_time_ms = 0;
static char telemetry_topic[128];
static uint8_t telemetry_payload[100];
static uint32_t telemetry_send_count = 0;

#pragma endregion memory allocation for variables

//Https Request certificate
static X509List cert2((const char*)ca_pem);

#pragma region Auxiliary functions

// Auxiliary functions

static void connectToWiFi()
{
  
  Serial.println();
  Serial.print("Connecting to WIFI SSID ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.print("WiFi connected, IP address: ");
  Serial.println(WiFi.localIP());
}

static void initializeTime()
{
  Serial.print("Setting time using SNTP");

  configTime(-5 * 3600, 0, NTP_SERVERS);
  time_t now = time(NULL);
  while (now < 1510592825)
  {
    delay(500);
    Serial.print(".");
    now = time(NULL);
  }
  Serial.println("done!");
}

static char* getCurrentLocalTimeString()
{
  time_t now = time(NULL);
  return ctime(&now);
}

static void printCurrentTime()
{
  Serial.print("Current time: ");
  Serial.print(getCurrentLocalTimeString());
}

void receivedCallback(char* topic, byte* payload, unsigned int length)
{
  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println("");
}

static void initializeClients()
{
  az_iot_hub_client_options options = az_iot_hub_client_options_default();
  options.user_agent = AZ_SPAN_FROM_STR(AZURE_SDK_CLIENT_USER_AGENT);

  wifi_client.setTrustAnchors(&cert);
  if (az_result_failed(az_iot_hub_client_init(
          &client,
          az_span_create((uint8_t*)host, strlen(host)),
          az_span_create((uint8_t*)device_id, strlen(device_id)),
          &options)))
  {
    Serial.println("Failed initializing Azure IoT Hub client");
    return;
  }

  mqtt_client.setServer(host, port);
  mqtt_client.setCallback(receivedCallback);
}

/*
 * @brief           Gets the number of seconds since UNIX epoch until now.
 * @return uint32_t Number of seconds.
 */
static uint32_t getSecondsSinceEpoch() { return (uint32_t)time(NULL); }

static int generateSasToken(char* sas_token, size_t size)
{
  az_span signature_span = az_span_create((uint8_t*)signature, sizeofarray(signature));
  az_span out_signature_span;
  az_span encrypted_signature_span
      = az_span_create((uint8_t*)encrypted_signature, sizeofarray(encrypted_signature));

  uint32_t expiration = getSecondsSinceEpoch() + ONE_HOUR_IN_SECS;

  // Get signature
  if (az_result_failed(az_iot_hub_client_sas_get_signature(
          &client, expiration, signature_span, &out_signature_span)))
  {
    Serial.println("Failed getting SAS signature");
    return 1;
  }

  // Base64-decode device key
  int base64_decoded_device_key_length
      = base64_decode_chars(device_key, strlen(device_key), base64_decoded_device_key);

  if (base64_decoded_device_key_length == 0)
  {
    Serial.println("Failed base64 decoding device key");
    return 1;
  }

  // SHA-256 encrypt
  br_hmac_key_context kc;
  br_hmac_key_init(
      &kc, &br_sha256_vtable, base64_decoded_device_key, base64_decoded_device_key_length);

  br_hmac_context hmac_ctx;
  br_hmac_init(&hmac_ctx, &kc, 32);
  br_hmac_update(&hmac_ctx, az_span_ptr(out_signature_span), az_span_size(out_signature_span));
  br_hmac_out(&hmac_ctx, encrypted_signature);

  // Base64 encode encrypted signature
  String b64enc_hmacsha256_signature = base64::encode(encrypted_signature, br_hmac_size(&hmac_ctx));

  az_span b64enc_hmacsha256_signature_span = az_span_create(
      (uint8_t*)b64enc_hmacsha256_signature.c_str(), b64enc_hmacsha256_signature.length());

  // URl-encode base64 encoded encrypted signature
  if (az_result_failed(az_iot_hub_client_sas_get_password(
          &client,
          expiration,
          b64enc_hmacsha256_signature_span,
          AZ_SPAN_EMPTY,
          sas_token,
          size,
          NULL)))
  {
    Serial.println("Failed getting SAS token");
    return 1;
  }

  return 0;
}

static int connectToAzureIoTHub()
{
  size_t client_id_length;
  char mqtt_client_id[128];
  if (az_result_failed(az_iot_hub_client_get_client_id(
          &client, mqtt_client_id, sizeof(mqtt_client_id) - 1, &client_id_length)))
  {
    Serial.println("Failed getting client id");
    return 1;
  }

  mqtt_client_id[client_id_length] = '\0';

  char mqtt_username[128];
  // Get the MQTT user name used to connect to IoT Hub
  if (az_result_failed(az_iot_hub_client_get_user_name(
          &client, mqtt_username, sizeofarray(mqtt_username), NULL)))
  {
    printf("Failed to get MQTT clientId, return code\n");
    return 1;
  }

  Serial.print("Client ID: ");
  Serial.println(mqtt_client_id);

  Serial.print("Username: ");
  Serial.println(mqtt_username);

  mqtt_client.setBufferSize(MQTT_PACKET_SIZE);

  while (!mqtt_client.connected())
  {
    time_t now = time(NULL);

    Serial.print("MQTT connecting ... ");

    if (mqtt_client.connect(mqtt_client_id, mqtt_username, sas_token))
    {
      Serial.println("connected.");
    }
    else
    {
      Serial.print("failed, status code =");
      Serial.print(mqtt_client.state());
      Serial.println(". Trying again in 5 seconds.");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }

  mqtt_client.subscribe(AZ_IOT_HUB_CLIENT_C2D_SUBSCRIBE_TOPIC);

  return 0;
}

static void establishConnection()
{
  connectToWiFi();
  initializeTime();
  printCurrentTime();
  initializeClients();

  // The SAS token is valid for 1 hour by default in this sample.
  // After one hour the sample must be restarted, or the client won't be able
  // to connect/stay connected to the Azure IoT Hub.
  if (generateSasToken(sas_token, sizeofarray(sas_token)) != 0)
  {
    Serial.println("Failed generating MQTT password");
  }
  else
  {
    connectToAzureIoTHub();
  }

}

static char* getTelemetryPayload()
{
  az_span temp_span = az_span_create(telemetry_payload, sizeof(telemetry_payload));
  temp_span = az_span_copy(temp_span, AZ_SPAN_FROM_STR("{ \"msgCount\": "));
  (void)az_span_u32toa(temp_span, telemetry_send_count++, &temp_span);
  temp_span = az_span_copy(temp_span, AZ_SPAN_FROM_STR(" }"));
  temp_span = az_span_copy_u8(temp_span, '\0');

  return (char*)telemetry_payload;
}

#pragma endregion Auxiliary functions

//Given an error message string sends that error to the IoT Hub to store it in the logs
static void sendError(String errorMessage)
{
  Serial.print(millis());
  Serial.print(" ESP8266 Sending error . . . ");
  
  if (az_result_failed(az_iot_hub_client_telemetry_get_publish_topic(&client, NULL, telemetry_topic, sizeof(telemetry_topic), NULL)))
  {
    Serial.println("Failed publishing into topic");
    return;
  }

  // Use the function arguments in the JSON data
  String jsonData = String("{\"ErrorMessage\":\"") + errorMessage + "\"}";

  mqtt_client.publish(telemetry_topic, jsonData.c_str(), false);
  Serial.println("OK");
  delay(100);
}

String irrigationError;

//Performs a call to the API and returns -1 if the plant should not be watered, else returns a number indicating the number of milliseconds the pump will be active for
static int getIrrigationInfoFromServer(int soilMoisturePercent)
{
  if(WiFi.status()== WL_CONNECTED){
    WiFiClientSecure client;
    HTTPClient http;


    //Certificate for secure http request
    initializeTime();
    client.setTrustAnchors(&cert2);

    String serverPath = String(server_name) + "/esp/irrigate" + "?client_id=" + String(device_id) + "&soil_moisture=" + soilMoisturePercent;

    // Your Domain name with URL path or IP address with path
    http.begin(client, serverPath);
    
    // Send HTTP GET request
    //TODO: if server takes a bit from sleep then the request times out, make it wait longer
    int httpResponseCode = http.GET();
    
    if (httpResponseCode>0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);

      // Create a JSON object
      StaticJsonDocument<200> doc;
      
      // Parse the JSON payload
      DeserializationError error = deserializeJson(doc, payload);
      
      // Check for parsing errors
      if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.c_str());
        irrigationError = "Error when trying to deserialize JSON from API";
        http.end();
        return -1; // Return -1 to indicate an error
      }

      // Extract the value of shouldIrrigate
      bool shouldIrrigate = doc["shouldIrrigate"];

      // If shouldIrrigate is true, return the irrigation amount as an integer
      if (shouldIrrigate) {
        // Convert the irrigation amount to an integer
        float irrigationAmountFloat = doc["irrigationAmount"];
        int irrigationAmountInt = static_cast<int>(irrigationAmountFloat);
        return irrigationAmountInt;
      } else {
        return 0; // Return 0 if shouldIrrigate is false
      }

    }
    else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      irrigationError = "Error when trying to communicate with API, error code: " + String(httpResponseCode);
      return -1;
      http.end();
    }
    // Free resources
    http.end();
  }
  else {
    Serial.println("WiFi Disconnected");
  }

  return -1;
}

static void sendTelemetry(int wateringMilliseconds, int lightLevelValue, int soilMoisturePercentage, float temperature, float humidity)
{
  Serial.print(millis());
  Serial.print(" ESP8266 Sending telemetry . . . ");
  
  if (az_result_failed(az_iot_hub_client_telemetry_get_publish_topic(&client, NULL, telemetry_topic, sizeof(telemetry_topic), NULL)))
  {
    Serial.println("Failed publishing into topic");
    return;
  }

  // Use the function arguments in the JSON data
  String jsonData = "{\"SoilMoisture\":" + String(soilMoisturePercentage) +
                    ",\"Temperature\":" + String(temperature) +
                    ",\"AirHumidity\":" + String(humidity) +
                    ",\"LightLevel\":" + String(lightLevelValue) +
                    ",\"WaterLevel\":" + "0" + //TODO: maybe in a future add water level
                    ",\"IrrigationTime\":" + String(wateringMilliseconds) + "}";

  mqtt_client.publish(telemetry_topic, jsonData.c_str(), false);
  Serial.println("OK");
  delay(100);
}


// Arduino setup and loop main functions.
DHT dht(DHTPIN, DHTTYPE);

//Variables to collect sensor measurements
int wateringMilliseconds;
int lightLevelPercent;
int soilMoisturePercent;
float temperature;
float humidity;

//Main program (this activates each time the esp wakes from deepsleep)
void setup()
{
  
  digitalWrite(RELAYPIN, LOW); 

  pinMode(POWERSOILSENSORPIN, OUTPUT);
  pinMode(POWERPHOTOSENSORPIN, OUTPUT);
  pinMode(POWERPOTENTIOMETERPIN, OUTPUT);
  pinMode(RELAYPIN, OUTPUT);

  //Set relay on low so it doesn't activate the water pump
  digitalWrite(RELAYPIN, LOW);

  dht.begin();

  while (!Serial) { }
  
  Serial.begin(115200);

  Serial.println();Serial.println("---------------------------------");
  Serial.println("ESP wakes up");
  
  //Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  
  //Get data from sensors and send it to azure
  gatherData();

  //Get watering time from server
  int wateringTimeAPI = getIrrigationInfoFromServer(soilMoisturePercent);

  //Clear variables and connect to mqtt azure
  client = az_iot_hub_client();
  while(!mqtt_client.connected())
  {
    // Check if connected, reconnect if needed.
    establishConnection();
    delay(500);
  }

  // MQTT loop must be called to process Device-to-Cloud and Cloud-to-Device.
  mqtt_client.loop();

  

  //If wateringTime == -1 then the plant should not be watered, just send the measurement of sensors
  if(wateringTimeAPI == -1)
  {
    //Send previos generated error now that we have connection with iot Hub
    sendError(irrigationError);
    sendTelemetry(0, lightLevelPercent, soilMoisturePercent, temperature, humidity);
  }
  else
  {
    Serial.println("Watering the plant for: " + String(wateringTimeAPI) + " milliseconds");
    //Activate the pump for the time supposed to be in the potentiometer
    digitalWrite(RELAYPIN, HIGH);
    delay(wateringTimeAPI); 
    digitalWrite(RELAYPIN, LOW);

    sendTelemetry(wateringTimeAPI, lightLevelPercent, soilMoisturePercent, temperature, humidity);
  }

  deepSleepESP();
}

void deepSleepESP()
{
  digitalWrite(BUTTONPIN, LOW);
  delay(1000);

  Serial.println("Going to sleep 30 minutes");
  //ESP.deepSleep(10e6); //Uncomment this to have the ESP wake up each 10 seconds
  ESP.deepSleep(1800e6); //30 minutes between every wake of the ESP 
}

//Returns number of milliseconds for the relay to be active. If there was an error with the sensors, returns -1.
void gatherData()
{
  int lightLevelValue = analogReadPhotoResistor();

  delay(500);

  int soilMoistureValue = analogReadSoilMoistureSensor();

  delay(500);

  int potentiometerValue = analogReadPotentiometer();

  delay(500);

  digitalWriteLowAll();

  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  if (isnan(humidity) || isnan(temperature))
  {
    Serial.println("Error de sensor");
    sendError("DHT measurement error.");
    return;
  }

  wateringMilliseconds = (int) ((float) ((float) potentiometerValue / (float) MAX_ANALOG) * MAX_WATERING_TIME);
  soilMoisturePercent = map(soilMoistureValue, AIR_VALUE, WATER_VALUE, 0, 100);
  lightLevelPercent = map(lightLevelValue, 0, 1023, 0, 100);

  //Logs
  Serial.print("Humidity: ");
  Serial.println(humidity);
  Serial.print("Temperature: ");
  Serial.println(temperature);
  Serial.print("Potentiometer: ");
  Serial.println(potentiometerValue);
  Serial.print("Soil Moisture: ");
  Serial.println(soilMoisturePercent);
  Serial.print("Light level: ");
  Serial.println(lightLevelPercent);

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

void loop(){}
