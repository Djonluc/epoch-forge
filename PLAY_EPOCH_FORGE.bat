@echo off
title Epoch Forge Launcher
echo ===================================================
echo Starting Epoch Forge...
echo The browser should open automatically once ready.
echo ===================================================
cd /d "%~dp0"
npm run dev
pause
