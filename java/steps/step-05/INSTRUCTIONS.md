# Instructions — Étape 05

## 1. Imports nécessaires

Ajoutez les imports suivants dans `OrderController.java` :

```java
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
```

## 2. Créer les instruments de métriques

Dans le constructeur de `OrderController`, après avoir créé le `Tracer`, créez un `Meter` et les instruments :

```java
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
```

N'oubliez pas de déclarer les champs dans la classe :

```java
private final LongCounter ordersCreatedCounter;
private final LongCounter ordersFailedCounter;
private final DoubleHistogram orderAmountHistogram;
```

## 3. Incrémenter les métriques dans la logique métier

### En cas de succès (après la sauvegarde) :

```java
ordersCreatedCounter.add(1);
orderAmountHistogram.record(totalAmount);
```

### En cas d'échec (stock insuffisant) :

```java
ordersFailedCounter.add(1);
```

## 4. Lancer et tester

```bash
mvn spring-boot:run
```

Générez du trafic :

```bash
# Quelques commandes réussies
for i in {1..5}; do
  curl -s -X POST http://localhost:8080/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Client '$i'","items":[{"productId":2,"quantity":1}]}'
  echo ""
done

# Une commande en échec
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Fail","items":[{"productId":1,"quantity":99999}]}'
```

## 5. Vérifier dans Prometheus

Ouvrez http://localhost:9090 et exécutez les requêtes :

```promql
# Nombre total de commandes créées
orders_created_total

# Nombre de commandes en échec
orders_failed_total

# Montant moyen des commandes (sur 5 minutes)
rate(orders_total_amount_sum[5m]) / rate(orders_total_amount_count[5m])

# Distribution des montants
histogram_quantile(0.95, rate(orders_total_amount_bucket[5m]))
```

## 6. Visualiser dans Grafana

Ouvrez http://localhost:3000, ajoutez un dashboard et créez des panels avec les requêtes Prometheus ci-dessus.
