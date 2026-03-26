# Step 03 — Instructions

## Étapes

### 1. Créer la classe Diagnostics

Créez un nouveau fichier `Diagnostics.cs` à la racine du projet `ShopTrack.Api` (à côté de `Program.cs`).

Ce fichier doit contenir :
- Un `ActivitySource` statique nommé `"ShopTrack.Api"`

> **Convention** : On regroupe les instruments d'observabilité (ActivitySource, Meter, etc.) dans une classe statique `Diagnostics` pour centraliser les déclarations.

### 2. Enregistrer l'ActivitySource dans OpenTelemetry

Dans `Program.cs` de `ShopTrack.Api`, ajoutez l'enregistrement de l'ActivitySource dans la configuration OpenTelemetry :

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource("ShopTrack.Api"));
```

> **Important** : Le nom passé à `AddSource()` doit correspondre **exactement** au nom utilisé lors de la création de l'`ActivitySource`.

### 3. Ajouter un span "CreateOrder"

Dans `OrderEndpoints.cs`, dans le handler `POST /`, entourez toute la logique de création de commande avec un span custom :

```csharp
using var activity = Diagnostics.ActivitySource.StartActivity("CreateOrder");
```

Ce span doit englober tout le code du handler (validation, calcul, sauvegarde, notification).

### 4. Ajouter un span imbriqué "ValidateStock"

À l'intérieur du span `CreateOrder`, créez un span enfant pour la boucle de validation du stock :

```csharp
using var validateActivity = Diagnostics.ActivitySource.StartActivity("ValidateStock");
```

Ce span doit entourer la boucle `foreach` qui vérifie la disponibilité des produits.

### 5. Relancer et tester

```bash
cd dotnet/src
dotnet run --project ShopTrack.AppHost
```

Créez une commande :

```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Eve","items":[{"productId":1,"quantity":1},{"productId":2,"quantity":3}]}'
```

### 6. Observer dans Jaeger

Ouvrez [http://localhost:16686](http://localhost:16686), sélectionnez le service `shoptrack-api` et trouvez la trace de votre commande.

Vous devriez voir la hiérarchie :

```
POST /api/orders          ← auto-instrumentation
  └── CreateOrder         ← votre span custom
       └── ValidateStock  ← votre span imbriqué
       └── POST (httpbin) ← auto-instrumentation HTTP client
```
