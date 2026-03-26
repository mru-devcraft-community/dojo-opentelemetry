# Instructions — Étape 07

## 1. Vérifier la corrélation Logs → Traces (acquis étape 06)

Lancez l'application et générez une commande :

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Alice Dupont","items":[{"productId":2,"quantity":1}]}'
```

Dans la console, vérifiez que les logs contiennent `trace_id` non vide :
```
2024-01-15 10:23:45 INFO [trace_id=abc123...] [span_id=def456...] OrderController - Création de commande...
```

Dans Grafana > Explore > Loki, vérifiez avec :
```logql
{service_name="shoptrack-api"} |= "Création de commande"
```

## 2. Comprendre les Exemplars

Un exemplar est un **échantillon de trace** lié à un point de métrique. Quand on enregistre une métrique (compteur ou histogramme), OpenTelemetry attache automatiquement le `TraceId` du span actif.

Le Spring Boot Starter OpenTelemetry configure cela automatiquement quand :
- Un span est actif au moment de l'enregistrement de la métrique
- L'exporteur supporte les exemplars

## 3. Vérifier la configuration du Collector pour les Exemplars

Dans `infra/otel-collector-config.yml`, l'exporteur Prometheus doit avoir les exemplars activés. Vérifiez la section exporters/prometheus :

```yaml
exporters:
  prometheus:
    endpoint: 0.0.0.0:8889
    enable_open_metrics: true
```

L'option `enable_open_metrics` permet d'exposer les exemplars au format OpenMetrics, que Prometheus peut récupérer.

## 4. Configurer Prometheus pour les Exemplars

Dans `infra/prometheus.yml`, vérifiez que le scrape est configuré pour récupérer les exemplars. Ajoutez si nécessaire :

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'otel-collector'
    scrape_interval: 5s
    honor_labels: true
    metrics_path: /metrics
    static_configs:
      - targets: ['otel-collector:8889']
```

> **Note** : Prometheus stocke nativement les exemplars avec les métriques OpenMetrics.

## 5. Configurer la data source Prometheus dans Grafana avec les Exemplars

Dans Grafana :
1. Allez dans **Configuration** > **Data Sources** > **Prometheus**
2. Dans la section **Exemplars**, configurez :
   - **Internal link** : activé
   - **Data source** : Jaeger
   - **Label name** : `trace_id`

Cela permet à Grafana de créer un lien cliquable depuis un exemplar vers Jaeger.

## 6. Générer des données et naviguer

Générez plusieurs commandes pour avoir des données :

```bash
for i in $(seq 1 10); do
  curl -s -X POST http://localhost:8080/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Client '$i'","items":[{"productId":2,"quantity":1}]}' > /dev/null
done
```

### Navigation Métriques → Traces

1. Dans Grafana > **Explore** > **Prometheus**
2. Requête : `orders_total_amount_bucket`
3. Dans les options du graphique, activez **Exemplars**
4. Survolez les petits losanges sur le graphique — ils contiennent le `TraceId`
5. Cliquez pour ouvrir la trace dans Jaeger

### Navigation Logs → Traces

1. Dans Grafana > **Explore** > **Loki**
2. Requête : `{service_name="shoptrack-api"} | json`
3. Développez un log — le champ `traceID` devrait être cliquable
4. Cliquez pour ouvrir la trace dans Jaeger

### Navigation Traces → Logs

1. Ouvrez une trace dans Jaeger
2. Copiez le Trace ID
3. Dans Grafana > Explore > Loki :
```logql
{service_name="shoptrack-api"} | json | trace_id = "<VOTRE_TRACE_ID>"
```
