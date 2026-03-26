# Étape 08 — Propagation de contexte (Context Propagation)

## Contexte

Le tracing distribué ne fonctionne que si le **contexte de trace** est propagé d'un service à l'autre. Sans propagation, chaque service crée des traces indépendantes et on perd la vision bout-en-bout.

### Comment fonctionne la propagation ?

Quand un service A appelle un service B via HTTP, le contexte de trace est transmis via des **en-têtes HTTP** :

```
Service A                    Service B
    |                            |
    |  POST /api/orders          |
    |  traceparent: 00-abc...    |
    |  -------------------------→|
    |                            | (extrait le contexte)
    |                            | (crée un span enfant)
    |  200 OK                    |
    |  ←-------------------------|
```

### Le standard W3C Trace Context

Le header `traceparent` suit le format W3C Trace Context :

```
traceparent: 00-{trace-id}-{parent-id}-{trace-flags}
```

Exemple :
```
traceparent: 00-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6-789abcdef0123456-01
```

- `00` : version du protocole
- `a1b2c3d4...` : Trace ID (32 hex chars = 16 bytes)
- `789abcdef...` : Parent Span ID (16 hex chars = 8 bytes)
- `01` : Trace flags (01 = sampled)

### Le header `tracestate`

En complément de `traceparent`, le header `tracestate` permet de transporter des informations spécifiques au vendor :

```
tracestate: vendor1=value1,vendor2=value2
```

### Propagation B3 (Zipkin)

Un format alternatif, utilisé historiquement par Zipkin :

```
X-B3-TraceId: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
X-B3-SpanId: 789abcdef0123456
X-B3-Sampled: 1
```

Ou en format compact :
```
b3: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6-789abcdef0123456-1
```

### Auto-propagation avec Spring Boot + OTel

Le Spring Boot Starter OpenTelemetry instrumente automatiquement :
- Les **clients HTTP** : `RestTemplate`, `WebClient`, `HttpClient`
- Les **serveurs HTTP** : les requêtes entrantes

Cela signifie que quand notre `NotificationService` appelle httpbin.org via `RestTemplate`, le header `traceparent` est automatiquement ajouté.

## Objectifs

- Observer les headers de propagation dans les appels HTTP sortants
- Comprendre le format W3C `traceparent`
- Créer un endpoint de chaînage (/api/chain) pour observer la propagation multi-hops
- Vérifier dans Jaeger qu'une seule trace couvre l'ensemble de la chaîne
- Comprendre la propagation B3 comme alternative
