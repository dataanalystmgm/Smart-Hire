const fs = require('fs');

const testsFile = fs.readFileSync('src/data/tests.ts', 'utf8');
const match = testsFile.match(/export const defaultTests = (\[[\s\S]*?\]);\s*export const getTests/);
let tests = eval(match[1]);

for (let i = 1; i <= 20; i++) {
  const qId = `lg${i}`;
  
  // Let's generate a clean, standalone SVG.
  // We can just read the component string to extract the internal SVGs...
  // Actually, wait! The SVGs inside VisualLogicQuestion.tsx are standard.
  // Let's parse VisualLogicQuestion.tsx.
  const code = fs.readFileSync('src/components/VisualLogicQuestion.tsx', 'utf8');
  const caseMatch = code.match(new RegExp(`case '${qId}':[\\s\\S]*?return \\([\\s\\S]*?<div className="flex items-center space-x-2 md:space-x-3">([\\s\\S]*?)<\\/div>\\s*\\)\\;`));
  if (caseMatch) {
    let svgs = [];
    const svgMatches = [...caseMatch[1].matchAll(/<svg width="60" height="60" viewBox="0 0 60 60">([\s\S]*?)<\/svg>/g)];
    
    // We want to generate one wide SVG. Say, 4 boxes, each 60x60, with 20px gaps. Total width = 4*60 + 3*20 = 300.
    // Height = 60.
    let combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60" viewBox="0 0 300 60">`;
    
    // Some sequences have 3 SVGs + 1 empty box for the "?".
    for (let idx = 0; idx < 4; idx++) {
      const offsetX = idx * 80;
      
      // Box border
      const isQuestion = idx === svgMatches.length;
      if (isQuestion) {
        combinedSvg += `<rect x="${offsetX}" y="0" width="60" height="60" rx="8" fill="#f1f5f9" stroke="#10b981" stroke-width="2" stroke-dasharray="4,4" />`;
        combinedSvg += `<text x="${offsetX + 30}" y="36" font-size="24" font-weight="bold" fill="#10b981" font-family="sans-serif" text-anchor="middle">?</text>`;
      } else if (idx < svgMatches.length) {
        combinedSvg += `<rect x="${offsetX}" y="0" width="60" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />`;
        // Insert the inner SVG content, translated
        combinedSvg += `<g transform="translate(${offsetX}, 0)">${svgMatches[idx][1]}</g>`;
      }
      
      // Arrow
      if (idx < 3) {
        combinedSvg += `<text x="${offsetX + 70}" y="36" font-size="16" font-weight="bold" fill="#94a3b8" font-family="sans-serif" text-anchor="middle">→</text>`;
      }
    }
    
    combinedSvg += `</svg>`;
    
    const seqBase64 = `data:image/svg+xml;base64,${Buffer.from(combinedSvg).toString('base64')}`;
    
    const testIdx = tests.findIndex(t => t.id === 'logika_gambar');
    const qIdx = tests[testIdx].questions.findIndex(q => q.id === qId);
    if (qIdx !== -1) {
      tests[testIdx].questions[qIdx].imageUrl = seqBase64;
    }
  }
}

const newArrayStr = JSON.stringify(tests, null, 2);
const newContent = testsFile.replace(match[1], newArrayStr);
fs.writeFileSync('src/data/tests.ts', newContent, 'utf8');

console.log('updated sequences');
