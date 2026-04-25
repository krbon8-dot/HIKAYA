import fs from 'fs';
let c = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');
const searchStr = String.fromCharCode(92) + '$' + '{';
console.log('Searching for:', searchStr);
c = c.split(searchStr).join('${');
fs.writeFileSync('src/components/ExportModal.tsx', c);
console.log('Fixed');
