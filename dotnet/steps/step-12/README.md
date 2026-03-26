# Step 12 — Export vers SigNoz (optionnel)

## Contexte

Jusqu'à présent, notre stack d'observabilité utilise **plusieurs outils distincts** :

| Outil | Rôle | Port |
|-------|------|------|
| OpenTelemetry Collector | Réception et routage | 4317, 4318 |
| Jaeger | Traces | 16686 |
| Prometheus | Métriques | 9090 |
| Loki | Logs | 3100 |
| Grafana | Visualisation | 3000 |

Cela représente **5+ services** à configurer, maintenir et corréler manuellement. C'est flexible mais complexe.

### SigNoz — Une alternative tout-en-un

[SigNoz](https://signoz.io) est une plateforme d'observabilité **open-source** et **OTLP-native** qui regroupe traces, métriques et logs dans une seule interface. Elle est basée sur **ClickHouse** pour le stockage haute performance.

### Comparaison

| Critère | Stack séparée (Jaeger+Prometheus+Loki+Grafana) | SigNoz |
|---------|------------------------------------------------|--------|
| **Nombre de services** | 5+ conteneurs | 3 conteneurs (SigNoz + ClickHouse + Query Service) |
| **Complexité de config** | Élevée (un fichier par outil) | Faible (configuration centralisée) |
| **Corrélation** | Manuelle (copier le TraceId entre outils) | Native (clic trace → logs → métriques) |
| **Stockage** | Multiple (Badger/ES, fichiers, TSDB) | Unifié (ClickHouse) |
| **Courbe d'apprentissage** | Élevée (apprendre chaque outil) | Moyenne (une seule interface) |
| **Flexibilité** | Maximale (chaque composant remplaçable) | Modérée (plateforme intégrée) |
| **Communauté** | Très large (projets CNCF matures) | En croissance (15k+ stars GitHub) |

### Architecture avec SigNoz

```
┌──────────────┐     OTLP (gRPC :4317)     ┌──────────────────┐
│  ShopTrack   │ ─────────────────────────▶ │  SigNoz OTel     │
│  (.NET API)  │                            │  Collector        │
└──────────────┘                            └────────┬─────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │   ClickHouse     │
                                            │  (Stockage)      │
                                            └────────┬─────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │  SigNoz Frontend │
                                            │  (:3301)         │
                                            └──────────────────┘
```

### Ports par défaut de SigNoz

| Service | Port | Usage |
|---------|------|-------|
| Frontend UI | 3301 | Interface web |
| OTLP gRPC | 4317 | Réception des données (gRPC) |
| OTLP HTTP | 4318 | Réception des données (HTTP) |

### La force d'OpenTelemetry : la portabilité

Le point clé de ce step est de démontrer la **portabilité** d'OpenTelemetry. Grâce au protocole standard OTLP :
- **Zéro modification de code** dans l'application
- Seule la configuration du endpoint OTLP change
- On passe d'une stack de 5 services à une plateforme unifiée

C'est la promesse d'OTel : **instrumentez une fois, exportez partout**.

## Objectif de ce step

1. **Déployer** SigNoz via Docker Compose
2. **Reconfigurer** l'application pour envoyer les données à SigNoz (changement de endpoint uniquement)
3. **Vérifier** que les traces, métriques et logs sont visibles dans SigNoz
4. **Comparer** l'expérience avec la stack précédente
