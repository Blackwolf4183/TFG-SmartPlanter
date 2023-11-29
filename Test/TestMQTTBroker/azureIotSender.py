"""
Clase que nos permitirá probar la conexión a Azure Iot Hub como cliente y así poder testear
las Azure Functions sin necesidad de tener el arduino 
"""

from dotenv import load_dotenv
import os
import asyncio
from azure.iot.device.aio import IoTHubDeviceClient

load_dotenv()

async def main():
    #
    conn_str = os.environ.get("IOTHUB_DEVICE_CONNECTION_STRING")

    # Create instance of the device client using the authentication provider
    device_client = IoTHubDeviceClient.create_from_connection_string(str(conn_str))

    # Connect the device client.
    await device_client.connect()

    # Send a single message
    print("Sending message...")
    await device_client.send_message("This is a message that is being sent")
    print("Message successfully sent!")

    # finally, shut down the client
    await device_client.shutdown()


if __name__ == "__main__":
    asyncio.run(main())