using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace ShopTrack.Api;

public static class Diagnostics
{
    public static readonly ActivitySource ActivitySource = new("ShopTrack.Api");
    public static readonly Meter Meter = new("ShopTrack.Api");

    public static readonly Counter<long> OrdersCreated =
        Meter.CreateCounter<long>("orders.created", "orders", "Number of orders created");

    public static readonly Counter<long> OrdersFailed =
        Meter.CreateCounter<long>("orders.failed", "orders", "Number of failed orders");

    public static readonly Histogram<double> OrderTotalAmount =
        Meter.CreateHistogram<double>("orders.total_amount", "USD", "Order total amount distribution");
}
