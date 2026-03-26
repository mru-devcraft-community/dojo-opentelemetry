# Instructions — Étape 12

## 1. Arrêter la stack actuelle (optionnel)

Pour éviter les conflits de ports, arrêtez la stack actuelle :

```bash
cd infra
docker compose down
```

> Alternativement, vous pouvez utiliser des ports différents pour SigNoz (voir la configuration ci-dessous).

## 2. Lancer SigNoz via Docker Compose

Créez un fichier `docker-compose-signoz.yml` dans le dossier `infra/` (ou à la racine du projet).

SigNoz fournit un Docker Compose officiel. Utilisez la version simplifiée fournie dans le dossier SOLUTION, ou téléchargez la version officielle :

```bash
# Option 1 : Utiliser le fichier SOLUTION fourni
cp steps/step-12/SOLUTION/docker-compose-signoz.yml infra/docker-compose-signoz.yml

# Option 2 : Cloner le repo SigNoz (version complète)
git clone -b main https://github.com/SigNoz/signoz.git /tmp/signoz
cd /tmp/signoz/deploy
docker compose -f docker/clickhouse-setup/docker-compose.yaml up -d
```

Lancez SigNoz :
```bash
cd infra
docker compose -f docker-compose-signoz.yml up -d
```

Attendez que tous les services démarrent (30-60 secondes).

## 3. Configurer l'application pour SigNoz

SigNoz expose les endpoints OTLP standards. Modifiez `application.yml` pour pointer vers SigNoz :

```yaml
otel:
  exporter:
    otlp:
      endpoint: http://localhost:4317
      protocol: grpc
```

> **Note** : Si vous utilisez des ports différents (ex: 4327 pour éviter les conflits), ajustez l'endpoint.

Si la stack précédente est toujours active avec le Collector sur le port 4317, utilisez des ports différents pour SigNoz :

```yaml
otel:
  exporter:
    otlp:
      endpoint: http://localhost:4327
      protocol: grpc
```

## 4. Relancer l'application

```bash
mvn spring-boot:run
```

## 5. Générer des données

```bash
# Commandes réussies
for i in $(seq 1 5); do
  curl -s -X POST http://localhost:8080/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"SigNoz Client '$i'","items":[{"productId":2,"quantity":1}]}' > /dev/null
done

# Commande en échec
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"SigNoz Erreur","items":[{"productId":1,"quantity":99999}]}' > /dev/null

# Requêtes GET
for i in $(seq 1 10); do
  curl -s http://localhost:8080/api/products > /dev/null
done
```

## 6. Explorer SigNoz

Ouvrez http://localhost:3301

### 6.1 — Services

1. Allez dans **Services**
2. Trouvez `shoptrack-api`
3. Observez :
   - Le débit (requêtes/sec)
   - La latence (P50, P95, P99)
   - Le taux d'erreur

### 6.2 — Traces

1. Allez dans **Traces**
2. Filtrez par service : `shoptrack-api`
3. Ouvrez une trace de création de commande
4. Observez :
   - La timeline des spans
   - Les attributs (customer_name, total_amount, etc.)
   - Les événements (OrderPersisted, etc.)

### 6.3 — Métriques

1. Allez dans **Dashboards** > **New Dashboard**
2. Ajoutez un panel avec la requête :
```
orders_created_total
```
3. Explorez les métriques auto-instrumentées :
   - `http_server_request_duration_seconds`
   - `jvm_memory_used_bytes`

### 6.4 — Logs

1. Allez dans **Logs**
2. Recherchez les logs du service `shoptrack-api`
3. Vérifiez la corrélation :
   - Cliquez sur un log
   - Le lien vers la trace devrait être disponible

## 7. Comparer avec la stack précédente

| Fonctionnalité | Stack séparée | SigNoz |
|----------------|---------------|--------|
| Setup initial | ⏱️ Complexe | ⚡ Simple |
| Corrélation traces↔logs | 🔧 Config manuelle | ✅ Native |
| Dashboards | 📊 Grafana (flexible) | 📊 Intégrés + custom |
| Recherche de traces | Jaeger UI | SigNoz Traces |
| Recherche de logs | Grafana + Loki (LogQL) | SigNoz Logs |
| Alertes | Grafana Alerting | SigNoz Alerts |
| Flexibilité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 8. Revenir à la stack de base (optionnel)

Pour revenir à la stack Jaeger+Prometheus+Loki+Grafana :

```bash
# Arrêter SigNoz
docker compose -f docker-compose-signoz.yml down

# Relancer la stack de base
docker compose up -d
```

Remettez l'endpoint OTLP vers le Collector dans `application.yml` :
```yaml
otel:
  exporter:
    otlp:
      endpoint: http://localhost:4317
```
