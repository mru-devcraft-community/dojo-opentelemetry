# Étape 03 — Instrumentation manuelle — Spans custom

## Contexte

L'auto-instrumentation (Java Agent ou Spring Boot Starter) capture les appels techniques (HTTP, JDBC, RestTemplate), mais elle ne sait rien de votre **logique métier**. Par exemple, pour une commande :
- La validation du stock est invisible
- Le calcul du montant total n'est pas tracé
- Les décisions métier ne produisent pas de spans

L'**instrumentation manuelle** permet de créer des spans personnalisés qui reflètent votre logique applicative.

### L'API Tracer et Span

OpenTelemetry fournit une API Java pour créer des spans manuellement :

```java
// Obtenir un Tracer
Tracer tracer = openTelemetry.getTracer("shoptrack-api");

// Créer un span
Span span = tracer.spanBuilder("NomDuSpan").startSpan();
try (Scope scope = span.makeCurrent()) {
    // Logique métier...
} finally {
    span.end();
}
```

### @WithSpan — L'annotation déclarative

Pour les cas simples, l'annotation `@WithSpan` crée automatiquement un span autour d'une méthode :

```java
@WithSpan("NotifyOrderCreated")
public void notifyOrderCreated(Long orderId, String customerName) {
    // Un span est automatiquement créé et fermé
}
```

### Hiérarchie des spans

Les spans s'imbriquent automatiquement grâce au **Context propagation**. Quand vous créez un span dans un contexte où un autre span est actif, le nouveau span devient automatiquement un enfant.

```
POST /api/orders              ← span auto (HTTP)
  ├── CreateOrder             ← span manuel
  │   ├── ValidateStock       ← span manuel imbriqué
  │   ├── SELECT ...          ← span auto (JDBC)
  │   └── INSERT ...          ← span auto (JDBC)
  └── NotifyOrderCreated      ← span @WithSpan
      └── POST httpbin.org    ← span auto (HTTP client)
```

## Objectifs

- Ajouter la dépendance `opentelemetry-instrumentation-annotations`
- Utiliser `@WithSpan` sur NotificationService
- Créer des spans manuels dans OrderController avec l'API Tracer/Span
- Observer la hiérarchie enrichie dans Jaeger
