const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminTestsEditor.tsx', 'utf8');

const match = `{['multiple', 'boolean', 'visual_pattern'].includes(q.type) && (
                      <div className="mt-2">
                        <label className="text-xs font-semibold text-mgm-green uppercase tracking-wider block mb-1">Kunci Jawaban</label>`;

const replace = `{['multiple', 'boolean', 'visual_pattern'].includes(q.type) && test.id !== 'disc' && test.id !== 'health' && (
                      <div className="mt-2">
                        <label className="text-xs font-semibold text-mgm-green uppercase tracking-wider block mb-1">Kunci Jawaban</label>`;

content = content.replace(match, replace);
fs.writeFileSync('src/pages/AdminTestsEditor.tsx', content, 'utf8');
