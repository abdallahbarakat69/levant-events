import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkFirstClients() {
    // 1. Read first few names from Excel
    const workbook = XLSX.readFile('New_Client_Update.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("First 5 rows from Excel:");
    // Row 0 is header, Row 1 is data
    const first5 = data.slice(1, 6).map(r => r[0]); // Get Company Name (col 0)
    console.log(first5);

    if (first5.length === 0) return;

    // 2. Check if they exist in DB
    const { data: dbClients, error } = await supabase
        .from('clients')
        .select('full_name')
        .in('full_name', first5);

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    const foundNames = dbClients.map(c => c.full_name);
    console.log("\nFound in DB:", foundNames);

    const missing = first5.filter(name => !foundNames.includes(name));
    console.log("Missing from DB:", missing);
}

checkFirstClients();
