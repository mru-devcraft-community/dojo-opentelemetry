# Indices — Étape 05

<details>
<summary>💡 Comment obtenir un Meter depuis OpenTelemetry ?</summary>

```java
Meter meter = openTelemetry.getMeter("shoptrack-api");
```

Le nom passé à `getMeter()` est le **scope name** — utilisez le nom de votre service.

</details>

<details>
<summary>💡 LongCounter vs DoubleCounter</summary>

- `LongCounter` : pour des valeurs entières (nombre de requêtes, compteur d'événements)
- `DoubleHistogram` : pour des valeurs décimales distribuées (montants, durées)

Pour les montants, utilisez un histogramme car la distribution est intéressante (médiane, percentiles).

</details>

<details>
<summary>💡 Les métriques n'apparaissent pas dans Prometheus</summary>

1. Le Collector doit être configuré pour exporter vers Prometheus. Vérifiez `otel-collector-config.yml`
2. Attendez au moins 15-30 secondes après la requête (intervalle de scrape Prometheus)
3. Les noms de métriques dans Prometheus sont transformés : les `.` deviennent `_`
   - `orders.created` → `orders_created_total`
   - `orders.total_amount` → `orders_total_amount`

</details>

<details>
<summary>💡 Comment ajouter des attributs (labels) aux métriques ?</summary>

```java
ordersCreatedCounter.add(1, Attributes.of(
    AttributeKey.stringKey("order.status"), "success"
));
```

Les attributs deviennent des labels dans Prometheus, ce qui permet des requêtes comme :

```promql
orders_created_total{order_status="success"}
```

</details>

<details>
<summary>💡 Différence entre Counter et Histogram</summary>

- **Counter** : une valeur qui ne fait que croître. Utilisation : comptage d'événements.
  - `add(1)` : incrémente de 1
  - Dans Prometheus : `rate(counter[5m])` pour le taux par seconde

- **Histogram** : enregistre des observations individuelles et calcule la distribution.
  - `record(99.99)` : enregistre une observation
  - Dans Prometheus : `histogram_quantile(0.95, ...)` pour le 95e percentile

</details>
