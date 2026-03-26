# Step 07 — Indices

## Les exemplars ne s'affichent pas dans Grafana ?

<details>
<summary>💡 Indice 1 — Vérifier le format OpenMetrics</summary>

L'exporteur Prometheus du Collector doit exposer les métriques au format OpenMetrics pour inclure les exemplars.

Dans `otel-collector-config.yml`, la section `exporters.prometheus` doit contenir :

```yaml
exporters:
  prometheus:
    endpoint: 0.0.0.0:8889
    enable_open_metrics: true
```

Vérifiez manuellement en accédant à `http://localhost:8889/metrics` et cherchez `# HELP` avec des exemplars entre `{}` :

```
orders_total_amount_bucket{le="100"} 5 # {trace_id="abc123"} 75.5 1234567890
```

</details>

## Prometheus ne stocke pas les exemplars ?

<details>
<summary>💡 Indice 2 — Feature flag Prometheus</summary>

Prometheus doit être lancé avec le flag `--enable-feature=exemplar-storage` :

```yaml
prometheus:
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--enable-feature=exemplar-storage'
```

Sans ce flag, Prometheus ignore les exemplars même s'ils sont exposés par le Collector.

</details>

## Comment configurer la datasource Prometheus pour les exemplars ?

<details>
<summary>💡 Indice 3 — Configuration Grafana</summary>

La datasource Prometheus dans Grafana doit connaître la destination des TraceId. Ajoutez dans `datasources.yml` :

```yaml
- name: Prometheus
  type: prometheus
  access: proxy
  url: http://prometheus:9090
  isDefault: true
  jsonData:
    exemplarTraceIdDestinations:
      - name: traceID
        datasourceUid: jaeger
        urlDisplayLabel: "Voir la trace dans Jaeger"
```

L'`uid` de la datasource Jaeger doit correspondre à celui déclaré dans la même configuration :

```yaml
- name: Jaeger
  type: jaeger
  uid: jaeger
```

</details>

## Comment voir les exemplars dans Grafana Explore ?

<details>
<summary>💡 Indice 4 — Activer l'affichage des exemplars</summary>

Dans Grafana → Explore → Prometheus :
1. Exécutez une requête sur un histogramme (ex: `orders_total_amount_bucket`)
2. Passez en mode **Graph**
3. Cliquez sur le bouton **Exemplars** (icône en forme de points) dans la barre d'outils du panneau
4. Des points violets apparaissent sur le graphique
5. Survolez un point pour voir le TraceId
6. Cliquez pour naviguer vers Jaeger

</details>

## Comment configurer la corrélation Loki → Jaeger ?

<details>
<summary>💡 Indice 5 — Derived fields dans Loki</summary>

La datasource Loki supporte les "derived fields" qui extraient des valeurs des logs via regex et créent des liens vers d'autres datasources :

```yaml
- name: Loki
  type: loki
  access: proxy
  url: http://loki:3100
  jsonData:
    derivedFields:
      - datasourceUid: jaeger
        matcherRegex: '"traceID":"(\w+)"'
        name: TraceID
        url: '$${__value.raw}'
```

Le regex extrait le `traceID` du JSON du log et crée un lien vers Jaeger.

</details>
