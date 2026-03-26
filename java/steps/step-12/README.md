# Étape 12 — Export vers SigNoz (Backend all-in-one)

## Contexte

Jusqu'ici, nous avons utilisé une stack composée de **multiples outils** :
- **Jaeger** pour les traces
- **Prometheus** pour les métriques
- **Loki** pour les logs
- **Grafana** pour la visualisation
- **OpenTelemetry Collector** pour la collecte et le routage

Cette stack est puissante et flexible, mais elle nécessite de configurer et maintenir 5 services séparés. Pour les équipes qui veulent une solution plus simple, il existe des backends **tout-en-un** natifs OpenTelemetry.

### SigNoz — Un backend OpenTelemetry natif

**SigNoz** est une plateforme d'observabilité open-source, nativement compatible avec OpenTelemetry :

- **Traces** : Visualisation et recherche de traces distribuées
- **Métriques** : Dashboards et alertes
- **Logs** : Collecte et recherche de logs
- **Alertes** : Système d'alertes intégré
- **Dashboards** : Dashboards intégrés pour les services

### Avantages de SigNoz

| Critère | Stack séparée (Jaeger+Prometheus+Loki+Grafana) | SigNoz |
|---------|-----------------------------------------------|--------|
| Nombre de services | 5+ | 1 (+ ClickHouse) |
| Configuration | Complexe | Simple |
| Corrélation | Manuelle (config Grafana) | Native |
| Stockage | Multiple (Jaeger storage, Prometheus TSDB, Loki) | Unifié (ClickHouse) |
| Courbe d'apprentissage | Élevée (multiple UIs) | Modérée (une seule UI) |
| Flexibilité | Très élevée | Modérée |
| Communauté | Très large (chaque outil) | Croissante |

### Architecture de SigNoz

```
Application (OTel SDK)
    ↓ OTLP (gRPC/HTTP)
SigNoz OTel Collector
    ↓
ClickHouse (stockage unifié)
    ↓
SigNoz Frontend (visualisation)
```

SigNoz utilise **ClickHouse**, une base de données colonnaire haute performance, pour stocker traces, métriques et logs dans un même système.

### Port par défaut

- SigNoz Frontend : `http://localhost:3301`
- SigNoz OTel Collector (gRPC) : `4317`
- SigNoz OTel Collector (HTTP) : `4318`

> **Note** : Les ports OTLP sont les mêmes que ceux de notre Collector actuel. Il faudra gérer le conflit de ports.

## Objectifs

- Déployer SigNoz via Docker Compose
- Configurer l'application pour envoyer les données à SigNoz
- Explorer traces, métriques et logs dans l'interface SigNoz
- Comparer l'expérience avec la stack Jaeger+Prometheus+Loki+Grafana
