# Étape 07 — Corrélation traces ↔ logs ↔ métriques (Exemplars)

## Contexte

Nous avons maintenant les **trois piliers** de l'observabilité en place :
- **Traces** (étapes 01-04) : spans distribués, attributs, événements, statuts
- **Métriques** (étape 05) : compteurs, histogrammes
- **Logs** (étape 06) : logs structurés corrélés avec les traces

La vraie puissance de l'observabilité apparaît quand on peut **naviguer** entre ces trois piliers de manière fluide. C'est la **corrélation**.

### Les trois axes de corrélation

```
         Traces
        ↗      ↖
   TraceId    Exemplars
      ↙          ↘
   Logs ←———→ Métriques
        Labels
```

1. **Logs → Traces** : Chaque log contient le `TraceId` (fait à l'étape 06). On peut cliquer sur un log et retrouver la trace complète.
2. **Métriques → Traces (Exemplars)** : Un exemplar est un **échantillon** associé à un point de métrique. Il contient le `TraceId` du contexte actif au moment de l'enregistrement de la métrique.
3. **Traces → Logs** : Depuis une trace, on peut rechercher les logs avec le même `TraceId`.

### Qu'est-ce qu'un Exemplar ?

Un **exemplar** est un lien entre une mesure de métrique et un span de trace. Quand vous enregistrez une valeur dans un histogramme ou un compteur, OpenTelemetry peut attacher le `TraceId` et `SpanId` du span actif comme exemplar.

Exemple conceptuel :
```
Métrique: orders.total_amount
  Valeur: 45.99
  Timestamp: 2024-01-15T10:23:45Z
  Exemplar:
    TraceId: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
    SpanId: 789ghi012jkl
```

Cela permet de répondre à la question : *"Cette valeur de métrique anormale, quelle requête l'a produite ?"*

### Exemplars avec Prometheus et le Collector OTLP

Le Collector OpenTelemetry, via son exporteur Prometheus, peut exposer les exemplars. Prometheus les récupère et Grafana peut les afficher sur les graphiques de métriques.

### Navigation dans Grafana

Grafana est l'outil central de visualisation qui permet de :
- Voir un graphique de métriques → cliquer sur un exemplar → ouvrir la trace dans Jaeger
- Voir un log → cliquer sur le TraceId → ouvrir la trace dans Jaeger
- Voir une trace → copier le TraceId → rechercher les logs dans Loki

## Objectifs

- Comprendre la corrélation entre les trois piliers
- Vérifier que les logs contiennent bien le TraceId (acquis à l'étape 06)
- Comprendre le concept d'Exemplar
- Configurer l'export des exemplars dans le Collector
- Naviguer entre métriques, traces et logs dans Grafana
