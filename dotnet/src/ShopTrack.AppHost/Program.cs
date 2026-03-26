var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .AddDatabase("shoptrackdb");

var api = builder.AddProject<Projects.ShopTrack_Api>("shoptrack-api")
    .WithReference(postgres)
    .WaitFor(postgres);

builder.Build().Run();
