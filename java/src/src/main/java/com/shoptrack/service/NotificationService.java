package com.shoptrack.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final RestTemplate restTemplate;

    public NotificationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void notifyOrderCreated(Long orderId, String customerName) {
        try {
            restTemplate.postForObject(
                "https://httpbin.org/post",
                "Order " + orderId + " created for " + customerName,
                String.class
            );
            log.info("Notification sent for order {}", orderId);
        } catch (Exception e) {
            log.warn("Failed to send notification for order {}: {}", orderId, e.getMessage());
        }
    }
}
