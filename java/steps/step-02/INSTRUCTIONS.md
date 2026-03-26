# Instructions — Étape 02

## 1. Ajouter le BOM OpenTelemetry dans `pom.xml`

Dans la section `<dependencyManagement>` (à créer si elle n'existe pas), ajoutez :

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom</artifactId>
            <version>2.11.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## 2. Ajouter la dépendance Spring Boot Starter

Dans la section `<dependencies>`, ajoutez :

```xml
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

> La version est gérée automatiquement par le BOM.

## 3. Configurer OpenTelemetry dans `application.yml`

Ajoutez la configuration suivante à la fin de votre `application.yml` :

```yaml
otel:
  exporter:
    otlp:
      endpoint: http://localhost:4317
  resource:
    attributes:
      service.name: shoptrack-api
```

## 4. Lancer l'application SANS le Java Agent

```bash
mvn spring-boot:run
```

Ou bien :

```bash
mvn clean package -DskipTests
java -jar target/shoptrack-api-1.0.0-SNAPSHOT.jar
```

> **Attention** : ne pas utiliser `-javaagent` cette fois-ci. L'instrumentation est maintenant intégrée.

## 5. Générer du trafic

```bash
curl http://localhost:8080/api/products

curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Bob Martin",
    "items": [{"productId": 1, "quantity": 1}]
  }'
```

## 6. Vérifier dans Jaeger

Ouvrez http://localhost:16686, sélectionnez le service `shoptrack-api` et vérifiez que les traces apparaissent, avec la même structure que dans l'étape précédente.
