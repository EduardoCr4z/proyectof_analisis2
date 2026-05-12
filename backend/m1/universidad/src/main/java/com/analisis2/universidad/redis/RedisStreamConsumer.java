package com.analisis2.universidad.redis;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.connection.stream.StreamReadOptions;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.analisis2.universidad.services.AdminEventService;
import com.analisis2.universidad.services.AsignacionEventService;
import com.analisis2.universidad.services.EstudianteService;
import com.analisis2.universidad.services.ProfesorEventService;

import jakarta.annotation.PostConstruct;

@Component
public class RedisStreamConsumer {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private EstudianteService estudianteService;

    @Autowired
    private ProfesorEventService profesorEventService;

    @Autowired
    private AdminEventService adminEventService;

    @Autowired
    private AsignacionEventService asignacionEventService;

    private static final String CONSUMER = "m1-consumer-1";
    private static final List<String> STREAMS = List.of(
        "estudiante-stream",
        "asignacion-stream",
        "profesor-stream",
        "admin-stream"
    );

    @PostConstruct
    public void start(){
        for (String stream : STREAMS) {
            Thread thread = new Thread(() -> listen(stream), "redis-stream-" + stream);
            thread.setDaemon(true);
            thread.start();
        }
    }

    public void listen(String stream){
        String group = groupFor(stream);
        while (true) {
            try {
                createGroupIfMissing(stream, group);
                break;
            } catch (Exception e) {
                System.out.println("[redis-stream] Redis no disponible creando grupo stream=" + stream + ". Reintentando...");
                sleep(5000);
            }
        }

        System.out.println("[redis-stream] Escuchando stream=" + stream + " group=" + group + " consumer=" + CONSUMER);

        while (true) {
            processBatch(stream, group, ReadOffset.from("0"), false);
            processBatch(stream, group, ReadOffset.lastConsumed(), true);
        }
    }

    private String groupFor(String stream) {
        return "m1-" + stream.replace("-stream", "-group");
    }

    private void createGroupIfMissing(String stream, String group) {
        try {
            redisTemplate.execute((RedisCallback<Void>) connection -> {
                connection.execute(
                    "XGROUP",
                    "CREATE".getBytes(StandardCharsets.UTF_8),
                    stream.getBytes(StandardCharsets.UTF_8),
                    group.getBytes(StandardCharsets.UTF_8),
                    "0".getBytes(StandardCharsets.UTF_8),
                    "MKSTREAM".getBytes(StandardCharsets.UTF_8)
                );
                return null;
            });
            System.out.println("[redis-stream] Grupo creado: " + group);
        } catch (Exception e) {
            if (isBusyGroup(e)) {
                System.out.println("[redis-stream] Grupo ya existe: " + group);
            } else {
                throw e;
            }
        }
    }

    private boolean isBusyGroup(Throwable error) {
        Throwable current = error;
        while (current != null) {
            String message = current.getMessage();
            if (message != null && message.contains("BUSYGROUP")) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private void processBatch(String stream, String group, ReadOffset offset, boolean block) {
        try {
            StreamReadOptions options = StreamReadOptions.empty().count(10);
            if (block) {
                options = options.block(Duration.ofSeconds(5));
            }

            List<MapRecord<String, Object, Object>> messages =
                redisTemplate.opsForStream().read(
                    Consumer.from(group, CONSUMER),
                    options,
                    StreamOffset.create(stream, offset)
                );

            if (messages == null || messages.isEmpty()) {
                return;
            }

            for (MapRecord<String, Object, Object> record : messages){
                processRecord(record);
                redisTemplate.opsForStream().acknowledge(stream, group, record.getId());
                System.out.println("[redis-stream] ACK stream=" + stream + " group=" + group + " id=" + record.getId());
            }
        } catch (Exception e) {
            System.out.println("[redis-stream] Error consumer stream=" + stream + ": " + e.getMessage());
            sleep(5000);
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void processRecord(MapRecord<String, Object, Object> record) {
        Map<Object, Object> value = record.getValue();
        String evento = (String) value.get("event");

        System.out.println("[redis-stream] Evento id=" + record.getId() + " data=" + value);

        if ("estudiante_created".equals(evento) || "estudiante_updated".equals(evento)) {
            estudianteService.saveFromEvent(
                asLong(value, "idEstudiante"),
                asString(value, "nombre"),
                asString(value, "correo"),
                asString(value, "telefono"),
                asString(value, "usuario"),
                asString(value, "pass")
            );
        } else if ("estudiante_deleted".equals(evento)) {
            estudianteService.deleteFromEvent(asLong(value, "idEstudiante"));
        } else if ("profesor_created".equals(evento) || "profesor_updated".equals(evento) || "profesor_update".equals(evento)) {
            profesorEventService.saveFromEvent(
                asLong(value, "idProfesor"),
                asString(value, "nombre"),
                asString(value, "correo"),
                asString(value, "telefono"),
                asString(value, "usuario"),
                asString(value, "pass")
            );
        } else if ("profesor_deleted".equals(evento) || "profesor_delete".equals(evento)) {
            profesorEventService.deleteFromEvent(asLong(value, "idProfesor"));
        } else if ("admin_created".equals(evento) || "admin_updated".equals(evento) || "admin_update".equals(evento)) {
            adminEventService.saveFromEvent(
                asLong(value, "idAdmin"),
                asString(value, "nombre"),
                asString(value, "correo"),
                asString(value, "telefono"),
                asString(value, "usuario"),
                asString(value, "pass")
            );
        } else if ("admin_deleted".equals(evento) || "admin_delete".equals(evento)) {
            adminEventService.deleteFromEvent(asLong(value, "idAdmin"));
        } else if ("asignacion_created".equals(evento) || "asignacion_updated".equals(evento)) {
            asignacionEventService.saveFromEvent(
                asLong(value, "idAsignacion"),
                asString(value, "puntos"),
                asLong(value, "idEstudiante"),
                asLong(value, "idCurso"),
                asLong(value, "idProfesor")
            );
        } else if ("asignacion_deleted".equals(evento)) {
            asignacionEventService.deleteFromEvent(asLong(value, "idAsignacion"));
        } else {
            System.out.println("[redis-stream] Evento ignorado: " + evento);
        }
    }

    private String asString(Map<Object, Object> value, String key) {
        Object data = value.get(key);
        return data == null ? "" : data.toString();
    }

    private Long asLong(Map<Object, Object> value, String key) {
        return Long.parseLong(asString(value, key));
    }
}
