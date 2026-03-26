# Step 02 — Indices

## Comment ajouter une variable d'environnement dans Aspire ?

<details>
<summary>💡 Indice 1 — Méthode WithEnvironment</summary>

Aspire fournit la méthode `.WithEnvironment()` pour passer des variables d'environnement à un projet :

```csharp
builder.AddProject<Projects.ShopTrack_Api>("shoptrack-api")
    .WithEnvironment("NOM_VARIABLE", "valeur");
```
</details>

## Quelle URL utiliser pour le Collector ?

<details>
<summary>💡 Indice 2 — Endpoint OTLP</summary>

Le Collector OpenTelemetry tourne dans Docker et expose le port `4317` (gRPC) sur `localhost`. L'URL à utiliser est :

```
http://localhost:4317
```

> **Important** : Utilisez `http://` et non `https://`. Le Collector n'a pas de TLS configuré.
</details>

## Quel est le nom de la variable d'environnement ?

<details>
<summary>💡 Indice 3 — Variable OTEL standard</summary>

La variable d'environnement standard d'OpenTelemetry pour l'endpoint OTLP est :

```
OTEL_EXPORTER_OTLP_ENDPOINT
```

C'est la même variable que le code dans `Extensions.cs` vérifie pour activer l'exporter.
</details>

## Code complet de la modification

<details>
<summary>💡 Indice 4 — Solution complète</summary>

```csharp
var api = builder.AddProject<Projects.ShopTrack_Api>("shoptrack-api")
    .WithReference(postgres)
    .WaitFor(postgres)
    .WithEnvironment("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317");
```
</details>

## Les traces n'apparaissent pas dans Jaeger ?

<details>
<summary>💡 Indice 5 — Dépannage</summary>

1. Vérifiez que le Collector est démarré : `docker compose ps`
2. Vérifiez les logs du Collector : `docker compose logs otel-collector`
3. Assurez-vous que le port `4317` n'est pas bloqué par un firewall
4. Vérifiez que vous avez bien relancé l'application après la modification
</details>
