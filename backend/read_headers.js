const XLSX = require('xlsx');
const workbook = XLSX.readFile('C:\\Users\\nalla\\Desktop\\Microland\\Retail_Intelligence_Dataset_500.xlsx');
const sheets = workbook.SheetNames;

sheets.forEach(sheetName => {
  console.log(`--- Sheet: ${sheetName} ---`);
  const worksheet = workbook.Sheets[sheetName];
  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
  if (headers) {
    headers.forEach(h => console.log(h));
  }
  console.log('');
});
