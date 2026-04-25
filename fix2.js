import fs from 'fs';
let c = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');
c = c.split('\\\\${').join('${');
fs.writeFileSync('src/components/ExportModal.tsx', c);
console.log('Replaced all escapes');
