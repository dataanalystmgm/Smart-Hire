const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/className="max-w-7xl mx-auto px-4"/g, 'className="w-full px-4"');
content = content.replace(/className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center"/g, 'className="w-full grid lg:grid-cols-2 gap-16 items-center"');

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
