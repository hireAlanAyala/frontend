import { createClient } from '@supabase/supabase-js';
import { App } from '../config';

export default createClient(App.SUPABASE_URL, process.env.SUPABASE_KEY);
