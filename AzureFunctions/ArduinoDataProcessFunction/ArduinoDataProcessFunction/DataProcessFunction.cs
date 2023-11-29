using IoTHubTrigger = Microsoft.Azure.WebJobs.EventHubTriggerAttribute;

using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Azure.EventHubs;
using System.Text;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Reflection;

namespace ArduinoDataProcessFunction
{
    public class DataProcessFunction
    {
        /// <summary>
        /// Function that processes events comming from Azure's IoTHub. Concretely, MQTT messages sent from a esp8266 are processed as JSON strings
        /// and stored in a Postgresql DB hosted in Supabase
        /// </summary>
        [FunctionName("DataProcessFunction")]
        public static async Task Run([IoTHubTrigger("messages/events", Connection = "IoTHubConnectionString")]EventData message, ILogger log)
        {
            //Extract client id
            var clientId = message.SystemProperties["iothub-connection-device-id"].ToString();

            String receivedString = Encoding.UTF8.GetString(message.Body.Array);
            log.LogInformation($"Data Process Function processed a message: {receivedString}");

            var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
            var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

            var options = new Supabase.SupabaseOptions
            {
                AutoConnectRealtime = true
            };

            var supabase = new Supabase.Client(url, key, options);
            await supabase.InitializeAsync();

            //TODO: Add try catch to ensure everything is running ok 
            //TODO: Create email alert when processing didn't go well

            //Trim the received message to avoid errors in Json conversion
            string trimmedReceivedString = receivedString.Trim();

            //Deserialize the json string gotten from the event
            ArduinoDataJson arduinoDataJson = JsonConvert.DeserializeObject<ArduinoDataJson>(trimmedReceivedString);
            log.LogInformation($"SoilMoisture: {arduinoDataJson.SoilMoisture}");
            log.LogInformation($"Temperature: {arduinoDataJson.Temperature}");
            log.LogInformation($"AirHumidity: {arduinoDataJson.AirHumidity}");
            log.LogInformation($"LightLevel: {arduinoDataJson.LightLevel}");
            log.LogInformation($"WaterLevel: {arduinoDataJson.WaterLevel}");

            //Store values in DB
            ArduinoDataDB arduinoDataDBModel = new ArduinoDataDB
            {
                SoilMoisture = arduinoDataJson.SoilMoisture/ ArduinoDataConstants.MAX_SOILTEMPERATURE_VALUE,
                Temperature = arduinoDataJson.Temperature ,
                AirHumidity = arduinoDataJson.AirHumidity / ArduinoDataConstants.MAX_AIRHUMIDITY_VALUE,
                LightLevel = arduinoDataJson.LightLevel / ArduinoDataConstants.MAX_LIGHTLEVEL_VALUE,
                WaterLevel = arduinoDataJson.WaterLevel / ArduinoDataConstants.MAX_WATERLEVEL_VALUE,
                IrrigationAmount = 0,
                TimeStamp = DateTime.Now, //TODO: FIX not passing proper hour
                ClientId = clientId
            };

            await supabase.From<ArduinoDataDB>().Insert(arduinoDataDBModel);
        }
    }
}