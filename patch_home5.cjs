const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const ctaTarget = `<section className="relative rounded-[2rem] p-12 md:p-24 text-center overflow-hidden mx-4 md:mx-0 shadow-2xl bg-mgm-dark">`;
const ctaReplace = `<section className="relative w-screen relative -left-4 sm:-left-8 lg:-left-12 px-4 sm:px-8 lg:px-12 py-12 md:py-24 text-center overflow-hidden shadow-2xl bg-mgm-dark border-y border-mgm-green/20">`;

content = content.replace(ctaTarget, ctaReplace);

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
