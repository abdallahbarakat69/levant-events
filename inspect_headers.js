import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const workbook = XLSX.readFile('New_Client_Update.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Headers:', data[0]);
data.slice(1, 6).forEach((row, i) => {
    console.log(`Row ${i + 1}:`, row);
});
