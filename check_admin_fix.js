
import { supabase } from './src/supabaseClient.js';

async function checkAdmin() {
    console.log("Checking role for 'abdallahbarakat'...");
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', 'abdallahbarakat');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Profile found:", data);
        if (data.length > 0 && data[0].role !== 'admin') {
            console.log("User is NOT admin. Fixing...");
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', data[0].id);

            if (updateError) console.error("Update failed:", updateError);
            else console.log("User updated to ADMIN.");
        } else if (data.length === 0) {
            console.log("User 'abdallahbarakat' NOT FOUND in profiles!");
        } else {
            console.log("User is already ADMIN.");
        }
    }
}

checkAdmin();
