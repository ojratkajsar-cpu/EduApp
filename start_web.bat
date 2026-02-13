@echo off
echo ==========================================
echo Starting EduApp in Browser (Web Mode)...
echo ==========================================

:: Temporarily add Node.js to PATH for this session
set "PATH=C:\Program Files\nodejs;%PATH%"

:: Run the npm web command using the CMD executable to bypass PowerShell restrictions
call "C:\Program Files\nodejs\npm.cmd" run web

pause
