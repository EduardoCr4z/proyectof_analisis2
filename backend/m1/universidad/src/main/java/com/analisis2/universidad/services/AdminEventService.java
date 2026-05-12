package com.analisis2.universidad.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.analisis2.universidad.models.AdminModel;
import com.analisis2.universidad.repositories.IAdminRepository;

@Service
public class AdminEventService {

    @Autowired
    private IAdminRepository repository;

    public void saveFromEvent(Long id, String nombre, String correo, String telefono, String usuario, String pass) {
        AdminModel admin = new AdminModel();
        admin.setIdAdmin(id);
        admin.setNombre(nombre);
        admin.setCorreo(correo);
        admin.setTelefono(telefono);
        admin.setUsuario(usuario);
        admin.setPass(pass);
        repository.save(admin);
        System.out.println("Admin guardado desde el evento");
    }

    public void deleteFromEvent(Long id) {
        repository.deleteById(id);
        System.out.println("Admin eliminado desde el evento");
    }
}
