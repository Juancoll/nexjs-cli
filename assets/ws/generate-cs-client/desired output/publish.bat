del template.api.wsclient.*.nupkg
.\.nuget\nuget.exe restore
.\.nuget\nuget.exe pack -Build -OutputDirectory .\ .\template.api.wsclient.csproj
.\.nuget\nuget.exe push -Source "nodall-dev" -ApiKey myazurekey .\template.api.wsclient.*.nupkg      
