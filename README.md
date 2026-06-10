# API-ops_dc
## Contexto del repositorio
API privada para gestionar la conexion de datos entre la aplicacion web de OPS_DC y el servidor (Base de datos relacional SQL)

## Dependencias
 - Node.js version

## Funcionamiento
La forma en la que esta construida la API es por medio de una estructuracion de Node.js + Express, su forma de funcionamiento es la de poder obtener datos pedidos por el cliente (Aplicacion WEB) de la base de datos, y convertir todos estos datos a un formato JSON para su procesamiento dentro de la aplicacion, asi como que las peticiones hechas por la aplicacion web se traduzcan a querys que el propio lenguaje SQL pueda entender, y asi pasar los datos solicitados
