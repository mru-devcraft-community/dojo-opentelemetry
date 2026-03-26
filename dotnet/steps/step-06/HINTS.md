# Step 06 — Indices

## Comment injecter ILogger dans un Minimal API ?

<details>
<summary>💡 Indice 1 — Injection via ILoggerFactory</summary>

Dans les Minimal APIs, vous pouvez injecter `ILoggerFactory` dans le handler et créer un logger :

```csharp
group.MapPost("/", async (CreateOrderRequest request, ShopTrackDbContext db,
    IHttpClientFactory httpClientFactory, ILoggerFactory loggerFactory) =>
{
    var logger = loggerFactory.CreateLogger("ShopTrack.Api.Orders");
    // ...
});
```
</details>

## Comment écrire un log structuré ?

<details>
<summary>💡 Indice 2 — Templates de message</summary>

Utilisez des **placeholders nommés** entre accolades :

```csharp
logger.LogInformation("Creating order for {CustomerName} with {ItemCount} items",
    request.CustomerName, request.Items.Count);
```

> ⚠️ N'utilisez PAS l'interpolation de strings `$"..."` — cela empêche les backends d'indexer les champs.
</details>

## Comment logger un warning ?

<details>
<summary>💡 Indice 3 — Niveaux de log</summary>

```csharp
logger.LogWarning("Insufficient stock for product {ProductName}: requested {RequestedQuantity}, available {AvailableStock}",
    product.Name, item.Quantity, product.Stock);
```

Niveaux disponibles : `Trace`, `Debug`, `Information`, `Warning`, `Error`, `Critical`
</details>

## Les logs n'apparaissent pas dans Loki ?

<details>
<summary>💡 Indice 4 — Dépannage Loki</summary>

1. Vérifiez que Loki est démarré : `docker compose ps | grep loki`
2. Vérifiez les logs du Collector : `docker compose logs otel-collector`
3. Dans Grafana, vérifiez que la datasource Loki est configurée (Settings → Data Sources)
4. En LogQL, essayez : `{service_name=~".+"}` pour voir tous les services disponibles
</details>

## Comment naviguer du log à la trace ?

<details>
<summary>💡 Indice 5 — Corrélation dans Grafana</summary>

Dans Grafana/Loki, chaque log émis pendant un span actif contient automatiquement un champ `traceID`.

Grafana peut être configuré pour créer un lien direct de ce `traceID` vers Jaeger. Si la datasource Jaeger est configurée, un bouton apparaît pour naviguer directement.

Dans le Dashboard Aspire, la corrélation est native : un clic sur le TraceId dans un log ouvre directement la trace.
</details>
