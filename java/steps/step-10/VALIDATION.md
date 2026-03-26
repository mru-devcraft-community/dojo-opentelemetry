# Validation — Étape 10

## ✅ Checklist

### 1. Générer des données

Avant de vérifier les dashboards, générez des données en faisant des commandes :

```bash
# Commandes réussies
for i in $(seq 1 10); do
  curl -s -X POST http://localhost:8080/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Client '$i'","items":[{"productId":2,"quantity":1}]}' > /dev/null
done

# Commande en échec
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Erreur","items":[{"productId":1,"quantity":99999}]}' > /dev/null
```

### 2. Vérifier le dashboard dans Grafana

Ouvrez http://localhost:3000 et naviguez vers le dashboard "ShopTrack Overview".

- [ ] Le panel "Commandes créées / sec" affiche un graphique
- [ ] Le panel "Commandes en échec" affiche un nombre
- [ ] Le panel "Distribution des montants" affiche les percentiles P50 et P95
- [ ] Le panel "Latence HTTP" affiche les temps de réponse
- [ ] Le panel "Logs d'erreur" affiche les logs d'avertissement et d'erreur
- [ ] Le panel "Total commandes créées" affiche le compteur total

### 3. Vérifier les requêtes PromQL

Dans Grafana > Explore > Prometheus, testez individuellement :

```promql
rate(orders_created_total[5m])
```
- [ ] Retourne des valeurs > 0

```promql
histogram_quantile(0.95, rate(orders_total_amount_bucket[5m]))
```
- [ ] Retourne une valeur en EUR

### 4. Vérifier le provisioning

- [ ] Le fichier `infra/grafana/provisioning/dashboards/dashboard-provider.yml` existe
- [ ] Le fichier `infra/grafana/provisioning/dashboards/shoptrack-dashboard.json` existe
- [ ] Après un `docker compose restart grafana`, le dashboard est toujours présent
- [ ] Le dashboard est marqué comme "provisioned" (non modifiable en UI, sauf si `editable: true`)

### 5. Test de résilience

Relancez toute l'infra :
```bash
docker compose down && docker compose up -d
```

- [ ] Le dashboard apparaît automatiquement après le redémarrage
- [ ] Les data sources Prometheus, Jaeger et Loki sont disponibles
