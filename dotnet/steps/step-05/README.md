# Step 05 — Métriques — Counters, Histogrammes, Gauges

## Contexte

Les **traces** donnent une vue détaillée sur les requêtes individuelles. Les **métriques** donnent une vue **agrégée** : combien de commandes par minute ? Quel est le montant moyen ? Combien d'erreurs ?

### Les métriques dans OpenTelemetry

OpenTelemetry définit trois types principaux d'instruments de métriques :

| Instrument | Usage | Exemple |
|-----------|-------|---------|
| **Counter** | Valeur qui ne fait qu'augmenter | Nombre de commandes créées, nombre d'erreurs |
| **Histogram** | Distribution de valeurs | Temps de réponse, montant des commandes |
| **Gauge** | Valeur instantanée qui peut monter et descendre | Nombre d'items en stock, connexions actives |

### L'API Meter en .NET

En .NET, les métriques utilisent l'API `System.Diagnostics.Metrics` :

```csharp
using System.Diagnostics.Metrics;

// Créer un Meter (équivalent du MeterProvider dans OTel)
static readonly Meter MyMeter = new("MonApplication");

// Créer des instruments
static readonly Counter<long> RequestCount = MyMeter.CreateCounter<long>("requests.count");
static readonly Histogram<double> RequestDuration = MyMeter.CreateHistogram<double>("requests.duration", "ms");
```

Pour utiliser un Counter :
```csharp
RequestCount.Add(1);                           // Incrémenter de 1
RequestCount.Add(1, new("method", "POST"));    // Avec un tag
```

Pour utiliser un Histogram :
```csharp
RequestDuration.Record(125.5);                         // Enregistrer une valeur
RequestDuration.Record(125.5, new("endpoint", "/api")); // Avec un tag
```

### Connexion à Prometheus

Prometheus **scrape** (pull) les métriques depuis votre application. Le Collector OpenTelemetry sert d'intermédiaire : il reçoit les métriques via OTLP et les expose au format Prometheus.

```
Application .NET → [OTLP] → OTel Collector → Prometheus → Grafana
```

## Objectif de ce step

Créer des instruments de métriques pour suivre les commandes (créées, échouées, montants) et les observer dans Prometheus et Grafana.
