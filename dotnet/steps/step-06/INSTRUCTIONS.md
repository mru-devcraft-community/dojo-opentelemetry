# Step 06 — Instructions

## Prérequis

Vous devez avoir complété les **Steps 03 à 05** (spans custom, attributs, métriques).

## Étapes

### 1. Observer la configuration existante

Ouvrez `ShopTrack.ServiceDefaults/Extensions.cs` et repérez la section logs :

```csharp
builder.Logging.AddOpenTelemetry(logging =>
{
    logging.IncludeFormattedMessage = true;
    logging.IncludeScopes = true;
});
```

Cette configuration est déjà en place — les logs sont prêts à être exportés via OTLP.

### 2. Injecter ILogger dans OrderEndpoints

Dans `OrderEndpoints.cs`, le handler `POST /` doit recevoir un `ILogger` via l'injection de dépendances.

Avec les Minimal APIs, vous pouvez injecter `ILogger<T>` ou utiliser `ILoggerFactory` :

```csharp
group.MapPost("/", async (CreateOrderRequest request, ShopTrackDbContext db, 
    IHttpClientFactory httpClientFactory, ILoggerFactory loggerFactory) =>
{
    var logger = loggerFactory.CreateLogger("ShopTrack.Api.Orders");
    // ...
});
```

### 3. Ajouter un log au début de la création de commande

Au début du handler, loguez :

```
Creating order for {CustomerName} with {ItemCount} items
```

Niveau : `Information`

### 4. Ajouter un log de succès

Après la sauvegarde en base, loguez :

```
Order {OrderId} created successfully for {CustomerName}, total: {TotalAmount}, items: {ItemCount}
```

Niveau : `Information`

### 5. Ajouter un log d'erreur pour stock insuffisant

Quand la validation du stock échoue, loguez :

```
Insufficient stock for product {ProductName}: requested {RequestedQuantity}, available {AvailableStock}
```

Niveau : `Warning`

### 6. Ajouter un log d'erreur pour produit introuvable

```
Product {ProductId} not found while creating order for {CustomerName}
```

Niveau : `Warning`

### 7. Relancer et tester

```bash
cd dotnet/src
dotnet run --project ShopTrack.AppHost
```

Générez des commandes (réussies et échouées) :

```bash
# Commande réussie
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Iris","items":[{"productId":1,"quantity":1}]}'

# Commande échouée
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Jack","items":[{"productId":2,"quantity":99999}]}'
```

### 8. Observer les logs dans l'Aspire Dashboard

1. Ouvrez [https://localhost:18888](https://localhost:18888)
2. Allez dans l'onglet **Structured Logs**
3. Vérifiez que vos logs apparaissent avec les champs structurés

### 9. Vérifier la corrélation TraceId

Dans l'Aspire Dashboard :
1. Trouvez un log de création de commande
2. Notez le **TraceId** affiché dans les détails du log
3. Allez dans l'onglet **Traces** et recherchez cette trace
4. Vérifiez que la trace correspond bien à la commande loguée

### 10. Observer dans Grafana/Loki

1. Ouvrez [http://localhost:3000](http://localhost:3000)
2. Allez dans **Explore**
3. Sélectionnez la datasource **Loki**
4. Exécutez une requête LogQL :

```logql
{service_name="shoptrack-api"} |= "Creating order"
```

Cliquez sur un log et repérez le champ `traceID` — vous pouvez cliquer dessus pour naviguer vers la trace dans Jaeger.
