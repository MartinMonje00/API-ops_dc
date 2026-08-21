const { Client } = require("ldapts");

const LDAP_SERVERS = [
    process.env.LDAP_SERVER_PRIMARY || "10,150,106,60",
    process.env.LDAP_SERVER_SECONDARY || "10.150.106.70",
];

const authenticateLDAP = async (username, password) => {
    if (!/^[a-zA-Z0-9._\-]+$/.test(username)) {
        throw { status: 400, message: "Nombre de usuario inválido." };
    }

    let lastError = null;

    for (const host of LDAP_SERVERS) {
        if (!host) continue;

        const url = `ldap://${host}:${process.env.LDAP_PORT || 389}`;
        const client = new Client({
            url,
            timeout: parseInt(process.env.LDAP_TIMEOUT || 5000),
            connectTimeout: parseInt(process.env.LDAP_TIMEOUT || 5000)
        });

        try {
            const userPrincipalName = `${username}@${process.env.LDAP_DOMAIN}`;
            await client.bind(userPrincipalName, password);

            const userData = await fetchUserAttributes(client, username);

            await client.unbind();

            return userData;
        } catch (err) {
            try {
                client.unbind();
            } catch (_) { }
            lastError = err;

            if (lastError && lastError.name === "InvalidCredentialsError") {
                throw { status: 401, message: "Usuario o contraseña incorrectos" };
            }
        }
    }
    throw {
        status: 500,
        message: "Error de conexion con directorio activo (LDAP).",
    };
};

const fetchUserAttributes = async (client, username) => {
    try {
        if (process.env.LDAP_SVC_USER && process.env.LDAP_SVC_PASS) {
            await client.bind(process.env.LDAP_SVC_USER, process.env.LDAP_SVC_PASS);
        }

        const filter = `(&(objectClass=user)(sAMAccountName=${username}))`;

        const { searchEntries } = await client.search(process.env.LDAP_BASE_DN, {
            filter,
            scope: 'sub',
            attributes: ['sAMAccountName', 'displayName', 'mail']
        });

        if (!searchEntries || searchEntries.length === 0) {
            return getDefaultUserData(username);
        }

        const entry = searchEntries[0];

        return {
            username: (entry.sAMAccountName || username).toString().toLowerCase(),
            full_name: (entry.displayName || username).toString(),
            email: (entry.mail || `${username}@${process.env.LDAP_DOMAIN}`).toString().toLowerCase()
        };

    } catch (error) {
        console.warn('No se pudieron obtener los atributos completos de LDAP, usando valores por defecto.');
        return getDefaultUserData(username);
    }
};

const getDefaultUserData = (username) => ({
    username: username.toLowerCase(),
    full_name: username,
    email: `${username}@${process.env.LDAP_DOMAIN}`.toLowerCase()
});

module.exports = { authenticateLDAP };
