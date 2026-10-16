@echo off
setlocal
where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
  endlocal
  mvn %*
  goto :eof
)

if exist "%~dp0..\tools\apache-maven-3.9.16\bin\mvn.cmd" (
  endlocal
  call "%~dp0..\tools\apache-maven-3.9.16\bin\mvn.cmd" %*
  goto :eof
)

echo [ERROR] Maven not found! Please install Maven or place it in tools/apache-maven-3.9.16.
exit /b 1
