@echo off
echo ==================================================
echo   GAPGENIUS - Find the gap. Fix the gap.
echo   Starting Development Mode (Client + Server)
echo ==================================================
echo.
start "GapGenius Server" cmd /k "cd /d "%~dp0\server" && node --watch src\index.js"
start "GapGenius Client" cmd /k "cd /d "%~dp0\client" && npm.cmd run dev"
echo Both services started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
pause
