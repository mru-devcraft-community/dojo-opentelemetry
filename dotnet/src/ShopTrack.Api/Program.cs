using Scalar.AspNetCore;
using ShopTrack.Api.Data;
using ShopTrack.Api.Endpoints;
using ShopTrack.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.AddNpgsqlDbContext<ShopTrackDbContext>("shoptrackdb");

builder.Services.AddHttpClient("NotificationService", client =>
{
    client.BaseAddress = new Uri("https://httpbin.org/");
});

builder.Services.AddOpenApi();

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Ensure DB is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopTrackDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.MapProductEndpoints();
app.MapOrderEndpoints();

app.Run();
