namespace ArduinoDataProcessFunction
{
    /// <summary>
    /// Class to store values relative to the Arduino sensors such as the maximum value the sensors can take to then normalize it into the database
    /// </summary>
    public static class ArduinoDataConstants
    {
        public const float MAX_SOILMOISTURE_VALUE = 9999;
        public const float MAX_SOILTEMPERATURE_VALUE = 9999;
        public const float MAX_AIRHUMIDITY_VALUE = 99999;
        public const float MAX_LIGHTLEVEL_VALUE = 9999;
        public const float MAX_WATERLEVEL_VALUE = 9999;
    }
}
