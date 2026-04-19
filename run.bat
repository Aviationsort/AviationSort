@echo off
echo ========================================
echo AviationSort Launcher
echo ========================================
echo.
echo [1/4] Installing Node.js dependencies...
call npm install
call npm fund
call npm audit
call npm audit fix
echo.
echo [2/4] Installing Python dependencies...
call pip install -q flask flask-cors cloudscraper
echo.
echo [3/4] Building frontend...
call npm run build
echo.
echo [4/4] Starting servers...
echo.

REM Check if port 5001 is already in use
netstat -ano | findstr /C:":5001" > nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Port 5001 is already in use. Please close existing servers.
    goto :end
)

echo Starting Python server on https://localhost:5001...
start "Python Server" cmd /k "python server.py"
timeout /t 3 /nobreak > nul 2>&1

echo Starting Vite dev server on http://localhost:5173...
start "Vite" cmd /k "npx vite"

echo.
echo ========================================
echo All servers started!
echo - Vite:      http://localhost:5173
echo - Python:    https://localhost:5001
echo ========================================
echo.
pause

:end