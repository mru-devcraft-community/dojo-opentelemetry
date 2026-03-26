# Step 06 — Validation

## Checklist

### ✅ 1. ILogger injecté dans le handler POST /api/orders

Le handler utilise `ILoggerFactory` pour créer un logger nommé.

### ✅ 2. Logs structurés (pas d'interpolation de strings)

Vérifiez que vos logs utilisent des **templates avec placeholders** et non de l'interpolation :

```csharp
// ✅ Correct
logger.LogInformation("Creating order for {CustomerName}", request.CustomerName);

// ❌ Incorrect — pas structuré
logger.LogInformation($"Creating order for {request.CustomerName}");
```

### ✅ 3. Logs visibles dans l'Aspire Dashboard

Créez une commande :

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Iris","items":[{"productId":1,"quantity":1}]}'
```

Dans le Dashboard Aspire, onglet **Structured Logs** :
- Log `"Creating order for Iris with 1 items"` visible
- Log `"Order X created successfully for Iris..."` visible

### ✅ 4. Log Warning visible pour erreur de stock

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Jack","items":[{"productId":2,"quantity":99999}]}'
```

Dans le Dashboard Aspire, un log de niveau **Warning** doit apparaître avec le message de stock insuffisant.

### ✅ 5. Corrélation TraceId dans les logs

Dans le Dashboard Aspire :
1. Trouvez un log dans **Structured Logs**
2. Vérifiez qu'un **TraceId** est associé
3. Cliquez sur le TraceId pour naviguer vers la trace correspondante
4. La trace doit correspondre à la même requête

### ✅ 6. Logs dans Grafana/Loki

Ouvrez [http://localhost:3000](http://localhost:3000) → Explore → Loki :

```logql
{service_name="shoptrack-api"} |= "Creating order"
```

**Attendu** : Les logs de création de commande apparaissent.

### ✅ 7. Champ traceID dans Loki

Cliquez sur un log dans Loki et vérifiez que le champ `traceID` est présent. Ce champ peut être utilisé pour naviguer vers Jaeger et voir la trace complète.

### ✅ Bravo !

Si toutes les validations passent, vous avez complété le DoJo ! Votre application ShopTrack est désormais entièrement instrumentée avec les **trois piliers de l'observabilité** :

- 🔍 **Traces** — Spans custom avec attributs, events et status (Jaeger)
- 📊 **Métriques** — Counters et histogrammes (Prometheus/Grafana)
- 📝 **Logs** — Structurés et corrélés avec les traces (Loki/Grafana)
