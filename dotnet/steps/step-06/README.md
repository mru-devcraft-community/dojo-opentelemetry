# Step 06 — Logs structurés corrélés avec les traces

## Contexte

Les **logs** sont le troisième pilier de l'observabilité, avec les traces et les métriques. Dans un système bien instrumenté, les logs ne sont pas juste du texte brut — ils sont **structurés** et **corrélés** avec les traces.

### Logs structurés en .NET

En .NET, `ILogger` supporte nativement les logs structurés grâce aux **templates de message** :

```csharp
// ❌ Log non structuré — concaténation de strings
logger.LogInformation($"Order created for {customerName} with total {total}");

// ✅ Log structuré — paramètres nommés
logger.LogInformation("Order created for {CustomerName} with total {TotalAmount}",
    customerName, total);
```

La deuxième forme permet aux backends (Loki, Application Insights, etc.) d'**indexer** et de **filtrer** sur les champs `CustomerName` et `TotalAmount`.

### Corrélation Traces ↔ Logs

OpenTelemetry connecte automatiquement les logs aux traces via le **TraceId** et le **SpanId**. Quand vous émettez un log pendant qu'un span est actif, le TraceId et le SpanId sont automatiquement ajoutés au log.

Cela permet de :
- Partir d'une trace dans Jaeger et retrouver les logs associés dans Loki
- Partir d'un log d'erreur dans Loki et retrouver la trace complète dans Jaeger

### Configuration dans ServiceDefaults

Le fichier `Extensions.cs` configure déjà l'export des logs via OpenTelemetry :

```csharp
builder.Logging.AddOpenTelemetry(logging =>
{
    logging.IncludeFormattedMessage = true;
    logging.IncludeScopes = true;
});
```

- `IncludeFormattedMessage` : Inclut le message formaté (lisible par un humain)
- `IncludeScopes` : Inclut les scopes de logging (contexte additionnel)

### Pipeline de logs

```
ILogger (.NET) → OpenTelemetry Log Exporter → OTel Collector → Loki → Grafana
```

## Objectif de ce step

Ajouter des logs structurés dans les endpoints de commande et vérifier la corrélation avec les traces dans Grafana/Loki.
