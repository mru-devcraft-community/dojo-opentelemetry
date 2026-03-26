# Indices — Étape 08

<details>
<summary>💡 Le header traceparent n'apparaît pas dans la réponse de httpbin</summary>

Vérifiez que :
1. Le Spring Boot Starter OpenTelemetry est bien dans les dépendances
2. Vous utilisez le `RestTemplate` injecté comme bean Spring (et non un `new RestTemplate()`)
3. L'auto-instrumentation instrumente le `RestTemplate` uniquement s'il est géré par Spring

Si vous créez un `RestTemplate` manuellement, la propagation ne sera pas active.

</details>

<details>
<summary>💡 httpbin.org ne répond pas ou est lent</summary>

httpbin.org est un service public qui peut être lent ou temporairement indisponible.

Alternatives :
- Attendez quelques secondes et réessayez
- Utilisez un timeout sur le RestTemplate :

```java
@Bean
public RestTemplate restTemplate() {
    var factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(Duration.ofSeconds(5));
    factory.setReadTimeout(Duration.ofSeconds(5));
    return new RestTemplate(factory);
}
```

</details>

<details>
<summary>💡 Comment accéder au Trace ID courant dans le code ?</summary>

```java
import io.opentelemetry.api.trace.Span;

String traceId = Span.current().getSpanContext().getTraceId();
String spanId = Span.current().getSpanContext().getSpanId();
```

Cela vous donne le Trace ID et Span ID du span actuellement actif.

</details>

<details>
<summary>💡 La propagation B3 ne fonctionne pas</summary>

Pour activer B3, il faut :

1. Ajouter la propriété dans `application.yml` :
```yaml
otel:
  propagators: tracecontext,baggage,b3
```

2. Vérifier que la dépendance `b3` est disponible. Avec le Spring Boot Starter, elle est incluse.

3. Après la configuration, les deux formats sont envoyés simultanément.

</details>

<details>
<summary>💡 Comment vérifier que deux spans font partie de la même trace ?</summary>

Dans Jaeger :
1. Ouvrez une trace
2. Vérifiez le Trace ID en haut de la page
3. Tous les spans listés partagent ce Trace ID
4. La hiérarchie parent-enfant est affichée visuellement (indentation)

Le span de la requête entrante (server) est le parent du span de l'appel HTTP sortant (client).

</details>
