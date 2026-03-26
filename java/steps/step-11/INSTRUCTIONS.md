# Instructions — Étape 11

## 1. Simuler de la latence dans NotificationService

Modifiez `NotificationService.notifyOrderCreated()` pour ajouter un délai aléatoire :

```java
import java.util.Random;

private final Random random = new Random();

public void notifyOrderCreated(Long orderId, String customerName) {
    try {
        // Simuler une latence variable (100ms à 2000ms)
        int delay = random.nextInt(100, 2000);
        Thread.sleep(delay);
        log.info("Notification envoyée pour la commande {} (délai simulé: {}ms)", orderId, delay);
        
        restTemplate.postForObject(
            "https://httpbin.org/post",
            "Order " + orderId + " created for " + customerName,
            String.class
        );
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        log.warn("Notification interrompue pour la commande {}", orderId);
    } catch (Exception e) {
        log.warn("Échec de notification pour la commande {}: {}", orderId, e.getMessage());
    }
}
```

## 2. Identifier le goulot d'étranglement

1. Lancez l'application et créez quelques commandes :

```bash
for i in $(seq 1 5); do
  curl -s -X POST http://localhost:8080/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Debug Client '$i'","items":[{"productId":2,"quantity":1}]}' &
done
wait
```

2. Ouvrez Jaeger (http://localhost:16686)
3. Service : `shoptrack-api`, trié par **Longest First**
4. Ouvrez une trace lente

Observez :
- Le span `NotificationService.notifyOrderCreated` (ou son équivalent) prend la majorité du temps
- Le `Thread.sleep` ajoute 100ms à 2000ms de latence
- L'appel HTTP à httpbin ajoute encore du temps réseau

## 3. Ajouter du Baggage pour le debugging

Créez un contrôleur `DebugController` qui utilise le Baggage pour propager un identifiant de session de debug.

Le Baggage permet de transporter des informations à travers toute la chaîne d'appels :

```java
import io.opentelemetry.api.baggage.Baggage;
import io.opentelemetry.context.Scope;
```

Dans l'endpoint :
```java
// Créer un baggage avec un identifiant de session de debug
Baggage baggage = Baggage.current().toBuilder()
    .put("debug.session_id", sessionId)
    .put("debug.initiated_by", "manual-debug")
    .build();

try (Scope scope = baggage.makeCurrent()) {
    // Tout appel fait dans ce scope propagera le baggage
    // Faire des appels aux autres services...
}
```

## 4. Créer le DebugController

Créez `DebugController.java` dans le package `com.shoptrack.controller` avec :

### Endpoint GET `/api/debug/slow-order`

Cet endpoint simule une commande lente pour le debugging :
1. Crée un Baggage avec un `debug.session_id` unique
2. Logge le début du debugging
3. Simule une opération lente (Thread.sleep)
4. Appelle httpbin.org pour observer la propagation
5. Retourne les informations de debugging

### Endpoint GET `/api/debug/trace-info`

Cet endpoint retourne les informations de tracing actuelles :
1. Trace ID courant
2. Span ID courant
3. Baggage items actifs

## 5. Analyser le processus de debugging

Workflow de debugging avec OpenTelemetry :

1. **Détection** : Les métriques (dashboard Grafana) montrent une augmentation de la latence
2. **Investigation** : Les traces (Jaeger) révèlent les spans lents
3. **Corrélation** : Les logs (Loki) donnent le contexte métier
4. **Confirmation** : Le Baggage permet de tracer une session de debug spécifique

Lancez le debugging :
```bash
curl http://localhost:8080/api/debug/slow-order | jq
```

Dans Jaeger, recherchez la trace et identifiez :
- Quel span est le plus lent
- Les attributs de debugging (session_id)
- La corrélation avec les logs
