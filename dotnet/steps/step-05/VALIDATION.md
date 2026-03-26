# Step 05 — Validation

## Checklist

### ✅ 1. Diagnostics.cs contient le Meter et les instruments

Vérifiez que `Diagnostics.cs` déclare :
- Un `Meter` nommé `"ShopTrack.Api"`
- Un `Counter<long>` `orders.created`
- Un `Counter<long>` `orders.failed`
- Un `Histogram<double>` `orders.total_amount`

### ✅ 2. Program.cs enregistre le Meter

```csharp
.WithMetrics(metrics => metrics.AddMeter(Diagnostics.Meter.Name));
```

### ✅ 3. L'application compile et démarre

```bash
cd dotnet/src
dotnet build
dotnet run --project ShopTrack.AppHost
```

### ✅ 4. Métriques visibles dans Prometheus

Après avoir généré plusieurs commandes, ouvrez [http://localhost:9090](http://localhost:9090) et vérifiez :

```promql
# Nombre total de commandes créées
orders_created_total
```

**Attendu** : Une valeur > 0.

```promql
# Commandes échouées
orders_failed_total
```

**Attendu** : Une valeur > 0 si vous avez fait des commandes avec stock insuffisant.

```promql
# Distribution des montants (percentile 99)
histogram_quantile(0.99, rate(orders_total_amount_bucket[5m]))
```

**Attendu** : Une valeur correspondant aux montants de vos commandes.

### ✅ 5. Métriques visibles dans Grafana

1. Ouvrez [http://localhost:3000](http://localhost:3000)
2. Allez dans **Explore**
3. Sélectionnez la datasource **Prometheus**
4. Exécutez `orders_created_total`

**Attendu** : La métrique apparaît avec sa valeur.

### ✅ 6. Les métriques s'incrémentent

Faites quelques commandes supplémentaires et vérifiez que les valeurs augmentent dans Prometheus.
