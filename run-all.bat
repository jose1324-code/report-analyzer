@echo off
echo ==========================================
echo   Starting CareNova - Local Development
echo ==========================================
echo.

:: 0. Ollama (AI backend) — http://localhost:11434
echo [1/5] Starting Ollama AI backend on http://localhost:11434
start "Ollama :11434" cmd /k "ollama serve"

:: wait for Ollama to initialize
timeout /t 3 /nobreak >nul

:: 1. Landing Page (Vite) — http://localhost:8081
echo [2/5] Starting Landing Page on http://localhost:8081
start "Landing :8081" cmd /k "cd /d "%~dp0langing-_module-main\langing-_module-main" && pnpm dev"

:: wait a moment before next
timeout /t 2 /nobreak >nul

:: 2. Dashboard (Next.js) — http://localhost:3000
echo [3/5] Starting Dashboard on http://localhost:3000
start "Dashboard :3000" cmd /k "cd /d "%~dp0dashborad_module-main\dashborad_module-main" && pnpm dev"

:: wait a moment before next
timeout /t 2 /nobreak >nul

:: 3. Netmeds API (Express) — http://localhost:5000
echo [4/5] Starting Netmeds API on http://localhost:5000
start "Netmeds API :5000" cmd /k "cd /d "%~dp0dashborad_module-main\netmeds-api-master" && set PORT=5000 && npm start"

:: wait a moment before next
timeout /t 2 /nobreak >nul

:: 4. Email Service
echo [5/5] Starting Email Service
start "Email Service" cmd /k "cd /d "%~dp0dashborad_module-main\dashborad_module-main\email-service" && node index.js"

echo.
echo ==========================================
echo   All modules launched!
echo.
echo   Ollama AI     : http://localhost:11434
echo   Landing Page  : http://localhost:8081
echo   Dashboard     : http://localhost:3000
echo   Netmeds API   : http://localhost:5000
echo ==========================================
echo.
pause
