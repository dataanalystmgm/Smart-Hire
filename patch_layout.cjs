const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const headerMatch = `<img src="/logo.png" alt="Mercindo Smart Hire" className="h-10 w-auto object-contain" />`;

const headerReplace = `<img src="/logo_m_only.png" alt="Mercindo Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col justify-center -space-y-1">
                <span className="font-extrabold text-xl tracking-tight text-mgm-dark">Mercindo</span>
                <span className="font-bold text-[13px] tracking-wide text-[#2b90b6]">Smart Hire</span>
              </div>`;
              
const footerReplace = `<img src="/logo_m_only.png" alt="Mercindo Logo" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col justify-center -space-y-1">
                    <span className="font-extrabold text-xl tracking-tight text-white">Mercindo</span>
                    <span className="font-bold text-[13px] tracking-wide text-[#2b90b6]">Smart Hire</span>
                  </div>`;

// Replace first occurrence (header)
content = content.replace(headerMatch, headerReplace);

// Replace second occurrence (footer)
content = content.replace(headerMatch, footerReplace);

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
