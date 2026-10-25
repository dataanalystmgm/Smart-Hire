const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. CTA SECTION full width
const ctaTarget = `{/* CTA SECTION */}
      <section className="relative rounded-[2rem] p-12 md:p-24 text-center overflow-hidden mx-4 md:mx-0 shadow-2xl bg-mgm-dark">`;
const ctaReplace = `{/* CTA SECTION */}
      <section className="relative w-screen relative -left-4 sm:-left-8 lg:-left-12 px-4 sm:px-8 lg:px-12 py-12 md:py-24 text-center overflow-hidden shadow-2xl bg-mgm-dark border-y border-mgm-green/20">`;

content = content.replace(ctaTarget, ctaReplace);

// 2. Add 'Lihat selengkapnya'
const ulTarget = `</ul>
            <div className="mt-8">
              <Link to="/tentang-kami" className="inline-flex items-center font-bold text-mgm-dark hover:text-mgm-green transition-colors">
                Lihat selengkapnya <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>`;
// Wait, is it already there?
