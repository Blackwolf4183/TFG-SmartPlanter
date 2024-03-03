using Postgrest.Attributes;
using Postgrest.Models;
using System;


namespace ArduinoDataProcessFunction
{
    [Table("errorlog")]
    class ErrorLogDB : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("errormessage")]
        public string ErrorMessage { get; set; }

        [Column("errortime")]
        public DateTime ErrorTime { get; set; }

        [Column("source")]
        public string Source { get; set; }

        [Column("clientid")]
        public string ClientID { get; set; }
    }
}
