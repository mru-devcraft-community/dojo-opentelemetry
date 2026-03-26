# Step 05 — Instructions

## Prérequis

Vous devez avoir complété les **Steps 03 et 04** (spans custom avec attributs/events/status).

## Étapes

### 1. Ajouter le Meter dans Diagnostics.cs

Ouvrez `ShopTrack.Api/Diagnostics.cs` et ajoutez :

- Un `Meter` statique nommé `"ShopTrack.Api"`
- Un `Counter<long>` nommé `orders.created` — pour compter les commandes créées avec succès
- Un `Counter<long>` nommé `orders.failed` — pour compter les commandes échouées
- Un `Histogram<double>` nommé `orders.total_amount` — pour la distribution des montants des commandes

> **Rappel** : Ajoutez `using System.Diagnostics.Metrics;` en haut du fichier.

### 2. Enregistrer le Meter dans OpenTelemetry

Dans `Program.cs` de `ShopTrack.Api`, ajoutez l'enregistrement du Meter :

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(Diagnostics.ActivitySource.Name))
    .WithMetrics(metrics => metrics.AddMeter(Diagnostics.Meter.Name));
```

> **Important** : Comme pour `AddSource()`, le nom passé à `AddMeter()` doit correspondre exactement au nom du `Meter`.

### 3. Incrémenter les métriques dans OrderEndpoints

Dans `OrderEndpoints.cs`, ajoutez les appels de métriques aux bons endroits :

- **Commande créée avec succès** : incrémenter `OrdersCreated` et enregistrer le montant dans `OrderTotalAmount`
- **Commande échouée** : incrémenter `OrdersFailed`

### 4. Relancer et générer du trafic

```bash
cd dotnet/src
dotnet run --project ShopTrack.AppHost
```

Générez plusieurs commandes (réussies et échouées) :

```bash
# Commandes réussies
for i in $(seq 1 5); do
  curl -s -X POST http://localhost:<port>/api/orders \
    -H "Content-Type: application/json" \
    -d "{\"customerName\":\"User$i\",\"items\":[{\"productId\":1,\"quantity\":1}]}"
done

# Commande échouée
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Fail","items":[{"productId":2,"quantity":99999}]}'
```

### 5. Observer dans Prometheus

Ouvrez [http://localhost:9090](http://localhost:9090) et exécutez ces requêtes PromQL :

```promql
# Nombre total de commandes créées
orders_created_total

# Nombre de commandes échouées
orders_failed_total

# Histogramme des montants (buckets)
orders_total_amount_bucket
```

### 6. Observer dans Grafana

Ouvrez [http://localhost:3000](http://localhost:3000) :
1. Allez dans **Explore**
2. Sélectionnez la datasource **Prometheus**
3. Exécutez les mêmes requêtes PromQL
