# Step 02 — Instructions

## Étapes

### 1. Comprendre le code existant

Ouvrez `ShopTrack.ServiceDefaults/Extensions.cs` et trouvez la méthode `AddOpenTelemetryExporters()` :

```csharp
private static IHostApplicationBuilder AddOpenTelemetryExporters(this IHostApplicationBuilder builder)
{
    var useOtlpExporter = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

    if (useOtlpExporter)
    {
        builder.Services.AddOpenTelemetry().UseOtlpExporter();
    }

    return builder;
}
```

Remarquez que l'exporter OTLP est **conditionnel** : il ne s'active que si la variable d'environnement `OTEL_EXPORTER_OTLP_ENDPOINT` est définie.

### 2. Configurer l'endpoint OTLP dans l'AppHost

Ouvrez `ShopTrack.AppHost/Program.cs`. Actuellement il contient :

```csharp
var api = builder.AddProject<Projects.ShopTrack_Api>("shoptrack-api")
    .WithReference(postgres)
    .WaitFor(postgres);
```

Vous devez ajouter la variable d'environnement `OTEL_EXPORTER_OTLP_ENDPOINT` pour pointer vers le **Collector OpenTelemetry** qui écoute sur le port `4317` (gRPC) de votre machine locale.

Ajoutez `.WithEnvironment(...)` pour configurer cette variable.

### 3. Vérifier que la stack Docker est démarrée

```bash
cd infra
docker compose ps
```

Le service `otel-collector` doit être en état `Up`.

### 4. Relancer l'application

```bash
cd dotnet/src
dotnet run --project ShopTrack.AppHost
```

### 5. Générer des requêtes

```bash
curl http://localhost:<port>/api/products

curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Charlie","items":[{"productId":1,"quantity":1},{"productId":3,"quantity":2}]}'
```

### 6. Vérifier les traces dans Jaeger

1. Ouvrez **Jaeger** : [http://localhost:16686](http://localhost:16686)
2. Dans le menu déroulant **Service**, sélectionnez `shoptrack-api`
3. Cliquez sur **Find Traces**
4. Vous devriez voir vos traces avec les spans HTTP automatiques

### 7. Comparer avec l'Aspire Dashboard

Les mêmes traces sont visibles à la fois dans l'Aspire Dashboard et dans Jaeger. L'Aspire Dashboard reçoit les traces directement, tandis que Jaeger les reçoit via le Collector.
