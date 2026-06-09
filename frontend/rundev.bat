@echo off
setlocal
set "NODE_EXE=C:\Users\Ahmad Gilang Saputra\nodejs\node-v20.19.2-win-x64\node.exe"
set "VITE_JS=node_modules\vite\bin\vite.js"

echo Checking node...
"%NODE_EXE%" --version
if errorlevel 1 (
    echo ERROR: node.exe not found!
    pause
    exit /b 1
)

echo Starting Vite dev server...
"%NODE_EXE%" "%VITE_JS%"
