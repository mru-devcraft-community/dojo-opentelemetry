# Validation — Étape 08

## ✅ Checklist

### 1. Le projet compile

```bash
mvn clean compile
```

### 2. Observer les headers propagés

```bash
curl http://localhost:8080/api/chain | jq
```

- [ ] La réponse contient les headers de httpbin
- [ ] Le header `Traceparent` est présent dans la réponse
- [ ] Le format est `00-{traceId}-{spanId}-{flags}`

### 3. Analyser le Trace ID

Depuis la réponse, extrayez le Trace ID du header `traceparent` :

```
traceparent: 00-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6-789abcdef0123456-01
                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                 Ceci est le Trace ID
```

- [ ] Le Trace ID fait 32 caractères hexadécimaux
- [ ] Le Span ID fait 16 caractères hexadécimaux
- [ ] Le flag est `01` (sampled)

### 4. Vérifier la trace dans Jaeger

1. Ouvrez http://localhost:16686
2. Service : `shoptrack-api`
3. Recherchez les traces récentes

- [ ] La trace contient un span `GET /api/chain` (serveur)
- [ ] La trace contient un span `HTTP GET` vers httpbin.org (client)
- [ ] Les deux spans partagent le même Trace ID
- [ ] Le span client est enfant du span serveur

### 5. Vérifier les logs

- [ ] Les logs du ChainController contiennent le `trace_id`
- [ ] Le `trace_id` dans les logs correspond au Trace ID de Jaeger

### 6. Test de propagation B3 (optionnel)

Après avoir configuré `otel.propagators: tracecontext,baggage,b3` :

```bash
curl http://localhost:8080/api/chain | jq
```

- [ ] Le header `B3` ou `X-B3-Traceid` apparaît en plus de `Traceparent`
- [ ] Les deux headers contiennent le même Trace ID
