package com.analisis2.universidad.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.analisis2.universidad.models.AdminModel;

public interface IAdminRepository extends JpaRepository<AdminModel, Long>{
}
