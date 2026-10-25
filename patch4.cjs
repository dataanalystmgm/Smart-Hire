const fs = require('fs');
let content = fs.readFileSync('src/components/VisualLogicQuestion.tsx', 'utf8');

content = content.replace(
  /interface VisualLogicQuestionProps \{\n  questionId: string;\n  selectedOption: string;\n  onChange: \(value: string\) => void;\n\}/,
  `interface VisualLogicQuestionProps {
  question: any;
  selectedOption: string;
  onChange: (value: string) => void;
}`
);

content = content.replace(
  /export default function VisualLogicQuestion\(\{ questionId, selectedOption, onChange \}: VisualLogicQuestionProps\) \{/,
  `export default function VisualLogicQuestion({ question, selectedOption, onChange }: VisualLogicQuestionProps) {\n  const questionId = question.id;`
);

const matchSequence = `  // Render Question Sequence of 4 boxes
  const renderQuestionSequence = () => {`;
const replaceSequence = `  // Render Question Sequence of 4 boxes
  const renderQuestionSequence = () => {
    if (question.imageUrl) {
      return <img src={question.imageUrl} alt="Soal" className="max-w-full h-auto rounded shadow-sm object-contain max-h-[300px]" />;
    }`;

content = content.replace(matchSequence, replaceSequence);

const matchOption = `  // Render option diagrams for choices (A, B, C, D)
  const renderOptionDiagram = (opt: string) => {`;
const replaceOption = `  // Render option diagrams for choices (A, B, C, D)
  const renderOptionDiagram = (opt: string) => {
    if (question.optionImages && question.optionImages[opt]) {
      return <img src={question.optionImages[opt]} alt={\`Opsi \${opt}\`} className="max-w-full h-auto rounded shadow-sm object-contain max-h-[100px]" />;
    }`;

content = content.replace(matchOption, replaceOption);

fs.writeFileSync('src/components/VisualLogicQuestion.tsx', content, 'utf8');
