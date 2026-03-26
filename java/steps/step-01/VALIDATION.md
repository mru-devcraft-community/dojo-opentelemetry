# Validation — Étape 01

## ✅ Checklist

### 1. Le Java Agent est chargé

Vérifiez dans les logs de démarrage de l'application une ligne similaire à :

```
[otel.javaagent 20xx-xx-xx] INFO ... opentelemetry-javaagent - version: x.x.x
```

### 2. Générer des traces

```bash
# Listez les produits
curl -s http://localhost:8080/api/products

# Créez une commande
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test Validation","items":[{"productId":1,"quantity":1}]}'
```

### 3. Traces visibles dans Jaeger

1. Ouvrez http://localhost:16686
2. Sélectionnez le service **shoptrack-api**
3. Cliquez **Find Traces**
4. Vous devriez voir au moins 2 traces

### 4. Vérifier les types de spans

Cliquez sur la trace du `POST /api/orders`. Validez la présence de :

- [ ] **Span HTTP serveur** : `POST /api/orders`
- [ ] **Spans JDBC** : `SELECT`, `UPDATE`, `INSERT` sur PostgreSQL
- [ ] **Span HTTP client** : `POST` vers `httpbin.org`

### 5. Vérifier la propagation de contexte

Chaque span dans la trace doit avoir le même **Trace ID**. Les spans JDBC et HTTP client doivent être des enfants du span HTTP serveur.

## 🎯 Résultat attendu

- L'agent Java est correctement chargé au démarrage
- Les traces sont automatiquement envoyées au Collector OTLP
- Jaeger affiche des traces complètes avec spans HTTP, JDBC et HTTP Client
- La hiérarchie parent-enfant des spans reflète le flux d'exécution
