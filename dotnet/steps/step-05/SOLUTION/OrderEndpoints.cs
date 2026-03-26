using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using ShopTrack.Api.Data;
using ShopTrack.Api.Models;

namespace ShopTrack.Api.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/orders").WithTags("Orders");

        group.MapGet("/", async (ShopTrackDbContext db) =>
            await db.Orders.Include(o => o.Items).ThenInclude(i => i.Product).ToListAsync());

        group.MapGet("/{id:int}", async (int id, ShopTrackDbContext db) =>
            await db.Orders.Include(o => o.Items).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id) is Order order
                ? Results.Ok(order)
                : Results.NotFound());

        group.MapPost("/", async (CreateOrderRequest request, ShopTrackDbContext db, IHttpClientFactory httpClientFactory) =>
        {
            using var activity = Diagnostics.ActivitySource.StartActivity("CreateOrder");

            activity?.SetTag("order.customer_name", request.CustomerName);
            activity?.SetTag("order.items_count", request.Items.Count);

            var order = new Order
            {
                CustomerName = request.CustomerName,
                Items = new List<OrderItem>()
            };

            using (var validateActivity = Diagnostics.ActivitySource.StartActivity("ValidateStock"))
            {
                foreach (var item in request.Items)
                {
                    var product = await db.Products.FindAsync(item.ProductId);
                    if (product is null)
                    {
                        activity?.SetStatus(ActivityStatusCode.Error, $"Product {item.ProductId} not found");
                        activity?.AddEvent(new ActivityEvent("StockValidationFailed",
                            tags: new ActivityTagsCollection
                            {
                                { "product.id", item.ProductId },
                                { "error.reason", "product_not_found" }
                            }));
                        Diagnostics.OrdersFailed.Add(1);
                        return Results.BadRequest($"Product {item.ProductId} not found");
                    }

                    if (product.Stock < item.Quantity)
                    {
                        activity?.SetStatus(ActivityStatusCode.Error, $"Insufficient stock for product {product.Name}");
                        activity?.AddEvent(new ActivityEvent("StockValidationFailed",
                            tags: new ActivityTagsCollection
                            {
                                { "product.name", product.Name },
                                { "product.stock", product.Stock },
                                { "requested.quantity", item.Quantity },
                                { "error.reason", "insufficient_stock" }
                            }));
                        Diagnostics.OrdersFailed.Add(1);
                        return Results.BadRequest($"Insufficient stock for product {product.Name}");
                    }

                    product.Stock -= item.Quantity;
                    order.Items.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price
                    });
                }

                validateActivity?.AddEvent(new ActivityEvent("OrderValidated"));
            }

            order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);
            activity?.SetTag("order.total_amount", (double)order.TotalAmount);

            db.Orders.Add(order);
            await db.SaveChangesAsync();

            activity?.AddEvent(new ActivityEvent("OrderPersisted",
                tags: new ActivityTagsCollection
                {
                    { "order.id", order.Id }
                }));

            Diagnostics.OrdersCreated.Add(1);
            Diagnostics.OrderTotalAmount.Record((double)order.TotalAmount);

            // Simulate notification call
            var client = httpClientFactory.CreateClient("NotificationService");
            try
            {
                await client.PostAsync("post", new StringContent($"Order {order.Id} created for {order.CustomerName}"));
            }
            catch
            {
                // Notification failure should not block order creation
            }

            return Results.Created($"/api/orders/{order.Id}", order);
        });
    }
}

public record CreateOrderRequest(string CustomerName, List<CreateOrderItemRequest> Items);
public record CreateOrderItemRequest(int ProductId, int Quantity);
