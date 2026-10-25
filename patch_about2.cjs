const fs = require('fs');
let content = fs.readFileSync('src/pages/About.tsx', 'utf8');

const visionTarget = `<section className="relative w-full max-w-6xl mx-auto px-4 md:px-0">
        <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl flex items-center min-h-[400px]">`;
const visionReplace = `<section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden bg-slate-900 shadow-xl flex items-center min-h-[400px] w-screen relative -left-4 sm:-left-8 lg:-left-12">`;

// Wait, standard full bleed in tailwind: 
// w-screen is one way, but `w-[calc(100%+2rem)] -ml-4` works better.
// Actually, since the wrapper has px-4, if we set the element to `-mx-4`, it will span the whole width, and the element will take up 100% of the parent width plus 2rem, exactly matching the screen. So we don't need w-screen.

