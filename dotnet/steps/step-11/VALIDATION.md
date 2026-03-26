# Step 11 — Validation

## Checklist

### ✅ 1. Le projet compile

```bash
cd dotnet/src
dotnet build
```

Le build doit réussir sans erreurs.

### ✅ 2. La latence simulée fonctionne

1. Créez une commande :
   ```bash
   curl -s -w "\nTemps total: %{time_total}s\n" -X POST http://localhost:<port>/api/orders \
     -H "Content-Type: application/json" \
     -d '{"customerName":"LatencyTest","items":[{"productId":1,"quantity":1}]}'
   ```

2. Le temps total doit être supérieur à 100ms (et potentiellement jusqu'à ~2s)
3. Exécutez plusieurs fois — le temps doit varier (latence aléatoire 100-2000ms)

### ✅ 3. Le goulot d'étranglement est visible dans Jaeger

1. Ouvrez Jaeger : [http://localhost:16686](http://localhost:16686)
2. Service : `shoptrack-api` → **Find Traces** → **Sort: Longest First**
3. Ouvrez une trace lente → le span de notification HTTP doit être le **span enfant le plus long**
4. La durée du span HTTP doit correspondre approximativement à la latence injectée

### ✅ 4. L'endpoint `/api/debug/slow-order` fonctionne

```bash
curl -s http://localhost:<port>/api/debug/slow-order | jq
```

La réponse doit contenir :
- `sessionId` — une chaîne de 8 caractères hex
- `traceId` — une chaîne de 32 caractères hex
- `message` — "Slow order simulation completed"
- `simulatedDelay` — un nombre entre 100 et 1999

### ✅ 5. Le Baggage est propagé et visible dans Jaeger

1. Notez le `sessionId` retourné par `/api/debug/slow-order`
2. Dans Jaeger, cherchez la trace correspondante
3. Ouvrez un span → onglet **Tags**
4. L'attribut `debug.session_id` doit être présent avec la valeur du `sessionId`

### ✅ 6. L'endpoint `/api/debug/trace-info` fonctionne

```bash
curl -s http://localhost:<port>/api/debug/trace-info | jq
```

La réponse doit contenir :
- `traceId` — exactement 32 caractères hexadécimaux
- `spanId` — exactement 16 caractères hexadécimaux
- `baggageItems` — un objet (peut être vide si aucun Baggage n'a été ajouté en amont)
