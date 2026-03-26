# Validation — Étape 02

## ✅ Checklist

### 1. Le projet compile avec les nouvelles dépendances

```bash
mvn clean compile
```

Doit compiler sans erreur.

### 2. Le Spring Boot Starter est présent dans le classpath

```bash
mvn dependency:tree | grep opentelemetry
```

Doit afficher `opentelemetry-spring-boot-starter` et ses dépendances transitives.

### 3. L'application démarre sans Java Agent

```bash
mvn spring-boot:run
```

L'application doit démarrer sans le flag `-javaagent`.

### 4. Les traces sont émises

```bash
curl -s http://localhost:8080/api/products
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Validation Step02","items":[{"productId":1,"quantity":1}]}'
```

### 5. Traces visibles dans Jaeger

1. Ouvrez http://localhost:16686
2. Sélectionnez **shoptrack-api**
3. Les traces doivent apparaître avec :
   - [ ] Span HTTP pour `GET /api/products`
   - [ ] Span HTTP pour `POST /api/orders`
   - [ ] Spans JDBC enfants
   - [ ] Span HTTP client vers httpbin.org

## 🎯 Résultat attendu

- Le projet utilise le Spring Boot Starter au lieu du Java Agent
- La configuration est dans `application.yml` (plus de propriétés système `-D`)
- Les traces sont identiques à celles de l'étape 01
- Le lancement est simplifié : `mvn spring-boot:run` ou `java -jar` sans javaagent
