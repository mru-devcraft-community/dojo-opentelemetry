# Step 01 — Validation

## Checklist

### ✅ 1. Application démarrée

L'application tourne via `dotnet run --project ShopTrack.AppHost` et le Dashboard Aspire est accessible.

### ✅ 2. Traces visibles dans le Dashboard Aspire

1. Ouvrez [https://localhost:18888](https://localhost:18888)
2. Allez dans l'onglet **Traces**
3. Des traces doivent apparaître après des appels API

### ✅ 3. Span serveur pour GET /api/products

```bash
curl http://localhost:<port>/api/products
```

Vérifiez dans le Dashboard Aspire qu'une trace apparaît avec un span `GET /api/products`.

### ✅ 4. Trace multi-spans pour POST /api/orders

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Bob","items":[{"productId":2,"quantity":3}]}'
```

Vérifiez que la trace contient :
- Un span racine `POST /api/orders` (serveur)
- Un span enfant `POST` vers `httpbin.org` (client HTTP)

### ✅ 5. Attributs automatiques présents

Cliquez sur un span et vérifiez que les attributs suivants sont présents :
- `http.request.method`
- `url.path`
- `http.response.status_code`

> **Rappel** : Remplacez `<port>` par le port réel du service `shoptrack-api`.
