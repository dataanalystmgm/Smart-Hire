const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// I will revert my changes and do it cleanly.
// Actually, let's extract the sorted logic into the render function body.
