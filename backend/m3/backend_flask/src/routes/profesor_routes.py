from flask import Blueprint
from src.services.profesor_service import (
    crear_profesores,
    leer_profesores,
    leer_profesor_id,
    actualizar_profesor,
    eliminar_profesor
)

profesor = Blueprint('profesor', __name__)

@profesor.route('/leer', methods=['GET'])
def leer_profesor():
    return leer_profesores()

@profesor.route('/leer/<id>', methods=['GET'])
def leer_profesor_por_id(id):
    return leer_profesor_id(id)

@profesor.route('/crear', methods=['POST'])
def crear_profesor():
    return crear_profesores()

@profesor.route('/actualizar/<id>', methods=['PUT'])
def actualizar_profesor_route(id):
    return actualizar_profesor(id)

@profesor.route('/eliminar/<id>', methods=['DELETE'])
def eliminar_profesor_route(id):
    return eliminar_profesor(id)