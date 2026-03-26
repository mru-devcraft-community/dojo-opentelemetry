# Step 11 — Instructions

## Prérequis

Vous devez avoir complété le **Step 10** (dashboards Grafana). L'infrastructure Docker doit être démarrée.

## Étapes

### 1. Ajouter une latence simulée à l'appel de notification

Dans `OrderEndpoints.cs`, ajoutez un délai aléatoire **avant** l'appel HTTP de notification :

```csharp
// Simulate notification call with random latency (debugging exercise)
var client = httpClientFactory.CreateClient("NotificationService");
try
{
    // Latence simulée — simule un service externe lent
    var delay = Random.Shared.Next(100, 2000);
    await Task.Delay(delay);

    await client.PostAsync("post", new StringContent($"Order {order.Id} created for {order.CustomerName}"));
}
catch
{
    // Notification failure should not block order creation
}
```

> ⚠️ Utilisez `Task.Delay` et non `Thread.Sleep` — on est en code async, `Thread.Sleep` bloquerait le thread du pool.

### 2. Tester et observer la latence

1. Lancez l'application :
   ```bash
   cd dotnet/src/ShopTrack.AppHost
   dotnet run
   ```

2. Créez quelques commandes :
   ```bash
   for i in $(seq 1 5); do
     curl -s -X POST http://localhost:<port>/api/orders \
       -H "Content-Type: application/json" \
       -d '{"customerName":"DebugUser'$i'","items":[{"productId":1,"quantity":1}]}'
   done
   ```

3. Ouvrez Jaeger : [http://localhost:16686](http://localhost:16686)
4. Sélectionnez le service `shoptrack-api`
5. Cliquez sur **Find Traces**
6. **Triez par "Longest First"** — les traces les plus longues apparaissent en premier

### 3. Identifier le goulot d'étranglement

Dans une trace lente, ouvrez les détails :
- Le span racine `POST /api/orders` couvre la durée totale
- Le span enfant `HTTP POST` (vers httpbin.org) devrait être le plus long
- La différence entre la durée totale et la durée du span HTTP correspond au traitement métier

C'est le span de notification qui cause la latence — le **Critical Path** passe par ce span.

### 4. Utiliser l'API Baggage pour le debugging

L'API Baggage permet d'ajouter du contexte de debug qui sera propagé à travers la trace. En .NET, on utilise `System.Diagnostics.Activity` :

```csharp
using System.Diagnostics;

// Ajouter un identifiant de session de debug
var sessionId = Guid.NewGuid().ToString("N")[..8];
Activity.Current?.AddBaggage("debug.session_id", sessionId);

// IMPORTANT : Le Baggage n'apparaît pas automatiquement dans Jaeger
// Il faut le copier comme tag sur le span :
Activity.Current?.SetTag("debug.session_id", sessionId);
```

### 5. Créer les endpoints de debug

Créez un fichier `Endpoints/DebugEndpoints.cs` avec deux endpoints :

#### Endpoint 1 : `GET /api/debug/slow-order`

Cet endpoint simule une commande lente avec du Baggage de debug :
- Génère un `session_id` unique
- L'ajoute au Baggage et comme tag sur le span
- Effectue un appel HTTP avec latence simulée
- Retourne le `session_id` et le `traceId`

#### Endpoint 2 : `GET /api/debug/trace-info`

Cet endpoint retourne les informations de trace courantes :
- `traceId` (32 caractères hexadécimaux)
- `spanId` (16 caractères hexadécimaux)
- Liste des éléments de Baggage attachés à l'Activity courante

### 6. Enregistrer les endpoints de debug

Dans `Program.cs`, ajoutez l'appel à `MapDebugEndpoints()` :

```csharp
app.MapProductEndpoints();
app.MapOrderEndpoints();
app.MapDebugEndpoints(); // ← Ajouter cette ligne
```

### 7. Tester les endpoints de debug

1. Testez l'endpoint slow-order :
   ```bash
   curl -s http://localhost:<port>/api/debug/slow-order | jq
   ```
   Réponse attendue :
   ```json
   {
     "sessionId": "a1b2c3d4",
     "traceId": "abcdef1234567890abcdef1234567890",
     "message": "Slow order simulation completed",
     "simulatedDelay": 1234
   }
   ```

2. Testez l'endpoint trace-info :
   ```bash
   curl -s http://localhost:<port>/api/debug/trace-info | jq
   ```
   Réponse attendue :
   ```json
   {
     "traceId": "abcdef1234567890abcdef1234567890",
     "spanId": "1234567890abcdef",
     "baggageItems": {}
   }
   ```

### 8. Vérifier dans Jaeger

1. Ouvrez Jaeger : [http://localhost:16686](http://localhost:16686)
2. Cherchez les traces du service `shoptrack-api`
3. Filtrez par tag : `debug.session_id=<votre_session_id>`
4. Ouvrez la trace → le tag `debug.session_id` doit apparaître sur les spans

### Workflow complet de debugging

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Détection   │────▶│ Investigation │────▶│  Corrélation  │────▶│ Confirmation  │
│  (Grafana)   │     │   (Jaeger)    │     │    (Loki)     │     │  (Baggage)   │
│              │     │              │     │              │     │              │
│ Pic latence  │     │ Span lent    │     │ Logs du span │     │ session_id   │
│ P95 dégradé  │     │ notification │     │ avec TraceId │     │ dans traces  │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```
