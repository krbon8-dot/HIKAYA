import fs from 'fs';
let c = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');
c = c.replace(/\\\\\$\\{/g, '${');
fs.writeFileSync('src/components/ExportModal.tsx', c);
console.log("Done");
