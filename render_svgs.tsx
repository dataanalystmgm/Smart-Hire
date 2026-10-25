import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import VisualLogicQuestion from './src/components/VisualLogicQuestion';

const outDir = path.join(process.cwd(), 'public', 'tests');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Mock the question prop to just provide the ID
const renderSequence = (id: string) => {
  const comp = <VisualLogicQuestion question={{id, imageUrl: null}} selectedOption="" onChange={() => {}} />;
  const html = renderToStaticMarkup(comp);
  
  // We need to extract the part that renders the sequence.
  // Actually, wait, VisualLogicQuestion renders BOTH sequence and options at the same time.
  // It renders:
  // <div className="space-y-6">
  //   <div className="bg-slate-100...">{renderQuestionSequence()}</div>
  //   <div className="grid...">{options.map(renderOptionDiagram)}</div>
  // </div>
  return html;
};

for (let i = 1; i <= 20; i++) {
  const id = `lg${i}`;
  const html = renderSequence(id);
  fs.writeFileSync(path.join(outDir, `${id}.html`), html);
}
console.log('done');
