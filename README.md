# API-ops_dc
## Contexto del repositorio
API privada para gestionar la conexion de datos entre la aplicacion web de OPS_DC y el servidor (Base de datos relacional SQL).

## Dependencias
 - Node.js version 24.14.0.
 - Express version 5.2.1.
 - mysql2 version 3.22.5.
 - dotenv version 17.4.2.
 - cors version 2.8.6.
 - jsonwebtoken version 9.0.3.
 - bcryptjs version 3.0.3.

## Funcionamiento
La forma en la que esta construida la API es por medio de una estructuracion de Node.js + Express, su forma de funcionamiento es la de poder obtener datos pedidos por el cliente (Aplicacion WEB) de la base de datos, y convertir todos estos datos a un formato JSON para su procesamiento dentro de la aplicacion, asi como que las peticiones hechas por la aplicacion web se traduzcan a querys que el propio lenguaje SQL pueda entender, y asi pasar los datos solicitados.

Ademas de tener el control logico de modulos de importancia como lo pueden ser:
 - Autenticacion de usuarios.
 - Registro de incidentes.
 - Registros realizados por usuarios.
 - Registro de Data Centers (Temperatura principalmente).

En el caso de agregar mas modulos, estos seran descritos dentro de esta misma lista.

## Pruebas en ambiente de desarrollo

Las pruebas desarrolladas a la API muestran resultados positivos, devolviendo los 3 datos mas basicos de usuario para su uso dentro de la aplicacion web, asi como el token de sesion generado tras la autenticacion exitosa (Pruebas realizadas dentro de los modulos creados).

# Despliegue

## Despliegue inicial (cerrado)

El despliegue inicial de la API se va a realizar con las intenciones de poder hacer pruebas con el uso de datos y de seguridad, pruebas tales como:
1. Pruebas de Brute Force
2. Pruebas de extraccion de datos
3. Pruebas de inyección SQL

Estas siendo las pruebas principales y mas importantes a trabajar en un ambiente de pruebas en un formato de despliegue, pero aun siendo de forma cerrada (formato de ambiente de pruebas pre-despliegue).

## Despliegue global 

Esta etapa se realizara una vez terminada las pruebas de seguridad y rendimiento al servidor donde se va a alojar todo el proyecto. (Más informacion a ser agregada a dias antes del despliegue global).

# Integracion de Pipeline CI/CD

## Pipeline CI en rama Main

Para lo que fue el trabajo en la automatizacion de pruebas y de integracion continua dentro del repositorio, se le hizo una integracion importante a 2 ramas principales de Main y Deployment (Deployment siendo una rama exclusiva para el Pipeline CD)

En la rama Main del repositorio se agrego la automatizacion de pruebas por medio del pipeline CI, donde se hace el uso de 2 contenedores de docker, uno de ellos para simular la base de datos a la cual se va a conectar la API, y otro contenedor donde se va a inicializar la API para testear su conexion con la base de datos, siendo esta una de las pruebas primordiales que se realizan dentro del pipeline CI (Mas pruebas automatizadas van a ser agregadas a futuro).

## Pipeline CD en rama Deployment

Dentro de las acciones de este pipeline, se ejecuta por segunda vez todo lo que esta dentro del pipeline CI por estandar de seguridad (y en el caso de que alguien a futuro realice un pull request a esta rama y no a la rama Main de forma previa).

Despues de la ejecucion del pipeline CI, se ejecuta inmediatamente el pipeline CD al servidor, donde se toman todos los archivos dentro de la carpeta API, exceptuando los archivos docker y archivos que inician con un punto (ya que son considerados archivos basura para el deployment)
