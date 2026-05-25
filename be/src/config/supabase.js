import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di .env');
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

export default supabase;
