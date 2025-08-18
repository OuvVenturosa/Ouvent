Write-Host "Iniciando Nginx..." -ForegroundColor Green

$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
$nginxDir = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0"

# Mudar para o diretório do Nginx
Push-Location $nginxDir

try {
    # Iniciar Nginx
    & $nginxPath
    Write-Host "Nginx iniciado com sucesso!" -ForegroundColor Green
    Write-Host "Acesse: http://localhost" -ForegroundColor Yellow
} catch {
    Write-Host "Erro ao iniciar Nginx: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Voltar ao diretório original
    Pop-Location
}

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
Read-Host
