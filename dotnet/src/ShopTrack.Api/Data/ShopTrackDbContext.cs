using Microsoft.EntityFrameworkCore;
using ShopTrack.Api.Models;

namespace ShopTrack.Api.Data;

public class ShopTrackDbContext : DbContext
{
    public ShopTrackDbContext(DbContextOptions<ShopTrackDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Laptop", Description = "High-performance laptop", Price = 999.99m, Stock = 50 },
            new Product { Id = 2, Name = "Mouse", Description = "Wireless mouse", Price = 29.99m, Stock = 200 },
            new Product { Id = 3, Name = "Keyboard", Description = "Mechanical keyboard", Price = 79.99m, Stock = 100 }
        );
    }
}
