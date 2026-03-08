@echo off
echo ========================================
echo   NeoBank - Auto Setup + Run
echo ========================================
cd /d "D:\A.ERIK\vt-bank"

:: Check for node in common paths
set "NODE_PATH="
if exist "D:\A.ERIK\vt-bank\node-local\node-v20.11.1-win-x64\node.exe" set "NODE_PATH=D:\A.ERIK\vt-bank\node-local\node-v20.11.1-win-x64"
if exist "D:\flutter\bin\cache\artifacts\engine\windows-x64\node.exe" set "NODE_PATH=D:\flutter\bin\cache\artifacts\engine\windows-x64"
if exist "C:\Program Files\nodejs\node.exe" set "NODE_PATH=C:\Program Files\nodejs"
if exist "C:\Program Files (x86)\nodejs\node.exe" set "NODE_PATH=C:\Program Files (x86)\nodejs"
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_PATH=%LOCALAPPDATA%\Programs\nodejs"
if exist "%APPDATA%\nvm\current\node.exe" set "NODE_PATH=%APPDATA%\nvm\current"

:: Check default PATH
where node >nul 2>&1 && set "NODE_PATH=found"

if "%NODE_PATH%"=="" (
    echo.
    echo [ERROR] Node.js not found! 
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

if not "%NODE_PATH%"=="found" (
    echo Found Node.js at: %NODE_PATH%
    set "PATH=%NODE_PATH%;%PATH%"
)

echo.
echo [1/2] Installing dependencies...
call npm install
echo.
echo [2/2] Starting Vite dev server...
echo.
echo ========================================
echo   Open in browser: http://localhost:5173
echo ========================================
echo.
call npx vite --host --open
pause
