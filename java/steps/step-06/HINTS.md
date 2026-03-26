# Indices — Étape 06

<details>
<summary>💡 Le fichier logback-spring.xml n'est pas pris en compte</summary>

Vérifiez que le fichier est bien dans `src/main/resources/logback-spring.xml` (et non `logback.xml` tout court).

Spring Boot détecte automatiquement `logback-spring.xml` et l'utilise à la place de la configuration par défaut.

Si vous avez aussi un `logback.xml`, supprimez-le — il a priorité sur `logback-spring.xml`.

</details>

<details>
<summary>💡 Les trace_id et span_id sont vides dans les logs</summary>

Le MDC est rempli automatiquement par le Spring Boot Starter OpenTelemetry quand un span est actif.

Vérifiez que :
1. Le Spring Boot Starter est bien dans les dépendances
2. Vous logguez **à l'intérieur** d'un span (dans une requête HTTP)
3. Les logs au démarrage (hors requête HTTP) n'auront pas de trace_id — c'est normal

</details>

<details>
<summary>💡 L'appender OTEL ne fonctionne pas</summary>

Vérifiez :
1. La dépendance `opentelemetry-logback-appender-1.0` est dans le pom.xml
2. Le nom de la classe dans logback-spring.xml est exact :
   `io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender`
3. Notez le `v1_0` (underscore, pas un point)

</details>

<details>
<summary>💡 Les logs n'apparaissent pas dans Loki</summary>

1. Vérifiez que Loki est démarré : `docker compose ps`
2. Vérifiez que le Collector est configuré pour exporter vers Loki dans `otel-collector-config.yml`
3. Vérifiez la source de données Loki dans Grafana : **Configuration > Data Sources**
4. Attendez 10-30 secondes après avoir généré des logs

</details>

<details>
<summary>💡 Comment écrire des logs structurés avec SLF4J ?</summary>

SLF4J utilise les `{}` comme placeholders :

```java
// ✅ Correct — le paramètre remplace {}
log.info("Commande {} créée pour {}", orderId, customerName);

// ❌ Incorrect — concaténation de chaînes (moins performant)
log.info("Commande " + orderId + " créée pour " + customerName);
```

Pour les exceptions, passez l'exception en dernier argument :

```java
log.error("Erreur pour la commande {}", orderId, exception);
```

Le stacktrace sera automatiquement inclus.

</details>

<details>
<summary>💡 Comment trouver le TraceId dans Jaeger ?</summary>

Dans Jaeger, le Trace ID est affiché en haut de chaque trace. Il ressemble à :

```
Trace ID: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
```

Copiez-le et utilisez-le dans une requête Loki pour retrouver les logs associés.

</details>
