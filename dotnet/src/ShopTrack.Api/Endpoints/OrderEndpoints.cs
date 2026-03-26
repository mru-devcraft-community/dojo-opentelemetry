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
            var order = new Order
            {
                CustomerName = request.CustomerName,
                Items = new List<OrderItem>()
            };

            foreach (var item in request.Items)
            {
                var product = await db.Products.FindAsync(item.ProductId);
                if (product is null)
                    return Results.BadRequest($"Product {item.ProductId} not found");

                if (product.Stock < item.Quantity)
                    return Results.BadRequest($"Insufficient stock for product {product.Name}");

                product.Stock -= item.Quantity;
                order.Items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });
            }

            order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

            db.Orders.Add(order);
            await db.SaveChangesAsync();

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
