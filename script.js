const fs=require('fs');
const path='C:/MIA-APP/app/admin/projects/[id]/page.tsx';
const text=fs.readFileSync(path,'utf8');
const start=text.indexOf('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\"');
const idx=text.indexOf('flex items-start gap-3', start);
console.log(text.slice(idx, idx+400));
