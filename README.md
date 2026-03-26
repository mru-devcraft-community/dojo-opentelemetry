# OpenTelemetry — Formation & DoJos pratiques

<https://opentelemetry.io/fr/>

## Présentation

OpenTelemetry est un projet *open source* issu de la fusion de **OpenTracing** et **OpenCensus**. Il fournit un ensemble unique d'API et de bibliothèques qui standardisent la collecte et l'envoi de données de télémétrie vers n'importe quelle plateforme d'observabilité.

Son principal avantage : une **norme unifiée** et *vendor-agnostic* pour les traces, métriques et logs.

## Structure du repo

```
├── infra/                  # Docker Compose : PostgreSQL, OTel Collector, Jaeger, Prometheus, Grafana, Loki
├── dotnet/                 # DoJo .NET 10 Aspire + Minimal API
│   ├── src/                # Code source de l'application ShopTrack
│   └── steps/              # Steps auto-guidés (step-00 à step-12)
├── java/                   # DoJo Java 21 + Spring Boot 3.x
│   ├── src/                # Code source de l'application ShopTrack
│   └── steps/              # Steps auto-guidés (step-00 à step-12)
└── .thinking/              # Notes de conception
```

## Contexte applicatif — ShopTrack

Les deux DoJos implémentent la **même API REST fictive** « ShopTrack » (gestion de produits et commandes) pour permettre une comparaison directe entre les stacks :

- **Endpoints** : Products (CRUD) + Orders (création, consultation)
- **Persistence** : PostgreSQL partagé via conteneur Docker
- **Appel HTTP sortant** : service de notification simulé

## DoJos disponibles

Les deux DoJos suivent la **même progression** et partagent la même infrastructure d'observabilité :

| Step | Thème | Signals |
|------|-------|---------|
| 0 | Setup environnement + stack observabilité | — |
| 1 | Auto-instrumentation (zero-code) | Traces |
| 2 | Configuration de l'exporter OTLP | Traces |
| 3 | Instrumentation manuelle — Spans custom | Traces |
| 4 | Attributs, Events, Status sur les spans | Traces |
| 5 | Métriques — Counters, Histogrammes, Gauges | Metrics |
| 6 | Logs structurés corrélés avec les traces | Logs |
| 7 | Corrélation Traces + Metrics + Logs | Les 3 |
| 8 | Propagation de contexte inter-services | Traces |
| 9 | Sampling — filtrage des données | Traces |
| 10 | Dashboards Grafana & alerting | Metrics/Logs |
| 11 | *(optionnel)* Debugging avec OTel | Traces |
| 12 | *(optionnel)* Export vers SigNoz | Les 3 |

### Format de chaque step

```
step-XX/
  README.md        ← Contexte & objectifs
  INSTRUCTIONS.md  ← Ce que l'apprenant doit faire
  HINTS.md         ← Indices progressifs
  SOLUTION/        ← Correction complète
  VALIDATION.md    ← Comment vérifier que ça fonctionne
```

## Prérequis

- **Docker** et **Docker Compose** installés et fonctionnels
- Pour le DoJo .NET : **.NET 10 SDK**
- Pour le DoJo Java : **Java 21** + **Maven 3.9+**
- Un IDE (VS Code, IntelliJ IDEA, Rider…)

## Démarrage rapide

```bash
# 1. Lancer le stack d'observabilité
cd infra
docker compose up -d

# 2. Choisir un DoJo et commencer au step 0
cd ../dotnet/steps/step-00   # ou ../java/steps/step-00
# Lire le README.md du step
```

## URLs des services

| Service | URL |
|---------|-----|
| Jaeger UI | http://localhost:16686 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Aspire Dashboard (.NET) | http://localhost:18888 |
