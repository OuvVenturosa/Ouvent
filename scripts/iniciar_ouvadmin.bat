@echo off
echo ========================================
echo  INICIANDO SISTEMA OUVIDORIA VENTUROSA
echo ========================================
echo.

echo 1. Construindo frontend...
cd frontend
call npm run build
cd ..

echo.
echo 2. Iniciando backend...
start "Backend" cmd /k "npm start"

echo.
echo 3. Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

echo.
echo 4. Iniciando servidor frontend...
start "Frontend" cmd /k "npm run serve"

echo.
echo ========================================
echo  SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo URL Principal: http://ouvadmin/venturosa
echo.
echo Para acessar via URL personalizada:
echo 1. Adicione no arquivo hosts: 127.0.0.1 ouvadmin
echo 2. Configure o nginx com o arquivo nginx.conf
echo.
pause 