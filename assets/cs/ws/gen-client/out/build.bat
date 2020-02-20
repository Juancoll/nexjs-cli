@echo off

echo [1] launch visual studio command prompt
call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools\VsMSBuildCmd.bat"

echo [2] nuget restore
if not exist ".\nuget.exe" powershell -Command "(new-object System.Net.WebClient).DownloadFile('https://dist.nuget.org/win-x86-commandline/latest/nuget.exe', '.\nuget.exe')"
.\nuget.exe install src\template.api.wsclient\packages.config -o packages
".nuget/nuget" restore

echo [3] build solucion
msbuild template.api.wsclient.sln /target:template_api_wsclient
