package com.shoptrack.controller;

import com.shoptrack.model.Order;
import com.shoptrack.model.OrderItem;
import com.shoptrack.model.Product;
import com.shoptrack.repository.OrderRepository;
import com.shoptrack.repository.ProductRepository;
import com.shoptrack.service.NotificationService;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final Tracer tracer;
    private final LongCounter ordersCreatedCounter;
    private final LongCounter ordersFailedCounter;
    private final DoubleHistogram orderAmountHistogram;

    public OrderController(OrderRepository orderRepository, ProductRepository productRepository,
                           NotificationService notificationService, OpenTelemetry openTelemetry) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
        this.tracer = openTelemetry.getTracer("shoptrack-api");

        Meter meter = openTelemetry.getMeter("shoptrack-api");
        this.ordersCreatedCounter = meter.counterBuilder("orders.created")
            .setDescription("Nombre de commandes créées avec succès")
            .setUnit("{order}")
            .build();
        this.ordersFailedCounter = meter.counterBuilder("orders.failed")
            .setDescription("Nombre de commandes en échec")
            .setUnit("{order}")
            .build();
        this.orderAmountHistogram = meter.histogramBuilder("orders.total_amount")
            .setDescription("Distribution des montants de commandes")
            .setUnit("EUR")
            .build();
    }

    @GetMapping
    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderRequest request) {
        log.info("Création de commande pour le client {}", request.customerName());

        Span span = tracer.spanBuilder("CreateOrder").startSpan();
        try (Scope scope = span.makeCurrent()) {
            span.setAttribute("order.customer_name", request.customerName());

            Order order = new Order();
            order.setCustomerName(request.customerName());

            double totalAmount = 0;

            Span validateSpan = tracer.spanBuilder("ValidateStock").startSpan();
            try (Scope validateScope = validateSpan.makeCurrent()) {
                for (CreateOrderItemRequest item : request.items()) {
                    Product product = productRepository.findById(item.productId()).orElse(null);
                    if (product == null) {
                        String errorMsg = "Produit " + item.productId() + " non trouvé";
                        log.warn("Produit {} non trouvé", item.productId());
                        validateSpan.setStatus(StatusCode.ERROR, errorMsg);
                        span.setStatus(StatusCode.ERROR, errorMsg);
                        ordersFailedCounter.add(1);
                        return ResponseEntity.badRequest().body(errorMsg);
                    }
                    if (product.getStock() < item.quantity()) {
                        log.warn("Stock insuffisant pour le produit {} (demandé: {}, disponible: {})",
                            product.getName(), item.quantity(), product.getStock());
                        String errorMsg = "Stock insuffisant pour le produit " + product.getName();
                        validateSpan.setStatus(StatusCode.ERROR, errorMsg);
                        span.setStatus(StatusCode.ERROR, errorMsg);
                        ordersFailedCounter.add(1);
                        return ResponseEntity.badRequest().body(errorMsg);
                    }

                    product.setStock(product.getStock() - item.quantity());
                    productRepository.save(product);

                    OrderItem orderItem = new OrderItem();
                    orderItem.setProductId(product.getId());
                    orderItem.setQuantity(item.quantity());
                    orderItem.setUnitPrice(product.getPrice());
                    orderItem.setOrder(order);
                    order.getItems().add(orderItem);

                    totalAmount += product.getPrice() * item.quantity();
                }

                validateSpan.addEvent("OrderValidated", Attributes.of(
                    AttributeKey.longKey("validated.items_count"), (long) request.items().size()
                ));
            } finally {
                validateSpan.end();
            }

            span.setAttribute("order.total_amount", totalAmount);
            span.setAttribute("order.items_count", (long) request.items().size());

            order.setTotalAmount(totalAmount);
            Order saved = orderRepository.save(order);

            span.addEvent("OrderPersisted", Attributes.of(
                AttributeKey.longKey("order.id"), saved.getId()
            ));

            log.info("Commande {} créée, total={}, items={}", saved.getId(), totalAmount, request.items().size());

            notificationService.notifyOrderCreated(saved.getId(), saved.getCustomerName());

            ordersCreatedCounter.add(1);
            orderAmountHistogram.record(totalAmount);

            span.setStatus(StatusCode.OK);
            return ResponseEntity.created(URI.create("/api/orders/" + saved.getId())).body(saved);
        } catch (Exception e) {
            log.error("Erreur lors de la création de commande pour {}", request.customerName(), e);
            span.setStatus(StatusCode.ERROR, e.getMessage());
            span.recordException(e);
            ordersFailedCounter.add(1);
            throw e;
        } finally {
            span.end();
        }
    }

    public record CreateOrderRequest(String customerName, List<CreateOrderItemRequest> items) {}
    public record CreateOrderItemRequest(Long productId, int quantity) {}
}
