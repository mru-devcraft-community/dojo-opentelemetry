package com.shoptrack.controller;

import com.shoptrack.model.Order;
import com.shoptrack.model.OrderItem;
import com.shoptrack.model.Product;
import com.shoptrack.repository.OrderRepository;
import com.shoptrack.repository.ProductRepository;
import com.shoptrack.service.NotificationService;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final Tracer tracer;

    public OrderController(OrderRepository orderRepository, ProductRepository productRepository,
                           NotificationService notificationService, OpenTelemetry openTelemetry) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
        this.tracer = openTelemetry.getTracer("shoptrack-api");
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
        Span span = tracer.spanBuilder("CreateOrder").startSpan();
        try (Scope scope = span.makeCurrent()) {
            Order order = new Order();
            order.setCustomerName(request.customerName());

            double totalAmount = 0;

            // Span imbriqué pour la validation du stock
            Span validateSpan = tracer.spanBuilder("ValidateStock").startSpan();
            try (Scope validateScope = validateSpan.makeCurrent()) {
                for (CreateOrderItemRequest item : request.items()) {
                    Product product = productRepository.findById(item.productId()).orElse(null);
                    if (product == null) {
                        return ResponseEntity.badRequest().body("Product " + item.productId() + " not found");
                    }
                    if (product.getStock() < item.quantity()) {
                        return ResponseEntity.badRequest().body("Insufficient stock for product " + product.getName());
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
            } finally {
                validateSpan.end();
            }

            order.setTotalAmount(totalAmount);
            Order saved = orderRepository.save(order);

            notificationService.notifyOrderCreated(saved.getId(), saved.getCustomerName());

            return ResponseEntity.created(URI.create("/api/orders/" + saved.getId())).body(saved);
        } catch (Exception e) {
            span.recordException(e);
            throw e;
        } finally {
            span.end();
        }
    }

    public record CreateOrderRequest(String customerName, List<CreateOrderItemRequest> items) {}
    public record CreateOrderItemRequest(Long productId, int quantity) {}
}
