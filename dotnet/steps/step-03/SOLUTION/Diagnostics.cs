using System.Diagnostics;

namespace ShopTrack.Api;

public static class Diagnostics
{
    public static readonly ActivitySource ActivitySource = new("ShopTrack.Api");
}
