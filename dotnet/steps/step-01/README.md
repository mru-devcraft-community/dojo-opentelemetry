# Step 01 — Auto-instrumentation (zero-code) — Traces

## Contexte

L'un des grands avantages d'**OpenTelemetry** combiné à **.NET Aspire** est l'**auto-instrumentation**. Sans écrire une seule ligne de code d'instrumentation, vous obtenez déjà des traces détaillées sur les requêtes HTTP entrantes et sortantes.

### Qu'est-ce qu'une trace ?

Une **trace** représente le parcours complet d'une requête à travers votre système. Elle est composée de **spans** (unités de travail) organisés hiérarchiquement :

```
Trace
 └── Span: HTTP GET /api/products (serveur)
      └── Span: SELECT * FROM Products (base de données)
```

Chaque span contient :
- Un **nom** (ex : `GET /api/products`)
- Un **timestamp** de début et de fin
- Des **attributs** (metadonnées clé-valeur)
- Un **TraceId** partagé entre tous les spans d'une même trace
- Un **SpanId** unique
- Un **ParentSpanId** pour la hiérarchie

### Le Trace Context

Le **Trace Context** (W3C standard) est un en-tête HTTP (`traceparent`) qui propage le TraceId et le SpanId entre les services. Cela permet de suivre une requête à travers plusieurs microservices.

### Qu'est-ce que l'auto-instrumentation fait ?

Le fichier `Extensions.cs` dans **ShopTrack.ServiceDefaults** configure automatiquement :

- **`AddAspNetCoreInstrumentation()`** : Crée un span pour chaque requête HTTP entrante (serveur)
- **`AddHttpClientInstrumentation()`** : Crée un span pour chaque requête HTTP sortante (client)

Cela signifie que chaque appel à votre API et chaque appel HTTP fait par votre application (comme la notification vers httpbin.org) génère automatiquement des spans.

## Objectif de ce step

Explorer et comprendre l'auto-instrumentation déjà en place grâce à Aspire ServiceDefaults, et observer les traces dans le Dashboard Aspire.
