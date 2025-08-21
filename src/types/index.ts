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
}

export interface CartItem {
  product: Product;
  quantity: number;
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
