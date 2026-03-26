using Microsoft.EntityFrameworkCore;
using ShopTrack.Api.Data;
using ShopTrack.Api.Models;

namespace ShopTrack.Api.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", async (ShopTrackDbContext db) =>
            await db.Products.ToListAsync());

        group.MapGet("/{id:int}", async (int id, ShopTrackDbContext db) =>
            await db.Products.FindAsync(id) is Product product
                ? Results.Ok(product)
                : Results.NotFound());

        group.MapPost("/", async (Product product, ShopTrackDbContext db) =>
        {
            db.Products.Add(product);
            await db.SaveChangesAsync();
            return Results.Created($"/api/products/{product.Id}", product);
        });

        group.MapPut("/{id:int}", async (int id, Product input, ShopTrackDbContext db) =>
        {
            var product = await db.Products.FindAsync(id);
            if (product is null) return Results.NotFound();

            product.Name = input.Name;
            product.Description = input.Description;
            product.Price = input.Price;
            product.Stock = input.Stock;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id, ShopTrackDbContext db) =>
        {
            var product = await db.Products.FindAsync(id);
            if (product is null) return Results.NotFound();

            db.Products.Remove(product);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
