const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const match = `  const { testType, answers } = req.body;
  
  // 1. CALCULATE SCORE LOCALLY (HARDCODED KEY)
  let calculatedScore = 'N/A';
  let detailedAnswers = [];`;

const replace = `  const { testType, answers, testData } = req.body;
  
  // 1. CALCULATE SCORE LOCALLY (HARDCODED KEY OR DYNAMIC FROM FRONTEND)
  let calculatedScore = 'N/A';
  let detailedAnswers = [];`;

content = content.replace(match, replace);

const matchKeyLogic = `  if (localKeys[testType]) {
    const key = localKeys[testType];
    let correct = 0;
    const total = Object.keys(key).length;
    for (const qId of Object.keys(key)) {
      const ans = answers[qId];
      const isCorrect = ans === key[qId];
      if (isCorrect) correct++;
      detailedAnswers.push({
        soal: qId,
        jawaban_kandidat: ans || '-',
        status: isCorrect ? 'Benar' : 'Salah'
      });
    }
    calculatedScore = (correct / total * 100).toFixed(0);
  } else {
    // For tests without strict correct/incorrect keys (disc, health, dll)
    // We just populate the detailedAnswers with their response
    for (const qId of Object.keys(answers)) {
      if (qId === 'raw_score') continue;
      detailedAnswers.push({
        soal: qId,
        jawaban_kandidat: answers[qId] || '-',
        status: '-'
      });
    }
    if (answers.raw_score !== undefined) {
      calculatedScore = answers.raw_score.toString();
    }
  }`;

const replaceKeyLogic = `  const dynamicKeys: Record<string, string> = {};
  if (testData && testData.questions) {
    testData.questions.forEach((q: any) => {
      if (q.keyAnswer) {
        dynamicKeys[q.id] = q.keyAnswer;
      }
    });
  }

  // Merge dynamic keys with localKeys
  const fallbackKeys = localKeys[testType] || {};
  const activeKeys = { ...fallbackKeys, ...dynamicKeys };

  if (Object.keys(activeKeys).length > 0) {
    let correct = 0;
    const total = Object.keys(activeKeys).length;
    for (const qId of Object.keys(activeKeys)) {
      const ans = answers[qId];
      // Basic match, could be improved if options match exactly
      const isCorrect = ans && activeKeys[qId] && ans.toString().toLowerCase() === activeKeys[qId].toString().toLowerCase();
      if (isCorrect) correct++;
      detailedAnswers.push({
        soal: qId,
        jawaban_kandidat: ans || '-',
        status: isCorrect ? 'Benar' : 'Salah'
      });
    }
    calculatedScore = (correct / total * 100).toFixed(0);
  } else {
    // For tests without strict correct/incorrect keys (disc, health, dll)
    // We just populate the detailedAnswers with their response
    for (const qId of Object.keys(answers)) {
      if (qId === 'raw_score') continue;
      detailedAnswers.push({
        soal: qId,
        jawaban_kandidat: answers[qId] || '-',
        status: '-'
      });
    }
    if (answers.raw_score !== undefined) {
      calculatedScore = answers.raw_score.toString();
    }
  }`;

content = content.replace(matchKeyLogic, replaceKeyLogic);

// also replace the localKeys check in the AI part:
content = content.replace(
  `  } else if (localKeys[testType]) {`,
  `  } else if (Object.keys(activeKeys).length > 0) {`
);

fs.writeFileSync('server.ts', content, 'utf8');
