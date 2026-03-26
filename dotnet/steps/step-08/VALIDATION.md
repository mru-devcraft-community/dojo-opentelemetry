# Step 08 — Validation

## Checklist

### ✅ 1. Endpoint /api/chain fonctionne

```bash
curl http://localhost:<port>/api/chain
```

La réponse doit contenir un objet JSON avec `message` et `httpbinHeaders`. Dans les headers de httpbin, un champ `Traceparent` doit être visible.

### ✅ 2. Le header traceparent est présent dans les headers de httpbin

Dans la réponse de `/api/chain`, cherchez dans `httpbinHeaders` :

```json
{
  "headers": {
    "Traceparent": "00-abcdef1234567890abcdef1234567890-1234567890abcdef-01",
    ...
  }
}
```

### ✅ 3. La trace dans Jaeger montre les spans parent-enfant

1. Ouvrez Jaeger (`http://localhost:16686`)
2. Sélectionnez le service `shoptrack-api`
3. Trouvez une trace pour `GET /api/chain`
4. La trace doit contenir au minimum 2 spans :
   - `GET /api/chain` (serveur)
   - `GET` vers `httpbin.org` (client HTTP)
5. Le span client doit être enfant du span serveur

### ✅ 4. Endpoint /api/context retourne les informations de trace

```bash
curl http://localhost:<port>/api/context
```

La réponse doit contenir :
- `traceId` : un identifiant de 32 caractères hexadécimaux
- `spanId` : un identifiant de 16 caractères hexadécimaux

### ✅ 5. Le contexte est propagé quand on envoie un traceparent

```bash
curl -H "traceparent: 00-aaaabbbbccccddddeeeeffffgggghhhh-1111222233334444-01" \
  http://localhost:<port>/api/context
```

> Note : les caractères doivent être hexadécimaux valides. Utilisez :

```bash
curl -H "traceparent: 00-aabbccdd11223344aabbccdd11223344-aabbccdd11223344-01" \
  http://localhost:<port>/api/context
```

Le `traceId` retourné doit correspondre à `aabbccdd11223344aabbccdd11223344`.

### ✅ 6. Sans traceparent, un nouveau TraceId est généré

```bash
curl http://localhost:<port>/api/context
```

Le `traceId` retourné est un nouveau TraceId aléatoire (différent à chaque appel).
