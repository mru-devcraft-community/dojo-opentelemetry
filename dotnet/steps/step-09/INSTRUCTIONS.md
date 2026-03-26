# Step 09 — Instructions

## Prérequis

Vous devez avoir complété le **Step 08** (propagation de contexte).

## Étapes

### 1. Configurer un sampler ratio-based à 50%

Dans `Program.cs`, ajoutez la configuration du sampler dans la section OpenTelemetry :

```csharp
using OpenTelemetry.Trace;

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing.AddSource(Diagnostics.ActivitySource.Name)
            .SetSampler(new TraceIdRatioBasedSampler(0.5));
    })
    .WithMetrics(metrics => metrics.AddMeter(Diagnostics.Meter.Name));
```

### 2. Envoyer 20 requêtes et compter les traces

Relancez l'application et envoyez 20 requêtes :

```bash
for i in $(seq 1 20); do
  curl -s -X POST http://localhost:<port>/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"User'$i'","items":[{"productId":1,"quantity":1}]}'
  echo ""
done
```

Ouvrez Jaeger et comptez les traces. Avec un ratio de 50%, vous devriez voir environ 10 traces (±3 par variation statistique).

### 3. Tester AlwaysOff

Remplacez le sampler par `AlwaysOffSampler` :

```csharp
.SetSampler(new AlwaysOffSampler())
```

Envoyez quelques requêtes → **aucune trace** ne doit apparaître dans Jaeger.

### 4. Tester ParentBased sampling

Configurez un `ParentBasedSampler` avec un ratio de 50% pour les traces racines :

```csharp
.SetSampler(new ParentBasedSampler(new TraceIdRatioBasedSampler(0.5)))
```

Ce sampler :
- Pour les nouvelles traces (sans parent) → applique le ratio de 50%
- Pour les traces avec un parent sampled → conserve toujours
- Pour les traces avec un parent non-sampled → ignore toujours

### 5. Configurer le sampling via variable d'environnement

Au lieu de coder le sampler dans le code, utilisez les variables d'environnement. Supprimez le `SetSampler()` du code et configurez dans `launchSettings.json` ou via la ligne de commande :

```json
{
  "environmentVariables": {
    "OTEL_TRACES_SAMPLER": "parentbased_traceidratio",
    "OTEL_TRACES_SAMPLER_ARG": "0.1"
  }
}
```

Ou via Aspire dans l'AppHost :

```csharp
var api = builder.AddProject<Projects.ShopTrack_Api>("shoptrack-api")
    .WithReference(postgres)
    .WaitFor(postgres)
    .WithEnvironment("OTEL_TRACES_SAMPLER", "parentbased_traceidratio")
    .WithEnvironment("OTEL_TRACES_SAMPLER_ARG", "0.1");
```

### 6. Revenir à AlwaysOn

Pour la suite du DoJo, remettez le sampling à `AlwaysOn` (ou supprimez simplement la configuration du sampler, car c'est le défaut) :

```csharp
// Pas de SetSampler() = AlwaysOnSampler par défaut
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(Diagnostics.ActivitySource.Name))
    .WithMetrics(metrics => metrics.AddMeter(Diagnostics.Meter.Name));
```
