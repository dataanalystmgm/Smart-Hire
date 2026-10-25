const fs = require('fs');
let content = fs.readFileSync('src/pages/Lowongan.tsx', 'utf8');

const target1 = `<div className="max-w-7xl mx-auto space-y-12 pb-12">`;
const replace1 = `<div className="space-y-12 pb-12 w-full">`;

const target2 = `{/* Header Banner */}
      <div className="bg-mgm-dark text-white rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden">`;
const replace2 = `{/* Header Banner */}
      <div className="bg-mgm-dark text-white p-8 md:p-12 shadow-xl relative overflow-hidden w-screen relative -left-4 sm:-left-8 lg:-left-12 px-4 sm:px-8 lg:px-12 -mt-10 border-b border-mgm-green/20">`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);

fs.writeFileSync('src/pages/Lowongan.tsx', content, 'utf8');
