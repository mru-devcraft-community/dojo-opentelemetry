# Validation — Étape 04

## ✅ Checklist

### 1. Cas nominal — Commande réussie

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Alice Dupont","items":[{"productId":1,"quantity":1},{"productId":2,"quantity":2}]}'
```

Dans Jaeger, trouvez la trace et vérifiez le span **CreateOrder** :

**Attributs (Tags) :**
- [ ] `order.customer_name` = "Alice Dupont"
- [ ] `order.total_amount` = valeur numérique
- [ ] `order.items_count` = 2
- [ ] `otel.status_code` = "OK"

**Events (Logs) :**
- [ ] `OrderValidated` avec attribut `validated.items_count`
- [ ] `OrderPersisted` avec attribut `order.id`

### 2. Cas d'erreur — Stock insuffisant

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Bob Martin","items":[{"productId":1,"quantity":99999}]}'
```

Dans Jaeger :

- [ ] Le span **CreateOrder** est affiché en **rouge**
- [ ] Le span **ValidateStock** est affiché en **rouge**
- [ ] `otel.status_code` = "ERROR"
- [ ] Le message d'erreur contient "Stock insuffisant"

### 3. Cas d'exception système

Si une exception inattendue se produit, vérifiez que :

- [ ] `span.recordException(e)` génère un event `exception` avec le stacktrace
- [ ] Le status est `ERROR`

## 🎯 Résultat attendu

- Les spans contiennent des informations métier (attributs)
- Les events marquent les étapes clés du processus
- Les erreurs sont clairement identifiées (status ERROR, rouge dans Jaeger)
- Les exceptions sont enregistrées avec leur stacktrace
