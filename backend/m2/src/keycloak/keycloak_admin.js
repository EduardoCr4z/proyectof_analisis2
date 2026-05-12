const axios = require('axios');

const config = {
    baseUrl: process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_URL || 'http://localhost:8091',
    realm: process.env.KEYCLOAK_REALM || 'Universidad',
    adminRealm: process.env.KEYCLOAK_ADMIN_REALM || 'master',
    adminUser: process.env.KEYCLOAK_ADMIN_USER || 'admin',
    adminPass: process.env.KEYCLOAK_ADMIN_PASSWORD || '123456',
    adminClient: process.env.KEYCLOAK_ADMIN_CLIENT || 'admin-cli'
};

async function getAdminToken() {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', config.adminClient);
    params.append('username', config.adminUser);
    params.append('password', config.adminPass);

    const response = await axios.post(
        `${config.baseUrl}/realms/${config.adminRealm}/protocol/openid-connect/token`,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data.access_token;
}

async function findUserId(token, username) {
    const response = await axios.get(
        `${config.baseUrl}/admin/realms/${config.realm}/users`,
        {
            params: { username, exact: true },
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    return response.data[0]?.id;
}

async function createOrGetUser(token, user) {
    const payload = {
        username: user.usuario,
        firstName: user.nombre,
        email: user.correo || undefined,
        enabled: true,
        emailVerified: true,
        credentials: [
            {
                type: 'password',
                value: user.pass,
                temporary: false
            }
        ]
    };

    try {
        await axios.post(
            `${config.baseUrl}/admin/realms/${config.realm}/users`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch (error) {
        if (error.response?.status !== 409) {
            throw error;
        }
    }

    const userId = await findUserId(token, user.usuario);
    if (!userId) {
        throw new Error(`No se pudo obtener el usuario ${user.usuario} en Keycloak`);
    }

    return userId;
}

async function assignRealmRole(token, userId, roleName) {
    const roleResponse = await axios.get(
        `${config.baseUrl}/admin/realms/${config.realm}/roles/${roleName}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    await axios.post(
        `${config.baseUrl}/admin/realms/${config.realm}/users/${userId}/role-mappings/realm`,
        [roleResponse.data],
        { headers: { Authorization: `Bearer ${token}` } }
    );
}

async function createUserWithRole(user, roleName) {
    if (!user.usuario || !user.pass) {
        throw new Error('Usuario y pass son obligatorios para crear el usuario en Keycloak');
    }

    const token = await getAdminToken();
    const userId = await createOrGetUser(token, user);
    await assignRealmRole(token, userId, roleName);

    return { userId, roleName };
}

module.exports = {
    createUserWithRole
};
