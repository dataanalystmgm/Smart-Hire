const fs = require('fs');

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// replace header logo & text
const headerMatch = `<img src="/logo_m_only.png" alt="Mercindo Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col justify-center -space-y-1">
                <span className="font-extrabold text-xl tracking-tight text-mgm-dark">Mercindo</span>
                <span className="font-bold text-[13px] tracking-wide text-[#2b90b6]">Smart Hire</span>
              </div>`;

const headerReplace = `<img src="/logo.png" alt="Mercindo Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col justify-center -space-y-1 font-google">
                <span className="font-bold text-xl tracking-tight text-mgm-dark">Mercindo</span>
                <span className="font-semibold text-sm tracking-wide text-[#2b90b6]">Smart Hire</span>
              </div>`;

// replace footer logo & text
const footerMatch = `<img src="/logo_m_only.png" alt="Mercindo Logo" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col justify-center -space-y-1">
                    <span className="font-extrabold text-xl tracking-tight text-white">Mercindo</span>
                    <span className="font-bold text-[13px] tracking-wide text-[#2b90b6]">Smart Hire</span>
                  </div>`;

const footerReplace = `<img src="/logo.png" alt="Mercindo Logo" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col justify-center -space-y-1 font-google">
                    <span className="font-bold text-xl tracking-tight text-white">Mercindo</span>
                    <span className="font-semibold text-sm tracking-wide text-[#2b90b6]">Smart Hire</span>
                  </div>`;

content = content.replace(headerMatch, headerReplace);
content = content.replace(footerMatch, footerReplace);

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
