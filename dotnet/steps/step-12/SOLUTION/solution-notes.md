# Step 12 — Solution

## Résumé des modifications

### Principe clé : zéro modification de code

Ce step démontre la **portabilité d'OpenTelemetry**. Aucun fichier `.cs` n'est modifié. Les changements se limitent à l'infrastructure et à la configuration.

### 1. Fichier `docker-compose-signoz.yml`

Déploie SigNoz avec 4 services :

| Service | Image | Port exposé |
|---------|-------|-------------|
| `signoz-clickhouse` | `clickhouse/clickhouse-server:24.1.2-alpine` | — (interne) |
| `signoz-otel-collector` | `signoz/signoz-otel-collector:0.102.12` | 4317 (gRPC), 4318 (HTTP) |
| `signoz-query-service` | `signoz/query-service:0.102.12` | — (interne) |
| `signoz-frontend` | `signoz/frontend:0.102.12` | 3301 (UI) |

### 2. Configuration du endpoint OTLP

La seule configuration à changer est le endpoint OTLP :

```
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

Cela peut se faire via :
- Variable d'environnement (recommandé)
- `appsettings.signoz.json`
- Configuration dans l'AppHost (`WithEnvironment(...)`)

### 3. Ce qui fonctionne sans changement

Grâce à l'instrumentation OpenTelemetry standard configurée dans les ServiceDefaults :
- ✅ Traces distribuées (ASP.NET Core + HttpClient)
- ✅ Métriques custom (`orders_created_total`, `orders_total_amount`)
- ✅ Métriques auto-instrumentées (`http_server_request_duration`)
- ✅ Logs structurés avec corrélation TraceId
- ✅ Propagation de contexte W3C

### Comparaison finale

| Aspect | Stack séparée | SigNoz |
|--------|--------------|--------|
| Conteneurs | 5+ | 4 |
| Corrélation trace-log | Manuelle | Native (1 clic) |
| UI unifiée | Non (Grafana + Jaeger) | Oui |
| Code modifié | — | Aucun |
| Config modifiée | — | 1 variable d'environnement |
