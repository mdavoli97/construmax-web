# =============================================================================
# SCRIPT PARA PROBAR APIs DE GESTIÓN DE PRECIOS
# =============================================================================
# Uso: npm run dev (en una terminal) y luego ejecutar este script
# =============================================================================

Write-Host "🧪 PROBANDO APIs DE GESTIÓN DE PRECIOS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Función para hacer peticiones HTTP
function Test-API {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [string]$Description
    )
    
    Write-Host "🔍 $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $headers = @{
            'Content-Type' = 'application/json'
        }
        
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        
        Write-Host "   ✅ Éxito:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3 | Write-Host
        return $response
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
    
    Write-Host ""
}

# Esperar a que el usuario confirme que el servidor está ejecutándose
Write-Host "⚠️  Asegúrate de que el servidor esté ejecutándose con 'npm run dev'" -ForegroundColor Yellow
Write-Host "   Presiona Enter cuando esté listo o Ctrl+C para cancelar"
Read-Host

Write-Host ""

# 1. Probar API pública de grupos de precios
Test-API -Method "GET" -Url "$baseUrl/api/price-groups" -Description "Obtener grupos de precios (API pública)"

# 2. Probar API admin para obtener grupos
Test-API -Method "GET" -Url "$baseUrl/api/admin/price-groups" -Description "Obtener grupos de precios (API admin)"

# 3. Crear un grupo de prueba
$newGroupBody = @{
    name = "Grupo de Prueba API"
    description = "Grupo creado desde el script de prueba"
    price_per_kg_usd = 1.45
    category = "metalurgica"
} | ConvertTo-Json

$createdGroup = Test-API -Method "POST" -Url "$baseUrl/api/admin/price-groups" -Body $newGroupBody -Description "Crear nuevo grupo de precios"

if ($createdGroup -and $createdGroup.success) {
    $groupId = $createdGroup.data.id
    Write-Host "✅ Grupo creado con ID: $groupId" -ForegroundColor Green
    
    # 4. Obtener el grupo específico
    Test-API -Method "GET" -Url "$baseUrl/api/admin/price-groups/$groupId" -Description "Obtener grupo específico"
    
    # 5. Actualizar el precio del grupo
    $updateBody = @{
        price_per_kg_usd = 1.55
    } | ConvertTo-Json
    
    Test-API -Method "PUT" -Url "$baseUrl/api/admin/price-groups/$groupId" -Body $updateBody -Description "Actualizar precio del grupo"
    
    # 6. Eliminar el grupo (limpieza)
    $deleteConfirm = Read-Host "¿Quieres eliminar el grupo de prueba? (y/n)"
    if ($deleteConfirm -eq "y" -or $deleteConfirm -eq "Y") {
        Test-API -Method "DELETE" -Url "$baseUrl/api/admin/price-groups/$groupId" -Description "Eliminar grupo de prueba"
    }
} else {
    Write-Host "❌ No se pudo crear el grupo, saltando pruebas adicionales" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 URLs para probar manualmente:" -ForegroundColor Yellow
Write-Host "   - Panel de precios: $baseUrl/admin/precios" -ForegroundColor White
Write-Host "   - Crear producto: $baseUrl/admin/productos/nuevo" -ForegroundColor White
Write-Host "   - API grupos (JSON): $baseUrl/api/price-groups" -ForegroundColor White
Write-Host ""
Write-Host "✅ Si todas las pruebas pasaron, la integración está funcionando!" -ForegroundColor Green
Write-Host ""
