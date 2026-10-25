const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const ulTarget = `</ul>
          </motion.div>
          <motion.div`;

const ulReplace = `</ul>
            <div className="mt-8">
              <Link to="/tentang-kami" className="inline-flex items-center font-bold text-mgm-dark hover:text-mgm-green transition-colors bg-mgm-light px-6 py-3 rounded-xl shadow-sm border border-slate-100 hover:border-mgm-green/30 group">
                Lihat selengkapnya <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
          <motion.div`;

content = content.replace(ulTarget, ulReplace);

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
