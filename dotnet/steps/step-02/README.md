# Step 02 — Configuration de l'exporter OTLP

## Contexte

Jusqu'ici, les traces étaient visibles uniquement dans le **Dashboard Aspire**. C'est pratique en développement, mais en production on veut envoyer la télémétrie vers des backends spécialisés comme **Jaeger** (traces), **Prometheus** (métriques) et **Loki** (logs).

### Le protocole OTLP

**OTLP** (OpenTelemetry Protocol) est le protocole standard d'OpenTelemetry pour transporter les données de télémétrie. Il supporte deux transports :

| Transport | Port par défaut | Usage |
|-----------|----------------|-------|
| **gRPC** | `4317` | Performant, binaire, recommandé |
| **HTTP/protobuf** | `4318` | Compatibilité, traversée de proxies |

### L'OpenTelemetry Collector

Le **Collector** est un composant intermédiaire qui :
1. **Reçoit** la télémétrie (via OTLP)
2. **Traite** les données (filtrage, enrichissement, échantillonnage)
3. **Exporte** vers les backends finaux (Jaeger, Prometheus, Loki, etc.)

```
Application .NET → [OTLP] → OTel Collector → Jaeger (traces)
                                            → Prometheus (métriques)
                                            → Loki (logs)
```

### Le concept d'Exporter

Un **exporter** est le composant qui envoie les données de télémétrie vers un backend. Dans notre configuration, le ServiceDefaults utilise déjà `UseOtlpExporter()` qui s'active quand la variable `OTEL_EXPORTER_OTLP_ENDPOINT` est définie.

## Objectif de ce step

Configurer l'application pour envoyer ses traces vers le **Collector OpenTelemetry** (déjà lancé dans Docker), afin de les visualiser dans **Jaeger**.
