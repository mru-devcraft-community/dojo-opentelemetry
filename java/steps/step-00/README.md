# Étape 00 — Setup de l'environnement et stack d'observabilité

## Contexte

Bienvenue dans ce DoJo **OpenTelemetry** pour Java ! Vous allez instrumenter progressivement une application Spring Boot appelée **ShopTrack** — une API de gestion de produits et commandes.

### L'application ShopTrack

ShopTrack est une API REST construite avec :
- **Java 21** et **Spring Boot 3.4.1**
- **Spring Data JPA** avec **PostgreSQL**
- **Spring Web** (REST controllers)
- Un **NotificationService** qui appelle un service externe (httpbin.org) via RestTemplate

L'application expose deux groupes d'endpoints :
- `/api/products` — CRUD de produits
- `/api/orders` — Création et consultation de commandes

### La stack d'observabilité

Le dossier `infra/` contient un `docker-compose.yml` qui déploie :

| Service | Port | Rôle |
|---------|------|------|
| **PostgreSQL** | 5432 | Base de données de l'application |
| **OpenTelemetry Collector** | 4317 (gRPC), 4318 (HTTP) | Réception et routage des données de télémétrie |
| **Jaeger** | 16686 | Visualisation des traces distribuées |
| **Prometheus** | 9090 | Collecte et stockage des métriques |
| **Grafana** | 3000 | Dashboards et visualisation |
| **Loki** | 3100 | Agrégation de logs |

### Deux approches d'instrumentation

Au cours de ce DoJo, nous explorerons deux approches :

1. **Auto-instrumentation (javaagent)** — Zéro code à écrire. Un agent Java intercepte automatiquement les appels HTTP, JDBC, RestTemplate, etc. Idéal pour un démarrage rapide.

2. **SDK (Spring Boot Starter)** — Intégration via des dépendances Maven et configuration Spring. Permet une instrumentation manuelle fine avec des spans, attributs, métriques et logs personnalisés.

## Objectifs de cette étape

- Vérifier que votre environnement de développement est prêt
- Lancer la stack d'observabilité avec Docker Compose
- Builder et lancer l'application ShopTrack
- Tester les endpoints de l'API
