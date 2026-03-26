# Étape 04 — Attributs, Events et Status sur les spans

## Contexte

À l'étape précédente, nous avons créé des spans personnalisés. Ils apparaissent dans Jaeger, mais ils ne contiennent aucune **information métier**. Un span nommé "CreateOrder" ne dit pas :
- De quel client il s'agit
- Combien d'articles sont commandés
- Quel est le montant total
- Si tout s'est bien passé ou s'il y a eu une erreur

OpenTelemetry permet d'enrichir les spans avec trois mécanismes :

### 1. Attributs (Attributes)

Les attributs sont des paires clé-valeur ajoutées au span. Ils suivent les **Semantic Conventions** d'OpenTelemetry quand c'est possible :

```java
span.setAttribute("order.customer_name", "Alice Dupont");
span.setAttribute("order.total_amount", 1059.97);
span.setAttribute("order.items_count", 3);
```

Types supportés : `String`, `long`, `double`, `boolean`, et leurs tableaux.

### 2. Events

Les events sont des logs horodatés attachés au span. Ils marquent des moments clés :

```java
span.addEvent("OrderValidated");
span.addEvent("OrderPersisted", Attributes.of(
    AttributeKey.longKey("order.id"), savedOrder.getId()
));
```

### 3. Status

Le status indique si l'opération s'est terminée correctement :

```java
// En cas de succès (optionnel, OK est le défaut)
span.setStatus(StatusCode.OK);

// En cas d'erreur
span.setStatus(StatusCode.ERROR, "Stock insuffisant pour le produit Laptop");

// Enregistrer l'exception complète
span.recordException(exception);
```

Les codes de status : `UNSET` (défaut), `OK`, `ERROR`.

### Visualisation dans Jaeger

Dans Jaeger, les attributs apparaissent dans la section **Tags** du span. Les events apparaissent dans la section **Logs**. Un span avec `StatusCode.ERROR` est affiché en rouge.

## Objectifs

- Ajouter des attributs métier aux spans
- Ajouter des events pour marquer les étapes clés
- Gérer les erreurs avec le status ERROR et recordException
- Observer les informations enrichies dans Jaeger
