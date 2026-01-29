
import { supabase } from './src/supabaseClient.js';

async function checkDates() {
    console.log("Checking updated_at values...");
    const { data } = await supabase
        .from('clients')
        .select('updated_at')
        .limit(10);

    console.log(data);
}

checkDates();
