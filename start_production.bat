@echo off
echo ==================================================
echo   GAPGENIUS - Find the gap. Fix the gap.
echo   Starting Unified Full-Stack Production Server
echo ==================================================
echo.
cd /d "%~dp0\server"
node src\index.js
pause
