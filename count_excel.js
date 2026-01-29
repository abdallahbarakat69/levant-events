import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const workbook = XLSX.readFile('New_Client_Update.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total Rows in Excel (including header):', data.length);
// Filter out empty rows just in case
const nonEmpty = data.filter(row => row && row.length > 0 && row[0]);
console.log('Non-empty rows (approx):', nonEmpty.length);
