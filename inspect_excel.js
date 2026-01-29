import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'New_Client.xlsx');
const workbook = XLSX.readFile(filePath);

const sheetName = 'My clints';
console.log(`Inspecting '${sheetName}'...`);
const sheet = workbook.Sheets[sheetName];

const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log('First 5 rows (raw):');
console.log(JSON.stringify(rawData.slice(0, 5), null, 2));
