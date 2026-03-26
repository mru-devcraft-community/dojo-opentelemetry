# Step 00 — Validation

## Checklist

### ✅ 1. Stack Docker opérationnelle

```bash
cd infra
docker compose ps
```

**Attendu** : Tous les services (`postgres`, `otel-collector`, `jaeger`, `prometheus`, `grafana`, `loki`) sont en état `Up`.

### ✅ 2. Jaeger accessible

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:16686
```

**Attendu** : Code HTTP `200`.

### ✅ 3. Grafana accessible

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

**Attendu** : Code HTTP `200`.

### ✅ 4. Prometheus accessible

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:9090
```

**Attendu** : Code HTTP `200`.

### ✅ 5. Application .NET démarrée

L'Aspire Dashboard est accessible sur [https://localhost:18888](https://localhost:18888) et affiche le service `shoptrack-api` en état "Running".

### ✅ 6. API Products fonctionnelle

```bash
curl http://localhost:<port>/api/products
```

**Attendu** : Un tableau JSON avec 3 produits (Laptop, Mouse, Keyboard).

### ✅ 7. API Orders fonctionnelle

```bash
# Créer une commande
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","items":[{"productId":1,"quantity":1}]}'

# Vérifier la commande
curl http://localhost:<port>/api/orders
```

**Attendu** : La commande est créée avec un statut `201 Created`, puis visible dans la liste des commandes.

> **Note** : Remplacez `<port>` par le port réel du service `shoptrack-api` visible dans l'Aspire Dashboard.
