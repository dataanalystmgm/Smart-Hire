import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import VisualLogicQuestion from './src/components/VisualLogicQuestion';

const testsFile = fs.readFileSync('src/data/tests.ts', 'utf8');
const match = testsFile.match(/export const defaultTests = (\[[\s\S]*?\]);\s*export const getTests/);
let tests = eval(match[1]);

for (let i = 1; i <= 20; i++) {
  const qId = `lg${i}`;
  const comp = <VisualLogicQuestion question={{id: qId, imageUrl: null}} selectedOption="" onChange={() => {}} />;
  const html = renderToStaticMarkup(comp);
  
  const $ = cheerio.load(html);
  
  // The sequence is the div with class "flex items-center space-x-2 md:space-x-3"
  const sequenceHtml = $('.flex.items-center.space-x-2.md\\:space-x-3').parent().html();
  // Wait, sequenceHtml is inside a bg-slate-100 div. We should just capture the whole Sequence block.
  // Actually, we can wrap it in an SVG with foreignObject, or just generate HTML string and encode as SVG?
  // foreignObject allows rendering HTML inside SVG.
  // Better yet, why not just let the `imageUrl` be an SVG string containing a foreignObject?
  
  const seqSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="150">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;height:100%;font-family:sans-serif;background-color:#f1f5f9;padding:20px;border-radius:10px;">
        ${$('.flex.items-center.space-x-2.md\\:space-x-3').parent().html()}
      </div>
    </foreignObject>
  </svg>`;
  
  const seqBase64 = `data:image/svg+xml;base64,${Buffer.from(seqSvg).toString('base64')}`;

  const options = ['A', 'B', 'C', 'D'];
  const optBase64 = {};
  
  $('.grid.grid-cols-2.md\\:grid-cols-4 button').each((index, el) => {
    const optSvg = $(el).find('.min-h-\\[50px\\]').html();
    // Some SVGs don't have xmlns
    const cleanedSvg = optSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    optBase64[options[index]] = `data:image/svg+xml;base64,${Buffer.from(cleanedSvg).toString('base64')}`;
  });
  
  const testIdx = tests.findIndex(t => t.id === 'logika_gambar');
  const qIdx = tests[testIdx].questions.findIndex(q => q.id === qId);
  tests[testIdx].questions[qIdx].imageUrl = seqBase64;
  tests[testIdx].questions[qIdx].optionImages = optBase64;
}

const newArrayStr = JSON.stringify(tests, null, 2);
const newContent = testsFile.replace(match[1], newArrayStr);
fs.writeFileSync('src/data/tests.ts', newContent, 'utf8');

console.log('updated tests.ts');
