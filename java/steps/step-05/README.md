# Étape 05 — Métriques — Counters, Histogrammes

## Contexte

Jusqu'ici, nous avons travaillé avec les **traces** — elles permettent de suivre le parcours d'une requête individuelle. Les **métriques** apportent une vision différente : elles mesurent des **agrégats** dans le temps.

Exemples :
- Combien de commandes ont été créées dans la dernière heure ?
- Quel est le montant moyen d'une commande ?
- Quel est le taux d'erreur ?

### L'API Meter d'OpenTelemetry

OpenTelemetry fournit une API Metrics via le `Meter` :

```java
Meter meter = openTelemetry.getMeter("shoptrack-api");
```

### Types d'instruments

| Instrument | Description | Exemple |
|-----------|-------------|---------|
| **Counter** (LongCounter) | Compteur croissant | Nombre de commandes créées |
| **Counter** (LongCounter) | Compteur croissant | Nombre d'erreurs |
| **Histogram** (DoubleHistogram) | Distribution de valeurs | Montant des commandes |
| **UpDownCounter** | Compteur bi-directionnel | Connexions actives |
| **Gauge** | Valeur ponctuelle | Température, stock courant |

### Counter — Compteur

Un compteur ne fait que s'incrémenter :

```java
LongCounter ordersCreated = meter.counterBuilder("orders.created")
    .setDescription("Nombre de commandes créées")
    .setUnit("{order}")
    .build();

// Incrémenter
ordersCreated.add(1);

// Avec des attributs
ordersCreated.add(1, Attributes.of(
    AttributeKey.stringKey("customer.name"), "Alice"
));
```

### Histogram — Distribution

Un histogramme mesure la distribution d'une valeur :

```java
DoubleHistogram orderAmount = meter.histogramBuilder("orders.total_amount")
    .setDescription("Montant total des commandes")
    .setUnit("EUR")
    .build();

// Enregistrer une valeur
orderAmount.record(1059.97);
```

### Export vers Prometheus

Le Spring Boot Starter exporte automatiquement les métriques OTel via OTLP vers le Collector, qui les rend disponibles à Prometheus. Les métriques Micrometer de Spring Boot Actuator sont aussi incluses.

## Objectifs

- Créer des métriques personnalisées (Counter, Histogram)
- Les incrémenter dans la logique métier
- Vérifier les métriques dans Prometheus
- Visualiser dans Grafana
