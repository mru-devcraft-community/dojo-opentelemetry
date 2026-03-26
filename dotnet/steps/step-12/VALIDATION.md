# Step 12 — Validation

## Checklist

### ✅ 1. SigNoz est démarré et fonctionnel

```bash
cd infra
docker compose -f docker-compose-signoz.yml ps
```

Tous les conteneurs doivent être en état `healthy` ou `running` :
- `signoz-clickhouse`
- `signoz-otel-collector`
- `signoz-frontend` (ou `signoz-query-service` selon la version)

### ✅ 2. L'application envoie des données sans erreur

1. Lancez l'application :
   ```bash
   cd dotnet/src/ShopTrack.AppHost
   dotnet run
   ```

2. Vérifiez dans les logs de l'application qu'il n'y a **aucune erreur de connexion OTLP** :
   ```
   # ❌ Ce type d'erreur ne doit PAS apparaître :
   # Error exporting to OTLP: connection refused
   # Failed to export batch
   ```

### ✅ 3. Les traces sont visibles dans SigNoz

1. Ouvrez SigNoz : [http://localhost:3301](http://localhost:3301)
2. Allez dans l'onglet **Traces**
3. Filtrez par service : `shoptrack-api`
4. Au moins une trace doit apparaître (après avoir généré du trafic)
5. Cliquez sur une trace → le diagramme en cascade (waterfall) doit être visible

### ✅ 4. Les services sont visibles avec métriques RED

1. Onglet **Services** dans SigNoz
2. `shoptrack-api` doit apparaître dans la liste
3. Les métriques suivantes doivent être affichées :
   - **Throughput** (débit de requêtes)
   - **Latency** (P50, P95, P99)
   - **Error Rate** (taux d'erreur)

### ✅ 5. Les métriques sont visibles

1. Onglet **Metrics** (ou **Metrics Explorer**) dans SigNoz
2. Les métriques custom suivantes doivent être présentes :
   - `orders_created_total`
   - `orders_total_amount`
3. Les métriques auto-instrumentées doivent être présentes :
   - `http_server_request_duration` (ou variante selon les conventions sémantiques)

### ✅ 6. Les logs sont visibles avec corrélation

1. Onglet **Logs** dans SigNoz
2. Les logs de l'application doivent apparaître
3. Cliquez sur un log qui contient un **Trace ID**
4. Vérifiez que SigNoz permet de naviguer directement vers la trace associée (corrélation log → trace)

### ✅ 7. Aucune modification de code dans l'application

Le point crucial de ce step : **aucun fichier `.cs` n'a été modifié**. Seule la configuration du endpoint OTLP a changé. Cela démontre la portabilité d'OpenTelemetry.

Vérifiez :
```bash
cd dotnet/src
git diff --name-only
```

Les seuls fichiers modifiés devraient être dans `infra/` (docker compose) ou des fichiers de configuration, **pas** des fichiers `.cs`.
