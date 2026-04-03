@echo off
echo --- Removing Android Platform ---
cordova platform remove android

echo.
echo --- Adding Android Platform ---
cordova platform add android

echo.
echo --- Building Android APK ---
cordova build android

echo.
echo --- Build Complete ---
pause
