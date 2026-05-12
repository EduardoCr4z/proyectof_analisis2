package com.analisis2.universidad.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
//import org.springframework.web.bind.annotation.RequestBody;

import com.analisis2.universidad.models.CursoModel;
import com.analisis2.universidad.redis.RedisStreamPublisher;
import com.analisis2.universidad.repositories.ICursoRepository;

@Service
public class CursoService {

    @Autowired
    ICursoRepository cursoRepository;

    @Autowired
    private RedisStreamPublisher redisPublisher;

    public ArrayList<CursoModel> getCursos(){
        return (ArrayList<CursoModel>) cursoRepository.findAll();
    }

    public CursoModel saveCurso(CursoModel curso){
        CursoModel sCurso = cursoRepository.save(curso);

        if (sCurso != null){
            Map<String, String> evento = new HashMap<>();
            evento.put("event", "curso_created");
            evento.put("idCurso", sCurso.getIdCurso().toString());
            evento.put("nombre", sCurso.getNombre().toString());
            evento.put("idProfesor", sCurso.getIdProfesor().toString());

            redisPublisher.publish("curso-stream", evento);
        }


        return sCurso;
    }

    public Optional<CursoModel> getById(Long id){
        return cursoRepository.findById(id);
    }

    public CursoModel updateById(CursoModel request, Long id){
        CursoModel curso = cursoRepository.findById(id).get();
        curso.setNombre(request.getNombre());
        curso.setIdProfesor(request.getIdProfesor());

        if (curso != null){
            Map<String, String> evento = new HashMap<>();
            evento.put("event", "curso_update");
            evento.put("idCurso", curso.getIdCurso().toString());
            evento.put("nombre", curso.getNombre().toString());
            evento.put("idProfesor", curso.getIdProfesor().toString());

            redisPublisher.publish("curso-stream", evento);
        }

        return cursoRepository.save(curso);

    }

    public Boolean deleteCurso(Long id){
        try {
            cursoRepository.deleteById(id);

            Map<String, String> evento = new HashMap<>();
            evento.put("event", "curso_delete");
            evento.put("idCurso", id.toString());
            redisPublisher.publish("curso-stream", evento);

            return true;
        } catch (Exception e) {
            System.out.println(e.toString());
            return false;
        }
    }

}
