# Step 12 — Indices

## Conflit de port avec le Collector existant ?

<details>
<summary>💡 Indice 1 — Ports 4317/4318 déjà utilisés</summary>

Si les ports 4317 ou 4318 sont déjà utilisés par le Collector de la stack précédente :

1. **Option recommandée** — Arrêtez la stack précédente :
   ```bash
   cd infra
   docker compose down
   ```

2. **Option alternative** — Mappez SigNoz sur des ports différents dans `docker-compose-signoz.yml` :
   ```yaml
   ports:
     - "4327:4317"  # gRPC sur 4327 au lieu de 4317
     - "4328:4318"  # HTTP sur 4328 au lieu de 4318
   ```
   Puis ajustez le endpoint dans l'application :
   ```
   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4327
   ```

</details>

## SigNoz est lent à démarrer ?

<details>
<summary>💡 Indice 2 — ClickHouse a besoin de temps</summary>

SigNoz utilise ClickHouse comme base de données. ClickHouse peut prendre **30 à 60 secondes** pour s'initialiser.

Pour vérifier l'état des conteneurs :

```bash
docker compose -f docker-compose-signoz.yml ps
```

Tous les conteneurs doivent afficher `healthy` ou `running`. Si un conteneur redémarre en boucle :

```bash
# Voir les logs d'un conteneur spécifique
docker compose -f docker-compose-signoz.yml logs clickhouse

# Voir les logs du collecteur SigNoz
docker compose -f docker-compose-signoz.yml logs signoz-otel-collector
```

Si ClickHouse manque de mémoire, augmentez la RAM allouée à Docker (recommandé : **4 Go minimum**).

</details>

## Les données n'apparaissent pas dans SigNoz ?

<details>
<summary>💡 Indice 3 — Vérifications à effectuer</summary>

1. **Vérifiez le endpoint** — L'application doit pointer vers le bon endpoint :
   ```bash
   echo $OTEL_EXPORTER_OTLP_ENDPOINT
   # Doit afficher : http://localhost:4317
   ```

2. **Attendez un peu** — SigNoz peut mettre **15 à 30 secondes** avant d'afficher les premières données

3. **Vérifiez les logs de l'application** — Cherchez des erreurs OTLP :
   ```
   Error exporting to OTLP: connection refused
   ```

4. **Vérifiez les logs du collecteur SigNoz** :
   ```bash
   docker compose -f docker-compose-signoz.yml logs signoz-otel-collector
   ```

5. **Générez du trafic** — Si aucune requête n'est envoyée, aucune donnée n'apparaîtra :
   ```bash
   curl -s http://localhost:<port>/api/products
   ```

</details>

## Comment configurer .NET Aspire avec SigNoz ?

<details>
<summary>💡 Indice 4 — ServiceDefaults et OTLP</summary>

Les Aspire ServiceDefaults (`ShopTrack.ServiceDefaults/Extensions.cs`) configurent déjà l'export OTLP via `AddOpenTelemetry()`. Le SDK OpenTelemetry pour .NET lit automatiquement la variable d'environnement :

```
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

Il n'y a **rien à changer dans le code**. Seule la variable d'environnement doit pointer vers SigNoz.

Si vous utilisez l'AppHost, vous pouvez ajouter la variable d'environnement directement :

```csharp
var api = builder.AddProject<Projects.ShopTrack_Api>("shoptrack-api")
    .WithReference(postgres)
    .WaitFor(postgres)
    .WithEnvironment("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317");
```

</details>

## SigNoz nécessite beaucoup de RAM ?

<details>
<summary>💡 Indice 5 — Ressources Docker</summary>

SigNoz (avec ClickHouse) est plus gourmand que la stack séparée :

| Stack | RAM recommandée |
|-------|----------------|
| Jaeger + Prometheus + Loki + Grafana | ~2 Go |
| SigNoz (avec ClickHouse) | ~4 Go |

Pour vérifier la RAM allouée à Docker :
- **Docker Desktop** → Settings → Resources → Memory
- **Linux** : vérifiez avec `docker info | grep Memory`

Si vous manquez de RAM, réduisez les limites dans le `docker-compose-signoz.yml` :
```yaml
deploy:
  resources:
    limits:
      memory: 1g
```

</details>
