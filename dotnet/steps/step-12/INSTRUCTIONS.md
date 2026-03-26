# Step 12 — Instructions

## Prérequis

- Docker et Docker Compose installés
- Au moins **4 Go de RAM** disponibles pour Docker (SigNoz + ClickHouse sont gourmands)
- Avoir complété au moins le **Step 01** (instrumentation de base)

## Étapes

### 1. Arrêter la stack existante

Arrêtez la stack d'observabilité précédente pour libérer les ports :

```bash
cd infra
docker compose down
```

> ⚠️ Vérifiez que les ports 4317 et 4318 sont bien libérés avant de continuer.

### 2. Lancer SigNoz

Utilisez le fichier `docker-compose-signoz.yml` fourni dans le dossier `SOLUTION/` de ce step :

```bash
# Copier le fichier dans le dossier infra
cp dotnet/steps/step-12/SOLUTION/docker-compose-signoz.yml infra/

# Lancer SigNoz
cd infra
docker compose -f docker-compose-signoz.yml up -d
```

Attendez que tous les conteneurs soient en état **healthy** :

```bash
docker compose -f docker-compose-signoz.yml ps
```

> ⚠️ ClickHouse peut prendre **30 à 60 secondes** pour démarrer complètement. Soyez patient.

### 3. Configurer l'application pour SigNoz

L'avantage d'OpenTelemetry : aucune modification de code n'est nécessaire ! Les Aspire ServiceDefaults configurent déjà l'export OTLP. Il suffit de changer le endpoint.

#### Option A — Variable d'environnement (recommandée)

Modifiez la variable `OTEL_EXPORTER_OTLP_ENDPOINT` dans le lancement de l'application :

```bash
# Si vous lancez directement l'API
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 dotnet run --project dotnet/src/ShopTrack.Api
```

Ou dans le `Program.cs` de l'AppHost :

```csharp
var api = builder.AddProject<Projects.ShopTrack_Api>("shoptrack-api")
    .WithReference(postgres)
    .WaitFor(postgres)
    .WithEnvironment("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317");
```

#### Option B — Fichier appsettings

Créez ou modifiez `appsettings.signoz.json` dans `ShopTrack.Api/` :

```json
{
  "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4317"
}
```

Puis lancez avec le profil :

```bash
ASPNETCORE_ENVIRONMENT=signoz dotnet run --project dotnet/src/ShopTrack.Api
```

### 4. Lancer l'application

```bash
cd dotnet/src/ShopTrack.AppHost
dotnet run
```

### 5. Générer des données de test

Créez quelques produits et commandes pour alimenter SigNoz :

```bash
PORT=<port>

# Vérifier les produits existants
curl -s http://localhost:$PORT/api/products | jq

# Créer des commandes
for i in $(seq 1 10); do
  curl -s -X POST http://localhost:$PORT/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"SigNozUser'$i'","items":[{"productId":1,"quantity":1}]}'
  sleep 1
done
```

### 6. Explorer l'interface SigNoz

Ouvrez SigNoz : [http://localhost:3301](http://localhost:3301)

#### 6.1 — Services

Rendez-vous dans l'onglet **Services** :
- `shoptrack-api` doit apparaître dans la liste
- Vous verrez : débit (requêtes/s), latence P50/P95/P99, taux d'erreur

#### 6.2 — Traces

Onglet **Traces** :
- Filtrez par service : `shoptrack-api`
- Cliquez sur une trace pour voir le diagramme en cascade (waterfall)
- Comparez avec la vue Jaeger — la structure est similaire

#### 6.3 — Metrics Explorer

Onglet **Metrics** :
- Cherchez les métriques custom : `orders_created_total`, `orders_total_amount`
- Cherchez les métriques auto-instrumentées : `http_server_request_duration`
- Créez des graphiques directement dans l'explorateur

#### 6.4 — Logs

Onglet **Logs** :
- Les logs de l'application doivent apparaître
- Cliquez sur un log avec un **Trace ID** → SigNoz navigue directement vers la trace associée
- C'est la corrélation log-trace **native** — plus besoin de copier le TraceId manuellement !

#### 6.5 — Dashboards

Onglet **Dashboards** :
- SigNoz fournit des dashboards par défaut pour les métriques HTTP
- Vous pouvez créer des dashboards personnalisés similaires à ceux de Grafana

### 7. Comparer avec la stack précédente

| Action | Stack précédente | SigNoz |
|--------|-----------------|--------|
| Voir les traces | Jaeger → chercher par service | Traces → filtrer par service |
| Voir les métriques | Grafana → Explore → Prometheus | Metrics Explorer → chercher métrique |
| Voir les logs | Grafana → Explore → Loki | Logs → filtrer par service |
| Corréler trace ↔ logs | Copier TraceId de Jaeger vers Loki | Cliquer sur le Trace ID dans les logs |
| Modifier le code | Aucune modification | Aucune modification |
| Configuration changée | — | Seulement `OTEL_EXPORTER_OTLP_ENDPOINT` |
