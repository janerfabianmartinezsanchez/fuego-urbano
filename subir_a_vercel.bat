@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================================
echo   ACTUALIZADOR DE VERCEL - FUEGO URBANO
echo ==========================================================
echo.
echo Verificando sesion en Vercel...
call npx vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo No has iniciado sesion en Vercel desde esta PC.
    echo Se abrira una ventana o enlace para iniciar sesion en vercel.com...
    echo.
    call npx vercel login
    if %errorlevel% neq 0 (
        echo.
        echo [Error] No se pudo completar el inicio de sesion.
        pause
        exit /b 1
    )
)

echo.
echo Listo! Ahora se subira la version nueva (2 columnas UX/UI).
echo IMPORTANTE: Si te pregunta:
echo   - "Set up and deploy?" -> Presiona Y (Enter)
echo   - "Link to existing project?" -> Presiona Y (Enter)
echo   - "What's the name of your existing project?" -> Escribe: fuego-urbano-1
echo.
call npx vercel --prod
echo.
echo ==========================================================
echo   Si no hubo errores, espera 15 segundos y abre la app
echo   en tu celular (cierra y vuelve a abrirla 1 vez).
echo ==========================================================
pause
