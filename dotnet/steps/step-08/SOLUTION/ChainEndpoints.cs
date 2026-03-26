using ShopTrack.Api.Data;

namespace ShopTrack.Api.Endpoints;

public static class ChainEndpoints
{
    public static void MapChainEndpoints(this WebApplication app)
    {
        app.MapGet("/api/chain", async (IHttpClientFactory httpClientFactory) =>
        {
            var client = httpClientFactory.CreateClient("NotificationService");

            // Cet appel propage automatiquement le contexte de trace (header traceparent)
            var response = await client.GetAsync("https://httpbin.org/headers");
            var body = await response.Content.ReadAsStringAsync();

            return Results.Ok(new { message = "Chain call completed", httpbinHeaders = body });
        })
        .WithTags("Chain");
    }
}
