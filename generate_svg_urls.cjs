const fs = require('fs');

const file = fs.readFileSync('src/components/VisualLogicQuestion.tsx', 'utf8');

const getSequence = (id) => {
  const regex = new RegExp(`case '${id}':.*?return \\(.*?<div.*?>(.*?)</div>\\s*<span.*?</div>\\s*<span.*?</div>\\s*<span.*?</div>.*?\\);`, 's');
  const match = file.match(regex);
  if (match) {
    // This is getting complex, maybe it's easier to just use regex to extract all SVGs?
    // Let's just do it manually for a few, or find a simpler way.
  }
};
