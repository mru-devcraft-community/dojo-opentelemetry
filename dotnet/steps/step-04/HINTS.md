# Step 04 — Indices

## Comment ajouter un attribut (tag) ?

<details>
<summary>💡 Indice 1 — SetTag</summary>

```csharp
activity?.SetTag("order.customer_name", request.CustomerName);
activity?.SetTag("order.items_count", request.Items.Count);
```

Les types supportés : `string`, `int`, `long`, `double`, `bool`, `string[]`, `int[]`, `long[]`, `double[]`, `bool[]`.
</details>

## Comment ajouter un event ?

<details>
<summary>💡 Indice 2 — AddEvent simple</summary>

```csharp
activity?.AddEvent(new ActivityEvent("OrderValidated"));
```
</details>

## Comment ajouter un event avec des attributs ?

<details>
<summary>💡 Indice 3 — AddEvent avec tags</summary>

```csharp
activity?.AddEvent(new ActivityEvent("OrderPersisted",
    tags: new ActivityTagsCollection
    {
        { "order.id", order.Id }
    }));
```
</details>

## Comment poser un status Error ?

<details>
<summary>💡 Indice 4 — SetStatus</summary>

```csharp
activity?.SetStatus(ActivityStatusCode.Error, "Insufficient stock for product X");
```

N'oubliez pas le `using System.Diagnostics;` en haut du fichier.
</details>

## Où placer les attributs dans le code ?

<details>
<summary>💡 Indice 5 — Placement des enrichissements</summary>

```csharp
group.MapPost("/", async (...) =>
{
    using var activity = Diagnostics.ActivitySource.StartActivity("CreateOrder");
    
    // Attributs connus dès le début
    activity?.SetTag("order.customer_name", request.CustomerName);
    activity?.SetTag("order.items_count", request.Items.Count);

    var order = new Order { ... };

    using (var validateActivity = Diagnostics.ActivitySource.StartActivity("ValidateStock"))
    {
        foreach (var item in request.Items)
        {
            // ... 
            if (product.Stock < item.Quantity)
            {
                activity?.SetStatus(ActivityStatusCode.Error, $"Insufficient stock for {product.Name}");
                activity?.AddEvent(new ActivityEvent("StockValidationFailed", 
                    tags: new ActivityTagsCollection { { "product.name", product.Name } }));
                return Results.BadRequest(...);
            }
            // ...
        }
        validateActivity?.AddEvent(new ActivityEvent("OrderValidated"));
    }

    order.TotalAmount = ...;
    activity?.SetTag("order.total_amount", (double)order.TotalAmount);

    await db.SaveChangesAsync();
    activity?.AddEvent(new ActivityEvent("OrderPersisted",
        tags: new ActivityTagsCollection { { "order.id", order.Id } }));

    // ... notification ...
});
```
</details>
