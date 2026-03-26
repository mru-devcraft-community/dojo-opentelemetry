# Step 03 — Validation

## Checklist

### ✅ 1. Fichier Diagnostics.cs créé

Le fichier `ShopTrack.Api/Diagnostics.cs` existe et contient un `ActivitySource` nommé `"ShopTrack.Api"`.

### ✅ 2. ActivitySource enregistré

`Program.cs` contient :

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(Diagnostics.ActivitySource.Name));
```

### ✅ 3. L'application compile et démarre

```bash
cd dotnet/src
dotnet build
dotnet run --project ShopTrack.AppHost
```

Aucune erreur de compilation.

### ✅ 4. Spans custom visibles dans Jaeger

Créez une commande :

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Frank","items":[{"productId":1,"quantity":1}]}'
```

Ouvrez [http://localhost:16686](http://localhost:16686), trouvez la trace et vérifiez la hiérarchie :

```
POST /api/orders
  └── CreateOrder          ← span custom
       └── ValidateStock   ← span custom imbriqué
       └── POST (httpbin)  ← auto-instrumentation
```

### ✅ 5. GET /api/products n'a PAS de spans custom

```bash
curl http://localhost:<port>/api/products
```

La trace de cette requête ne doit contenir que le span auto-instrumenté `GET /api/products`, sans spans custom — c'est normal, on n'a instrumenté que la création de commande.
