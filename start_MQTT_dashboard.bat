::@echo off
::REM === Run Node.js backend (publisher) ===
::start "" "C:\Program Files\nodejs\node.exe" "E:\TOX-EE_Dept Manage\HTML Campaign template\MQTT Web App\Mqtt chart dashboard\For online testing\backend\tox_xml_watcher.js"

::REM === Open frontend dashboard in browser edge ===
::start msedge.exe  "E:\TOX-EE_Dept Manage\HTML Campaign template\MQTT Web App\Mqtt chart dashboard\For online testing\frontend\index.html"

::exit


@echo off
title TOX MQTT Dashboard Starter
color 0A

echo ========================================
echo   🚀 Starting TOX EDC Dashboard + Node-RED + Data Watcher
echo ========================================
echo.

:: Change to your project folder (adjust this path)
cd /d "E:\TOX-EE_Dept Manage\HTML Campaign template\MQTT Web App\Mqtt chart dashboard\For online testing\backend"

:: Step 1 - Start Node-RED in background
echo 🔧 Launching Node-RED service...
start cmd /k "node-red"

:: Step 2 - Start the TOX XML watcher backend
echo ⚙️ Launching TOX XML Data Watcher...
start cmd /k "node tox_xml_watcher.js"

:: Wait few seconds for Node-RED to initialize
timeout /t 8 >nul

:: Step 3 - Open Node-RED flow editor
echo 🌐 Opening Node-RED (http://127.0.0.1:1880)...
start "" "http://127.0.0.1:1880"

:: Step 4 - Open your MQTT Dashboard (HTML front-end)
echo 🧭 Opening MQTT Dashboard...
start msedge.exe  "E:\TOX-EE_Dept Manage\HTML Campaign template\MQTT Web App\Mqtt chart dashboard\For online testing\frontend\index.html"

echo.
echo ✅ All systems started successfully!
echo Leave this window open while running.
pause
