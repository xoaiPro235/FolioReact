import { createClient } from '@supabase/supabase-js'

// Lấy biến môi trường từ file .env
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase Environment Variables')
}

// Khởi tạo và export client để dùng ở nơi khác
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true, // Tự động lưu đăng nhập
        autoRefreshToken: true,
    }
})