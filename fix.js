import fs from 'fs';
let content = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/ExportModal.tsx', content);
console.log('Fixed dollar signs');
