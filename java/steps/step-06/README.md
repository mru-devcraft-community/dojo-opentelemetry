# Étape 06 — Logs structurés corrélés avec les traces

## Contexte

Nous avons maintenant des **traces** (étapes 01-04) et des **métriques** (étape 05). Il reste le troisième pilier de l'observabilité : les **logs**.

L'objectif n'est pas simplement de loguer, mais de **corréler** les logs avec les traces. Quand vous voyez un log d'erreur, vous voulez pouvoir cliquer et retrouver la trace complète qui a produit cette erreur.

### Corrélation Traces ↔ Logs

OpenTelemetry injecte automatiquement le **TraceId** et le **SpanId** dans les logs via le **MDC** (Mapped Diagnostic Context) de SLF4J/Logback. Cela signifie que chaque ligne de log contient l'identifiant de la trace en cours.

Exemple de log corrélé :
```
2024-01-15 10:23:45 INFO [trace_id=abc123def456] [span_id=789ghi] Creating order for customer Alice
```

### L'appender OpenTelemetry pour Logback

Le module `opentelemetry-logback-appender-1.0` fournit un appender Logback qui :
1. Intercepte les logs SLF4J
2. Les enrichit avec TraceId et SpanId
3. Les envoie au Collector OTLP

### Architecture du pipeline de logs

```
Application (SLF4J/Logback)
    ↓ OpenTelemetry Logback Appender
OpenTelemetry Collector
    ↓ exporter/loki
Loki (stockage)
    ↓
Grafana (visualisation et requêtes)
```

### LogQL — Le langage de requête de Loki

Loki utilise **LogQL** pour rechercher des logs :

```logql
{service_name="shoptrack-api"} |= "Creating order"
{service_name="shoptrack-api"} | json | trace_id = "abc123def456"
```

## Objectifs

- Ajouter la dépendance du Logback appender OpenTelemetry
- Configurer `logback-spring.xml` avec l'appender OTel
- Ajouter des logs structurés dans OrderController
- Observer les logs dans Grafana/Loki
- Vérifier la corrélation TraceId entre logs et traces
