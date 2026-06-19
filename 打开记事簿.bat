@echo off
:: 为了防止乱码引起闪退，不再强制使用 chcp 65001 >nul，而是让系统自动决定
cd /d "%~dp0"
title Jishibu Start

echo ========================================
echo   Starting Jishibu
echo ========================================
echo.

:: 检查 Node.js 是否已安装并被系统识别
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not recognized!
    echo.
    echo Please RESTART your computer if you just installed it.
    echo Or download and install Node.js from https://nodejs.org
    echo.
    pause
    exit /b
)

:: 检查并自动安装依赖
if not exist "node_modules\" (
    echo [INFO] First run, installing dependencies...
    echo Please wait...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b
    )
    echo.
    echo [SUCCESS] Dependencies installed!
)

echo.
echo [INFO] Starting local server and opening browser...
echo.
echo ----------------------------------------------------
echo   DO NOT CLOSE THIS WINDOW while using the app!
echo ----------------------------------------------------
echo.

call npm run open

echo.
echo Finished or error occurred.
pause
