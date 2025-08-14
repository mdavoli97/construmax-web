import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database interface for TypeScript
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image: string | null
          stock: number
          unit: string
          brand: string | null
          sku: string
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image?: string | null
          stock?: number
          unit: string
          brand?: string | null
          sku: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image?: string | null
          stock?: number
          unit?: string
          brand?: string | null
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
          description: string | null
          icon: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string
          slug?: string
          created_at?: string
        }
      }
    }
  }
}
