const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `      {/* HERO SECTION */}
      <section className="relative rounded-[2rem] overflow-hidden bg-mgm-dark text-white p-8 md:p-16 shadow-2xl flex flex-col items-center gap-12 text-center pb-20">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current"><polygon points="0,100 100,0 100,100"/></svg>
        </div>
        
        <div className="relative z-10 w-full flex flex-col items-center pt-10">`;

const replace = `      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-mgm-dark/95 to-teal-950 text-white p-8 md:p-16 flex flex-col items-center gap-12 text-center pb-20 -mx-4 sm:-mx-8 lg:-mx-12 -mt-10 mb-12 border-b border-white/5">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-mgm-green/20 via-transparent to-transparent"></div>
        
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current"><polygon points="0,100 100,0 100,100"/></svg>
        </div>
        
        <div className="relative z-10 w-full flex flex-col items-center pt-10">`;

content = content.replace(target, replace);
fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
