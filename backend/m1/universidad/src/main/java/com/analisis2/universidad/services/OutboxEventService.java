package com.analisis2.universidad.services;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.analisis2.universidad.models.OutboxEventModel;
import com.analisis2.universidad.repositories.IOutboxEventRepository;

@Service
public class OutboxEventService {

    @Autowired
    private IOutboxEventRepository repository;

    @Transactional
    public void savePending(String stream, Map<String, String> payload) {
        OutboxEventModel event = new OutboxEventModel();
        event.setEventType(stream);
        event.setPayload(payload);
        event.setStatus("PENDING");
        repository.save(event);
        System.out.println("[outbox] Evento pendiente guardado stream=" + stream);
    }

    public List<OutboxEventModel> pendingEvents() {
        return repository.findTop50ByStatusAndEventTypeEndingWithOrderByIdAsc("PENDING", "-stream");
    }

    @Transactional
    public void markSent(OutboxEventModel event) {
        event.setStatus("SENT");
        repository.save(event);
    }
}
