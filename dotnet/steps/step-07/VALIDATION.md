# Step 07 — Validation

## Checklist

### ✅ 1. Prometheus stocke les exemplars

Vérifiez que Prometheus est lancé avec le bon flag :

```bash
docker compose ps prometheus
docker compose logs prometheus | grep exemplar
```

Accédez à `http://localhost:9090/api/v1/query_exemplars?query=orders_total_amount_bucket&start=2020-01-01T00:00:00Z&end=2030-01-01T00:00:00Z`. La réponse doit contenir des exemplars avec des `traceID`.

### ✅ 2. Le Collector expose les exemplars au format OpenMetrics

Accédez à `http://localhost:8889/metrics` et vérifiez que les métriques contiennent des exemplars (lignes avec `# {trace_id=...}`).

### ✅ 3. Navigation Métrique → Trace dans Grafana

1. Créez quelques commandes :
   ```bash
   for i in $(seq 1 10); do
     curl -s -X POST http://localhost:<port>/api/orders \
       -H "Content-Type: application/json" \
       -d '{"customerName":"User'$i'","items":[{"productId":1,"quantity":1}]}'
   done
   ```

2. Ouvrez Grafana → Explore → Prometheus
3. Requête : `orders_total_amount_bucket`
4. Activez les **Exemplars** (bouton points)
5. Des points violets doivent apparaître
6. Cliquez sur un point → une fenêtre avec un lien vers Jaeger doit s'ouvrir
7. Cliquez sur le lien → la trace correspondante s'ouvre dans Jaeger

### ✅ 4. Navigation Log → Trace dans Grafana

1. Ouvrez Grafana → Explore → Loki
2. Requête : `{service_name="shoptrack-api"} |= "Order"`
3. Déployez un log
4. Un champ `TraceID` doit être visible avec un lien cliquable
5. Cliquez sur le lien → la trace correspondante s'ouvre dans Jaeger

### ✅ 5. Corrélation complète : trois piliers liés

Vérifiez que vous pouvez effectuer le parcours complet :
1. **Métrique** → (exemplar) → **Trace** dans Jaeger
2. **Log** → (traceID) → **Trace** dans Jaeger
3. **Trace** dans Jaeger → copier le TraceId → chercher dans Loki le **Log** correspondant

Ce circuit complet confirme la corrélation entre les trois piliers.
