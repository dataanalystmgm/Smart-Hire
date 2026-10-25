const fs = require('fs');

const content = fs.readFileSync('src/data/tests.ts', 'utf8');

function extractKeys() {
  const match = content.match(/export const defaultTests = (\[[\s\S]*?\]);\s*export const getTests/);
  let jsObj = match[1];
  let tests = eval(jsObj);

  const mtKey = {};
  const meneliti = tests.find(t => t.id === 'meneliti_teks');
  if (meneliti) {
    meneliti.questions.forEach(q => {
      const matchText = q.text.match(/A: (.*)\nB: (.*)/);
      if (matchText) {
        mtKey[q.id] = matchText[1].trim() === matchText[2].trim() ? 'Ya' : 'Tidak';
      }
    });
  }

  const slKey = {};
  const silogisme = tests.find(t => t.id === 'silogisme');
  if (silogisme) {
    silogisme.questions.forEach(q => {
      slKey[q.id] = q.options[0];
    });
  }

  const avKey = {};
  const av = tests.find(t => t.id === 'analogi_verbal');
  if (av) {
    av.questions.forEach((q, i) => {
      if (q.id === 'av1') avKey[q.id] = 'Bulan';
      else avKey[q.id] = q.options[0]; // assuming rest are index 0
    });
  }
  
  console.log("const keys = {");
  console.log(`  meneliti_teks: ${JSON.stringify(mtKey)},`);
  console.log(`  silogisme: ${JSON.stringify(slKey)},`);
  console.log(`  analogi_verbal: ${JSON.stringify(avKey)}`);
  console.log("};");
}

extractKeys();
