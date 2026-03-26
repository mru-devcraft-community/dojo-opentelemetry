# Validation — Étape 05

## ✅ Checklist

### 1. Générer du trafic

```bash
# 5 commandes réussies
for i in 1 2 3 4 5; do
  curl -s -X POST http://localhost:8080/api/orders \
    -H "Content-Type: application/json" \
    -d "{\"customerName\":\"Client $i\",\"items\":[{\"productId\":2,\"quantity\":1}]}"
  echo ""
done

# 2 commandes en échec
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Fail1","items":[{"productId":1,"quantity":99999}]}'

curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Fail2","items":[{"productId":999,"quantity":1}]}'
```

### 2. Vérifier dans Prometheus

Ouvrez http://localhost:9090 et exécutez :

- [ ] `orders_created_total` → doit afficher au moins 5
- [ ] `orders_failed_total` → doit afficher au moins 2
- [ ] `orders_total_amount_count` → doit afficher le nombre d'observations de l'histogramme
- [ ] `orders_total_amount_sum` → doit afficher la somme des montants

### 3. Requêtes avancées

```promql
# Taux de commandes créées par seconde (sur 5 min)
rate(orders_created_total[5m])

# Taux d'échec
rate(orders_failed_total[5m])

# Montant moyen
rate(orders_total_amount_sum[5m]) / rate(orders_total_amount_count[5m])
```

### 4. Grafana (optionnel)

Ouvrez http://localhost:3000 et créez un dashboard avec :
- Un panel "Commandes créées par minute"
- Un panel "Taux d'échec"
- Un panel "Montant moyen des commandes"

## 🎯 Résultat attendu

- Les compteurs `orders.created` et `orders.failed` sont incrémentés
- L'histogramme `orders.total_amount` enregistre les montants
- Les métriques sont visibles dans Prometheus
- Les requêtes PromQL retournent des données cohérentes
