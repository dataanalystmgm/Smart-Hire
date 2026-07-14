const fs = require('fs');

const cases11_20_seq = `
      case 'lg11': return renderSequence(questionId);
      case 'lg12': return renderSequence(questionId);
      case 'lg13': return renderSequence(questionId);
      case 'lg14': return renderSequence(questionId);
      case 'lg15': return renderSequence(questionId);
      case 'lg16': return renderSequence(questionId);
      case 'lg17': return renderSequence(questionId);
      case 'lg18': return renderSequence(questionId);
      case 'lg19': return renderSequence(questionId);
      case 'lg20': return renderSequence(questionId);
`;

const cases11_20_opt = `
      case 'lg11': return renderOption(questionId, opt);
      case 'lg12': return renderOption(questionId, opt);
      case 'lg13': return renderOption(questionId, opt);
      case 'lg14': return renderOption(questionId, opt);
      case 'lg15': return renderOption(questionId, opt);
      case 'lg16': return renderOption(questionId, opt);
      case 'lg17': return renderOption(questionId, opt);
      case 'lg18': return renderOption(questionId, opt);
      case 'lg19': return renderOption(questionId, opt);
      case 'lg20': return renderOption(questionId, opt);
`;

let content = fs.readFileSync('src/components/VisualLogicQuestion.tsx', 'utf8');

// The file needs a generic renderSequence and renderOption or we just inline some dummy SVGs for lg11-lg20 to make it simple.
