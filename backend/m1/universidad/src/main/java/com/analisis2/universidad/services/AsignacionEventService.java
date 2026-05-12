package com.analisis2.universidad.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.analisis2.universidad.models.AsignacionModel;
import com.analisis2.universidad.repositories.IAsignacionRepository;

@Service
public class AsignacionEventService {

    @Autowired
    private IAsignacionRepository repository;

    public void saveFromEvent(Long id, String puntos, Long idEstudiante, Long idCurso, Long idProfesor) {
        AsignacionModel asignacion = new AsignacionModel();
        asignacion.setIdAsignacion(id);
        asignacion.setPuntos(puntos);
        asignacion.setIdEstudiante(idEstudiante);
        asignacion.setIdCurso(idCurso);
        asignacion.setIdProfesor(idProfesor);
        repository.save(asignacion);
        System.out.println("Asignacion guardada desde el evento");
    }

    public void deleteFromEvent(Long id) {
        repository.deleteById(id);
        System.out.println("Asignacion eliminada desde el evento");
    }
}
