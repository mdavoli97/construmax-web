import { supabase } from './supabase'
import { Product, Category, Order } from '@/types'

// Productos
export const productService = {
  // Obtener todos los productos
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener productos por categoría
  async getByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener productos destacados
  async getFeatured(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener producto por ID
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Buscar productos
  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Actualizar stock
  async updateStock(id: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ stock: quantity })
      .eq('id', id)

    if (error) throw error
  }
}

// Categorías
export const categoryService = {
  // Obtener todas las categorías
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Obtener categoría por slug
  async getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  }
}

// Órdenes
export const orderService = {
  // Crear nueva orden
  async create(orderData: {
    user_id: string
    total: number
    shipping_address: string
    shipping_city: string
    shipping_zip: string
    payment_method: string
    items: Array<{
      product_id: string
      quantity: number
      price: number
    }>
  }): Promise<string> {
    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        total: orderData.total,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_zip: orderData.shipping_zip,
        payment_method: orderData.payment_method,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Crear los items de la orden
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order.id
  },

  // Obtener órdenes de un usuario
  async getByUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Actualizar estado de la orden
  async updateStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) throw error
  },

  // Obtener orden por ID
  async getById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data
  }
}

// Usuarios
export const userService = {
  // Obtener perfil del usuario
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Actualizar perfil del usuario
  async updateProfile(userId: string, profileData: {
    name?: string
    phone?: string
    address?: string
    city?: string
    zip_code?: string
  }) {
    const { error } = await supabase
      .from('users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
  },

  // Crear usuario
  async create(userData: {
    id: string
    email: string
    name: string
    phone?: string
    address?: string
    city?: string
    zip_code?: string
  }) {
    const { error } = await supabase
      .from('users')
      .insert(userData)

    if (error) throw error
  }
}
