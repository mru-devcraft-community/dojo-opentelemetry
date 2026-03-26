# Instructions — Étape 10

## 1. Accéder à Grafana

Ouvrez http://localhost:3000 (login: `admin`/`admin` si demandé, ou accès anonyme si configuré).

## 2. Créer un nouveau dashboard

1. Cliquez sur **+** > **New Dashboard**
2. Nommez-le **"ShopTrack Overview"**

## 3. Ajouter les panels

### Panel 1 — Débit des commandes (Time series)

- Type : **Time series**
- Data source : **Prometheus**
- Requête PromQL :
```promql
rate(orders_created_total[5m])
```
- Titre : "Commandes créées / sec"
- Unité : req/s

### Panel 2 — Commandes en échec (Stat)

- Type : **Stat**
- Data source : **Prometheus**
- Requête PromQL :
```promql
increase(orders_failed_total[1h])
```
- Titre : "Commandes en échec (1h)"
- Seuils : Vert < 1, Orange < 5, Rouge ≥ 5

### Panel 3 — Distribution des montants (Time series / Histogram)

- Type : **Time series**
- Data source : **Prometheus**
- Requête PromQL pour le percentile 50 :
```promql
histogram_quantile(0.50, rate(orders_total_amount_bucket[5m]))
```
- Ajoutez une 2e requête pour le percentile 95 :
```promql
histogram_quantile(0.95, rate(orders_total_amount_bucket[5m]))
```
- Titre : "Distribution des montants (P50 / P95)"
- Unité : EUR

### Panel 4 — Latence HTTP (Time series)

- Type : **Time series**
- Data source : **Prometheus**
- Requête PromQL pour le P95 :
```promql
histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket{http_route=~"/api/orders.*"}[5m]))
```
- Requête PromQL pour le P50 :
```promql
histogram_quantile(0.50, rate(http_server_request_duration_seconds_bucket{http_route=~"/api/orders.*"}[5m]))
```
- Titre : "Latence HTTP — Commandes (P50 / P95)"
- Unité : secondes

### Panel 5 — Logs d'erreur (Logs panel)

- Type : **Logs**
- Data source : **Loki**
- Requête LogQL :
```logql
{service_name="shoptrack-api"} |= "ERROR" or {service_name="shoptrack-api"} |= "WARN"
```
- Titre : "Logs d'erreur et d'avertissement"

### Panel 6 — Nombre total de commandes (Stat)

- Type : **Stat**
- Data source : **Prometheus**
- Requête PromQL :
```promql
orders_created_total
```
- Titre : "Total commandes créées"

## 4. Sauvegarder le dashboard

1. Cliquez sur la disquette (💾) pour sauvegarder
2. Donnez un titre si pas déjà fait

## 5. Exporter en JSON

1. Allez dans les **paramètres du dashboard** (⚙️)
2. Cliquez sur **JSON Model**
3. Copiez le JSON complet

## 6. Provisionner le dashboard

### Créer le fichier de configuration du provider

Créez `infra/grafana/provisioning/dashboards/dashboard-provider.yml` :

```yaml
apiVersion: 1
providers:
  - name: 'ShopTrack'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
      foldersFromFilesStructure: false
```

### Sauvegarder le JSON du dashboard

Sauvegardez le JSON exporté dans :
`infra/grafana/provisioning/dashboards/shoptrack-dashboard.json`

### Monter le volume dans Docker Compose

Vérifiez que le volume Grafana monte bien le dossier de provisioning :

```yaml
grafana:
  volumes:
    - ./grafana/provisioning:/etc/grafana/provisioning
```

## 7. Relancer et vérifier

```bash
docker compose down && docker compose up -d
```

Le dashboard devrait apparaître automatiquement dans Grafana après le redémarrage.
