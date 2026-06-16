import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmlnvjvkfjvnfpukuasq.supabase.co'
const supabaseKey = 'sb_publishable_IVYlhMKe2QsvYsuKQUVpxw_N3oigAQO'

export const supabase = createClient(supabaseUrl, supabaseKey)