# Guía de Uso del Componente Select de shadcn/ui

## Instalación Completada ✅

Se ha instalado e implementado el componente Select de shadcn/ui en toda la aplicación.

## Archivos Actualizados

1. **`src/components/ProductSearch.tsx`** - Select para filtro de categorías
2. **`src/app/admin/productos/page.tsx`** - Selects para filtros de categoría y stock
3. **`src/app/admin/precios/page.tsx`** - Select para categoría de grupos de precios
4. **`src/app/admin/productos/editar/[id]/page.tsx`** - Múltiples selects en formulario de edición

## Ejemplo de Uso Básico

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Estado
const [selectedValue, setSelectedValue] = useState("");

// JSX
<Select value={selectedValue} onValueChange={setSelectedValue}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar opción" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opción 1</SelectItem>
    <SelectItem value="option2">Opción 2</SelectItem>
    <SelectItem value="option3">Opción 3</SelectItem>
  </SelectContent>
</Select>;
```

## Ejemplo con Lista Dinámica

```tsx
const categories = [
  { id: 1, name: "Construcción", value: "construccion" },
  { id: 2, name: "Metalúrgica", value: "metalurgica" },
  { id: 3, name: "Herramientas", value: "herramientas" },
];

<Select value={category} onValueChange={setCategory}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar categoría" />
  </SelectTrigger>
  <SelectContent>
    {categories.map((cat) => (
      <SelectItem key={cat.id} value={cat.value}>
        {cat.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>;
```

## Props Principales

- **`value`**: Valor seleccionado actual
- **`onValueChange`**: Función que se ejecuta cuando cambia la selección
- **`disabled`**: Deshabilita el select
- **`placeholder`**: Texto mostrado cuando no hay selección

## Ventajas sobre select HTML nativo

1. **Diseño consistente** - Estilo unificado con el design system
2. **Accesibilidad mejorada** - ARIA labels y navegación por teclado
3. **Responsive** - Se adapta automáticamente a diferentes tamaños
4. **Customizable** - Fácil de personalizar con Tailwind CSS
5. **TypeScript** - Tipado completo para mejor DX

## Próximos Pasos

Para nuevos selects en la aplicación, utilizar siempre este componente en lugar del `<select>` HTML nativo.
