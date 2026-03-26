# Instructions — Étape 09

## 1. Configurer le sampling à 50%

Dans `src/main/resources/application.yml`, ajoutez la configuration de sampling :

```yaml
otel:
  traces:
    sampler: traceidratio
    sampler-arg: "0.5"
```

> **Note** : Le sampler `traceidratio` est wrappé automatiquement dans un `ParentBased` sampler par le Spring Boot Starter.

## 2. Relancer et tester

```bash
mvn spring-boot:run
```

Faites 20 requêtes :

```bash
for i in $(seq 1 20); do
  curl -s http://localhost:8080/api/products > /dev/null
  echo "Requête $i envoyée"
done
```

## 3. Compter les traces dans Jaeger

1. Ouvrez Jaeger (http://localhost:16686)
2. Service : `shoptrack-api`
3. Opération : `GET /api/products`
4. Limit results : 20
5. Cliquez **Find Traces**

Comptez le nombre de traces trouvées :
- Avec un ratio de 0.5, vous devriez avoir environ **10 traces** (±3)
- Le sampling est probabiliste, le résultat exact varie

## 4. Tester différents ratios

Changez le ratio et observez l'effet :

### Ratio 0.1 (10% des traces)
```yaml
otel:
  traces:
    sampler: traceidratio
    sampler-arg: "0.1"
```

### Ratio 1.0 (100% — équivalent à AlwaysOn)
```yaml
otel:
  traces:
    sampler: traceidratio
    sampler-arg: "1.0"
```

### AlwaysOff (aucune trace)
```yaml
otel:
  traces:
    sampler: always_off
```

> Relancez l'application après chaque changement.

## 5. Configurer via variables d'environnement

Au lieu de modifier `application.yml`, on peut utiliser des variables d'environnement (utile en production et Kubernetes) :

```bash
OTEL_TRACES_SAMPLER=traceidratio \
OTEL_TRACES_SAMPLER_ARG=0.5 \
mvn spring-boot:run
```

Les variables d'environnement prennent priorité sur la configuration YAML.

Autres options possibles :
```bash
# AlwaysOn
OTEL_TRACES_SAMPLER=always_on

# AlwaysOff
OTEL_TRACES_SAMPLER=always_off

# ParentBased avec TraceIdRatio root
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.5
```

## 6. Comprendre ParentBased

Le sampler `parentbased_traceidratio` fonctionne ainsi :
- Si la requête entrante a un parent **échantillonné** → le span est échantillonné
- Si la requête entrante a un parent **non échantillonné** → le span n'est PAS échantillonné
- Si c'est une **nouvelle trace** (root span) → on applique le ratio (ex: 50%)

C'est le mode par défaut et le plus approprié pour la production.

## 7. Revenir à AlwaysOn

Pour la suite du DoJo, revenez à la configuration par défaut (ou supprimez la section sampling) :

```yaml
otel:
  traces:
    sampler: always_on
```

Ou simplement supprimez les lignes ajoutées — le défaut est `parentbased_always_on`.
