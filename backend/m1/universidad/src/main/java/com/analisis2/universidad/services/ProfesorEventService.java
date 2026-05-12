package com.analisis2.universidad.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.analisis2.universidad.models.ProfesorModel;
import com.analisis2.universidad.repositories.IProfesorRepository;

@Service
public class ProfesorEventService {

    @Autowired
    private IProfesorRepository repository;

    public void saveFromEvent(Long id, String nombre, String correo, String telefono, String usuario, String pass) {
        ProfesorModel profesor = new ProfesorModel();
        profesor.setIdProfesor(id);
        profesor.setNombre(nombre);
        profesor.setCorreo(correo);
        profesor.setTelefono(telefono);
        profesor.setUsuario(usuario);
        profesor.setPass(pass);
        repository.save(profesor);
        System.out.println("Profesor guardado desde el evento");
    }

    public void deleteFromEvent(Long id) {
        repository.deleteById(id);
        System.out.println("Profesor eliminado desde el evento");
    }
}
