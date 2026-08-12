const { Client } = require('ldapts');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const authenticateLDAP = (username, password) => {
    //TODO Se va a hacer uso de ldapts o activedirectory2 dependiendo del tipo de autenticacion LDAP que se use al final
};

const login = async (req,res) => {
    
};

module.exports = { login };

//!Despues cambiar todos los message por code
//!NO OLVIDAR: Rellenar datos faltantes de LDAP en .env antes de hacer docker compose up
