package com.analisis2.universidad.redis;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.analisis2.universidad.services.OutboxEventService;

@Service
public class RedisStreamPublisher {
    
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private OutboxEventService outboxEventService;

    public void publish(String stream, Map<String, String> data){
        try {
            publishDirect(stream, data);
        } catch (Exception e) {
            System.out.println("[redis-stream] Redis no disponible. Guardando outbox stream=" + stream + " error=" + e.getMessage());
            outboxEventService.savePending(stream, data);
        }
    }

    public void publishDirect(String stream, Map<String, String> data){
        redisTemplate.opsForStream().add(stream, data);
    }
}
