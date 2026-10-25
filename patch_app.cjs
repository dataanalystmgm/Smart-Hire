const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import AdminDashboard from './pages/AdminDashboard';`;
const importReplace = `import AdminDashboard from './pages/AdminDashboard';\nimport About from './pages/About';`;

const routeTarget = `<Route path="/lowongan" element={<Lowongan />} />`;
const routeReplace = `<Route path="/lowongan" element={<Lowongan />} />\n          <Route path="/tentang-kami" element={<About />} />`;

content = content.replace(importTarget, importReplace);
content = content.replace(routeTarget, routeReplace);

fs.writeFileSync('src/App.tsx', content, 'utf8');
