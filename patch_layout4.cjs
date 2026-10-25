const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const targetDesktopNav = `<Link to="/lowongan" className={\`text-sm transition-colors \${isActive('/lowongan')}\`}>Lowongan</Link>`;
const replaceDesktopNav = `<Link to="/lowongan" className={\`text-sm transition-colors \${isActive('/lowongan')}\`}>Lowongan</Link>\n              <Link to="/tentang-kami" className={\`text-sm transition-colors \${isActive('/tentang-kami')}\`}>Tentang Kami</Link>`;

const targetMobileNav = `<Link to="/lowongan" className={\`text-base transition-colors py-2 border-b border-slate-100 \${isActive('/lowongan')}\`}>Lowongan</Link>`;
const replaceMobileNav = `<Link to="/lowongan" className={\`text-base transition-colors py-2 border-b border-slate-100 \${isActive('/lowongan')}\`}>Lowongan</Link>\n            <Link to="/tentang-kami" className={\`text-base transition-colors py-2 border-b border-slate-100 \${isActive('/tentang-kami')}\`}>Tentang Kami</Link>`;

content = content.replace(targetDesktopNav, replaceDesktopNav);
content = content.replace(targetMobileNav, replaceMobileNav);

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
