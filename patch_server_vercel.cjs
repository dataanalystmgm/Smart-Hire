const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'async function startServer() {',
  'export default app;\n\nasync function startServer() {'
);

content = content.replace(
  'startServer();',
  'if (!process.env.VERCEL) {\n  startServer();\n}'
);

fs.writeFileSync('server.ts', content);
