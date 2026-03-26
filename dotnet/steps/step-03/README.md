# Step 03 — Instrumentation manuelle — Spans custom

## Contexte

L'auto-instrumentation capture les appels HTTP, mais elle ne sait rien de votre **logique métier**. Pour obtenir une visibilité fine sur ce qui se passe dans votre code, vous devez créer des **spans personnalisés**.

### ActivitySource en .NET

En .NET, l'équivalent du **Tracer** OpenTelemetry est l'**`ActivitySource`**. C'est l'API native de .NET pour créer des spans (appelés **Activities** en .NET).

```csharp
// Déclarer une source d'activités
static readonly ActivitySource MySource = new("MonApplication");

// Créer un span
using var activity = MySource.StartActivity("MonOperation");
// ... logique métier ...
// Le span se termine automatiquement à la fin du using
```

### Vocabulaire .NET vs OpenTelemetry

| OpenTelemetry | .NET |
|---------------|------|
| Tracer | `ActivitySource` |
| Span | `Activity` |
| Span Name | `Activity.DisplayName` |
| Span Kind | `ActivityKind` |

### Hiérarchie des spans

Quand vous créez un span à l'intérieur d'un autre span, il devient automatiquement un **enfant** :

```
POST /api/orders          ← span auto (ASP.NET Core)
  └── CreateOrder         ← span custom (votre code)
       └── ValidateStock  ← span custom imbriqué
```

### Enregistrer l'ActivitySource

Pour que OpenTelemetry capture les Activities de votre `ActivitySource`, il faut l'enregistrer via `AddSource()` :

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource("MonApplication"));
```

## Objectif de ce step

Créer un `ActivitySource` pour l'application et ajouter des spans personnalisés autour de la logique de création de commande et de validation du stock.
