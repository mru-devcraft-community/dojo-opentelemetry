# Step 11 — Indices

## Le Baggage n'apparaît pas dans Jaeger ?

<details>
<summary>💡 Indice 1 — Baggage vs Tags</summary>

Le Baggage OpenTelemetry est **propagé** entre services via les en-têtes HTTP, mais il n'est **pas automatiquement** ajouté aux attributs des spans dans Jaeger.

Pour que le Baggage soit visible dans Jaeger, il faut **manuellement** le copier comme tag :

```csharp
// Ajouter au Baggage (propagé via en-têtes HTTP)
Activity.Current?.AddBaggage("debug.session_id", sessionId);

// Copier comme tag (visible dans Jaeger)
Activity.Current?.SetTag("debug.session_id", sessionId);
```

Les deux sont nécessaires :
- `AddBaggage` → propagation inter-services
- `SetTag` → visibilité dans Jaeger/backend de traces

</details>

## Comment trouver les traces les plus lentes dans Jaeger ?

<details>
<summary>💡 Indice 2 — Tri par durée</summary>

1. Ouvrez Jaeger : [http://localhost:16686](http://localhost:16686)
2. Sélectionnez le service `shoptrack-api`
3. Cliquez sur **Find Traces**
4. Dans la liste des résultats, utilisez le sélecteur de tri : **Sort: Longest First**
5. Les traces avec la plus grande durée apparaissent en premier

Vous pouvez aussi filtrer par durée minimale dans les options de recherche :
- **Min Duration** : `500ms` pour ne voir que les traces lentes

</details>

## Pourquoi utiliser Task.Delay et non Thread.Sleep ?

<details>
<summary>💡 Indice 3 — Async vs Sync</summary>

En .NET, dans du code async :
- `Thread.Sleep(1000)` **bloque** le thread courant du pool de threads → réduit la capacité de traitement du serveur
- `await Task.Delay(1000)` **libère** le thread pendant l'attente → le thread peut traiter d'autres requêtes

```csharp
// ❌ Mauvais — bloque un thread du pool
Thread.Sleep(Random.Shared.Next(100, 2000));

// ✅ Bon — libère le thread pendant l'attente
await Task.Delay(Random.Shared.Next(100, 2000));
```

Dans un vrai scénario de latence réseau, c'est `await Task.Delay` qui simule fidèlement le comportement (I/O non-bloquant).

</details>

## Comment lire une valeur du Baggage ?

<details>
<summary>💡 Indice 4 — Lecture du Baggage</summary>

Pour lire un élément du Baggage sur l'Activity courante :

```csharp
using System.Diagnostics;

// Lire un élément spécifique
var sessionId = Activity.Current?.GetBaggageItem("debug.session_id");

// Lire tous les éléments du Baggage
var allBaggage = Activity.Current?.Baggage;
if (allBaggage != null)
{
    foreach (var item in allBaggage)
    {
        Console.WriteLine($"{item.Key} = {item.Value}");
    }
}
```

Note : `GetBaggageItem` retourne `null` si la clé n'existe pas.

</details>

## Le propagateur Baggage est-il activé par défaut ?

<details>
<summary>💡 Indice 5 — W3C Baggage Propagator</summary>

Oui ! Le SDK OpenTelemetry pour .NET active par défaut les propagateurs suivants :
- **W3C TraceContext** — propage `traceparent` et `tracestate`
- **W3C Baggage** — propage les éléments de Baggage via l'en-tête `baggage`

Les Aspire ServiceDefaults configurent déjà tout via `AddOpenTelemetry()`. Aucune configuration supplémentaire n'est nécessaire pour le Baggage.

Le Baggage ajouté via `Activity.Current?.AddBaggage(...)` sera automatiquement propagé dans les en-têtes HTTP des appels `HttpClient`.

</details>

## Comment structurer les endpoints de debug ?

<details>
<summary>💡 Indice 6 — Pattern Minimal API</summary>

Suivez le même pattern que `OrderEndpoints.cs` et `ProductEndpoints.cs` :

```csharp
namespace ShopTrack.Api.Endpoints;

public static class DebugEndpoints
{
    public static void MapDebugEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/debug").WithTags("Debug");

        group.MapGet("/slow-order", async (IHttpClientFactory httpClientFactory) =>
        {
            // ... implémentation
        });

        group.MapGet("/trace-info", () =>
        {
            // ... implémentation
        });
    }
}
```

N'oubliez pas d'ajouter `app.MapDebugEndpoints();` dans `Program.cs`.

</details>
