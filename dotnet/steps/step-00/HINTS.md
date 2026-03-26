# Step 00 — Indices

## Docker ne démarre pas ?

<details>
<summary>💡 Indice 1 — Vérifier le daemon Docker</summary>

Assurez-vous que Docker Desktop est lancé. Sur Windows/Mac, vérifiez l'icône dans la barre système.

```bash
docker info
```

Si cette commande échoue, Docker n'est pas démarré.
</details>

## Erreur de port déjà utilisé ?

<details>
<summary>💡 Indice 2 — Ports occupés</summary>

Si un port est déjà utilisé (ex: 5432 pour PostgreSQL), vous pouvez :
- Arrêter le service qui utilise le port
- Ou modifier le mapping de port dans `infra/docker-compose.yml`

Pour trouver quel processus utilise un port :
```bash
# Windows
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :5432
```
</details>

## Erreur de certificat HTTPS avec Aspire ?

<details>
<summary>💡 Indice 3 — Certificat de développement</summary>

Si vous avez des erreurs de certificat, faites confiance au certificat de développement :

```bash
dotnet dev-certs https --trust
```
</details>

## La base de données n'a pas de données ?

<details>
<summary>💡 Indice 4 — Seed data</summary>

Les données initiales (3 produits) sont créées automatiquement par Entity Framework via la méthode `OnModelCreating` dans `ShopTrackDbContext.cs`. Si la base est vide, supprimez le volume Docker et relancez :

```bash
cd infra
docker compose down -v
docker compose up -d
```

Puis relancez l'application .NET.
</details>

## `dotnet run` échoue ?

<details>
<summary>💡 Indice 5 — Restaurer les packages</summary>

```bash
cd dotnet/src
dotnet restore
dotnet run --project ShopTrack.AppHost
```
</details>
