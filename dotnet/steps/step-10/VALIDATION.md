# Step 10 — Validation

## Checklist

### ✅ 1. Le dashboard "ShopTrack Overview" existe

Ouvrez Grafana → Dashboards. Un dashboard nommé **ShopTrack Overview** doit apparaître dans la liste.

### ✅ 2. Le panneau "Débit des commandes" affiche des données

1. Générez du trafic :
   ```bash
   for i in $(seq 1 10); do
     curl -s -X POST http://localhost:<port>/api/orders \
       -H "Content-Type: application/json" \
       -d '{"customerName":"DashTester'$i'","items":[{"productId":1,"quantity":1}]}'
     sleep 1
   done
   ```
2. Attendez 30 secondes
3. Le panneau **Débit des commandes** doit montrer une courbe non-nulle

### ✅ 3. Le panneau "Taux d'erreur" fonctionne

1. Générez quelques erreurs (stock insuffisant) :
   ```bash
   curl -s -X POST http://localhost:<port>/api/orders \
     -H "Content-Type: application/json" \
     -d '{"customerName":"ErrorTest","items":[{"productId":2,"quantity":99999}]}'
   ```
2. Le panneau doit afficher un taux > 0

### ✅ 4. Le panneau "Montant P95" affiche une valeur

Le percentile 95 des montants de commande doit être visible. Si toutes les commandes ont le même montant, la courbe sera plate — c'est normal.

### ✅ 5. Le panneau "Logs" affiche des logs

Le panneau Loki doit montrer les logs récents de l'application, en particulier les warnings et erreurs.

### ✅ 6. Le panneau "Latence HTTP P95" affiche des données

La courbe de latence P95 doit être visible. En développement local, les valeurs seront très faibles (quelques millisecondes).

### ✅ 7. Le dashboard est provisionné

1. Vérifiez que `infra/grafana/provisioning/dashboards/dashboard-provider.yml` existe
2. Vérifiez que `infra/grafana/provisioning/dashboards/shoptrack-dashboard.json` existe
3. Redémarrez Grafana : `docker compose restart grafana`
4. Le dashboard doit apparaître automatiquement sans configuration manuelle
