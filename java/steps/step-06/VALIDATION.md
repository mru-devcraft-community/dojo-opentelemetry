# Validation — Étape 06

## ✅ Checklist

### 1. Le projet compile avec la nouvelle dépendance

```bash
mvn clean compile
```

### 2. Générer des logs

```bash
# Commande réussie
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Alice Dupont","items":[{"productId":2,"quantity":1}]}'

# Commande en échec
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Bob Error","items":[{"productId":1,"quantity":99999}]}'
```

### 3. Vérifier les logs en console

Les logs doivent contenir `trace_id` et `span_id` :

- [ ] Log INFO "Création de commande pour le client Alice Dupont" avec `trace_id` non vide
- [ ] Log INFO "Commande X créée, total=Y, items=Z" avec le même `trace_id`
- [ ] Log WARN "Stock insuffisant..." pour la commande en échec

### 4. Vérifier les logs dans Grafana/Loki

1. Ouvrez http://localhost:3000
2. Allez dans **Explore** > Sélectionnez **Loki**
3. Requête :

```logql
{service_name="shoptrack-api"}
```

- [ ] Les logs de l'application apparaissent
- [ ] Les logs contiennent le TraceId

### 5. Vérifier la corrélation Traces ↔ Logs

1. Dans la console ou Loki, notez un `trace_id` d'un log
2. Dans Jaeger (http://localhost:16686), recherchez cette trace par son ID
3. Vérifiez que :
   - [ ] La trace correspond au même appel API que le log
   - [ ] Les timestamps sont cohérents
   - [ ] Les informations métier (customer_name, etc.) correspondent

### 6. Requête Loki avancée — filtrage par TraceId

```logql
{service_name="shoptrack-api"} | json | trace_id = "<VOTRE_TRACE_ID>"
```

Doit retourner tous les logs associés à cette trace.

## 🎯 Résultat attendu

Les **trois piliers** de l'observabilité sont maintenant en place :

| Pilier | Outil | Vérification |
|--------|-------|-------------|
| **Traces** | Jaeger | Spans HTTP, JDBC, custom, @WithSpan |
| **Métriques** | Prometheus + Grafana | Counters, Histograms |
| **Logs** | Loki + Grafana | Logs structurés avec TraceId |

La corrélation entre les trois est assurée par le **TraceId** partagé, permettant de naviguer d'un log vers sa trace, et inversement.

### 🎓 Bravo !

Vous avez instrumenté une application Spring Boot complète avec OpenTelemetry, en couvrant :
- L'auto-instrumentation (Java Agent)
- L'instrumentation SDK (Spring Boot Starter)
- Les spans personnalisés (API Tracer + @WithSpan)
- Les attributs, events et status
- Les métriques (Counter, Histogram)
- Les logs corrélés (Logback + Loki)
