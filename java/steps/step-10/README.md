# Étape 10 — Dashboards Grafana (Visualisation)

## Contexte

Avoir des métriques, traces et logs c'est bien. Pouvoir les **visualiser** de manière efficace c'est mieux. Grafana est l'outil de visualisation standard de l'écosystème OpenTelemetry.

### Grafana pour l'observabilité

Grafana permet de créer des dashboards qui combinent des données de plusieurs sources :
- **Prometheus** pour les métriques (PromQL)
- **Jaeger** pour les traces
- **Loki** pour les logs (LogQL)

### PromQL — Le langage de requête de Prometheus

PromQL est le langage pour interroger les métriques :

```promql
# Taux de requêtes par seconde (rate)
rate(orders_created_total[5m])

# Percentile 95 de la latence
histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket[5m]))

# Taux d'erreur (% de réponses 5xx)
rate(http_server_request_duration_seconds_count{http_response_status_code=~"5.."}[5m])
/ rate(http_server_request_duration_seconds_count[5m])
```

### Types de panels Grafana

- **Time series** : Graphique temporel classique (métriques en temps réel)
- **Stat** : Valeur unique (compteur total, valeur actuelle)
- **Gauge** : Jauge (pourcentage, taux)
- **Bar chart** : Comparaisons
- **Table** : Données tabulaires
- **Logs** : Affichage de logs depuis Loki

### Provisioning de dashboards

Plutôt que de créer les dashboards manuellement à chaque déploiement, on peut les **provisionner** :

```
infra/grafana/provisioning/
  dashboards/
    dashboard-provider.yml   ← Indique où trouver les dashboards
    shoptrack-dashboard.json ← Le dashboard au format JSON
  datasources/
    datasources.yml          ← Les data sources (déjà fait)
```

## Objectifs

- Créer un dashboard Grafana "ShopTrack Overview"
- Utiliser PromQL pour les métriques de l'application
- Ajouter des panels pour les logs Loki
- Provisionner le dashboard via un fichier JSON
