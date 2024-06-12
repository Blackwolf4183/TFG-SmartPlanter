

## Proyecto SmartPlanter

Este README proporciona una visión general del proyecto **SmartPlanter**, que combina tecnologías IoT, cloud computing y machine learning para crear una maceta inteligente con riego automático y monitorización a través de una interfaz web.

## Tabla de Contenidos

- [Sobre el Proyecto](#sobre-el-proyecto)
  - [Objetivos](#objetivos)
  - [Características](#características)
  - [Especificaciones Técnicas](#especificaciones-técnicas)
- [Construido Con](#construido-con)
- [Guía de Inicio](#guía-de-inicio)
  - [Prerequisitos](#prerequisitos)
  - [Instalación](#instalación)
- [Uso](#uso)
- [Roadmap](#roadmap)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

<br />
<div align="center">
  <a href="https://github.com/Blackwolf4183/TFG-SmartPlanter">
    <img src="images/logo2.png" alt="Logo" width="200" >
  </a>

## Sobre el Proyecto

### Objetivos

El proyecto **SmartPlanter** tiene como objetivo crear una maceta IoT que permite:

- **Riego Automático**: Utiliza sensores para detectar la humedad del suelo y activar el riego cuando sea necesario.
- **Monitorización Remota**: Ofrece una interfaz web para visualizar en tiempo real los datos de la planta como temperatura, luz y humedad.
- **Interfaz Web**: Proporciona una plataforma accesible para configurar y controlar la maceta desde cualquier lugar.

### Características

- **Sensores Integrados**: Monitorea luz, temperatura, humedad del aire y del suelo.
- **Control Automático**: Sistema de riego basado en el análisis de datos en tiempo real.
- **Notificaciones y Alertas**: Envía alertas al usuario sobre el estado de la planta.
- **Machine Learning**: Utiliza modelos predictivos para optimizar el riego y el cuidado de la planta.

### Especificaciones Técnicas

- **Microcontrolador**: ESP32.
- **Plataforma Cloud**: Azure IoT Hub.
- **Base de Datos**: Supabase para el almacenamiento de datos.
- **Lenguajes de Programación**: Python y JavaScript.
- **Frameworks**: Next.js y React.js para la interfaz web.
- **Hardware**: Sensores de humedad, temperatura, y luz.


[![Product Name Screen Shot][product-screenshot]](https://example.com)
---

## Construido Con

- [Next.js](https://nextjs.org/) - Framework para React
- [React.js](https://reactjs.org/) - Librería JavaScript para construir interfaces de usuario
- [Python](https://www.python.org/) - Lenguaje de programación para el backend
- [Azure IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/) - Plataforma de nube para IoT
- [ESP32](https://www.espressif.com/en/products/socs/esp32) - Microcontrolador
- [Supabase](https://supabase.io/) - Base de datos de código abierto

---

## Guía de Inicio

Para obtener una copia local del proyecto y ejecutarlo, sigue estos pasos:

### Prerequisitos

- Node.js y npm (Node Package Manager)
- Python 3.x

Instala Node.js y npm:
```sh
npm install npm@latest -g
```

### Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/Blackwolf4183/TFG-SmartPlanter.git
   ```
2. Navega al directorio del proyecto:
   ```sh
   cd TFG-SmartPlanter/WebApp/Frontend
   ```
3. Instala las dependencias:
   ```sh
   npm install
   ```
---

## Uso

Una vez instalado, puedes ejecutar el proyecto localmente:

1. **Inicia el servidor de desarrollo**:
   ```sh
   npm start
   ```
2. **Accede a la interfaz web** a través de tu navegador en `http://localhost:3000`.

Para más ejemplos y capturas de pantalla, consulta la [documentación](https://github.com/Blackwolf4183/TFG-SmartPlanter).

---

## Roadmap

- [ ] Implementación de sensores adicionales
- [ ] Mejora de la interfaz de usuario
- [ ] Integración con otros servicios cloud
- [ ] Funcionalidades avanzadas de machine learning

Consulta la lista de [issues abiertas](https://github.com/Blackwolf4183/TFG-SmartPlanter/issues) para ver una lista completa de las características propuestas y problemas conocidos.

---

## Licencia

Distribuido bajo la Licencia MIT. Para más información, consulta `LICENSE.txt`.

---

## Contacto

Pablo Pérez Martín - perezmartinpablo@uma.es

Link del Proyecto: [SmartPlanter en GitHub](https://github.com/Blackwolf4183/TFG-SmartPlanter)

---

[product-screenshot]: images/maceta.jpg