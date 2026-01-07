import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilzbqzzlsumlqsndpnjj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemJnenpsc3VtbHFzbmRwbmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTYwOTYsImV4cCI6MjA4MzM5MjA5Nn0.iZIr3kz_pnEfT3k-D7ZXhGkDU4h5mzZWwq1JUZGkCDE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
