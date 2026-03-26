# Step 11 — Debugging avec OpenTelemetry (optionnel)

## Contexte

OpenTelemetry n'est pas seulement un outil de **monitoring** — c'est aussi un puissant outil de **debugging**. Les traces distribuées, les logs corrélés et les métriques permettent de diagnostiquer des problèmes complexes en production sans avoir à reproduire le bug localement.

### Scénarios de debugging courants

| Scénario | Signal OTel utile | Outil |
|----------|-------------------|-------|
| **Requête lente** | Traces (spans avec durée) | Jaeger — tri par durée |
| **Erreur intermittente** | Traces + Logs corrélés | Jaeger + Loki (via TraceId) |
| **Goulot d'étranglement** | Traces (span enfant le plus long) | Jaeger — vue Critical Path |
| **Régression de performance** | Métriques (latence P95/P99) | Grafana — dashboards |
| **Propagation de contexte** | Baggage + Tags | Jaeger — attributs de span |

### L'API Baggage

Le **Baggage** est un mécanisme d'OpenTelemetry qui permet de propager du contexte arbitraire entre services, au sein d'une même trace. En .NET, on utilise l'API `System.Diagnostics.Activity` :

```csharp
// Ajouter un élément au Baggage (propagé aux services downstream)
Activity.Current?.AddBaggage("debug.session_id", sessionId);

// Lire un élément du Baggage
var sessionId = Activity.Current?.GetBaggageItem("debug.session_id");

// Le Baggage n'est PAS automatiquement visible dans Jaeger !
// Il faut manuellement le copier en tant que tag :
Activity.Current?.SetTag("debug.session_id", sessionId);
```

> ⚠️ **Attention** : Le Baggage est propagé via les en-têtes HTTP (W3C Baggage). Ne mettez **jamais** de données sensibles (tokens, mots de passe, PII) dans le Baggage — elles transitent en clair sur le réseau.

### Vues de debugging dans Jaeger

Jaeger offre plusieurs vues utiles pour le debugging :

| Vue | Usage |
|-----|-------|
| **Timeline** | Voir la cascade de spans et identifier visuellement le plus long |
| **Critical Path** | Jaeger met en surbrillance le chemin critique (la chaîne de spans qui détermine la durée totale) |
| **Compare** | Comparer deux traces côte à côte pour identifier les différences |
| **Deep Dependency Graph** | Visualiser les dépendances entre services |

### Workflow de debugging

```
1. Détection (Grafana) → Les métriques montrent un pic de latence
2. Investigation (Jaeger) → Les traces révèlent quel span est lent
3. Corrélation (Loki) → Les logs du span lent donnent le détail de l'erreur
4. Confirmation (Baggage) → Le contexte de debug permet de suivre une session spécifique
```

## Objectif de ce step

1. **Simuler** une latence aléatoire (100-2000ms) dans l'appel de notification HTTP
2. **Identifier** le goulot d'étranglement via Jaeger (tri par durée)
3. **Utiliser** l'API Baggage pour propager un contexte de debug
4. **Créer** des endpoints de debug pour faciliter le diagnostic
