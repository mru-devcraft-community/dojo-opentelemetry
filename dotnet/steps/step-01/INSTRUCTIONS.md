# Step 01 — Instructions

## Étapes

### 1. Ouvrir Extensions.cs

Ouvrez le fichier `dotnet/src/ShopTrack.ServiceDefaults/Extensions.cs`.

Localisez la méthode `ConfigureOpenTelemetry()` et observez les lignes suivantes :

```csharp
.WithTracing(tracing =>
{
    tracing.AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation();
})
```

### 2. Comprendre chaque instrumentation

- **`AddAspNetCoreInstrumentation()`** : Intercepte toutes les requêtes HTTP entrantes dans l'API et crée automatiquement un span pour chacune. Le span contient le verbe HTTP, l'URL, le code de retour, etc.

- **`AddHttpClientInstrumentation()`** : Intercepte toutes les requêtes HTTP sortantes faites via `HttpClient` (par exemple l'appel de notification vers `httpbin.org`) et crée un span enfant dans la trace parente.

### 3. Lancer l'application

Assurez-vous que la stack Docker est démarrée (`infra/docker compose up -d`), puis :

```bash
cd dotnet/src
dotnet run --project ShopTrack.AppHost
```

### 4. Générer des requêtes

Faites quelques appels API pour générer des traces :

```bash
# Lister les produits
curl http://localhost:<port>/api/products

# Créer une commande (génère aussi un appel HTTP sortant vers httpbin.org)
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Alice","items":[{"productId":1,"quantity":2}]}'
```

### 5. Observer les traces dans l'Aspire Dashboard

1. Ouvrez l'**Aspire Dashboard** : [https://localhost:18888](https://localhost:18888)
2. Cliquez sur l'onglet **Traces**
3. Vous devriez voir les traces de vos requêtes

### 6. Identifier les spans automatiques

Pour chaque requête `POST /api/orders`, observez la hiérarchie des spans :

- **Span racine** : `POST /api/orders` (serveur ASP.NET Core)
  - **Span enfant** : `POST` vers `httpbin.org` (client HTTP)

Notez que :
- Chaque span a son propre **SpanId**
- Tous les spans partagent le même **TraceId**
- La durée de chaque span est visible dans le timeline

### 7. Explorer les détails d'un span

Cliquez sur un span dans le Dashboard pour voir :
- Les **attributs** automatiques (`http.method`, `http.url`, `http.status_code`, etc.)
- La **durée** du span
- Le **TraceId** et **SpanId**
