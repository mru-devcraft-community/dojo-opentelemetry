# Step 02 — Validation

## Checklist

### ✅ 1. Variable d'environnement configurée

Vérifiez que `Program.cs` de l'AppHost contient bien :

```csharp
.WithEnvironment("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
```

### ✅ 2. Collector opérationnel

```bash
cd infra
docker compose ps | grep otel-collector
```

**Attendu** : Le service `otel-collector` est en état `Up`.

### ✅ 3. Traces visibles dans Jaeger

1. Ouvrez [http://localhost:16686](http://localhost:16686)
2. Sélectionnez le service `shoptrack-api` dans le menu déroulant
3. Cliquez sur **Find Traces**

**Attendu** : Des traces apparaissent pour vos requêtes.

### ✅ 4. Trace d'une commande avec appel HTTP

Créez une commande :

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Diana","items":[{"productId":2,"quantity":5}]}'
```

Dans Jaeger, trouvez cette trace et vérifiez qu'elle contient :
- Un span `POST /api/orders` (serveur)
- Un span enfant pour l'appel HTTP vers `httpbin.org` (client)

### ✅ 5. Les traces sont toujours dans le Dashboard Aspire

Vérifiez que les traces apparaissent **aussi** dans le Dashboard Aspire — les deux backends reçoivent les données simultanément.
