using System.Diagnostics;

namespace ShopTrack.Api.Endpoints;

public static class DebugEndpoints
{
    public static void MapDebugEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/debug").WithTags("Debug");

        // GET /api/debug/slow-order — Simule une commande lente avec Baggage de debug
        group.MapGet("/slow-order", async (IHttpClientFactory httpClientFactory) =>
        {
            // Générer un identifiant de session de debug
            var sessionId = Guid.NewGuid().ToString("N")[..8];

            // Ajouter au Baggage (propagé via en-têtes HTTP W3C Baggage)
            Activity.Current?.AddBaggage("debug.session_id", sessionId);

            // Copier comme tag pour visibilité dans Jaeger
            Activity.Current?.SetTag("debug.session_id", sessionId);

            // Simuler une latence aléatoire (comme un service externe lent)
            var delay = Random.Shared.Next(100, 2000);
            await Task.Delay(delay);

            // Appel HTTP simulé (notification)
            var client = httpClientFactory.CreateClient("NotificationService");
            try
            {
                await client.PostAsync("post", new StringContent($"Debug slow order - session {sessionId}"));
            }
            catch
            {
                // Ignorer les erreurs de notification
            }

            var traceId = Activity.Current?.TraceId.ToString() ?? "unknown";

            return Results.Ok(new
            {
                sessionId,
                traceId,
                message = "Slow order simulation completed",
                simulatedDelay = delay
            });
        });

        // GET /api/debug/trace-info — Retourne les informations de trace courantes
        group.MapGet("/trace-info", () =>
        {
            var activity = Activity.Current;

            var baggageItems = new Dictionary<string, string?>();
            if (activity?.Baggage != null)
            {
                foreach (var item in activity.Baggage)
                {
                    baggageItems[item.Key] = item.Value;
                }
            }

            return Results.Ok(new
            {
                traceId = activity?.TraceId.ToString() ?? "no-active-trace",
                spanId = activity?.SpanId.ToString() ?? "no-active-span",
                baggageItems
            });
        });
    }
}
