
import { supabase } from './src/supabaseClient.js';

async function checkData() {
    console.log("Fetching one client...");
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching:", error);
    } else {
        if (data.length === 0) {
            console.log("No clients found in DB!");
        } else {
            console.log("Client keys:", Object.keys(data[0]));
            console.log("Client created_at:", data[0].created_at);
        }
    }
}

checkData();
