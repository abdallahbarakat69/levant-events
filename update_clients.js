import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const path = require('path');
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

async function updateClients() {
    console.log('Starting Client Update Process...');

    // 1. Delete all existing clients
    console.log('Deleting all existing clients...');
    // We use a condition that is always true to delete all rows.
    // Assuming 'id' is a UUID, checking if it is not null or not equal to a dummy UUID works.
    const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Valid UUID format

    if (deleteError) {
        console.error('Error deleting clients:', deleteError);
        // Sometimes RLS or other things might prevent mass delete without a where clause.
        // If this fails, we might need to fetch IDs and delete them.
        return;
    }
    console.log('All clients deleted (or table was empty).');

    // 2. Read Excel File
    const filePath = path.join(process.cwd(), 'New_Client_Update.xlsx');
    console.log('Reading file:', filePath);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length < 2) {
        console.log('No data found in Excel file.');
        return;
    }

    // 3. Cache Salesmen
    const { data: salesmenData, error: smError } = await supabase.from('salesmen').select('*');
    if (smError) {
        console.error("Error fetching salesmen:", smError);
        return;
    }

    let salesmenMap = {}; // Name (lowercase) -> ID
    salesmenData.forEach(sm => {
        if (sm.name) salesmenMap[sm.name.toLowerCase().trim()] = sm.id;
    });
    console.log(`Loaded ${salesmenData.length} existing salesmen.`);

    let successCount = 0;
    let failCount = 0;

    // Start from index 1 to skip headers
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // Mapping:
        // Col 0: Company Name
        // Col 1: Phone
        // Col 2: Extra Note
        // Col 3: Email
        // Col 4: Website
        // Col 5: Notes
        // Col 6: Salesman

        const companyName = row[0];
        if (!companyName) continue; // Skip empty rows

        const phone = row[1] || '';

        // Combine notes
        const extraNote = row[2];
        const mainNote = row[5];
        let notesParts = [];
        if (extraNote) notesParts.push(extraNote);
        if (mainNote) notesParts.push(mainNote);
        const notes = notesParts.join('\n');

        const email = row[3] || '';
        const website = row[4] || '';
        const salesmanName = row[6];

        let salesmanId = null;

        if (salesmanName) {
            const cleanName = salesmanName.toString().trim();
            const lowerName = cleanName.toLowerCase();

            if (salesmenMap[lowerName]) {
                salesmanId = salesmenMap[lowerName];
            } else {
                // Create new salesman
                console.log(`Creating new salesman: ${cleanName}`);
                const { data: newSm, error: createError } = await supabase
                    .from('salesmen')
                    .insert([{ name: cleanName }])
                    .select()
                    .single();

                if (createError) {
                    console.error(`Failed to create salesman ${cleanName}:`, createError.message);
                } else {
                    salesmanId = newSm.id;
                    salesmenMap[lowerName] = newSm.id;
                }
            }
        }

        const clientData = {
            full_name: companyName,
            phone: phone,
            email: email,
            notes: notes,
            website: website,
            salesman_id: salesmanId,
        };

        const { error: insertError } = await supabase
            .from('clients')
            .insert([clientData]);

        if (insertError) {
            console.error(`Failed to insert ${companyName}:`, insertError.message);
            failCount++;
        } else {
            successCount++;
            if (successCount % 10 === 0) process.stdout.write('.');
        }
    }

    console.log(`\nImport complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

updateClients();
