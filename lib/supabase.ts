import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para TypeScript
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: string
          image: string
          stock: number
          unit: string
          brand?: string
          sku: string
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category: string
          image: string
          stock: number
          unit: string
          brand?: string
          sku: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category?: string
          image?: string
          stock?: number
          unit?: string
          brand?: string
          sku?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          slug?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_address: string
          shipping_city: string
          shipping_zip: string
          payment_method: string
          payment_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_address: string
          shipping_city: string
          shipping_zip: string
          payment_method: string
          payment_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          total?: number
          shipping_address?: string
          shipping_city?: string
          shipping_zip?: string
          payment_method?: string
          payment_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone?: string
          address?: string
          city?: string
          zip_code?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string
          address?: string
          city?: string
          zip_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          address?: string
          city?: string
          zip_code?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
