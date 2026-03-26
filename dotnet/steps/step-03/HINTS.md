# Step 03 — Indices

## Comment créer un ActivitySource ?

<details>
<summary>💡 Indice 1 — Déclaration de l'ActivitySource</summary>

```csharp
using System.Diagnostics;

public static class Diagnostics
{
    public static readonly ActivitySource ActivitySource = new("ShopTrack.Api");
}
```

Le namespace `System.Diagnostics` contient `ActivitySource` et `Activity` — pas besoin de package NuGet supplémentaire.
</details>

## Comment enregistrer l'ActivitySource ?

<details>
<summary>💡 Indice 2 — Enregistrement dans Program.cs</summary>

Ajoutez ceci dans `Program.cs` après `builder.AddServiceDefaults()` :

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(Diagnostics.ActivitySource.Name));
```

Utiliser `Diagnostics.ActivitySource.Name` plutôt que la string en dur évite les erreurs de typo.
</details>

## Comment créer un span custom ?

<details>
<summary>💡 Indice 3 — StartActivity</summary>

```csharp
using var activity = Diagnostics.ActivitySource.StartActivity("NomDuSpan");
// ... votre code ici ...
// Le span se termine automatiquement grâce au "using"
```

Si l'ActivitySource n'est pas enregistré (pas de `AddSource`), `StartActivity()` retourne `null` et rien ne se passe (pas d'erreur).
</details>

## Comment imbriquer les spans ?

<details>
<summary>💡 Indice 4 — Spans imbriqués</summary>

Les spans s'imbriquent automatiquement. Un `StartActivity()` appelé pendant qu'un autre span est actif crée un span enfant :

```csharp
using var parent = Diagnostics.ActivitySource.StartActivity("CreateOrder");

// Ce span sera enfant de CreateOrder
using var child = Diagnostics.ActivitySource.StartActivity("ValidateStock");
// ... validation ...
// child se termine ici

// Retour dans le contexte de CreateOrder
```
</details>

## Où placer les spans dans OrderEndpoints ?

<details>
<summary>💡 Indice 5 — Placement dans le code</summary>

Dans le handler `POST /` de `OrderEndpoints.cs` :

```csharp
group.MapPost("/", async (...) =>
{
    using var activity = Diagnostics.ActivitySource.StartActivity("CreateOrder");

    var order = new Order { ... };

    using (var validateActivity = Diagnostics.ActivitySource.StartActivity("ValidateStock"))
    {
        foreach (var item in request.Items)
        {
            // ... validation du stock ...
        }
    }

    // ... calcul total, sauvegarde, notification ...
});
```
</details>
