# Step 05 — Indices

## Comment créer un Meter ?

<details>
<summary>💡 Indice 1 — Déclaration du Meter</summary>

```csharp
using System.Diagnostics.Metrics;

public static readonly Meter Meter = new("ShopTrack.Api");
```
</details>

## Comment créer un Counter ?

<details>
<summary>💡 Indice 2 — CreateCounter</summary>

```csharp
public static readonly Counter<long> OrdersCreated = 
    Meter.CreateCounter<long>("orders.created", "orders", "Number of orders created");
```

Les paramètres sont : nom, unité (optionnel), description (optionnel).
</details>

## Comment créer un Histogram ?

<details>
<summary>💡 Indice 3 — CreateHistogram</summary>

```csharp
public static readonly Histogram<double> OrderTotalAmount = 
    Meter.CreateHistogram<double>("orders.total_amount", "USD", "Order total amount distribution");
```
</details>

## Comment utiliser les métriques dans le code ?

<details>
<summary>💡 Indice 4 — Add et Record</summary>

```csharp
// Incrémenter un counter
Diagnostics.OrdersCreated.Add(1);

// Enregistrer une valeur dans un histogram
Diagnostics.OrderTotalAmount.Record((double)order.TotalAmount);

// Incrémenter le counter d'erreurs
Diagnostics.OrdersFailed.Add(1);
```
</details>

## Comment enregistrer le Meter dans OpenTelemetry ?

<details>
<summary>💡 Indice 5 — AddMeter dans Program.cs</summary>

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(Diagnostics.ActivitySource.Name))
    .WithMetrics(metrics => metrics.AddMeter(Diagnostics.Meter.Name));
```
</details>

## Les métriques n'apparaissent pas dans Prometheus ?

<details>
<summary>💡 Indice 6 — Dépannage</summary>

1. Vérifiez que le Collector est démarré et a la bonne configuration
2. Vérifiez que `OTEL_EXPORTER_OTLP_ENDPOINT` pointe vers `http://localhost:4317`
3. Les métriques n'apparaissent qu'après avoir généré des requêtes
4. Prometheus scrape les métriques avec un intervalle — attendez quelques secondes
5. Dans Prometheus, vérifiez les targets : [http://localhost:9090/targets](http://localhost:9090/targets)
</details>
