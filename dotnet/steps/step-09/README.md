# Step 09 — Sampling (Stratégies d'échantillonnage)

## Contexte

En production, il est souvent impossible (et inutile) de capturer **100% des traces**. Le **sampling** (échantillonnage) permet de ne garder qu'un pourcentage des traces tout en conservant une vue représentative du système.

### Pourquoi le sampling ?

| Sans sampling | Avec sampling |
|--------------|---------------|
| 100% des traces capturées | Seul un % des traces est capturé |
| Coût de stockage élevé | Coût de stockage réduit |
| Bande passante réseau élevée | Bande passante réduite |
| Tous les détails disponibles | Vue statistique représentative |

### Head-based vs Tail-based sampling

| Type | Quand la décision est prise | Avantages | Inconvénients |
|------|---------------------------|-----------|---------------|
| **Head-based** | Au début de la trace (avant exécution) | Simple, efficace | Ne peut pas décider basé sur le résultat |
| **Tail-based** | Après la fin de la trace | Peut garder les traces avec erreurs | Complexe, nécessite un buffer |

### Stratégies de sampling en OpenTelemetry

| Stratégie | Description | Usage |
|-----------|-------------|-------|
| `AlwaysOnSampler` | Capture 100% des traces | Développement, débogage |
| `AlwaysOffSampler` | Ne capture aucune trace | Désactiver temporairement |
| `TraceIdRatioBasedSampler(ratio)` | Capture un % basé sur le TraceId | Production (ex: 10%) |
| `ParentBasedSampler(root)` | Respecte la décision du parent, utilise `root` pour les nouvelles traces | Systèmes distribués |

### ParentBasedSampler

Le `ParentBasedSampler` est le plus utilisé en production. Il :
1. Si la requête entrante a un parent (header `traceparent` avec `sampled=1`) → **conserve** la trace
2. Si la requête entrante a un parent non-sampled (`sampled=0`) → **ignore** la trace
3. Si c'est une nouvelle trace (pas de parent) → utilise le sampler racine (ex: `TraceIdRatioBasedSampler`)

Cela garantit la **cohérence** : si un service décide d'échantillonner une trace, tous les services en aval la conserveront aussi.

### Configuration via variables d'environnement

OpenTelemetry supporte la configuration du sampling via des variables d'environnement standardisées :

| Variable | Valeurs possibles |
|----------|------------------|
| `OTEL_TRACES_SAMPLER` | `always_on`, `always_off`, `traceidratio`, `parentbased_always_on`, `parentbased_always_off`, `parentbased_traceidratio` |
| `OTEL_TRACES_SAMPLER_ARG` | Ratio pour les samplers ratio-based (ex: `0.5` pour 50%) |

## Objectif de ce step

Configurer différentes stratégies de sampling, observer leur effet sur le nombre de traces capturées, et comprendre quand utiliser chaque stratégie.
