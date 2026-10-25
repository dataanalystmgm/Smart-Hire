const fs = require('fs');
let content = fs.readFileSync('src/pages/Tests.tsx', 'utf8');

content = content.replace(
  /body: JSON.stringify\(\{ testType: testId, answers: answers \}\)/,
  `body: JSON.stringify({ testType: testId, answers: answers, testData: testList.find(t => t.id === testId) })`
);

fs.writeFileSync('src/pages/Tests.tsx', content, 'utf8');
