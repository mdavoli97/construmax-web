# Script de migración automática para el sistema de imágenes
# Ejecutar en PowerShell desde la raíz del proyecto

Write-Host "🔧 Verificando instalación de Supabase CLI..." -ForegroundColor Cyan

# Verificar si Supabase CLI está instalado
$supabaseInstalled = $false
try {
    $supabaseVersion = & supabase --version 2>$null
    if ($supabaseVersion) {
        Write-Host "✅ Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
        $supabaseInstalled = $true
    }
} catch {
    Write-Host "❌ Supabase CLI no encontrado. Instalando..." -ForegroundColor Red
    Write-Host "📦 Ejecutando: npm install -g supabase" -ForegroundColor Yellow
    npm install -g supabase
}

Write-Host ""
Write-Host "🚀 Ejecutando migración de base de datos..." -ForegroundColor Cyan

# Verificar si existe el archivo de migración
if (Test-Path "database\migration_complete.sql") {
    Write-Host "📄 Archivo de migración encontrado" -ForegroundColor Green
    
    # Intentar ejecutar la migración
    Write-Host "⚡ Aplicando migración..." -ForegroundColor Yellow
    
    try {
        # Si tienes Supabase CLI configurado con tu proyecto
        & supabase db push 2>$null
        Write-Host "✅ Migración completada exitosamente!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Error al ejecutar migración automática" -ForegroundColor Red
        Write-Host "📋 Por favor, ejecuta manualmente en Supabase:" -ForegroundColor Yellow
        Write-Host "   1. Ve a https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "   2. Abre tu proyecto" -ForegroundColor White
        Write-Host "   3. Ve a SQL Editor" -ForegroundColor White
        Write-Host "   4. Copia y pega el contenido de database\migration_complete.sql" -ForegroundColor White
        Write-Host "   5. Ejecuta el script" -ForegroundColor White
    }
} else {
    Write-Host "❌ Archivo de migración no encontrado en database\migration_complete.sql" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 También puedes usar la página de migración en:" -ForegroundColor Cyan
Write-Host "   http://localhost:3001/admin/migrate" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Para verificar que funcionó, ve a:" -ForegroundColor Cyan
Write-Host "   http://localhost:3001/admin/reset-products" -ForegroundColor White

Write-Host ""
Write-Host "✨ ¡Migración lista! Presiona cualquier tecla para continuar..." -ForegroundColor Green
Read-Host
