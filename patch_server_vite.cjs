const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'const { createServer: createViteServer } = await import("vite");',
  'let createViteServer;\n    try {\n      createViteServer = (await import("vite")).createServer;\n    } catch (e) {}'
);

content = content.replace(
  'const vite = await createViteServer({',
  'if (createViteServer) {\n      const vite = await createViteServer({'
);

content = content.replace(
  'app.use(vite.middlewares);\n  } else {',
  'app.use(vite.middlewares);\n    }\n  } else {'
);

fs.writeFileSync('server.ts', content);
