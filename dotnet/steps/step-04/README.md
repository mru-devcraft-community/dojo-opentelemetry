# Step 04 — Attributs, Events et Status sur les spans

## Contexte

Un span seul avec juste un nom donne une vue structurelle (quelle opération, combien de temps), mais pour **diagnostiquer** un problème, on a besoin de plus de contexte. C'est le rôle des **attributs**, **events** et **status**.

### Les Attributs (Tags)

Les attributs sont des **paires clé-valeur** attachées à un span. Ils donnent du contexte métier :

```csharp
activity?.SetTag("order.customer_name", "Alice");
activity?.SetTag("order.total_amount", 129.97);
activity?.SetTag("order.items_count", 3);
```

> **Conventions sémantiques** : OpenTelemetry définit des conventions pour les noms d'attributs. Pour la logique métier, utilisez un préfixe lié à votre domaine (ex: `order.`, `product.`).

### Les Events

Les events sont des **annotations ponctuelles** (avec timestamp) attachées à un span. Ils marquent un moment précis dans l'exécution :

```csharp
activity?.AddEvent(new ActivityEvent("OrderValidated"));
activity?.AddEvent(new ActivityEvent("PaymentProcessed", 
    tags: new ActivityTagsCollection { { "payment.method", "card" } }));
```

À la différence des attributs (qui décrivent le span), les events **racontent ce qui s'est passé** pendant le span.

### Le Status

Le status indique si l'opération a **réussi** ou **échoué** :

| Status | Signification |
|--------|--------------|
| `Unset` | Par défaut, pas d'information explicite |
| `Ok` | L'opération a réussi (rarement utile à poser explicitement) |
| `Error` | L'opération a échoué |

```csharp
activity?.SetStatus(ActivityStatusCode.Error, "Insufficient stock");
```

> **Bonne pratique** : Ne posez `Error` que quand c'est une vraie erreur. Un `404 Not Found` n'est pas forcément une erreur côté serveur.

## Objectif de ce step

Enrichir les spans custom créés au step précédent avec des attributs métier, des events et des status appropriés.
