# Step 04 — Validation

## Checklist

### ✅ 1. Commande réussie — Attributs visibles

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Grace","items":[{"productId":1,"quantity":2},{"productId":2,"quantity":1}]}'
```

Dans Jaeger, sur le span `CreateOrder`, vérifiez :
- **Attribut** `order.customer_name` = `Grace`
- **Attribut** `order.items_count` = `2`
- **Attribut** `order.total_amount` = montant calculé

### ✅ 2. Commande réussie — Events visibles

Dans le même span `CreateOrder`, vérifiez les events :
- **Event** `OrderValidated` (dans le span `ValidateStock`)
- **Event** `OrderPersisted` avec l'attribut `order.id`

### ✅ 3. Commande échouée — Status Error

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Hacker","items":[{"productId":2,"quantity":99999}]}'
```

Dans Jaeger, trouvez cette trace et vérifiez :
- Le span `CreateOrder` a un **status Error** (affiché en rouge dans Jaeger)
- Un **event** `StockValidationFailed` est présent avec les détails

### ✅ 4. Produit introuvable — Status Error

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","items":[{"productId":999,"quantity":1}]}'
```

Vérifiez dans Jaeger que le span `CreateOrder` a un status Error avec le message approprié.

### ✅ 5. Distinction visuelle dans Jaeger

Dans la liste des traces de Jaeger, les traces en erreur doivent être visuellement distinctes (icône ou couleur différente) des traces réussies.
