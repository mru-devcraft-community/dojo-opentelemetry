# Instructions — Étape 00

## 1. Vérifier les prérequis

Assurez-vous d'avoir installé :

```bash
# Java 21
java -version
# Doit afficher : openjdk version "21.x.x" ou similaire

# Maven 3.9+
mvn -version
# Doit afficher : Apache Maven 3.9.x ou supérieur

# Docker et Docker Compose
docker --version
docker compose version
```

## 2. Lancer la stack d'observabilité

Depuis la racine du projet :

```bash
cd infra
docker compose up -d
```

Vérifiez que tous les conteneurs sont démarrés :

```bash
docker compose ps
```

## 3. Vérifier l'accès aux services

Ouvrez dans votre navigateur :

| Service | URL |
|---------|-----|
| Jaeger | http://localhost:16686 |
| Grafana | http://localhost:3000 (admin/admin) |
| Prometheus | http://localhost:9090 |

## 4. Builder le projet Java

```bash
cd java/src
mvn clean package -DskipTests
```

Le JAR exécutable sera généré dans `target/shoptrack-api-1.0.0-SNAPSHOT.jar`.

## 5. Lancer l'application

```bash
java -jar target/shoptrack-api-1.0.0-SNAPSHOT.jar
```

L'application démarre sur le port **8080**.

## 6. Tester les API

### Lister les produits (des données de test sont insérées automatiquement)

```bash
curl http://localhost:8080/api/products
```

### Créer une commande

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Alice Dupont",
    "items": [
      {"productId": 1, "quantity": 2},
      {"productId": 2, "quantity": 1}
    ]
  }'
```

### Consulter les commandes

```bash
curl http://localhost:8080/api/orders
```
