from src.config.mongodb import mongo
from flask import request, jsonify
from bson import ObjectId, json_util
import hashlib
import json
from src.events.redis_publisher import publish

# =========================
# LEER TODOS
# =========================
def leer_profesores():
    data = mongo.db.profesor.find()
    result = json.loads(json_util.dumps(data))
    return jsonify(result), 200


# =========================
# LEER POR ID
# =========================
def leer_profesor_id(id):
    try:
        profesor = mongo.db.profesor.find_one({"_id": ObjectId(id)})

        if not profesor:
            return jsonify({"error": "Profesor no encontrado"}), 404

        return json_util.dumps(profesor), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# =========================
# CREAR
# =========================
def crear_profesores():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON recibido"}), 400

    try:
        passw = hashlib.sha256(data.get('pass', '').encode('utf-8')).hexdigest()
        next_id = next_profesor_id()
        response = mongo.db.profesor.insert_one({
            'idProfesor': next_id,
            'nombre': data.get('nombre'),
            'correo': data.get('correo'),
            'telefono': data.get('telefono'),
            'usuario': data.get('usuario'),
            'pass': passw
        })
        publish('profesor-stream', {
            'event': 'profesor_created',
            'idProfesor': next_id,
            'nombre': data.get('nombre'),
            'correo': data.get('correo'),
            'telefono': data.get('telefono'),
            'usuario': data.get('usuario'),
            'pass': passw
        })

        return jsonify({
            "message": "Profesor creado",
            "id": str(response.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# ACTUALIZAR
# =========================
def actualizar_profesor(id):
    data = request.get_json()

    try:
        profesor_actual = mongo.db.profesor.find_one({"_id": ObjectId(id)})
        result = mongo.db.profesor.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "nombre": data.get("nombre"),
                "correo": data.get("correo"),
                "telefono": data.get("telefono"),
                "usuario": data.get("usuario"),
                "pass": data.get("pass")
                
            }}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Profesor no encontrado"}), 404
        id_profesor = profesor_actual.get('idProfesor') if profesor_actual else None
        publish('profesor-stream', {
            'event': 'profesor_update',
            'idProfesor': id_profesor,
            'nombre': data.get('nombre'),
            'correo': data.get('correo'),
            'telefono': data.get('telefono'),
            'usuario': data.get('usuario'),
            'pass': data.get('pass')
        })

        return jsonify({"message": "Profesor actualizado"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# =========================
# ELIMINAR
# =========================
def eliminar_profesor(id):
    try:
        profesor_actual = mongo.db.profesor.find_one({"_id": ObjectId(id)})
        result = mongo.db.profesor.delete_one({"_id": ObjectId(id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Profesor no encontrado"}), 404
        publish('profesor-stream', {
            'event': 'profesor_delete',
            'idProfesor': profesor_actual.get('idProfesor') if profesor_actual else ''
        })

        return jsonify({"message": "Profesor eliminado"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


def next_profesor_id():
    by_id_profesor = mongo.db.profesor.find_one(
        {'idProfesor': {'$exists': True}},
        sort=[('idProfesor', -1)]
    )
    by_seed_id = mongo.db.profesor.find_one({'_id': {'$type': 'int'}}, sort=[('_id', -1)])

    last_id_profesor = by_id_profesor.get('idProfesor', 0) if by_id_profesor else 0
    last_seed_id = by_seed_id.get('_id', 0) if by_seed_id else 0
    return max(last_id_profesor, last_seed_id) + 1
