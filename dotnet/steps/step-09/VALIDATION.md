# Step 09 — Validation

## Checklist

### ✅ 1. Sampling ratio 50% — environ 50% des traces capturées

1. Configurez `SetSampler(new TraceIdRatioBasedSampler(0.5))`
2. Relancez l'application
3. Envoyez 20 requêtes :
   ```bash
   for i in $(seq 1 20); do
     curl -s -X POST http://localhost:<port>/api/orders \
       -H "Content-Type: application/json" \
       -d '{"customerName":"SampleUser'$i'","items":[{"productId":1,"quantity":1}]}'
   done
   ```
4. Ouvrez Jaeger → Service `shoptrack-api` → Find Traces
5. Le nombre de traces doit être **approximativement 10** (entre 7 et 13 est normal)

### ✅ 2. AlwaysOff — aucune trace

1. Configurez `SetSampler(new AlwaysOffSampler())`
2. Relancez et envoyez 5 requêtes
3. Ouvrez Jaeger → **aucune nouvelle trace** ne doit apparaître

### ✅ 3. ParentBased — cohérence avec le parent

1. Configurez `SetSampler(new ParentBasedSampler(new TraceIdRatioBasedSampler(0.5)))`
2. Relancez l'application
3. Envoyez une requête **avec** un traceparent sampled :
   ```bash
   curl -H "traceparent: 00-aabbccdd11223344aabbccdd11223344-aabbccdd11223344-01" \
     http://localhost:<port>/api/context
   ```
   → La trace doit **toujours** apparaître dans Jaeger (flag `01` = sampled)

4. Envoyez une requête **avec** un traceparent non-sampled :
   ```bash
   curl -H "traceparent: 00-eeffaabb11223344eeffaabb11223344-eeffaabb11223344-00" \
     http://localhost:<port>/api/context
   ```
   → La trace ne doit **jamais** apparaître dans Jaeger (flag `00` = not sampled)

### ✅ 4. Configuration via env vars

1. Supprimez `SetSampler()` du code
2. Ajoutez les variables d'environnement :
   - `OTEL_TRACES_SAMPLER=traceidratio`
   - `OTEL_TRACES_SAMPLER_ARG=0.25`
3. Envoyez 20 requêtes → environ 5 traces visibles dans Jaeger

### ✅ 5. Retour à AlwaysOn

Vérifiez que le code final n'a **pas** de `SetSampler()` configuré (AlwaysOn est le défaut) ou pas de variable d'environnement de sampling.

Envoyez 5 requêtes → 5 traces doivent apparaître dans Jaeger.
