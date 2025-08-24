import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  HomeIcon,
  BoxIcon,
  TagIcon,
  ShoppingCartIcon,
  BarChart3Icon,
  LogOutIcon,
  DollarSignIcon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Productos", href: "/admin/productos", icon: BoxIcon },
  { name: "Precios", href: "/admin/precios", icon: DollarSignIcon },
  { name: "Categorías", href: "/admin/categorias", icon: TagIcon },
  { name: "Órdenes", href: "/admin/ordenes", icon: ShoppingCartIcon },
  { name: "Reportes", href: "/admin/reportes", icon: BarChart3Icon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (confirm("¿Estás seguro que quieres cerrar sesión?")) {
      logout();
    }
  };

  return (
    <div className="w-64 bg-white shadow-sm h-full flex flex-col min-h-0">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
      </div>

      <nav className="flex-1 mt-6 overflow-y-auto">
        <div className="px-3">
          {navigation.map((item) => {
            let isActive = false;

            if (item.href === "/admin") {
              // Dashboard solo está activo si estamos exactamente en /admin
              isActive = pathname === "/admin";
            } else {
              // Para otras rutas, verificar si coincide exactamente o es una subruta
              isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Botón de logout - siempre en la parte inferior */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-red-50 hover:text-red-700"
        >
          <LogOutIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
