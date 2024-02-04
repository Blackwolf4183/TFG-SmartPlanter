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

            //Get string from topic
            String receivedString = Encoding.UTF8.GetString(message.Body.Array);
            log.LogInformation($"Data Process Function received a message: {receivedString}");

            #region Supabase configuration
            var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
            var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

            var options = new Supabase.SupabaseOptions
            {
                AutoConnectRealtime = true
            };

            var supabase = new Supabase.Client(url, key, options);
            await supabase.InitializeAsync();
            #endregion Supabase configuration

            #region Get DateTime
            //Get local time 
            TimeZoneInfo centralEuropeTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Romance Standard Time");
            // Convert the current time to the specified time zone
            DateTime centralEuropeTime = TimeZoneInfo.ConvertTime(DateTime.UtcNow, centralEuropeTimeZone);
            #endregion Get DateTime

            //Trim the received message to avoid errors in Json conversion
            string trimmedReceivedString = receivedString.Trim();

            try
            {
                //Deserialize the json string gotten from the event
                ArduinoDataJson arduinoDataJson = JsonConvert.DeserializeObject<ArduinoDataJson>(trimmedReceivedString);

                //No error from ESP32
                if (arduinoDataJson.ErrorMessage == null)
                {
                    String errorString = String.Empty;

                    //Validate values before inserting them in DB
                    if (!(arduinoDataJson.SoilMoisture >= 0.0 && arduinoDataJson.SoilMoisture <= 100.0))
                    {
                        errorString += "SoilMoisture, ";
                    }
                    if (!(arduinoDataJson.Temperature >= -20.0 && arduinoDataJson.Temperature <= 60.0))
                    {
                        errorString += "Temperature, ";
                    }
                    if (!(arduinoDataJson.AirHumidity >= 0.0 && arduinoDataJson.AirHumidity <= 100.0))
                    {
                        errorString += "AirHumidity, ";
                    }
                    if (!(arduinoDataJson.LightLevel >= 0.0 && arduinoDataJson.LightLevel <= 100.0))
                    {
                        errorString += "LightLevel, ";
                    }
                    if (!(arduinoDataJson.IrrigationTime >= 0.0))
                    {
                        errorString += "LightLevel.";
                    }

                    if (errorString != String.Empty)
                    {
                        //Remove comma from end
                        errorString = errorString.TrimEnd(',', ' ').Trim();

                        String errorMessageDB = "Error encountered when validating: " + errorString;

                        var errorLogDBModel = new ErrorLogDB
                        {
                            ErrorMessage = errorMessageDB,
                            ErrorTime = centralEuropeTime,
                            Source = clientId + " - Validation"
                        };

                        await supabase.From<ErrorLogDB>().Insert(errorLogDBModel);
                    }
                    else
                    {
                        //Store values in DB
                        var arduinoDataDBModel = new ArduinoDataDB
                        {
                            SoilMoisture = arduinoDataJson.SoilMoisture,
                            Temperature = arduinoDataJson.Temperature,
                            AirHumidity = arduinoDataJson.AirHumidity,
                            LightLevel = arduinoDataJson.LightLevel,
                            IrrigationAmount = arduinoDataJson.IrrigationTime, //TODO: calculate aproximate amount of water in time
                            TimeStamp = centralEuropeTime,
                            ClientId = clientId
                        };

                        await supabase.From<ArduinoDataDB>().Insert(arduinoDataDBModel);
                    }

                }
                else
                {
                    //Store error in DB
                    var errorLogDBModel = new ErrorLogDB
                    {
                        ErrorMessage = arduinoDataJson.ErrorMessage,
                        ErrorTime = centralEuropeTime,
                        Source = clientId
                    };

                    await supabase.From<ErrorLogDB>().Insert(errorLogDBModel);
                }
            }
            catch (JsonException jsonException)
            {
                // Log the exception details
                log.LogError($"Error during JSON deserialization: {jsonException}");

                // Store the error in the database
                var errorLogDBModel = new ErrorLogDB
                {
                    ErrorMessage = $"Error during JSON deserialization: {jsonException.Message}",
                    ErrorTime = centralEuropeTime,
                    Source = clientId
                };

                await supabase.From<ErrorLogDB>().Insert(errorLogDBModel);
            }
        }
    }
}