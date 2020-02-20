set name={{namespace}}
set folder=.\src\%name%

del %folder%\%name%.*.nupkg
.\.nuget\nuget.exe restore
.\.nuget\nuget.exe pack -Build -OutputDirectory %folder% %folder%\%name%.csproj
.\.nuget\nuget.exe push -Source "nodall-dev" -ApiKey myazurekey %folder%\%name%.*.nupkg      
