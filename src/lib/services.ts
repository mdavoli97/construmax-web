import { supabase } from "./supabase";
import { Product, Category, Order } from "@/types";

// Productos
export const productService = {
  // Obtener todos los productos
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          price_group:price_groups(
            id,
            currency,
            price_per_kg
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn("Error connecting to Supabase, using fallback data:", error);
      // Fallback a datos estáticos si no hay conexión a Supabase
      return [];
    }
  },

  // Obtener productos por categoría
  async getByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          price_group:price_groups(
            id,
            currency,
            price_per_kg
          )
        `
        )
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn("Error connecting to Supabase, using fallback data:", error);
      return [];
    }
  },

  // Obtener productos destacados
  async getFeatured(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          price_group:price_groups(
            id,
            currency,
            price_per_kg
          )
        `
        )
        .eq("featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn("Error connecting to Supabase, using fallback data:", error);
      return [];
    }
  },

  // Obtener producto por ID
  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          price_group:price_groups(
            id,
            currency,
            price_per_kg
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.warn("Error fetching product by ID:", error);
      return null;
    }
  },

  // Buscar productos
  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Actualizar stock
  async updateStock(id: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ stock: quantity })
      .eq("id", id);

    if (error) throw error;
  },

  // Crear producto
  async create(productData: {
    name: string;
    description?: string;
    price: number;
    category: string;
    primary_image?: string;
    stock: number;
    unit: string;
    brand?: string;
    sku: string;
    featured?: boolean;
    price_group_id?: string | null;
  }): Promise<Product> {
    // Obtener token de autenticación si está disponible
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_auth_token")
        : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers,
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al crear producto");
    }

    return response.json();
  },

  // Actualizar producto
  async update(
    id: string,
    productData: {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      primary_image?: string;
      stock?: number;
      unit?: string;
      brand?: string;
      sku?: string;
      featured?: boolean;
      product_type?: string;
      weight_per_unit?: number;
      kg_per_meter?: number;
      price_per_kg?: number;
      price_group_id?: string | null;
      stock_type?: string;
      is_available?: boolean;
    }
  ): Promise<Product> {
    // Obtener token de autenticación si está disponible
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_auth_token")
        : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al actualizar producto");
    }

    return response.json();
  },

  // Eliminar producto
  async delete(id: string): Promise<void> {
    // Obtener token de autenticación si está disponible
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_auth_token")
        : null;

    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al eliminar producto");
    }
  },

  // Obtener imágenes de un producto
  async getImages(productId: string) {
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching product images:", error);
      return [];
    }
  },

  // Agregar imagen a un producto
  async addImage(
    productId: string,
    imageData: {
      image_url: string;
      alt_text?: string;
      is_primary?: boolean;
      display_order?: number;
    }
  ) {
    try {
      const response = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imageData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al agregar imagen");
      }

      return response.json();
    } catch (error) {
      console.error("Error adding product image:", error);
      throw error;
    }
  },

  // Eliminar imagen de un producto
  async deleteImage(productId: string, imageId: string) {
    try {
      const response = await fetch(
        `/api/products/${productId}/images?imageId=${imageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar imagen");
      }

      return response.json();
    } catch (error) {
      console.error("Error deleting product image:", error);
      throw error;
    }
  },
};

// Categorías
export const categoryService = {
  // Obtener todas las categorías
  async getAll(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn("Error connecting to Supabase, using fallback data:", error);
      return [];
    }
  },

  // Obtener categoría por slug
  async getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  },
};

// Órdenes
export const orderService = {
  // Crear nueva orden
  async create(orderData: {
    user_id: string;
    total: number;
    shipping_address: string;
    shipping_city: string;
    shipping_zip: string;
    payment_method: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<string> {
    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id,
        total: orderData.total,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_zip: orderData.shipping_zip,
        payment_method: orderData.payment_method,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Crear los items de la orden
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order.id;
  },

  // Obtener órdenes de un usuario
  async getByUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (*)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Actualizar estado de la orden
  async updateStatus(orderId: string, status: Order["status"]): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) throw error;
  },

  // Obtener orden por ID
  async getById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (*)
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  },
};

// Usuarios
export const userService = {
  // Obtener perfil del usuario
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar perfil del usuario
  async updateProfile(
    userId: string,
    profileData: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      zip_code?: string;
    }
  ) {
    const { error } = await supabase
      .from("users")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
  },

  // Crear usuario
  async create(userData: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    zip_code?: string;
  }) {
    const { error } = await supabase.from("users").insert(userData);

    if (error) throw error;
  },
};
