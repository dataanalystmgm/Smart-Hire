const fs = require('fs');

const content = fs.readFileSync('src/data/tests.ts', 'utf8');

function extractKeys() {
  const match = content.match(/export const defaultTests = (\[[\s\S]*?\]);\s*export const getTests/);
  if (!match) return;

  // We can't simply eval because it's not valid JSON (no quotes on keys, etc), 
  // but let's try a clever hack: wrap it in a function.
  let jsObj = match[1];
  
  let tests;
  try {
    tests = eval(jsObj);
  } catch(e) {
    console.error(e);
  }

  const meneliti = tests.find(t => t.id === 'meneliti_teks');
  const mtKey = {};
  if (meneliti) {
    meneliti.questions.forEach(q => {
      const matchText = q.text.match(/A: (.*)\nB: (.*)/);
      if (matchText) {
        mtKey[q.id] = matchText[1].trim() === matchText[2].trim() ? 'Ya' : 'Tidak';
      }
    });
  }
  
  const silogisme = tests.find(t => t.id === 'silogisme');
  const slKey = {};
  if (silogisme) {
    // Just use the first option as the correct one for simplicity?
    // Wait, the first option in tests.ts might not be the correct answer!
    // I need to know the correct answer for silogisme!
  }

  console.log("MENELITI:");
  console.log(JSON.stringify(mtKey));
}

extractKeys();
