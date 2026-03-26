# Validation — Étape 07

## ✅ Checklist

### 1. Corrélation Logs → Traces

- [ ] Les logs en console contiennent `trace_id` non vide
- [ ] Dans Grafana/Loki, les logs apparaissent avec le champ `trace_id`
- [ ] On peut copier un `trace_id` d'un log et retrouver la trace dans Jaeger

### 2. Configuration des Exemplars

- [ ] Le Collector a `enable_open_metrics: true` dans l'exporteur Prometheus
- [ ] Prometheus scrape le Collector correctement

### 3. Navigation Métriques → Traces (Exemplars)

1. Ouvrez Grafana > Explore > Prometheus
2. Requête : `orders_total_amount_bucket`
3. Activez **Exemplars** dans les options de requête

- [ ] Des petits losanges (exemplars) apparaissent sur le graphique
- [ ] Le survol d'un exemplar montre un `traceID`
- [ ] Le clic ouvre la trace correspondante dans Jaeger

### 4. Navigation Logs → Traces

1. Ouvrez Grafana > Explore > Loki
2. Requête : `{service_name="shoptrack-api"} | json`
3. Développez une ligne de log

- [ ] Le champ `traceID` ou `trace_id` est visible
- [ ] Le lien vers Jaeger fonctionne (si configuré)

### 5. Navigation Traces → Logs

1. Ouvrez Jaeger, sélectionnez une trace
2. Copiez le Trace ID
3. Dans Grafana/Loki :

```logql
{service_name="shoptrack-api"} | json | trace_id = "<TRACE_ID>"
```

- [ ] Les logs correspondant à cette trace sont retournés
- [ ] Les timestamps et les données métier correspondent

### 6. Flux complet de corrélation

Scénario de vérification :
1. Créez une commande via curl
2. Trouvez le log de création dans Loki
3. Depuis le log, naviguez vers la trace dans Jaeger
4. Vérifiez les métriques `orders.created` et `orders.total_amount`
5. Si un exemplar est visible, vérifiez qu'il pointe vers la même trace

- [ ] Le flux complet Logs → Traces → Métriques fonctionne
