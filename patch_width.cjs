const fs = require('fs');

// Home CTA
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace(
  'w-screen relative -left-4 sm:-left-8 lg:-left-12 px-4 sm:px-8 lg:px-12',
  '-mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12'
);
fs.writeFileSync('src/pages/Home.tsx', home, 'utf8');

// Lowongan Header
let lowongan = fs.readFileSync('src/pages/Lowongan.tsx', 'utf8');
lowongan = lowongan.replace(
  'w-screen relative -left-4 sm:-left-8 lg:-left-12 px-4 sm:px-8 lg:px-12',
  '-mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12'
);
fs.writeFileSync('src/pages/Lowongan.tsx', lowongan, 'utf8');

// About sections
let about = fs.readFileSync('src/pages/About.tsx', 'utf8');
about = about.replace(/w-screen relative -left-4 sm:-left-8 lg:-left-12/g, '');
fs.writeFileSync('src/pages/About.tsx', about, 'utf8');

