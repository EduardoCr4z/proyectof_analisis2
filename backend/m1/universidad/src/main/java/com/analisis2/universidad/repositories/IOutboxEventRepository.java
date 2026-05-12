package com.analisis2.universidad.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.analisis2.universidad.models.OutboxEventModel;

public interface IOutboxEventRepository extends JpaRepository<OutboxEventModel, Long>{
    List<OutboxEventModel> findTop50ByStatusAndEventTypeEndingWithOrderByIdAsc(String status, String suffix);
}
