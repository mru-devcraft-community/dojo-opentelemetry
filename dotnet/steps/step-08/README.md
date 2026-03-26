# Step 08 — Propagation de contexte (Context Propagation)

## Contexte

La **propagation de contexte** est le mécanisme qui permet de relier les spans entre eux à travers les frontières de processus et de services. Sans propagation, chaque service créerait des traces indépendantes.

### Le standard W3C Trace Context

Le standard **W3C Trace Context** définit deux en-têtes HTTP pour propager le contexte de trace :

| En-tête | Rôle | Format |
|---------|------|--------|
| `traceparent` | Identifiant de trace et de span parent | `{version}-{trace-id}-{parent-id}-{flags}` |
| `tracestate` | Informations spécifiques au vendor | Clé-valeur séparé par virgules |

#### Format du header `traceparent`

```
00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
│   │                                 │                  │
│   │                                 │                  └─ flags (01 = sampled)
│   │                                 └─ parent-id (span-id, 16 hex)
│   └─ trace-id (32 hex)
└─ version (toujours 00)
```

### Propagation automatique en .NET

En .NET avec OpenTelemetry, la propagation est **automatique** quand :
- L'instrumentation `HttpClient` est activée (`.AddHttpClientInstrumentation()`) → ajoute `traceparent` aux requêtes sortantes
- L'instrumentation `AspNetCore` est activée (`.AddAspNetCoreInstrumentation()`) → lit `traceparent` des requêtes entrantes

Quand le Service A appelle le Service B via HttpClient :

```
Service A                          Service B
┌─────────────┐  HTTP + traceparent  ┌─────────────┐
│  Span A     │ ──────────────────→  │  Span B     │
│  trace: abc │                      │  trace: abc │
│  span: 111  │                      │  parent: 111│
└─────────────┘                      └─────────────┘
```

Les deux spans partagent le même `trace-id` et forment une seule trace dans Jaeger.

### Autres formats de propagation

| Format | Utilisé par |
|--------|-------------|
| **W3C Trace Context** | Standard OpenTelemetry (défaut) |
| **B3** | Zipkin, ancien Spring Cloud Sleuth |
| **Jaeger** | En-tête `uber-trace-id` (legacy) |

OpenTelemetry .NET utilise W3C par défaut mais peut être configuré pour d'autres formats.

## Objectif de ce step

Observer la propagation de contexte en action, vérifier les en-têtes dans les requêtes sortantes, et simuler un appel chaîné pour voir une seule trace traverser plusieurs "services".
