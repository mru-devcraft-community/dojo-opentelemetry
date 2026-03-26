# Step 08 — Instructions

## Prérequis

Vous devez avoir complété le **Step 07** (corrélation traces ↔ logs ↔ métriques).

## Étapes

### 1. Observer les headers de propagation dans les requêtes sortantes

Notre application appelle déjà `httpbin.org` lors de la création d'une commande (notification). Le service `httpbin.org/post` renvoie les headers qu'il a reçus dans sa réponse.

1. Créez une commande et observez la réponse dans les logs du Collector (`debug` exporter)
2. Alternativement, modifiez temporairement l'endpoint de notification pour appeler `httpbin.org/headers` (GET) et loggez le résultat

Vous devriez voir un header `traceparent` dans les headers envoyés à httpbin.

### 2. Créer un endpoint qui affiche les headers de propagation entrants

Créez un nouveau fichier `Endpoints/ContextEndpoints.cs` qui expose la propagation :

```csharp
app.MapGet("/api/context", (HttpContext httpContext) =>
{
    // Lire les headers de propagation entrants
    // Retourner les informations sur le contexte de trace actuel
});
```

L'endpoint doit retourner :
- Les headers `traceparent` et `tracestate` de la requête entrante
- Le `TraceId` et `SpanId` de l'Activity courante
- Le `ParentSpanId` si disponible

### 3. Créer un endpoint de chaînage `/api/chain`

Créez un nouveau fichier `Endpoints/ChainEndpoints.cs` avec un endpoint qui appelle un autre endpoint de la même API (ou httpbin) via HttpClient :

```csharp
app.MapGet("/api/chain", async (IHttpClientFactory httpClientFactory) =>
{
    var client = httpClientFactory.CreateClient("NotificationService");
    
    // Cet appel propagera automatiquement le traceparent
    var response = await client.GetAsync("https://httpbin.org/headers");
    var body = await response.Content.ReadAsStringAsync();
    
    return Results.Ok(new { message = "Chain call completed", httpbinHeaders = body });
});
```

### 4. Enregistrer les nouveaux endpoints dans Program.cs

Ajoutez les mappings des nouveaux endpoints :

```csharp
app.MapChainEndpoints();
app.MapContextEndpoints();
```

### 5. Tester et observer dans Jaeger

1. Appelez `GET /api/chain`
2. Ouvrez Jaeger et trouvez la trace
3. La trace doit contenir :
   - Un span pour `GET /api/chain` (le serveur)
   - Un span enfant pour l'appel HTTP sortant vers httpbin.org
4. Le `traceparent` visible dans la réponse de httpbin doit correspondre au TraceId de la trace

### 6. Comprendre le format W3C traceparent

Depuis la réponse de httpbin, décodez le header `traceparent` :

```
00-{traceId 32 hex}-{spanId 16 hex}-{flags 2 hex}
```

- Vérifiez que le `traceId` correspond à celui affiché dans Jaeger
- Le `spanId` correspond au span de l'appel HTTP sortant
- `flags = 01` signifie que la trace est échantillonnée

### 7. Tester l'endpoint /api/context

1. Appelez `GET /api/context` **sans** header traceparent → un nouveau TraceId est généré
2. Appelez `GET /api/context` **avec** un header traceparent personnalisé :

```bash
curl -H "traceparent: 00-12345678901234567890123456789012-1234567890123456-01" \
  http://localhost:<port>/api/context
```

3. Vérifiez que le TraceId retourné correspond à celui que vous avez envoyé
