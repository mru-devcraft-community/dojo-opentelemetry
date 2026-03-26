# Step 11 — Solution

## Résumé des modifications

### 1. Latence simulée dans `OrderEndpoints.cs`

Ajout d'un `Task.Delay` aléatoire avant l'appel HTTP de notification :

```csharp
// Dans le handler POST /api/orders, avant l'appel HTTP :
var delay = Random.Shared.Next(100, 2000);
await Task.Delay(delay);
```

Cela simule un service de notification externe avec une latence variable.

### 2. Nouveau fichier : `Endpoints/DebugEndpoints.cs`

Deux endpoints de debug utilisant l'API `System.Diagnostics.Activity` :

| Endpoint | Description |
|----------|-------------|
| `GET /api/debug/slow-order` | Simule une commande lente, ajoute un `debug.session_id` au Baggage et comme tag |
| `GET /api/debug/trace-info` | Retourne le `traceId`, `spanId` et les éléments de Baggage de la trace courante |

### 3. Modification de `Program.cs`

Ajout de l'enregistrement des endpoints de debug :

```csharp
app.MapDebugEndpoints();
```

### Points clés

- **Baggage** : Propagé via les en-têtes HTTP (`baggage`), utile pour le debugging inter-services
- **Tags vs Baggage** : `AddBaggage` propage le contexte, `SetTag` le rend visible dans Jaeger — les deux sont nécessaires
- **Task.Delay** : Préféré à `Thread.Sleep` en contexte async pour ne pas bloquer les threads du pool
- **Aucune dépendance supplémentaire** : L'API `System.Diagnostics.Activity` fait partie du BCL .NET
