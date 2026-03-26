package com.shoptrack.controller;

import io.opentelemetry.api.trace.Span;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/chain")
public class ChainController {
    private static final Logger log = LoggerFactory.getLogger(ChainController.class);
    private final RestTemplate restTemplate;

    public ChainController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Endpoint qui démontre la propagation de contexte.
     * Appelle httpbin.org/headers pour observer les headers traceparent propagés.
     */
    @GetMapping
    public Map<String, Object> chain() {
        String traceId = Span.current().getSpanContext().getTraceId();
        String spanId = Span.current().getSpanContext().getSpanId();

        log.info("Début de la chaîne — traceId={}, spanId={}", traceId, spanId);

        // Appel à httpbin.org/headers — retourne les headers HTTP reçus
        // Le RestTemplate instrumenté ajoute automatiquement le header traceparent
        String httpbinResponse = restTemplate.getForObject(
            "https://httpbin.org/headers", String.class
        );

        log.info("Chaîne terminée — réponse reçue de httpbin");

        return Map.of(
            "message", "Chaîne de propagation complétée",
            "currentTraceId", traceId,
            "currentSpanId", spanId,
            "httpbinHeaders", httpbinResponse
        );
    }
}
