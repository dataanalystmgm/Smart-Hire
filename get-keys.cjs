const fs = require('fs');
const content = fs.readFileSync('src/data/tests.ts', 'utf8');
const match = content.match(/export const defaultTests = (\[[\s\S]*?\]);\s*export const getTests/);
const tests = eval(match[1]);

const av = tests.find(t => t.id === 'analogi_verbal').questions;
av.forEach(q => console.log(q.id, q.text, q.options));
