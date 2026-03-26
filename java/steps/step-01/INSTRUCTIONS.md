# Instructions — Étape 01

## 1. Télécharger l'agent OpenTelemetry Java

Depuis la racine du projet `java/src/` :

```bash
curl -Lo opentelemetry-javaagent.jar \
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

> Le fichier fait environ 20 Mo. Il contient l'instrumentation automatique pour des centaines de librairies.

## 2. S'assurer que le JAR de l'application est buildé

```bash
mvn clean package -DskipTests
```

## 3. Lancer l'application avec le Java Agent

```bash
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.service.name=shoptrack-api \
  -Dotel.exporter.otlp.endpoint=http://localhost:4317 \
  -jar target/shoptrack-api-1.0.0-SNAPSHOT.jar
```

> **Important** : le flag `-javaagent` doit être positionné **avant** `-jar`.

## 4. Générer du trafic

Exécutez les requêtes suivantes pour produire des traces :

```bash
# Lister les produits
curl http://localhost:8080/api/products

# Obtenir un produit spécifique
curl http://localhost:8080/api/products/1

# Créer une commande
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Alice Dupont",
    "items": [
      {"productId": 1, "quantity": 2},
      {"productId": 2, "quantity": 1}
    ]
  }'

# Lister les commandes
curl http://localhost:8080/api/orders
```

## 5. Observer les traces dans Jaeger

1. Ouvrez **Jaeger** : http://localhost:16686
2. Dans le menu déroulant **Service**, sélectionnez `shoptrack-api`
3. Cliquez sur **Find Traces**
4. Explorez les traces — identifiez :
   - Les spans **HTTP** (entrée de l'API REST)
   - Les spans **JDBC** (requêtes SQL vers PostgreSQL)
   - Les spans **HTTP Client** (appel RestTemplate vers httpbin.org)

## 6. Analyser une trace de création de commande

Cliquez sur une trace provenant du `POST /api/orders`. Vous devriez voir une hiérarchie de spans :

```
POST /api/orders                          ← span HTTP serveur
  ├── SELECT ... FROM products            ← span JDBC (lecture produit)
  ├── UPDATE ... products SET stock=...   ← span JDBC (mise à jour stock)
  ├── INSERT INTO orders ...               ← span JDBC (insertion commande)
  ├── INSERT INTO order_items ...          ← span JDBC (insertion items)
  └── POST https://httpbin.org/post       ← span HTTP client (notification)
```
