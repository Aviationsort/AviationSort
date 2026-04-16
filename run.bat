@echo off
echo ========================================
echo AviationSort Launcher
echo ========================================
echo.
echo [1/4] Installing Node.js dependencies...
call npm install
echo.
echo [2/4] Installing Python dependencies...
pip install flask flask-cors cloudscraper
echo.
echo [3/4] Building frontend...
call npm run build
echo.
echo [4/4] Starting servers...
echo.

REM Check if port 5001 is already in use
netstat -ano | findstr :5001 > nul
if %ERRORLEVEL% == 0 (
    echo Port 5001 is already in use. Please close existing servers.
    goto :end
)

echo Starting Python server on http://localhost:5001...
start "Python Server" cmd /c "python server.py"
timeout /t 3 /nobreak > nul

echo Starting Vite dev server on http://localhost:5173...
start "Vite" npx vite --host

echo.
echo ========================================
echo All servers started!
echo - Vite:      http://localhost:5173
echo - Python:    http://localhost:5001
echo ========================================
echo.
pause

:end
pause