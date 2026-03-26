# Step 04 — Instructions

## Prérequis

Vous devez avoir complété le **Step 03** (spans custom `CreateOrder` et `ValidateStock`).

## Étapes

### 1. Ajouter des attributs au span CreateOrder

Dans `OrderEndpoints.cs`, après avoir créé le span `CreateOrder`, ajoutez des attributs métier :

- `order.customer_name` — Le nom du client
- `order.items_count` — Le nombre d'articles dans la commande

Après le calcul du total, ajoutez aussi :
- `order.total_amount` — Le montant total de la commande

> **Rappel** : Utilisez `activity?.SetTag("clé", valeur)`. Le `?` est important car `StartActivity()` peut retourner `null` si l'ActivitySource n'est pas écouté.

### 2. Ajouter un event "OrderValidated"

Après la boucle de validation du stock (à la fin du span `ValidateStock`), ajoutez un event pour marquer que la validation est passée avec succès :

```
OrderValidated
```

### 3. Ajouter un event "OrderPersisted"

Après `await db.SaveChangesAsync()`, ajoutez un event pour marquer que la commande a été sauvegardée en base :

```
OrderPersisted
```

Ajoutez un attribut à cet event avec l'`OrderId` de la commande sauvegardée.

### 4. Gérer le status Error

Quand la validation du stock échoue (stock insuffisant ou produit introuvable), avant de retourner `BadRequest` :
- Posez le status `Error` sur le span `CreateOrder` avec un message descriptif
- Ajoutez un event "StockValidationFailed"

### 5. Relancer et tester

```bash
cd dotnet/src
dotnet run --project ShopTrack.AppHost
```

#### Commande réussie :
```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Grace","items":[{"productId":1,"quantity":1}]}'
```

#### Commande échouée (stock insuffisant) :
```bash
curl -X POST http://localhost:<port>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Hacker","items":[{"productId":2,"quantity":9999}]}'
```

### 6. Observer dans Jaeger

1. Ouvrez [http://localhost:16686](http://localhost:16686)
2. Trouvez la trace de la commande réussie : vérifiez les attributs et events
3. Trouvez la trace de la commande échouée : vérifiez le status Error et l'event d'échec
