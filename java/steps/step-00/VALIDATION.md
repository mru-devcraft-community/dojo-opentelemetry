# Validation — Étape 00

## ✅ Checklist

### 1. Infrastructure opérationnelle

```bash
docker compose ps
```

Tous les services doivent être en état `Up` ou `healthy`.

### 2. Jaeger accessible

```bash
curl -s http://localhost:16686 | head -1
```

Doit retourner du HTML (la page Jaeger).

### 3. Grafana accessible

```bash
curl -s http://localhost:3000/api/health
```

Doit retourner : `{"commit":"...","database":"ok","version":"..."}`

### 4. Prometheus accessible

```bash
curl -s http://localhost:9090/-/ready
```

Doit retourner : `Prometheus Server is Ready.`

### 5. API Products

```bash
curl -s http://localhost:8080/api/products | python3 -m json.tool
```

Doit retourner une liste de 3 produits (Laptop, Mouse, Keyboard).

### 6. API Orders — Création

```bash
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test User","items":[{"productId":1,"quantity":1}]}' \
  | python3 -m json.tool
```

Doit retourner une commande avec un `id`, un `totalAmount` et des `items`.

### 7. API Orders — Consultation

```bash
curl -s http://localhost:8080/api/orders | python3 -m json.tool
```

Doit retourner la liste des commandes créées.

## 🎯 Résultat attendu

- L'infrastructure Docker tourne
- L'application répond sur le port 8080
- Les APIs Products et Orders fonctionnent
- Jaeger, Grafana et Prometheus sont accessibles (mais vides pour l'instant)
