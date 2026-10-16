Write-Host "=== Khởi động Deutsch Trainer Backend ===" -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
cmd.exe /c .\mvnw.cmd spring-boot:run
