# Validation — Étape 03

## ✅ Checklist

### 1. Le projet compile

```bash
mvn clean compile
```

### 2. Générer une trace

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Validation Step03","items":[{"productId":1,"quantity":1},{"productId":2,"quantity":2}]}'
```

### 3. Vérifier la hiérarchie des spans dans Jaeger

Ouvrez http://localhost:16686 et trouvez la trace du `POST /api/orders`. Validez :

- [ ] **Span racine HTTP** : `POST /api/orders` (auto-instrumenté)
- [ ] **Span "CreateOrder"** : enfant du span HTTP (créé manuellement)
- [ ] **Span "ValidateStock"** : enfant de CreateOrder (créé manuellement)
- [ ] **Spans JDBC** : enfants de ValidateStock (auto-instrumentés)
- [ ] **Span "NotifyOrderCreated"** : enfant de CreateOrder (via @WithSpan)
- [ ] **Span HTTP client** : enfant de NotifyOrderCreated (auto-instrumenté)

### 4. Vérifier l'imbrication

La trace doit montrer une hiérarchie claire :

```
POST /api/orders
  └── CreateOrder
      ├── ValidateStock
      │   ├── SELECT ... products
      │   ├── UPDATE ... products
      │   └── ...
      ├── INSERT INTO orders
      ├── INSERT INTO order_items
      └── NotifyOrderCreated
          └── POST httpbin.org
```

## 🎯 Résultat attendu

- Les spans manuels `CreateOrder` et `ValidateStock` apparaissent dans la trace
- Le span `NotifyOrderCreated` (via @WithSpan) est visible
- La hiérarchie parent-enfant est respectée
- Les spans auto-instrumentés (JDBC, HTTP) s'imbriquent correctement dans les spans manuels
