# Step 08 — Indices

## Comment accéder aux informations de l'Activity courante ?

<details>
<summary>💡 Indice 1 — Activity.Current</summary>

En .NET, le span actif est accessible via `Activity.Current` :

```csharp
using System.Diagnostics;

var activity = Activity.Current;
var traceId = activity?.TraceId.ToString();
var spanId = activity?.SpanId.ToString();
var parentSpanId = activity?.ParentSpanId.ToString();
```

</details>

## Comment lire les headers de propagation dans une Minimal API ?

<details>
<summary>💡 Indice 2 — HttpContext.Request.Headers</summary>

Dans une Minimal API, vous pouvez injecter `HttpContext` pour accéder aux headers :

```csharp
app.MapGet("/api/context", (HttpContext httpContext) =>
{
    var traceparent = httpContext.Request.Headers["traceparent"].ToString();
    var tracestate = httpContext.Request.Headers["tracestate"].ToString();
    
    return Results.Ok(new
    {
        headers = new { traceparent, tracestate },
        currentActivity = new
        {
            traceId = Activity.Current?.TraceId.ToString(),
            spanId = Activity.Current?.SpanId.ToString(),
            parentSpanId = Activity.Current?.ParentSpanId.ToString()
        }
    });
});
```

</details>

## Comment créer un HttpClient qui pointe vers ma propre API ?

<details>
<summary>💡 Indice 3 — Appel self-referencing</summary>

Pour un appel chaîné vers sa propre API, vous pouvez configurer un HttpClient supplémentaire :

```csharp
builder.Services.AddHttpClient("SelfClient", client =>
{
    client.BaseAddress = new Uri("http://localhost:5000/");
});
```

Mais pour simplifier, l'appel vers `httpbin.org/headers` démontre tout aussi bien la propagation puisque httpbin renvoie les headers reçus.

</details>

## La trace ne montre qu'un seul span ?

<details>
<summary>💡 Indice 4 — Vérifier l'instrumentation HttpClient</summary>

L'instrumentation HttpClient doit être active dans `Extensions.cs` :

```csharp
.WithTracing(tracing =>
{
    tracing.AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation();  // ← Nécessaire pour la propagation
});
```

Sans `.AddHttpClientInstrumentation()`, les appels HTTP sortants ne créeraient pas de span enfant et ne propageraient pas le contexte.

</details>

## Comment envoyer un traceparent personnalisé avec curl ?

<details>
<summary>💡 Indice 5 — Header traceparent</summary>

```bash
curl -H "traceparent: 00-12345678901234567890123456789012-1234567890123456-01" \
  http://localhost:<port>/api/context
```

Format : `{version}-{traceId 32 hex chars}-{spanId 16 hex chars}-{flags}`

- version : toujours `00`
- traceId : 32 caractères hexadécimaux
- spanId : 16 caractères hexadécimaux
- flags : `01` = sampled, `00` = not sampled

</details>
