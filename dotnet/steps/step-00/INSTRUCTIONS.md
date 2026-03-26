# Step 00 — Instructions

## Prérequis

- **.NET 10 SDK** installé ([télécharger](https://dot.net/download))
- **Docker** et **Docker Compose** installés et démarrés
- Un éditeur de code (VS Code recommandé, ou Rider/Visual Studio)

## Étapes

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd opentelemetry-observability-applicative
```

### 2. Vérifier les prérequis

```bash
# Vérifier .NET 10
dotnet --version
# Doit afficher 10.x.x

# Vérifier Docker
docker --version
docker compose version
```

### 3. Lancer la stack d'observabilité

```bash
cd infra
docker compose up -d
```

Attendez que tous les conteneurs soient en état `healthy` :

```bash
docker compose ps
```

### 4. Vérifier les URLs des services

Ouvrez dans votre navigateur :

- **Jaeger** : [http://localhost:16686](http://localhost:16686)
- **Grafana** : [http://localhost:3000](http://localhost:3000) (login: admin / admin)
- **Prometheus** : [http://localhost:9090](http://localhost:9090)

### 5. Lancer l'application .NET

```bash
cd dotnet/src
dotnet run --project ShopTrack.AppHost
```

> **Note** : Au premier lancement, Aspire va télécharger l'image Docker PostgreSQL et créer la base de données. Cela peut prendre quelques minutes.

### 6. Accéder à l'Aspire Dashboard

Ouvrez le **Dashboard Aspire** : [https://localhost:18888](https://localhost:18888)

> Si le navigateur affiche un avertissement de certificat, acceptez-le (certificat de développement).

Vous devriez voir le service `shoptrack-api` en état "Running".

### 7. Tester les API

Récupérez le port de l'API depuis le Dashboard Aspire, puis testez :

```bash
# Lister les produits (données seed)
curl http://localhost:<port>/api/products

# Créer une commande
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Alice",
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'

# Lister les commandes
curl http://localhost:<port>/api/orders
```

> **Astuce** : Remplacez `<port>` par le port réel affiché dans le Dashboard Aspire pour le service `shoptrack-api`.
