# Step 00 — Setup de l'environnement et stack d'observabilité

## Contexte

Bienvenue dans ce DoJo **OpenTelemetry** avec **.NET 10 Aspire** et **Minimal API** !

Tout au long de ces étapes, vous allez instrumenter progressivement une application e-commerce appelée **ShopTrack**. Cette application expose une API REST pour gérer des **produits** et des **commandes**, utilise **Entity Framework Core** avec **PostgreSQL**, et est orchestrée par **.NET Aspire**.

### Le projet ShopTrack

L'application se compose de trois projets :

| Projet | Rôle |
|--------|------|
| **ShopTrack.AppHost** | Orchestrateur Aspire — lance et coordonne tous les services |
| **ShopTrack.ServiceDefaults** | Configuration partagée : OpenTelemetry, health checks, service discovery |
| **ShopTrack.Api** | API Minimal avec les endpoints Products et Orders, EF Core + PostgreSQL |

### Les endpoints disponibles

- `GET /api/products` — Liste des produits
- `GET /api/products/{id}` — Détail d'un produit
- `POST /api/products` — Créer un produit
- `GET /api/orders` — Liste des commandes
- `GET /api/orders/{id}` — Détail d'une commande
- `POST /api/orders` — Créer une commande

### La stack d'observabilité

L'infrastructure d'observabilité est déployée via **Docker Compose** dans le dossier `infra/` et comprend :

| Service | Rôle | URL |
|---------|------|-----|
| **OpenTelemetry Collector** | Point central de collecte — reçoit traces, métriques et logs via OTLP puis les redistribue | `localhost:4317` (gRPC), `localhost:4318` (HTTP) |
| **Jaeger** | Visualisation des traces distribuées | `http://localhost:16686` |
| **Prometheus** | Collecte et stockage des métriques | `http://localhost:9090` |
| **Grafana** | Dashboards et exploration des données (métriques, logs, traces) | `http://localhost:3000` |
| **Loki** | Stockage et requêtage des logs | `http://localhost:3100` |
| **PostgreSQL** | Base de données de l'application | `localhost:5432` |

### Parcours du DoJo

| Step | Sujet |
|------|-------|
| 00 | Setup environnement + stack observabilité |
| 01 | Auto-instrumentation (zero-code) — Traces |
| 02 | Configuration de l'exporter OTLP |
| 03 | Instrumentation manuelle — Spans custom |
| 04 | Attributs, Events, Status sur les spans |
| 05 | Métriques — Counters, Histogrammes, Gauges |
| 06 | Logs structurés corrélés avec les traces |

## Objectif de ce step

Mettre en place l'environnement de travail complet : lancer la stack d'observabilité avec Docker Compose, démarrer l'application .NET Aspire, et vérifier que tout fonctionne correctement.
