import json
import os
import urllib.parse
import urllib.request


BASE_URL = os.getenv('KEYCLOAK_INTERNAL_URL') or os.getenv('KEYCLOAK_URL') or 'http://keycloak:8080'
REALM = os.getenv('KEYCLOAK_REALM', 'Universidad')
ADMIN_REALM = os.getenv('KEYCLOAK_ADMIN_REALM', 'master')
ADMIN_USER = os.getenv('KEYCLOAK_ADMIN_USER', 'admin')
ADMIN_PASSWORD = os.getenv('KEYCLOAK_ADMIN_PASSWORD', '123456')
ADMIN_CLIENT = os.getenv('KEYCLOAK_ADMIN_CLIENT', 'admin-cli')


def create_user_with_role(user, role_name):
    if not user.get('usuario') or not user.get('pass'):
        raise ValueError('Usuario y pass son obligatorios para crear el usuario en Keycloak')

    token = get_admin_token()
    user_id = create_or_get_user(token, user)
    assign_realm_role(token, user_id, role_name)
    return {'userId': user_id, 'roleName': role_name}


def get_admin_token():
    data = urllib.parse.urlencode({
        'grant_type': 'password',
        'client_id': ADMIN_CLIENT,
        'username': ADMIN_USER,
        'password': ADMIN_PASSWORD
    }).encode('utf-8')

    response = request(
        f'{BASE_URL}/realms/{ADMIN_REALM}/protocol/openid-connect/token',
        method='POST',
        data=data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    return response['access_token']


def create_or_get_user(token, user):
    payload = {
        'username': user.get('usuario'),
        'firstName': user.get('nombre'),
        'email': user.get('correo') or None,
        'enabled': True,
        'emailVerified': True,
        'credentials': [{
            'type': 'password',
            'value': user.get('pass'),
            'temporary': False
        }]
    }

    try:
        request(
            f'{BASE_URL}/admin/realms/{REALM}/users',
            method='POST',
            token=token,
            data=json.dumps(payload).encode('utf-8')
        )
    except urllib.error.HTTPError as error:
        if error.code != 409:
            raise

    users = request(
        f'{BASE_URL}/admin/realms/{REALM}/users?username={urllib.parse.quote(user.get("usuario"))}&exact=true',
        token=token
    )
    if not users:
        raise RuntimeError(f'No se pudo obtener el usuario {user.get("usuario")} en Keycloak')
    return users[0]['id']


def assign_realm_role(token, user_id, role_name):
    role = request(
        f'{BASE_URL}/admin/realms/{REALM}/roles/{urllib.parse.quote(role_name)}',
        token=token
    )
    request(
        f'{BASE_URL}/admin/realms/{REALM}/users/{user_id}/role-mappings/realm',
        method='POST',
        token=token,
        data=json.dumps([role]).encode('utf-8')
    )


def request(url, method='GET', token=None, data=None, headers=None):
    request_headers = {'Content-Type': 'application/json', **(headers or {})}
    if token:
        request_headers['Authorization'] = f'Bearer {token}'

    req = urllib.request.Request(url, data=data, headers=request_headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as response:
        body = response.read().decode('utf-8')
        return json.loads(body) if body else None
