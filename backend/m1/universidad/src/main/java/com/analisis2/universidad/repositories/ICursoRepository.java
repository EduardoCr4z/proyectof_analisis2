package com.analisis2.universidad.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.analisis2.universidad.models.CursoModel;

@Repository
public interface ICursoRepository extends JpaRepository<CursoModel, Long>{

    
    

}
