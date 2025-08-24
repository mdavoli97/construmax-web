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
