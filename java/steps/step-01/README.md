# Étape 01 — Auto-instrumentation (zero-code) avec le Java Agent

## Contexte

L'**OpenTelemetry Java Agent** est un fichier JAR que l'on attache à la JVM au démarrage via le flag `-javaagent`. Il intercepte automatiquement les appels de nombreuses librairies et frameworks, **sans aucune modification de code**.

### Comment ça marche ?

Le Java Agent utilise la technique du **bytecode instrumentation** : au chargement des classes, il injecte du code de traçage dans les méthodes connues. Concrètement, pour Spring Boot, il instrumente automatiquement :

- **Spring MVC** — Un span est créé pour chaque requête HTTP entrante (GET, POST, etc.)
- **JDBC** — Un span est créé pour chaque requête SQL
- **RestTemplate / WebClient** — Un span est créé pour chaque appel HTTP sortant
- **Logback / Log4j** — Les `TraceId` et `SpanId` sont injectés dans les logs

### Avantages

- ✅ Zéro modification de code
- ✅ Couverture large et immédiate
- ✅ Idéal pour le diagnostic rapide

### Limites

- ❌ Pas de spans personnalisés pour la logique métier
- ❌ Pas de contrôle fin sur les attributs des spans
- ❌ L'agent ajoute une couche d'abstraction (légère overhead mémoire)

### Configuration

L'agent se configure via des propriétés système (`-D`) ou des variables d'environnement :

| Propriété système | Variable d'environnement | Description |
|---|---|---|
| `otel.service.name` | `OTEL_SERVICE_NAME` | Nom du service |
| `otel.exporter.otlp.endpoint` | `OTEL_EXPORTER_OTLP_ENDPOINT` | URL du collector OTLP |
| `otel.traces.exporter` | `OTEL_TRACES_EXPORTER` | Exporter de traces (otlp par défaut) |

## Objectifs

- Télécharger le Java Agent OpenTelemetry
- Lancer l'application avec l'agent attaché
- Observer les traces automatiques dans Jaeger
- Identifier les différents types de spans générés
