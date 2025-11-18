export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "construccion" | "metalurgica" | "herramientas" | "herreria";
  primary_image?: string;
  images?: string[] | ProductImage[]; // Array de URLs o objetos de imagen
  stock: number;
  unit: string; // kg, m, unidad, etc.
  brand?: string;
  sku: string;
  featured?: boolean;
  // Nuevos campos para tipos de productos
  product_type?: "standard" | "perfiles" | "chapas_conformadas" | "otros";
  weight_per_unit?: number; // Para perfiles: peso por unidad (kg)
  kg_per_meter?: number; // Para chapas conformadas: kg por metro
  price_per_kg?: number; // Para perfiles y chapas: precio por kilo
  price_group_id?: string; // Para perfiles y chapas: referencia al grupo de precios
  stock_type?: "quantity" | "availability"; // quantity = número, availability = tengo/no tengo
  is_available?: boolean; // Para stock tipo availability
  // Nuevos campos específicos basados en configuración del grupo de precios
  thickness?: string; // Campo espesor cuando el grupo de precios lo requiere
  size?: string; // Campo tamaño cuando el grupo de precios lo requiere
  // Información del grupo de precios (cuando está disponible)
  price_group?: {
    id: string;
    currency: "USD" | "UYU";
    price_per_kg: number;
  } | null;
}

export interface CalculationDetail {
  id: number;
  largo: number;
  cantidad: number;
  total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  calculationDetails?: CalculationDetail[]; // Detalles de la calculadora si se usó
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentMethod: "mercadopago";
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

export interface PriceGroup {
  id: string;
  name: string;
  description?: string;
  price_per_kg: number;
  currency: "USD" | "UYU";
  category?: "construccion" | "metalurgica" | "herramientas" | "herreria"; // Opcional para compatibilidad
  is_active: boolean;
  thickness?: boolean; // Nuevo campo para mostrar input de espesor
  size?: boolean; // Nuevo campo para mostrar input de tamaño
  created_at: string;
  updated_at: string;
}

export interface ProductGroup {
  priceGroup: PriceGroup;
  products: Product[];
}
