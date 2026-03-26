# Step 07 — Instructions

## Prérequis

Vous devez avoir complété le **Step 06** (logs structurés corrélés avec les traces).

L'infrastructure (docker-compose) doit être démarrée : Jaeger, Prometheus, Grafana, Loki, OTel Collector.

## Étapes

### 1. Vérifier la corrélation Logs → Traces (déjà en place)

Depuis le Step 06, les logs contiennent automatiquement le `TraceId`. Vérifiez-le :

1. Créez une commande via `POST /api/orders`
2. Ouvrez Grafana → Explore → sélectionnez **Loki**
3. Exécutez la requête : `{service_name="shoptrack-api"} |= "Order"`
4. Déployez un log et vérifiez la présence du champ `traceID`

### 2. Vérifier que les exemplars sont émis côté .NET

Les exemplars sont générés automatiquement par le SDK OpenTelemetry .NET quand :
- Un instrument de métrique enregistre une valeur (ex: `OrdersCreated.Add(1)`)
- Un `Activity` (span) est actif au moment de l'enregistrement

Dans notre code `OrderEndpoints.cs`, les appels `Diagnostics.OrdersCreated.Add(1)` et `Diagnostics.OrderTotalAmount.Record(...)` sont effectués à l'intérieur d'un span `CreateOrder`. Les exemplars sont donc déjà émis automatiquement.

### 3. Configurer l'OTel Collector pour les exemplars

Modifiez le fichier `infra/otel-collector-config.yml` pour activer les exemplars dans l'exporteur Prometheus :

Dans la section `exporters.prometheus`, ajoutez `enable_open_metrics: true` :

```yaml
exporters:
  prometheus:
    endpoint: 0.0.0.0:8889
    enable_open_metrics: true
```

Cela permet au collecteur d'exposer les métriques au format OpenMetrics, qui supporte les exemplars.

### 4. Configurer Prometheus pour stocker les exemplars

Modifiez le fichier `infra/docker-compose.yml` pour ajouter le flag `--enable-feature=exemplar-storage` à Prometheus :

```yaml
  prometheus:
    image: prom/prometheus:v2.50.1
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--enable-feature=exemplar-storage'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

### 5. Configurer la datasource Prometheus dans Grafana pour les exemplars

Modifiez `infra/grafana/provisioning/datasources/datasources.yml` :

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

Ajoutez également un `uid` à la datasource Jaeger pour pouvoir la référencer :

```yaml
  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
    uid: jaeger
```

### 6. Configurer la corrélation Loki → Jaeger

Dans la datasource Loki, ajoutez la configuration pour créer un lien du TraceId vers Jaeger :

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

### 7. Redémarrer l'infrastructure

```bash
cd infra
docker compose down
docker compose up -d
```

### 8. Générer du trafic et observer

1. Faites 10-15 commandes via `POST /api/orders`
2. Dans Grafana → Explore → Prometheus, exécutez :
   ```promql
   orders_total_amount_bucket
   ```
3. Activez l'affichage des exemplars (bouton "Exemplars" dans le panneau)
4. Des points violets devraient apparaître sur le graphique — ce sont les exemplars
5. Cliquez sur un point violet → un lien vers Jaeger apparaît

### 9. Tester la navigation Loki → Jaeger

1. Dans Grafana → Explore → Loki
2. Exécutez : `{service_name="shoptrack-api"} |= "Order"`
3. Déployez un log
4. Un lien cliquable vers Jaeger devrait apparaître sur le champ `traceID`
