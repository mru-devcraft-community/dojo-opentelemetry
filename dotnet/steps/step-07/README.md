# Step 07 — Corrélation traces ↔ logs ↔ métriques (Exemplars)

## Contexte

Les trois piliers de l'observabilité — **traces**, **métriques** et **logs** — sont encore plus puissants quand ils sont **corrélés** entre eux. La corrélation permet de naviguer fluidement d'un signal à l'autre pour diagnostiquer un problème :

```
Métrique suspecte → Trace associée → Logs de cette trace
```

### Les trois axes de corrélation

| Corrélation | Mécanisme | Exemple |
|------------|-----------|---------|
| **Logs → Traces** | TraceId dans les logs | Cliquer sur un TraceId dans Loki → ouvrir la trace dans Jaeger |
| **Traces → Logs** | Recherche par TraceId | Depuis Jaeger, chercher les logs avec le même TraceId dans Loki |
| **Métriques → Traces** | **Exemplars** | Un point de métrique contient un lien vers une trace spécifique |

### Qu'est-ce qu'un Exemplar ?

Un **Exemplar** est un échantillon attaché à un point de métrique. Il contient :
- Le **TraceId** et le **SpanId** d'un span actif au moment de l'enregistrement de la métrique
- Des **labels additionnels** optionnels

Concrètement, quand vous enregistrez une métrique (`Counter.Add()` ou `Histogram.Record()`) pendant qu'un span est actif, le SDK OpenTelemetry .NET attache automatiquement le TraceId/SpanId comme exemplar.

### Exemplars en .NET

Depuis .NET 8+, le SDK OpenTelemetry supporte les exemplars nativement. Ils sont activés par défaut quand :
1. Un instrument de métrique enregistre une valeur
2. Un span (`Activity`) est actif au moment de l'enregistrement
3. L'exporteur supporte les exemplars (OTLP le supporte)

### Flux de corrélation

```
Histogram.Record(125.5)  →  Exemplar { traceId: "abc123", spanId: "def456" }
                                    ↓
                            Prometheus (avec exemplars)
                                    ↓
                            Grafana → lien vers Jaeger
```

### Configuration côté collecteur et Prometheus

Pour que les exemplars remontent jusqu'à Grafana :
1. Le **Collector** doit être configuré pour transmettre les exemplars au format Prometheus
2. **Prometheus** doit être configuré pour stocker les exemplars (`--enable-feature=exemplar-storage`)
3. **Grafana** doit avoir la datasource Prometheus configurée avec le type "Prometheus" et les exemplars activés

## Objectif de ce step

Activer et vérifier la corrélation complète entre les trois piliers dans Grafana : naviguer d'une métrique vers une trace via les exemplars, et d'un log vers une trace via le TraceId.
