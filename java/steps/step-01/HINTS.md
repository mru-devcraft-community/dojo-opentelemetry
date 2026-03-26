# Indices — Étape 01

<details>
<summary>💡 Le téléchargement de l'agent échoue</summary>

Vérifiez votre connexion Internet. Sinon, téléchargez manuellement depuis :
https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases

Prenez le fichier `opentelemetry-javaagent.jar` de la dernière release.

</details>

<details>
<summary>💡 L'application ne démarre pas avec le javaagent</summary>

Vérifiez l'ordre des arguments :

```bash
# ✅ Correct — -javaagent AVANT -jar
java -javaagent:opentelemetry-javaagent.jar -jar target/shoptrack-api-1.0.0-SNAPSHOT.jar

# ❌ Incorrect — -javaagent APRÈS -jar (sera interprété comme argument de l'app)
java -jar target/shoptrack-api-1.0.0-SNAPSHOT.jar -javaagent:opentelemetry-javaagent.jar
```

</details>

<details>
<summary>💡 Pas de traces dans Jaeger</summary>

1. Vérifiez que l'OTel Collector est démarré : `docker compose ps`
2. Vérifiez que l'endpoint est correct : `http://localhost:4317` (gRPC)
3. Vérifiez les logs de l'application — vous devriez voir :
   ```
   [otel.javaagent] ... opentelemetry-javaagent - version: x.x.x
   ```
4. Attendez quelques secondes après la requête avant de chercher dans Jaeger

</details>

<details>
<summary>💡 Utilisation avec des variables d'environnement</summary>

Alternative aux propriétés système `-D` :

```bash
export OTEL_SERVICE_NAME=shoptrack-api
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
java -javaagent:opentelemetry-javaagent.jar -jar target/shoptrack-api-1.0.0-SNAPSHOT.jar
```

</details>

<details>
<summary>💡 Conflit de port 8080</summary>

Vérifiez qu'aucune autre application n'écoute sur le port 8080 :

```bash
# Linux / macOS
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

Arrêtez le processus en conflit ou changez le port dans `application.yml`.

</details>
