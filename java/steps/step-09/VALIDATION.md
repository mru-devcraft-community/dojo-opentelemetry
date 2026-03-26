# Validation — Étape 09

## ✅ Checklist

### 1. Le projet compile et démarre

```bash
mvn clean compile
mvn spring-boot:run
```

### 2. Sampling à 50% — vérification

Configuration :
```yaml
otel:
  traces:
    sampler: traceidratio
    sampler-arg: "0.5"
```

Envoyez 20 requêtes :
```bash
for i in $(seq 1 20); do
  curl -s http://localhost:8080/api/products > /dev/null
done
```

Comptez les traces dans Jaeger :
- [ ] Le nombre de traces est environ 10 (±5)
- [ ] Ce n'est PAS 20 (sinon le sampling ne fonctionne pas)
- [ ] Ce n'est PAS 0 (sinon le sampling est trop agressif)

### 3. Sampling à 10% — vérification

Configuration : `sampler-arg: "0.1"`

Envoyez 50 requêtes et comptez :
- [ ] Le nombre de traces est environ 5 (±3)

### 4. AlwaysOff — vérification

Configuration : `sampler: always_off`

Envoyez 10 requêtes :
- [ ] Aucune trace n'apparaît dans Jaeger

### 5. Variables d'environnement

```bash
OTEL_TRACES_SAMPLER=traceidratio OTEL_TRACES_SAMPLER_ARG=0.5 mvn spring-boot:run
```

- [ ] Le sampling fonctionne via les variables d'environnement
- [ ] Le comportement est identique à la configuration YAML

### 6. Retour à AlwaysOn

Supprimez ou commentez la configuration de sampling :
- [ ] Toutes les traces apparaissent de nouveau dans Jaeger
- [ ] L'application est prête pour les étapes suivantes
