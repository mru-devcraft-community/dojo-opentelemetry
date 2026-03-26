# Instructions — Étape 06

## 1. Ajouter la dépendance Logback Appender

Dans `pom.xml`, ajoutez dans `<dependencies>` :

```xml
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-logback-appender-1.0</artifactId>
</dependency>
```

> La version est gérée par le BOM.

## 2. Créer le fichier `logback-spring.xml`

Créez le fichier `src/main/resources/logback-spring.xml` :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- Appender console classique avec TraceId/SpanId -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread] [trace_id=%mdc{trace_id}] [span_id=%mdc{span_id}] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Appender OpenTelemetry — envoie les logs au Collector -->
    <appender name="OTEL" class="io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender">
        <captureExperimentalAttributes>true</captureExperimentalAttributes>
        <captureKeyValuePairAttributes>true</captureKeyValuePairAttributes>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="OTEL"/>
    </root>
</configuration>
```

## 3. Ajouter des logs structurés dans OrderController

Ajoutez un logger SLF4J dans `OrderController` :

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
```

```java
private static final Logger log = LoggerFactory.getLogger(OrderController.class);
```

### Au début de la création de commande :

```java
log.info("Création de commande pour le client {}", request.customerName());
```

### Après la sauvegarde réussie :

```java
log.info("Commande {} créée, total={}, items={}", saved.getId(), totalAmount, request.items().size());
```

### En cas de stock insuffisant :

```java
log.warn("Stock insuffisant pour le produit {} (demandé: {}, disponible: {})",
    product.getName(), item.quantity(), product.getStock());
```

### En cas d'exception :

```java
log.error("Erreur lors de la création de commande pour {}", request.customerName(), e);
```

## 4. Lancer et tester

```bash
mvn spring-boot:run
```

Générez des requêtes :

```bash
# Commande réussie
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Alice Dupont","items":[{"productId":2,"quantity":1}]}'

# Commande en échec
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Bob Martin","items":[{"productId":1,"quantity":99999}]}'
```

## 5. Observer les logs dans la console

Vérifiez que les logs contiennent le `trace_id` :

```
2024-01-15 10:23:45.123 INFO  [http-nio-8080-exec-1] [trace_id=abc123...] [span_id=def456...] c.s.c.OrderController - Création de commande pour le client Alice Dupont
```

## 6. Observer les logs dans Grafana/Loki

1. Ouvrez Grafana : http://localhost:3000
2. Allez dans **Explore** (icône boussole dans la sidebar)
3. Sélectionnez la source de données **Loki**
4. Exécutez la requête :

```logql
{service_name="shoptrack-api"}
```

5. Pour filtrer sur un client spécifique :

```logql
{service_name="shoptrack-api"} |= "Alice Dupont"
```

## 7. Vérifier la corrélation Trace ↔ Log

1. Dans Grafana/Loki, repérez un log et notez le `trace_id`
2. Ouvrez Jaeger (http://localhost:16686)
3. Recherchez la trace par son Trace ID
4. Vérifiez que la trace correspond au log
