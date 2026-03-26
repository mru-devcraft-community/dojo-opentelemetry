# Étape 11 — Debugging avec OpenTelemetry

## Contexte

OpenTelemetry n'est pas qu'un outil de monitoring — c'est un outil de **debugging** puissant. En combinant traces, métriques et logs, on peut diagnostiquer des problèmes complexes en production.

### Scénarios de debugging courants

1. **Requête lente** : Identifier quel span prend le plus de temps
2. **Erreur intermittente** : Corréler les logs d'erreur avec les traces pour comprendre le contexte
3. **Goulot d'étranglement** : Repérer les services ou opérations lents via les histogrammes
4. **Régression** : Comparer les latences avant/après un déploiement

### Baggage — Propagation de contexte métier

Le **Baggage** est un mécanisme OpenTelemetry pour propager des données **métier** à travers les services. Contrairement aux attributs de span (locaux à un span), le Baggage traverse les frontières de service.

Cas d'usage :
- Session ID de debugging
- ID de tenant (multi-tenancy)
- Feature flag actif
- ID de déploiement

```
Service A                       Service B
    |                               |
    | Baggage: debug.session=abc    |
    | ----------------------------→ |
    |                               | (lit le baggage)
    |                               | (l'ajoute aux logs/spans)
```

> ⚠️ **Attention** : Le Baggage est propagé via les headers HTTP. Ne mettez pas de données sensibles dans le Baggage (données personnelles, tokens, etc.).

### Identifier les goulots d'étranglement

Jaeger offre des vues puissantes pour le debugging :
- **Timeline** : Visualise la durée de chaque span
- **Critical path** : Met en évidence le chemin critique
- **Compare** : Compare deux traces côte à côte

## Objectifs

- Simuler de la latence dans NotificationService
- Identifier le goulot d'étranglement via Jaeger
- Utiliser l'API Baggage pour propager du contexte de debugging
- Créer un endpoint de debugging avec latence intentionnelle
- Pratiquer le workflow de debugging avec OpenTelemetry
