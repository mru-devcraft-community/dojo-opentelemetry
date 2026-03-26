$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
$env:DOTNET_ASPIRE_CONTAINER_RUNTIME = 'podman'
Set-Location $PSScriptRoot
dotnet aspire run --project ShopTrack.AppHost --launch-profile http
