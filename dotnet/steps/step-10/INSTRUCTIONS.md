# Step 10 — Instructions

## Prérequis

Vous devez avoir complété le **Step 09** (sampling). L'infrastructure Docker doit être démarrée.

## Étapes

### 1. Accéder à Grafana

Ouvrez [http://localhost:3000](http://localhost:3000). Si l'authentification est demandée : `admin` / `admin`.

### 2. Explorer les métriques disponibles

Avant de créer un dashboard, explorez les métriques disponibles :

1. Allez dans **Explore** → sélectionnez **Prometheus**
2. Tapez `orders` dans la barre de requête → vous devriez voir vos métriques custom
3. Essayez ces requêtes :
   - `orders_created_total` — compteur brut
   - `rate(orders_created_total[5m])` — taux par seconde
   - `orders_total_amount_bucket` — buckets de l'histogramme

### 3. Créer un dashboard manuellement

1. Cliquez sur **+** → **New Dashboard**
2. Renommez-le **ShopTrack Overview**

### 4. Ajouter le panneau "Débit des commandes"

1. **Add Panel** → **Add a new panel**
2. Datasource : **Prometheus**
3. Requête PromQL :
   ```promql
   rate(orders_created_total[5m])
   ```
4. Type : **Time Series**
5. Titre : **Débit des commandes (par seconde)**
6. Sauvegarder

### 5. Ajouter le panneau "Taux d'erreur"

1. Requête PromQL :
   ```promql
   rate(orders_failed_total[5m]) / rate(orders_created_total[5m])
   ```
2. Type : **Stat** ou **Gauge**
3. Titre : **Taux d'erreur commandes**
4. Configurez les seuils : `0` = vert, `0.1` = jaune, `0.5` = rouge

### 6. Ajouter le panneau "Distribution des montants (P95)"

1. Requête PromQL :
   ```promql
   histogram_quantile(0.95, rate(orders_total_amount_bucket[5m]))
   ```
2. Type : **Time Series**
3. Titre : **Montant commandes P95**

### 7. Ajouter le panneau "Derniers logs d'erreur"

1. Datasource : **Loki**
2. Requête LogQL :
   ```logql
   {service_name="shoptrack-api"} | json | level=~"Warning|Error"
   ```
3. Type : **Logs**
4. Titre : **Logs Warnings et Erreurs**

### 8. Ajouter le panneau "Latence HTTP P95"

1. Datasource : **Prometheus**
2. Requête PromQL :
   ```promql
   histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket{service_name="shoptrack-api"}[5m])) by (le))
   ```
3. Type : **Time Series**
4. Titre : **Latence HTTP P95 (secondes)**

### 9. Exporter le dashboard en JSON

1. Cliquez sur l'icône ⚙️ (Settings) du dashboard
2. Allez dans **JSON Model**
3. Copiez le JSON complet

### 10. Provisionner le dashboard

Créez le fichier de configuration du provider de dashboards :

**`infra/grafana/provisioning/dashboards/dashboard-provider.yml`** :

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

Puis déposez votre fichier JSON de dashboard dans le même répertoire :

**`infra/grafana/provisioning/dashboards/shoptrack-dashboard.json`**

### 11. Redémarrer Grafana

```bash
cd infra
docker compose restart grafana
```

Le dashboard doit apparaître automatiquement dans la liste des dashboards.
