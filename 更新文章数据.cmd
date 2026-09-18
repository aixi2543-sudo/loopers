@echo off
cd /d "%~dp0"
node tools\build-site.mjs
if errorlevel 1 goto :end
node tools\check-site.mjs
:end
pause
