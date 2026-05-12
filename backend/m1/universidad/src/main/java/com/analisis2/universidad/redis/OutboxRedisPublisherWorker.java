package com.analisis2.universidad.redis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.analisis2.universidad.models.OutboxEventModel;
import com.analisis2.universidad.services.OutboxEventService;

@Component
public class OutboxRedisPublisherWorker {

    @Autowired
    private OutboxEventService outboxEventService;

    @Autowired
    private RedisStreamPublisher redisStreamPublisher;

    @Scheduled(fixedDelay = 5000)
    public void publishPendingEvents() {
        List<OutboxEventModel> events = outboxEventService.pendingEvents();

        for (OutboxEventModel event : events) {
            try {
                redisStreamPublisher.publishDirect(event.getEventType(), event.getPayload());
                outboxEventService.markSent(event);
                System.out.println("[outbox] Evento reenviado stream=" + event.getEventType() + " id=" + event.getId());
            } catch (Exception e) {
                System.out.println("[outbox] Redis sigue no disponible. Reintento despues. error=" + e.getMessage());
                return;
            }
        }
    }
}
