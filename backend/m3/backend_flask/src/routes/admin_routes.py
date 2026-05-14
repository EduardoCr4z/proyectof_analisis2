from flask import Blueprint
from src.services.admin_service import (
    actualizar_admin,
    crear_admins,
    eliminar_admin,
    leer_admin_id,
    leer_admins
)

admin = Blueprint('admin', __name__)


@admin.route('/leer', methods=['GET'])
def leer_admin():
    return leer_admins()


@admin.route('/leer/<id>', methods=['GET'])
def leer_admin_por_id(id):
    return leer_admin_id(id)


@admin.route('/crear', methods=['POST'])
def crear_admin():
    return crear_admins()


@admin.route('/actualizar/<id>', methods=['PUT'])
def actualizar_admin_route(id):
    return actualizar_admin(id)


@admin.route('/eliminar/<id>', methods=['DELETE'])
def eliminar_admin_route(id):
    return eliminar_admin(id)
