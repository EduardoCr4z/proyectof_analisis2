package com.analisis2.universidad.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.analisis2.universidad.models.EstudianteModel;

@Repository
public interface IEstudianteRepository extends JpaRepository<EstudianteModel, Long>{

    
    

}
