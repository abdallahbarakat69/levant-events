import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkLastClients() {
    // 1. Read last few names from Excel
    const workbook = XLSX.readFile('New_Client_Update.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const propsData = data.slice(1).filter(r => r && r[0]); // valid rows
    const total = propsData.length;
    console.log(`Total non-empty rows: ${total}`);

    const last5Rows = propsData.slice(total - 5);
    const last5Names = last5Rows.map(r => r[0]);

    console.log("Last 5 rows from Excel:", last5Names);

    if (last5Names.length === 0) return;

    // 2. Check if they exist in DB
    const { data: dbClients, error } = await supabase
        .from('clients')
        .select('full_name')
        .in('full_name', last5Names);

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    const foundNames = dbClients.map(c => c.full_name);
    console.log("\nFound in DB:", foundNames);

    const missing = last5Names.filter(name => !foundNames.includes(name));
    console.log("Missing from DB:", missing);
}

checkLastClients();
