using OpenTelemetry.Trace;
using ShopTrack.Api;
using ShopTrack.Api.Data;
using ShopTrack.Api.Endpoints;
using ShopTrack.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddNpgsqlDbContext<ShopTrackDbContext>("shoptrackdb");

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing.AddSource(Diagnostics.ActivitySource.Name);

        // --- Option 1 : Ratio 50% ---
        // tracing.SetSampler(new TraceIdRatioBasedSampler(0.5));

        // --- Option 2 : AlwaysOff (aucune trace) ---
        // tracing.SetSampler(new AlwaysOffSampler());

        // --- Option 3 : ParentBased avec ratio 50% pour les nouvelles traces ---
        // tracing.SetSampler(new ParentBasedSampler(new TraceIdRatioBasedSampler(0.5)));

        // --- Option 4 : Via variables d'environnement (pas de SetSampler dans le code) ---
        // OTEL_TRACES_SAMPLER=parentbased_traceidratio
        // OTEL_TRACES_SAMPLER_ARG=0.5

        // --- Défaut : AlwaysOn (pas de SetSampler = tout est capturé) ---
    })
    .WithMetrics(metrics => metrics.AddMeter(Diagnostics.Meter.Name));

builder.Services.AddHttpClient("NotificationService", client =>
{
    client.BaseAddress = new Uri("https://httpbin.org/");
});

var app = builder.Build();
app.MapDefaultEndpoints();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopTrackDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.MapProductEndpoints();
app.MapOrderEndpoints();
app.MapChainEndpoints();
app.MapContextEndpoints();

app.Run();
