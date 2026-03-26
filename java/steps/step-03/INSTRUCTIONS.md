# Instructions — Étape 03

## 1. Ajouter la dépendance pour les annotations

Dans `pom.xml`, ajoutez dans `<dependencies>` :

```xml
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-instrumentation-annotations</artifactId>
</dependency>
```

> La version est gérée par le BOM ajouté à l'étape 02.

## 2. Annoter NotificationService avec @WithSpan

Dans `NotificationService.java`, ajoutez l'annotation `@WithSpan` sur la méthode `notifyOrderCreated` :

```java
import io.opentelemetry.instrumentation.annotations.WithSpan;

@WithSpan("NotifyOrderCreated")
public void notifyOrderCreated(Long orderId, String customerName) {
    // code existant inchangé
}
```

## 3. Créer un span manuel "CreateOrder" dans OrderController

Modifiez `OrderController.java` :

1. Injectez `OpenTelemetry` dans le constructeur
2. Créez un `Tracer` à partir de l'instance `OpenTelemetry`
3. Dans la méthode `create()`, englobez toute la logique dans un span `"CreateOrder"`

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.context.Scope;
```

Pattern à suivre :

```java
Span span = tracer.spanBuilder("CreateOrder").startSpan();
try (Scope scope = span.makeCurrent()) {
    // Logique de création de commande...
    return ResponseEntity.created(...).body(saved);
} catch (Exception e) {
    span.recordException(e);
    throw e;
} finally {
    span.end();
}
```

## 4. Créer un span imbriqué "ValidateStock"

À l'intérieur du span `CreateOrder`, créez un span enfant pour la validation de stock :

```java
Span validateSpan = tracer.spanBuilder("ValidateStock").startSpan();
try (Scope validateScope = validateSpan.makeCurrent()) {
    // Boucle de validation des items et mise à jour du stock
} finally {
    validateSpan.end();
}
```

## 5. Tester et observer

```bash
mvn spring-boot:run
```

Générez une commande et observez dans Jaeger la hiérarchie enrichie des spans.
