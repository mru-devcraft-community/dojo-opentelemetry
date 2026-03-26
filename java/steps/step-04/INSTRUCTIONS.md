# Instructions — Étape 04

## 1. Imports nécessaires

Ajoutez les imports suivants dans `OrderController.java` :

```java
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.StatusCode;
```

## 2. Ajouter des attributs au span "CreateOrder"

Après avoir créé le span et avant la logique métier, ajoutez le nom du client :

```java
span.setAttribute("order.customer_name", request.customerName());
```

Après le calcul du montant total, ajoutez :

```java
span.setAttribute("order.total_amount", totalAmount);
span.setAttribute("order.items_count", (long) request.items().size());
```

## 3. Ajouter un event "OrderValidated"

Après la boucle de validation du stock (à la fin du span ValidateStock), ajoutez un event :

```java
validateSpan.addEvent("OrderValidated", Attributes.of(
    AttributeKey.longKey("validated.items_count"), (long) request.items().size()
));
```

## 4. Ajouter un event "OrderPersisted"

Après la sauvegarde de la commande en base (`orderRepository.save`), ajoutez :

```java
span.addEvent("OrderPersisted", Attributes.of(
    AttributeKey.longKey("order.id"), saved.getId()
));
```

## 5. Gérer le stock insuffisant avec le status ERROR

Quand le stock est insuffisant, avant de retourner la réponse BadRequest :

```java
if (product.getStock() < item.quantity()) {
    String errorMsg = "Stock insuffisant pour le produit " + product.getName();
    validateSpan.setStatus(StatusCode.ERROR, errorMsg);
    span.setStatus(StatusCode.ERROR, errorMsg);
    return ResponseEntity.badRequest().body(errorMsg);
}
```

## 6. Enregistrer les exceptions

Dans le `catch` du span CreateOrder :

```java
catch (Exception e) {
    span.setStatus(StatusCode.ERROR, e.getMessage());
    span.recordException(e);
    throw e;
}
```

## 7. Ajouter le status OK en cas de succès

Juste avant le `return` en cas de succès :

```java
span.setStatus(StatusCode.OK);
```

## 8. Tester

### Cas nominal

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Alice Dupont","items":[{"productId":1,"quantity":1}]}'
```

### Cas d'erreur — stock insuffisant

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Bob Martin","items":[{"productId":1,"quantity":9999}]}'
```

## 9. Observer dans Jaeger

- Les attributs apparaissent dans les **Tags** du span
- Les events apparaissent dans les **Logs** du span
- Le span en erreur est affiché en **rouge**
