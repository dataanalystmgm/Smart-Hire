const fs = require('fs');

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Replace header logo
const headerLogoMatch = `<Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-mgm-dark rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-mgm-dark">MGM<span className="text-mgm-green">SmartHire</span></span>
            </Link>`;

const headerLogoReplace = `<Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Mercindo Smart Hire" className="h-10 w-auto object-contain" />
            </Link>`;

content = content.replace(headerLogoMatch, headerLogoReplace);

// Replace footer logo
const footerLogoMatch = `<div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-mgm-green rounded-lg flex items-center justify-center">
                    <Briefcase className="text-white w-5 h-5" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">MGM<span className="text-mgm-yellow">SmartHire</span></span>
                </div>`;

const footerLogoReplace = `<div className="flex items-center space-x-2 mb-4">
                  <img src="/logo.png" alt="Mercindo Smart Hire" className="h-10 w-auto object-contain" />
                </div>`;

content = content.replace(footerLogoMatch, footerLogoReplace);

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
