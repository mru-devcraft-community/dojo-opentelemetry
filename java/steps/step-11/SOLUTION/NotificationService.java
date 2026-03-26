package com.shoptrack.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Random;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final RestTemplate restTemplate;
    private final Random random = new Random();

    public NotificationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void notifyOrderCreated(Long orderId, String customerName) {
        try {
            // Simuler une latence variable (100ms à 2000ms) — pour le debugging
            int delay = random.nextInt(100, 2000);
            Thread.sleep(delay);
            log.info("Notification envoyée pour la commande {} (délai simulé: {}ms)", orderId, delay);

            restTemplate.postForObject(
                "https://httpbin.org/post",
                "Order " + orderId + " created for " + customerName,
                String.class
            );
            log.info("Notification HTTP envoyée pour la commande {}", orderId);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Notification interrompue pour la commande {}", orderId);
        } catch (Exception e) {
            log.warn("Échec de notification pour la commande {}: {}", orderId, e.getMessage());
        }
    }
}
