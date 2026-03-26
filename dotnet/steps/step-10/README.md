# Step 10 — Dashboards Grafana (Visualisation)

## Contexte

Jusqu'ici, nous avons exploré les données d'observabilité via l'onglet **Explore** de Grafana. En production, on crée des **dashboards** — des tableaux de bord visuels qui affichent les métriques, logs et traces clés en un coup d'œil.

### Grafana Dashboards

Un dashboard Grafana est composé de **panneaux** (panels), chacun affichant une visualisation :

| Type de panneau | Usage | Source de données |
|----------------|-------|-------------------|
| **Time Series** | Évolution dans le temps | Prometheus (PromQL) |
| **Stat** | Valeur unique (compteur, pourcentage) | Prometheus |
| **Gauge** | Valeur avec seuils (vert/jaune/rouge) | Prometheus |
| **Table** | Données tabulaires | Prometheus, Loki |
| **Logs** | Flux de logs | Loki (LogQL) |
| **Bar Chart** | Distribution | Prometheus |

### PromQL — Prometheus Query Language

PromQL est le langage de requête de Prometheus. Quelques fonctions essentielles :

| Fonction | Description | Exemple |
|----------|-------------|---------|
| `rate()` | Taux par seconde sur un intervalle | `rate(orders_created_total[5m])` |
| `increase()` | Augmentation sur un intervalle | `increase(orders_created_total[1h])` |
| `histogram_quantile()` | Percentile d'un histogramme | `histogram_quantile(0.95, rate(orders_total_amount_bucket[5m]))` |
| `sum()` | Somme par labels | `sum(rate(orders_created_total[5m]))` |

### LogQL — Loki Query Language

LogQL permet de chercher et filtrer les logs dans Loki :

```logql
{service_name="shoptrack-api"} |= "error"          # Contient "error"
{service_name="shoptrack-api"} | json | level="error"  # Logs JSON de niveau error
```

### Provisionnement automatique

Grafana supporte le **provisionnement** de dashboards via des fichiers JSON déposés dans un répertoire configuré. Cela permet de versionner les dashboards dans Git et de les déployer automatiquement.

Structure de provisionnement :
```
grafana/provisioning/
  dashboards/
    dashboard-provider.yml    ← Configuration du provider
    shoptrack-dashboard.json  ← Le dashboard au format JSON
  datasources/
    datasources.yml           ← Les datasources (déjà configuré)
```

## Objectif de ce step

Créer un dashboard Grafana complet pour ShopTrack avec des métriques, logs et le provisionner automatiquement.
