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

async function importData() {
    const filePath = path.join(process.cwd(), 'New_Client.xlsx');
    console.log('Reading file:', filePath);

    // Read file
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Sheet1
    // Parse with raw header to handle empty columns if needed, or just standard
    // Using sheet_to_json directly
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} rows.`);

    // 1. Fetch Salesmen to cache
    const { data: salesmenData, error: smError } = await supabase.from('salesmen').select('*');
    if (smError) {
        console.error("Error fetching salesmen:", smError);
        return;
    }

    let salesmenMap = {}; // Name -> ID
    salesmenData.forEach(sm => {
        if (sm.name) salesmenMap[sm.name.toLowerCase().trim()] = sm.id;
    });

    console.log(`Loaded ${salesmenData.length} existing salesmen.`);

    let successCount = 0;
    let failCount = 0;

    for (const row of data) {
        // Map fields
        // Headers: "Company Name", "Phone Number", "Notes", "Sales Man"

        const companyName = row['Company Name'];
        // Skip if no company name
        if (!companyName) continue;

        const phone = row['Phone Number'] || '';
        const notes = row['Notes'] || '';
        const salesmanName = row['Sales Man'];

        let salesmanId = null;

        if (salesmanName) {
            const cleanName = salesmanName.trim();
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
                    salesmenMap[lowerName] = newSm.id; // cache it
                }
            }
        }

        const clientData = {
            full_name: companyName,
            phone: phone,
            notes: notes,
            salesman_id: salesmanId,
            // email and website missing in source
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

importData();
