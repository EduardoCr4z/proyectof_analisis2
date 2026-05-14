package com.analisis2.universidad.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.service.annotation.DeleteExchange;

import com.analisis2.universidad.models.CursoModel;
import com.analisis2.universidad.services.CursoService;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.CrossOrigin;




@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/curso")
public class CursoController {

    @Autowired
    private CursoService cursoService;
    @GetMapping("/leer")
    public ArrayList<CursoModel> getCursos(){
        return this.cursoService.getCursos();
    }

    @PostMapping("/crear")
    public CursoModel saveCurso(@RequestBody CursoModel curso) {
        return this.cursoService.saveCurso(curso);
    }

    @GetMapping("/leer-id/{id}")
    public Optional<CursoModel> getCursoById(@PathVariable Long id) {
        return this.cursoService.getById(id);
    }

    @PutMapping("/actualizar/{id}")
    public CursoModel updateCursoById(@PathVariable Long id, @RequestBody CursoModel request) {
        System.out.println("CursoController id: " + id);
        return this.cursoService.updateById(request, id);
    }
    
    @DeleteMapping("/eliminar/{id}")
    public String deleteCursoById(@PathVariable("id") Long id){
        boolean ok = this.cursoService.deleteCurso(id);
        if(ok){
            return "Curso con id " + id + " eliminado";
        }else{
            return "Curso con id " + id + " no se elimino"; 
        }
    }
    
    
}
