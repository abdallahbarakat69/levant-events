import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function countClients() {
    const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting clients:', error);
    } else {
        console.log('Total clients in Supabase:', count);
    }
}

countClients();
