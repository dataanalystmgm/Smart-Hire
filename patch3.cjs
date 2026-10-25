const fs = require('fs');

let content = fs.readFileSync('src/components/GenericTest.tsx', 'utf8');

content = content.replace(
  /<VisualLogicQuestion\s+questionId=\{q\.id\}\s+selectedOption=\{answers\[q\.id\] \|\| ''\}\s+onChange=\{\(val\) => handleAnswer\(q\.id, val\)\}\s+\/>/,
  `<VisualLogicQuestion \n                question={q}\n                selectedOption={answers[q.id] || ''}\n                onChange={(val) => handleAnswer(q.id, val)}\n              />`
);

fs.writeFileSync('src/components/GenericTest.tsx', content, 'utf8');
