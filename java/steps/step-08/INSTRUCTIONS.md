# Instructions — Étape 08

## 1. Observer les headers propagés via httpbin.org

Le service httpbin.org a un endpoint `/headers` qui retourne les headers reçus — parfait pour observer la propagation.

Modifiez `NotificationService` pour ajouter une méthode qui appelle `/headers` :

```java
public String getOutgoingHeaders() {
    return restTemplate.getForObject("https://httpbin.org/headers", String.class);
}
```

Créez un endpoint dans un nouveau contrôleur ou dans `ProductController` pour appeler cette méthode :

```java
@GetMapping("/api/propagation/headers")
public String checkPropagationHeaders() {
    return notificationService.getOutgoingHeaders();
}
```

Appelez l'endpoint :
```bash
curl http://localhost:8080/api/propagation/headers | jq
```

Dans la réponse de httpbin, vous devriez voir le header `Traceparent` — preuve que le `RestTemplate` propage automatiquement le contexte.

## 2. Analyser le format du header traceparent

Le header retourné ressemble à :
```json
{
  "headers": {
    "Traceparent": "00-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6-789abcdef0123456-01"
  }
}
```

Décomposez-le :
- `00` → Version du protocole W3C
- `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6` → Trace ID (32 caractères hex)
- `789abcdef0123456` → Span ID du parent (16 caractères hex)
- `01` → Flags (01 = trace échantillonnée)

## 3. Créer le ChainController pour la propagation multi-hops

Créez le fichier `ChainController.java` dans le package `com.shoptrack.controller` :

```java
@RestController
@RequestMapping("/api/chain")
public class ChainController {
    // Injectez RestTemplate et un Logger
    // Créer un endpoint GET qui :
    //   1. Logge le début de la chaîne
    //   2. Appelle httpbin.org/headers pour observer les headers propagés
    //   3. Retourne les informations de propagation
}
```

L'endpoint doit :
1. Logger le Trace ID courant
2. Appeler `https://httpbin.org/headers` pour voir les headers envoyés
3. Retourner un objet JSON contenant :
   - Un message
   - Les headers reçus par httpbin (preuve de propagation)

## 4. Observer la trace dans Jaeger

1. Appelez l'endpoint :
```bash
curl http://localhost:8080/api/chain | jq
```

2. Ouvrez Jaeger (http://localhost:16686)
3. Recherchez les traces du service `shoptrack-api`
4. Trouvez la trace correspondante

Vérifiez que :
- La trace contient un span pour la requête entrante (`GET /api/chain`)
- La trace contient un span pour l'appel HTTP sortant (`HTTP GET httpbin.org`)
- Les deux spans partagent le même Trace ID

## 5. Tester la propagation B3

Par défaut, le Spring Boot Starter utilise W3C Trace Context. Pour ajouter aussi B3, configurez dans `application.yml` :

```yaml
otel:
  propagators: tracecontext,baggage,b3
```

Relancez l'application et appelez l'endpoint. httpbin devrait maintenant montrer les deux formats :
- `Traceparent` (W3C)
- `B3` ou `X-B3-Traceid` (Zipkin)

> **Note** : Revenez à la configuration par défaut (`tracecontext,baggage`) après le test.
