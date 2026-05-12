package com.analisis2.universidad.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.analisis2.universidad.models.EstudianteModel;
import com.analisis2.universidad.repositories.IEstudianteRepository;

@Service
public class EstudianteService {
    @Autowired

    private IEstudianteRepository repository;

    public void saveFromEvent(Long id, String nombre, String correo, String telefono, String usuario, String pass){
        EstudianteModel e = new EstudianteModel();
        e.setIdEstudiante(id);
        e.setNombre(nombre);
        e.setCorreo(correo);
        e.setTelefono(telefono);
        e.setUsuario(usuario);
        e.setPass(pass);

        repository.save(e);

        System.out.println("Estudiante guardado desde el evento");

    }

    public void deleteFromEvent(Long id){
        repository.deleteById(id);
        System.out.println("Estudiante eliminado desde el evento");
    }
}
