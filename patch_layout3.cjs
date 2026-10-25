const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const target = `             <div>
                <h4 className="font-semibold mb-4 text-mgm-yellow">Perusahaan</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
                </ul>
             </div>
             <div>
                <h4 className="font-semibold mb-4 text-mgm-yellow">Legal</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                </ul>
             </div>`;

const replace = `             <div>
                <h4 className="font-semibold mb-4 text-mgm-yellow">Perusahaan</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><Link to="/tentang-kami" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
                </ul>
             </div>`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
