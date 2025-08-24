# =============================================================================
# SCRIPT DE VERIFICACIÓN POST-CONFIGURACIÓN DE SUPABASE
# =============================================================================
# Descripción: Script para verificar que la nueva configuración de Supabase funcione
# Uso: ./verify-supabase-setup.ps1
# =============================================================================

Write-Host "🚀 VERIFICANDO CONFIGURACIÓN DE SUPABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar archivo .env.local
Write-Host "1. Verificando archivo .env.local..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "   ✅ Archivo .env.local encontrado" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    # Verificar variables críticas
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var=") {
            $missingVars += $var
        } else {
            Write-Host "   ✅ $var configurada" -ForegroundColor Green
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "   ❌ Variables faltantes:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "      - $var" -ForegroundColor Red
        }
        Write-Host "   📝 Revisa la guía SUPABASE_SETUP_GUIDE.md" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "   📝 Crea el archivo según SUPABASE_SETUP_GUIDE.md" -ForegroundColor Yellow
}

Write-Host ""

# Verificar dependencias
Write-Host "2. Verificando dependencias npm..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
    
    if (Test-Path "node_modules") {
        Write-Host "   ✅ node_modules existe" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  node_modules no encontrado. Ejecutando npm install..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "   ✅ npm install completado" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Error en npm install: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ package.json no encontrado" -ForegroundColor Red
}

Write-Host ""

# Verificar archivos de configuración
Write-Host "3. Verificando archivos de configuración..." -ForegroundColor Yellow

$configFiles = @(
    "lib/supabase.ts",
    "src/lib/supabase.ts"
)

$supabaseConfigFound = $false
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ Configuración de Supabase encontrada: $file" -ForegroundColor Green
        $supabaseConfigFound = $true
        break
    }
}

if (-not $supabaseConfigFound) {
    Write-Host "   ⚠️  Archivo de configuración de Supabase no encontrado" -ForegroundColor Yellow
}

Write-Host ""

# Verificar archivos SQL
Write-Host "4. Verificando archivos SQL..." -ForegroundColor Yellow

if (Test-Path "SUPABASE_COMPLETE_SETUP.sql") {
    Write-Host "   ✅ Script completo de configuración disponible" -ForegroundColor Green
} else {
    Write-Host "   ❌ SUPABASE_COMPLETE_SETUP.sql no encontrado" -ForegroundColor Red
}

if (Test-Path "SUPABASE_SETUP_GUIDE.md") {
    Write-Host "   ✅ Guía de configuración disponible" -ForegroundColor Green
} else {
    Write-Host "   ❌ SUPABASE_SETUP_GUIDE.md no encontrada" -ForegroundColor Red
}

Write-Host ""

# Verificar estructura de directorios
Write-Host "5. Verificando estructura del proyecto..." -ForegroundColor Yellow

$requiredDirs = @(
    "src/app/api",
    "src/components",
    "src/lib",
    "database"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ Directorio $dir existe" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Directorio $dir no encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""

# Intentar iniciar el servidor de desarrollo
Write-Host "6. Probando servidor de desarrollo..." -ForegroundColor Yellow

$choice = Read-Host "¿Quieres iniciar el servidor de desarrollo para probar? (y/n)"

if ($choice -eq "y" -or $choice -eq "Y" -or $choice -eq "yes") {
    Write-Host "   🚀 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
    Write-Host "   📝 El servidor se abrirá en http://localhost:3000" -ForegroundColor Yellow
    Write-Host "   📝 Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   🔍 URLs para probar:" -ForegroundColor Cyan
    Write-Host "      - http://localhost:3000 (página principal)" -ForegroundColor White
    Write-Host "      - http://localhost:3000/api/test-db (test conexión BD)" -ForegroundColor White
    Write-Host "      - http://localhost:3000/admin (panel de administración)" -ForegroundColor White
    Write-Host ""
    
    try {
        npm run dev
    } catch {
        Write-Host "   ❌ Error al iniciar servidor: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ⏭️  Saltando inicio de servidor" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎯 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PASOS COMPLETADOS:" -ForegroundColor Green
Write-Host "   ✅ Verificación de archivos de configuración" -ForegroundColor Green
Write-Host "   ✅ Verificación de dependencias" -ForegroundColor Green
Write-Host "   ✅ Verificación de estructura del proyecto" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "   1. Asegúrate de tener configurado Supabase correctamente" -ForegroundColor White
Write-Host "   2. Ejecuta el script SUPABASE_COMPLETE_SETUP.sql en Supabase" -ForegroundColor White
Write-Host "   3. Configura las variables de entorno en .env.local" -ForegroundColor White
Write-Host "   4. Prueba las URLs mencionadas arriba" -ForegroundColor White
Write-Host "   5. Revisa SUPABASE_SETUP_GUIDE.md para más detalles" -ForegroundColor White
Write-Host ""
Write-Host "🆘 SI HAY PROBLEMAS:" -ForegroundColor Red
Write-Host "   - Revisa la consola del navegador para errores" -ForegroundColor White
Write-Host "   - Verifica las credenciales de Supabase" -ForegroundColor White
Write-Host "   - Asegúrate de que el proyecto Supabase esté activo" -ForegroundColor White
Write-Host ""
Write-Host "¡Configuración completada! 🚀" -ForegroundColor Green
