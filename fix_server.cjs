const fs = require('fs');

const content = fs.readFileSync('server.ts', 'utf8');

const newContent = content.replace(/  const \{ messages, context \} = req\.body;\n  try \{\n    const systemPrompt[\s\S]*?res\.status\(500\)\.json\(\{ error: "AI interview failed" \}\);\n  \}\n\}\);/, "");

fs.writeFileSync('server.ts', newContent);
