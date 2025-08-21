"use client";

import Link from "next/link";

export default function SetupPage() {
  const sqlCommands = `-- Ejecuta estos comandos en el SQL Editor de Supabase Dashboard:

-- 1. Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 2. Insertar categorías por defecto
INSERT INTO categories (name, description, icon, slug) VALUES
('Construcción', 'Materiales para construcción y obra', '🏗️', 'construccion'),
('Metalúrgica', 'Productos de acero y metal', '⚙️', 'metalurgica'),
('Herramientas', 'Herramientas manuales y eléctricas', '🔧', 'herramientas'),
('Herrería', 'Materiales de herrería', '⚡', 'herreria')
ON CONFLICT (slug) DO NOTHING;

-- 3. (Opcional) Para habilitar RLS más tarde con políticas permisivas:
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuración de Supabase
            </h1>
            <p className="text-gray-600">
              Para resolver el error de RLS (Row Level Security), necesitas
              ejecutar los siguientes comandos SQL.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pasos para configurar la base de datos:
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Abrir Supabase Dashboard
                  </h3>
                  <p className="text-gray-600">
                    Ve a{" "}
                    <a
                      href="https://supabase.com/dashboard/project/jfxbgvnohgkqbbrukgyx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      tu proyecto en Supabase
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Ir al SQL Editor
                  </h3>
                  <p className="text-gray-600">
                    En el panel lateral, busca y haz clic en &quot;SQL
                    Editor&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Ejecutar comandos SQL
                  </h3>
                  <p className="text-gray-600">
                    Copia y pega los comandos de abajo en el editor y haz clic
                    en &quot;Run&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Comandos SQL a ejecutar:
            </h2>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">
                <code>{sqlCommands}</code>
              </pre>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(sqlCommands)}
              className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              📋 Copiar comandos
            </button>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <Link
                href="/admin"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                ← Volver al Admin
              </Link>

              <div className="text-sm text-gray-500">
                Una vez ejecutados los comandos, el panel admin debería
                funcionar correctamente.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
