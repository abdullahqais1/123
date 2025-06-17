import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: 'admin' | 'user'
  created_at: string
}

export interface Customer {
  id: string
  name: string
  contract_end_date: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  customer_id: string
  title: string
  details: string
  term: 'قصير' | 'طويل'
  employee: string
  is_completed: boolean
  created_at: string
  updated_at: string
  customer?: Customer
  profile?: Profile
}

export interface TaskWithCustomer extends Task {
  customer: Customer
}

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  expiredContracts: number
  todayTasks: number
  totalCustomers: number
}