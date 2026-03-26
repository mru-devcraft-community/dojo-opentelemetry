# Validation — Étape 12

## ✅ Checklist

### 1. SigNoz est démarré

```bash
docker compose -f docker-compose-signoz.yml ps
```

- [ ] Tous les services sont en état `running` ou `healthy`
- [ ] ClickHouse est démarré
- [ ] Le Collector SigNoz est démarré
- [ ] Le frontend SigNoz est accessible sur http://localhost:3301

### 2. L'application envoie des données à SigNoz

- [ ] `application.yml` pointe vers l'endpoint OTLP de SigNoz
- [ ] L'application démarre sans erreur
- [ ] Pas d'erreurs de connexion OTLP dans les logs de l'application

### 3. Traces dans SigNoz

1. Ouvrez http://localhost:3301 > **Traces**
2. Filtrez par service `shoptrack-api`

- [ ] Les traces apparaissent
- [ ] Les spans ont des attributs (customer_name, total_amount, etc.)
- [ ] La hiérarchie parent-enfant est visible
- [ ] Les événements (OrderPersisted, etc.) sont présents

### 4. Services dans SigNoz

1. Allez dans **Services**

- [ ] Le service `shoptrack-api` apparaît
- [ ] Le débit (req/sec) est affiché
- [ ] La latence P50/P95/P99 est affichée
- [ ] Le taux d'erreur est affiché

### 5. Métriques dans SigNoz

1. Allez dans **Dashboards** ou **Metrics Explorer**

- [ ] Les métriques custom (`orders_created_total`, `orders_total_amount`) sont disponibles
- [ ] Les métriques auto-instrumentées (`http_server_request_duration_seconds`) sont présentes
- [ ] Les métriques JVM sont disponibles

### 6. Logs dans SigNoz

1. Allez dans **Logs**

- [ ] Les logs de `shoptrack-api` apparaissent
- [ ] Les logs contiennent le Trace ID
- [ ] La corrélation log → trace fonctionne

### 7. Comparaison avec la stack précédente

Après avoir exploré SigNoz, notez vos observations :

- [ ] La corrélation traces ↔ logs est-elle plus simple ?
- [ ] L'interface est-elle plus ou moins intuitive que Jaeger + Grafana ?
- [ ] Quelles fonctionnalités manquent par rapport à Grafana ?
- [ ] SigNoz serait-il adapté à votre contexte professionnel ?

### 8. Nettoyage (optionnel)

```bash
# Arrêter SigNoz
docker compose -f docker-compose-signoz.yml down -v

# Relancer la stack de base
cd infra
docker compose up -d
```
