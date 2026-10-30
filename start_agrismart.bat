@echo off
title AgriSmart AI - Startup
color 0A
cls

echo.
echo  ============================================================
echo   🌿  AgriSmart AI - Crop Recommendation System
echo  ============================================================
echo.

:: -------------------------------------------------------
:: Change to script directory (so relative paths work)
:: -------------------------------------------------------
cd /d "%~dp0"

:: -------------------------------------------------------
:: Kill any existing instances on ports 5000 and 5173
:: -------------------------------------------------------
echo  [1/4] Stopping any existing servers...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000 " ^| find "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173 " ^| find "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: -------------------------------------------------------
:: Detect Wi-Fi IP dynamically
:: -------------------------------------------------------
echo  [2/4] Detecting network IP...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| find "IPv4" ^| find "10."') do (
    set LAN_IP=%%i
)
:: trim leading space
set LAN_IP=%LAN_IP: =%

if "%LAN_IP%"=="" (
    set LAN_IP=localhost
    echo      Wi-Fi IP not found - using localhost
) else (
    echo      LAN IP detected: %LAN_IP%
)

:: -------------------------------------------------------
:: Start Flask backend
:: -------------------------------------------------------
echo  [3/4] Starting Flask backend (port 5000)...
start "AgriSmart-Backend" /min cmd /c ".\venv\Scripts\python.exe app.py > logs\backend.log 2>&1"
timeout /t 3 /nobreak >nul

:: -------------------------------------------------------
:: Start Frontend server
:: -------------------------------------------------------
echo  [4/4] Starting Frontend server (port 5173)...
start "AgriSmart-Frontend" /min cmd /c ".\venv\Scripts\python.exe serve_frontend.py > logs\frontend.log 2>&1"
timeout /t 2 /nobreak >nul

:: -------------------------------------------------------
:: Create logs directory if it doesn't exist
:: -------------------------------------------------------
if not exist "logs" mkdir logs

:: -------------------------------------------------------
:: Start Cloudflare Tunnel (if cloudflared.exe exists)
:: -------------------------------------------------------
set CF_URL=Not available (cloudflared.exe not found)
if exist "cloudflared.exe" (
    echo  [+] Starting Cloudflare Tunnel...
    start "AgriSmart-Cloudflare" /min cmd /c ".\cloudflared.exe tunnel --url http://localhost:5173 > logs\cloudflare.log 2>&1"
    echo  [+] Waiting for tunnel URL (15 seconds)...
    timeout /t 15 /nobreak >nul
    :: Extract the URL from the log
    for /f "tokens=*" %%L in ('findstr "trycloudflare.com" logs\cloudflare.log 2^>nul') do set CF_LINE=%%L
    for /f "tokens=5" %%U in ("%CF_LINE%") do set CF_URL=%%U
)

:: -------------------------------------------------------
:: Done - show access URLs
:: -------------------------------------------------------
cls
echo.
echo  ============================================================
echo   🌿  AgriSmart AI is RUNNING!
echo  ============================================================
echo.
echo   Open in browser:
echo.
echo     💻  On this PC      :  http://localhost:5173
echo     📱  On Phone/LAN    :  http://%LAN_IP%:5173
echo     🌍  Public (anyone) :  %CF_URL%
echo.
echo   LAN: Phone must be on SAME Wi-Fi/hotspot as this PC
echo   Public: Works from ANYWHERE (share with anyone!)
echo.
echo  ============================================================
echo   Servers are running in the background.
echo   Close this window only when you want to STOP the app.
echo  ============================================================
echo.

:: Open browser automatically on this PC
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173"

echo  Press any key to STOP all servers and exit...
pause >nul

:: -------------------------------------------------------
:: Cleanup on exit
:: -------------------------------------------------------
echo.
echo  Stopping servers...
taskkill /FI "WINDOWTITLE eq AgriSmart-Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AgriSmart-Frontend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AgriSmart-Cloudflare*" /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000 " ^| find "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173 " ^| find "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo  All servers stopped. Goodbye!
timeout /t 2 /nobreak >nul
