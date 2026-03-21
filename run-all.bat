@echo off
echo Starting all CareNova modules...

:: 1. Landing Page (Vite) — port 8081
start "Landing Page :8081" cmd /k "cd /d "%~dp0langing-_module-main\langing-_module-main" && npm run dev"

:: 2. Dashboard (Next.js) — port 3000
start "Dashboard :3000" cmd /k "cd /d "%~dp0dashborad_module-main\dashborad_module-main" && npm run dev"

:: 3. Netmeds API (Express) — port 5000
start "Netmeds API :5000" cmd /k "cd /d "%~dp0dashborad_module-main\netmeds-api-master" && set PORT=5000 && npm start"

:: 4. Email Service
start "Email Service" cmd /k "cd /d "%~dp0dashborad_module-main\dashborad_module-main\email-service" && node index.js --now"

echo All modules launched in separate windows.
