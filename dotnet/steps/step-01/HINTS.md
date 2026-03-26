# Step 01 — Indices

## Je ne trouve pas la configuration OpenTelemetry

<details>
<summary>💡 Indice 1 — Où regarder</summary>

La configuration OpenTelemetry se trouve dans `ShopTrack.ServiceDefaults/Extensions.cs`, dans la méthode `ConfigureOpenTelemetry()`.

Cette méthode est appelée par `AddServiceDefaults()` qui est appelée dans le `Program.cs` de l'API :

```csharp
builder.AddServiceDefaults();
```
</details>

## Je ne vois pas de traces dans le Dashboard

<details>
<summary>💡 Indice 2 — Générer du trafic</summary>

Les traces n'apparaissent que si des requêtes sont faites. Utilisez `curl` ou un outil comme **Bruno**, **Postman**, ou le navigateur pour appeler les endpoints.

Les traces devraient apparaître dans l'onglet **Traces** du Dashboard Aspire ([https://localhost:18888](https://localhost:18888)).
</details>

## Je ne vois pas le span de notification HTTP

<details>
<summary>💡 Indice 3 — Appel HTTP sortant</summary>

Le span pour l'appel HTTP sortant n'apparaît que lorsque vous créez une commande (`POST /api/orders`), car c'est le seul endpoint qui fait un appel HTTP sortant vers `httpbin.org`.

L'appel `GET /api/products` ne génère qu'un seul span (la requête entrante).
</details>

## Quels attributs sont ajoutés automatiquement ?

<details>
<summary>💡 Indice 4 — Attributs des spans HTTP</summary>

L'auto-instrumentation ASP.NET Core ajoute automatiquement ces attributs (conventions sémantiques OpenTelemetry) :

- `http.request.method` — Méthode HTTP (GET, POST, etc.)
- `url.path` — Chemin de l'URL
- `http.response.status_code` — Code de retour HTTP
- `server.address` — Adresse du serveur
- `network.protocol.version` — Version du protocole HTTP

Pour les appels HTTP sortants (client), vous verrez aussi :
- `url.full` — URL complète
- `server.address` — Hôte cible
</details>
