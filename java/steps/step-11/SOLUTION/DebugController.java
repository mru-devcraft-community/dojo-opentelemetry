package com.shoptrack.controller;

import io.opentelemetry.api.baggage.Baggage;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.context.Scope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/debug")
public class DebugController {
    private static final Logger log = LoggerFactory.getLogger(DebugController.class);
    private final RestTemplate restTemplate;
    private final Random random = new Random();

    public DebugController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Simule une commande lente pour le debugging.
     * Utilise le Baggage pour propager un session ID de debug.
     */
    @GetMapping("/slow-order")
    public Map<String, Object> slowOrder() {
        String sessionId = UUID.randomUUID().toString();
        String traceId = Span.current().getSpanContext().getTraceId();

        log.info("Début du debugging — sessionId={}, traceId={}", sessionId, traceId);

        // Créer le Baggage avec les informations de debug
        Baggage baggage = Baggage.current().toBuilder()
            .put("debug.session_id", sessionId)
            .put("debug.initiated_by", "manual-debug")
            .build();

        try (Scope scope = baggage.makeCurrent()) {
            // Ajouter le session ID comme attribut du span courant
            Span.current().setAttribute("debug.session_id", sessionId);

            // Simuler une opération lente
            int delay = random.nextInt(500, 3000);
            log.info("Simulation de latence: {}ms — sessionId={}", delay, sessionId);

            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Appeler httpbin pour observer la propagation du baggage
            String httpbinResponse = restTemplate.getForObject(
                "https://httpbin.org/headers", String.class
            );

            log.info("Debugging terminé — sessionId={}, délai={}ms", sessionId, delay);

            return Map.of(
                "sessionId", sessionId,
                "traceId", traceId,
                "simulatedDelayMs", delay,
                "httpbinHeaders", httpbinResponse
            );
        }
    }

    /**
     * Retourne les informations de tracing actuelles.
     * Utile pour vérifier que le tracing est actif.
     */
    @GetMapping("/trace-info")
    public Map<String, Object> traceInfo() {
        Span currentSpan = Span.current();
        String traceId = currentSpan.getSpanContext().getTraceId();
        String spanId = currentSpan.getSpanContext().getSpanId();
        boolean isSampled = currentSpan.getSpanContext().isSampled();

        // Lire les entrées du Baggage courant
        Map<String, String> baggageItems = new HashMap<>();
        Baggage.current().forEach((key, entry) ->
            baggageItems.put(key, entry.getValue())
        );

        log.info("Trace info — traceId={}, spanId={}, sampled={}", traceId, spanId, isSampled);

        return Map.of(
            "traceId", traceId,
            "spanId", spanId,
            "isSampled", isSampled,
            "baggageItems", baggageItems
        );
    }
}
