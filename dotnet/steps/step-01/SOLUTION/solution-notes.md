# Step 01 — Solution

## Explication

Aucune modification de code n'est nécessaire pour ce step.

L'auto-instrumentation est déjà configurée dans `ShopTrack.ServiceDefaults/Extensions.cs` via la méthode `ConfigureOpenTelemetry()` :

```csharp
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation();
    })
    .WithTracing(tracing =>
    {
        tracing.AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation();
    });
```

### Ce qui est instrumenté automatiquement

| Instrumentation | Ce qu'elle capture |
|----------------|-------------------|
| `AddAspNetCoreInstrumentation()` | Chaque requête HTTP reçue par l'API (spans serveur) |
| `AddHttpClientInstrumentation()` | Chaque requête HTTP envoyée via `HttpClient` (spans client) |
| `AddRuntimeInstrumentation()` | Métriques du runtime .NET (GC, threads, etc.) |

### L'exporter Aspire Dashboard

La méthode `AddOpenTelemetryExporters()` configure automatiquement l'export OTLP si la variable d'environnement `OTEL_EXPORTER_OTLP_ENDPOINT` est définie. Aspire définit cette variable automatiquement pour pointer vers son propre Dashboard.

### Chaîne d'appel

```
Program.cs: builder.AddServiceDefaults()
    → Extensions.cs: AddServiceDefaults()
        → Extensions.cs: ConfigureOpenTelemetry()
            → AddAspNetCoreInstrumentation()
            → AddHttpClientInstrumentation()
            → AddOpenTelemetryExporters()
```
