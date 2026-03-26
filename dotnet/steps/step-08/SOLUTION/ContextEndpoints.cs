using System.Diagnostics;

namespace ShopTrack.Api.Endpoints;

public static class ContextEndpoints
{
    public static void MapContextEndpoints(this WebApplication app)
    {
        app.MapGet("/api/context", (HttpContext httpContext) =>
        {
            var traceparent = httpContext.Request.Headers["traceparent"].ToString();
            var tracestate = httpContext.Request.Headers["tracestate"].ToString();

            var activity = Activity.Current;

            return Results.Ok(new
            {
                incomingHeaders = new
                {
                    traceparent,
                    tracestate
                },
                currentActivity = new
                {
                    traceId = activity?.TraceId.ToString(),
                    spanId = activity?.SpanId.ToString(),
                    parentSpanId = activity?.ParentSpanId.ToString(),
                    operationName = activity?.OperationName,
                    displayName = activity?.DisplayName
                },
                explanation = new
                {
                    format = "00-{traceId 32 hex}-{spanId 16 hex}-{flags 2 hex}",
                    note = "Si vous envoyez un header traceparent, le TraceId ci-dessus correspondra au TraceId du header."
                }
            });
        })
        .WithTags("Context");
    }
}
