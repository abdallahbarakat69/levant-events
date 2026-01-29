import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function assignBarakat() {
    const targetName = 'Barakat';

    console.log(`Checking for salesman: ${targetName}...`);

    // 1. Find or Create Barakat
    let { data: salesman, error } = await supabase
        .from('salesmen')
        .select('id')
        .ilike('name', targetName) // Case insensitive match
        .maybeSingle();

    if (error) {
        console.error("Error finding salesman:", error);
        return;
    }

    if (!salesman) {
        console.log(`Salesman '${targetName}' not found. Creating...`);
        const { data: newSm, error: createError } = await supabase
            .from('salesmen')
            .insert([{ name: targetName }])
            .select()
            .single();

        if (createError) {
            console.error("Error creating salesman:", createError);
            return;
        }
        salesman = newSm;
    }

    console.log(`Using Salesman ID: ${salesman.id} for '${targetName}'`);

    // 2. Update NULL entries
    console.log("Updating unassigned clients...");

    const { data: updateData, error: updateError } = await supabase
        .from('clients')
        .update({ salesman_id: salesman.id })
        .is('salesman_id', null)
        .select();

    if (updateError) {
        console.error("Error updating clients:", updateError);
    } else {
        console.log(`Successfully updated ${updateData.length} clients to '${targetName}'.`);
    }
}

assignBarakat();
