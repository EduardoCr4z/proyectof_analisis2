from bson import json_util
from bson.objectid import ObjectId
from flask import jsonify, request
import hashlib
import json

from src.config.mongodb import mongo
from src.events.redis_publisher import publish
from src.keycloak.keycloak_admin import create_user_with_role


def leer_admins():
    data = mongo.db.admin.find()
    result = json.loads(json_util.dumps(data))
    return jsonify(result), 200


def leer_admin_id(id):
    try:
        admin = mongo.db.admin.find_one(query_by_id(id))
        if not admin:
            return jsonify({'error': 'Admin no encontrado'}), 404
        return json_util.dumps(admin), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def crear_admins():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON recibido'}), 400

    try:
        keycloak = create_user_with_role(data, 'Admin')
        passw = hashlib.sha256(data.get('pass', '').encode('utf-8')).hexdigest()
        next_id = next_admin_id()
        admin = {
            'idAdmin': next_id,
            'nombre': data.get('nombre'),
            'correo': data.get('correo'),
            'telefono': data.get('telefono'),
            'usuario': data.get('usuario'),
            'pass': passw
        }
        response = mongo.db.admin.insert_one(admin)
        publish('admin-stream', {'event': 'admin_created', **admin})

        return jsonify({
            'message': 'Admin creado',
            'id': str(response.inserted_id),
            'idAdmin': next_id,
            'keycloak': keycloak
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def actualizar_admin(id):
    data = request.get_json()
    try:
        current = mongo.db.admin.find_one(query_by_id(id))
        if not current:
            return jsonify({'error': 'Admin no encontrado'}), 404

        admin = {
            'nombre': data.get('nombre'),
            'correo': data.get('correo'),
            'telefono': data.get('telefono'),
            'usuario': data.get('usuario'),
            'pass': data.get('pass')
        }
        mongo.db.admin.update_one(query_by_id(id), {'$set': admin})
        publish('admin-stream', {
            'event': 'admin_update',
            'idAdmin': current.get('idAdmin'),
            **admin
        })
        return jsonify({'message': 'Admin actualizado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def eliminar_admin(id):
    try:
        current = mongo.db.admin.find_one(query_by_id(id))
        if not current:
            return jsonify({'error': 'Admin no encontrado'}), 404

        mongo.db.admin.delete_one(query_by_id(id))
        publish('admin-stream', {
            'event': 'admin_delete',
            'idAdmin': current.get('idAdmin')
        })
        return jsonify({'message': 'Admin eliminado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def query_by_id(id):
    if str(id).isdigit():
        return {'idAdmin': int(id)}
    return {'_id': ObjectId(id)}


def next_admin_id():
    by_id_admin = mongo.db.admin.find_one(
        {'idAdmin': {'$exists': True}},
        sort=[('idAdmin', -1)]
    )
    by_seed_id = mongo.db.admin.find_one({'_id': {'$type': 'int'}}, sort=[('_id', -1)])

    last_id_admin = by_id_admin.get('idAdmin', 0) if by_id_admin else 0
    last_seed_id = by_seed_id.get('_id', 0) if by_seed_id else 0
    return max(last_id_admin, last_seed_id) + 1
