# Step 09 — Indices

## Quel namespace importer pour les samplers ?

<details>
<summary>💡 Indice 1 — Imports nécessaires</summary>

Les samplers sont dans le namespace `OpenTelemetry.Trace` :

```csharp
using OpenTelemetry.Trace;
```

Les samplers disponibles :
- `AlwaysOnSampler`
- `AlwaysOffSampler`
- `TraceIdRatioBasedSampler(double ratio)`
- `ParentBasedSampler(Sampler rootSampler)`

</details>

## Comment appliquer le sampler ?

<details>
<summary>💡 Indice 2 — SetSampler dans la configuration</summary>

Le sampler se configure sur le `TracerProviderBuilder` via `SetSampler()` :

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing.AddSource(Diagnostics.ActivitySource.Name)
            .SetSampler(new TraceIdRatioBasedSampler(0.5));
    });
```

> ⚠️ `SetSampler()` doit être appelé sur le `TracerProviderBuilder`, pas sur le `OpenTelemetryBuilder`.

</details>

## Les traces disparaissent toutes avec ParentBased ?

<details>
<summary>💡 Indice 3 — Comprendre ParentBased</summary>

`ParentBasedSampler` prend un sampler racine en paramètre. Ce sampler racine est utilisé **uniquement** pour les traces sans parent.

```csharp
// 50% des nouvelles traces, 100% des traces avec parent sampled
new ParentBasedSampler(new TraceIdRatioBasedSampler(0.5))
```

Si toutes vos traces disparaissent, vérifiez que vous n'avez pas un proxy ou load balancer qui envoie un header `traceparent` non-sampled.

</details>

## Comment vérifier le sampling avec les env vars ?

<details>
<summary>💡 Indice 4 — Variables d'environnement</summary>

Supprimez tout appel à `SetSampler()` dans le code et utilisez :

```
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.5
```

Valeurs possibles pour `OTEL_TRACES_SAMPLER` :
- `always_on` (défaut)
- `always_off`
- `traceidratio`
- `parentbased_always_on`
- `parentbased_always_off`
- `parentbased_traceidratio`

</details>

## Comment faire un script qui envoie N requêtes ?

<details>
<summary>💡 Indice 5 — Script bash</summary>

```bash
#!/bin/bash
PORT=5000  # Adapter au port de votre application

for i in $(seq 1 20); do
  curl -s -X POST http://localhost:$PORT/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"SampleUser'$i'","items":[{"productId":1,"quantity":1}]}'
  echo " -> Request $i sent"
done

echo ""
echo "Ouvrez Jaeger (http://localhost:16686) et comptez les traces."
echo "Avec un ratio de 50%, vous devriez voir environ 10 traces."
```

</details>
