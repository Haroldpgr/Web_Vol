# Enciende la base de datos local temporal (PostgreSQL 17 en puerto 5433).
# Úsalo cuando el backend muestre "Can't reach database server at localhost:5433"
# (pasa si reiniciaste el PC: esta DB vive en Temp y no arranca sola).
# Uso: clic derecho → Ejecutar con PowerShell, o:
#   powershell -ExecutionPolicy Bypass -File backend\iniciar-db-local.ps1

$pgCtl = "C:\Users\harol\AppData\Local\Temp\opencode\pg-dist\bin\pg_ctl.exe"
$pgData = "C:\Users\harol\AppData\Local\Temp\opencode\pg-data"
$pgLog = "C:\Users\harol\AppData\Local\Temp\opencode\pg.log"

if (-not (Test-Path -LiteralPath $pgCtl)) {
  Write-Output "No existe $pgCtl. La carpeta Temp se limpió: pide ayuda para reinstalar la DB local o instala PostgreSQL 17 permanente (ver backend\README.md)."
  exit 1
}

& $pgCtl -D $pgData status
if ($LASTEXITCODE -eq 0) {
  Write-Output "La base de datos ya está encendida."
  exit 0
}

& $pgCtl -D $pgData -l $pgLog -o "-p 5433" start
Start-Sleep -Seconds 4
& $pgCtl -D $pgData status
