# Indices — Étape 11

<details>
<summary>💡 L'import de Baggage ne compile pas</summary>

Vérifiez les imports :
```java
import io.opentelemetry.api.baggage.Baggage;
import io.opentelemetry.context.Scope;
```

Le Baggage fait partie de l'API OpenTelemetry, qui est déjà incluse via le Spring Boot Starter.

</details>

<details>
<summary>💡 Le Baggage n'apparaît pas dans Jaeger</summary>

Le Baggage n'est **pas** automatiquement ajouté comme attribut de span. C'est voulu — le Baggage est un mécanisme de **propagation**, pas de **reporting**.

Pour voir le Baggage dans les spans, vous devez l'ajouter manuellement :
```java
String sessionId = Baggage.current().getEntryValue("debug.session_id");
if (sessionId != null) {
    Span.current().setAttribute("debug.session_id", sessionId);
}
```

Ou utilisez un `SpanProcessor` qui copie automatiquement certains Baggage items vers les attributs de span.

</details>

<details>
<summary>💡 Comment trouver les traces les plus lentes dans Jaeger ?</summary>

1. Dans Jaeger, sélectionnez le service `shoptrack-api`
2. Dans **Sort**, choisissez **Longest First**
3. Les traces les plus lentes apparaissent en premier
4. Ouvrez une trace et regardez la timeline

Le span le plus large visuellement est le goulot d'étranglement. Survolez-le pour voir sa durée exacte.

</details>

<details>
<summary>💡 Thread.sleep lance une InterruptedException</summary>

`Thread.sleep()` est une méthode bloquante qui peut être interrompue. Gérez l'exception :

```java
try {
    Thread.sleep(delay);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt(); // Restaurer le flag d'interruption
    log.warn("Sleep interrompu");
}
```

Ne pas ignorer `InterruptedException` — restaurez toujours le flag d'interruption.

</details>

<details>
<summary>💡 Comment lire les valeurs du Baggage dans le code ?</summary>

```java
// Lire une valeur du Baggage courant
String value = Baggage.current().getEntryValue("debug.session_id");

// Lister toutes les entrées du Baggage
Baggage.current().forEach((key, baggageEntry) -> {
    log.info("Baggage: {} = {}", key, baggageEntry.getValue());
});
```

Le Baggage est propagé automatiquement dans les headers HTTP par le propagateur `baggage` (actif par défaut avec le Spring Boot Starter).

</details>

<details>
<summary>💡 Comment créer un UUID en Java ?</summary>

```java
import java.util.UUID;

String sessionId = UUID.randomUUID().toString();
```

Cela génère un identifiant unique comme `550e8400-e29b-41d4-a716-446655440000`.

</details>
