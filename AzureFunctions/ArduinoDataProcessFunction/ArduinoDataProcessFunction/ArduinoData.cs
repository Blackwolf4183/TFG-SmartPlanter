using Postgrest.Attributes;
using Postgrest.Models;
using System;


namespace ArduinoDataProcessFunction
{
    [Table("arduinodata")]
    class ArduinoData : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("soilmoisture")]
        public float SoilMoisture { get; set; }

        [Column("temperature")]
        public float Temperature { get; set; }

        [Column("airhumidity")]
        public float AirHumidity { get; set; }

        [Column("lightlevel")]
        public float LightLevel { get; set; }

        [Column("waterlevel")]
        public float WaterLevel { get; set; }

        [Column("lightlevel")]
        public float IrrigationAmount { get; set; }

        [Column("timestamp")]
        public DateTime TimeStamp { get; set; }

        [Column("clientid")]
        public string ClientId { get; set; }
    }
}
