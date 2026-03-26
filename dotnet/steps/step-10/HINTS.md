# Step 10 — Indices

## Les métriques custom n'apparaissent pas dans Prometheus ?

<details>
<summary>💡 Indice 1 — Vérifier l'exposition des métriques</summary>

1. Vérifiez que le Collector expose les métriques : `http://localhost:8889/metrics`
2. Cherchez `orders_created` dans la page
3. Si absent, vérifiez que `AddMeter(Diagnostics.Meter.Name)` est bien dans `Program.cs`
4. Vérifiez que `Diagnostics.OrdersCreated.Add(1)` est bien appelé dans `OrderEndpoints.cs`

</details>

## Les requêtes PromQL ne retournent rien ?

<details>
<summary>💡 Indice 2 — Générer du trafic</summary>

Les métriques n'apparaissent dans Prometheus que si elles ont été émises. Générez du trafic :

```bash
for i in $(seq 1 5); do
  curl -s -X POST http://localhost:<port>/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Dashboard'$i'","items":[{"productId":1,"quantity":1}]}'
done
```

Attendez 15-30 secondes (intervalle de scrape Prometheus) puis réessayez la requête.

</details>

## Comment configurer les seuils sur un panneau Gauge ?

<details>
<summary>💡 Indice 3 — Seuils Grafana</summary>

Dans les options du panneau (onglet droit) :
1. Section **Thresholds**
2. Ajoutez des seuils :
   - Base : vert (0)
   - `0.1` : jaune (10% d'erreurs)
   - `0.5` : rouge (50% d'erreurs)

Pour un panneau **Gauge**, les seuils colorent automatiquement la jauge.

</details>

## Le nom de la métrique HTTP diffère ?

<details>
<summary>💡 Indice 4 — Noms de métriques HTTP</summary>

Le nom de la métrique de latence HTTP dépend de la version de l'instrumentation :
- Conventions récentes (semconv) : `http_server_request_duration_seconds`
- Anciennes conventions : `http_server_duration` (en millisecondes)

Vérifiez dans Prometheus quelles métriques `http_server` sont disponibles :
```promql
{__name__=~"http_server.*"}
```

</details>

## Comment provisionner un dashboard ?

<details>
<summary>💡 Indice 5 — Provisionnement Grafana</summary>

Vous avez besoin de deux fichiers dans `infra/grafana/provisioning/dashboards/` :

1. **`dashboard-provider.yml`** — Indique à Grafana où chercher les fichiers JSON :
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
```

2. **`shoptrack-dashboard.json`** — Le dashboard exporté en JSON depuis l'interface Grafana.

Redémarrez Grafana : `docker compose restart grafana`

</details>
