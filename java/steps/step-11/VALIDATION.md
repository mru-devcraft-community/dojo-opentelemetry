# Validation — Étape 11

## ✅ Checklist

### 1. Le projet compile

```bash
mvn clean compile
```

### 2. La latence simulée fonctionne

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Debug Test","items":[{"productId":2,"quantity":1}]}'
```

- [ ] La requête prend entre 100ms et 2000ms de plus que d'habitude
- [ ] Les logs montrent le délai simulé : "délai simulé: XXXms"

### 3. Identification du goulot d'étranglement dans Jaeger

1. Ouvrez Jaeger (http://localhost:16686)
2. Service : `shoptrack-api`
3. Triez par **Longest First**

- [ ] Les traces les plus longues ont un span NotificationService / `notifyOrderCreated` très large
- [ ] La timeline montre clairement que la notification est le goulot d'étranglement
- [ ] La durée du span de notification varie entre 100ms et 2000ms

### 4. L'endpoint `/api/debug/slow-order` fonctionne

```bash
curl http://localhost:8080/api/debug/slow-order | jq
```

- [ ] La réponse contient un `sessionId`
- [ ] La réponse contient un `traceId`
- [ ] La requête prend du temps (latence simulée)

### 5. Le Baggage est propagé

```bash
curl http://localhost:8080/api/debug/slow-order | jq
```

Dans Jaeger, ouvrez la trace correspondante :
- [ ] Le span contient l'attribut `debug.session_id` (si ajouté manuellement)
- [ ] Les logs contiennent le session_id

### 6. L'endpoint `/api/debug/trace-info` retourne les infos de tracing

```bash
curl http://localhost:8080/api/debug/trace-info | jq
```

- [ ] Le `traceId` est un identifiant de 32 caractères hexadécimaux
- [ ] Le `spanId` est un identifiant de 16 caractères hexadécimaux
- [ ] Le `traceId` correspond à celui visible dans Jaeger

### 7. Workflow de debugging complet

Scénario bout-en-bout :

1. Appelez `/api/debug/slow-order`
2. Notez le `sessionId` retourné
3. Dans Jaeger, trouvez la trace (via le Trace ID retourné)
4. Identifiez le span le plus lent
5. Dans Loki, recherchez les logs avec ce Trace ID :
```logql
{service_name="shoptrack-api"} | json | trace_id = "<TRACE_ID>"
```

- [ ] Tous les logs de cette requête sont trouvés
- [ ] Le goulot d'étranglement est clairement identifié
- [ ] Le `sessionId` apparaît dans les logs et/ou les spans
