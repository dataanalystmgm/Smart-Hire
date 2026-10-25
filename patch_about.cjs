const fs = require('fs');
let content = fs.readFileSync('src/pages/About.tsx', 'utf8');

const visionTarget = `<section className="relative w-full max-w-6xl mx-auto px-4 md:px-0">
        <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl flex items-center min-h-[400px]">`;
const visionReplace = `<section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12">
        <div className="relative overflow-hidden bg-slate-900 shadow-xl flex items-center min-h-[400px] w-[100vw] sm:w-[calc(100vw-0px)]">`;

const missionTarget = `<section className="relative w-full max-w-6xl mx-auto px-4 md:px-0">
        <div className="relative rounded-[2rem] overflow-hidden bg-teal-950 shadow-2xl flex items-center justify-end min-h-[400px]">`;
const missionReplace = `<section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12">
        <div className="relative overflow-hidden bg-teal-950 shadow-xl flex items-center justify-end min-h-[400px] w-[100vw] sm:w-[calc(100vw-0px)]">`;

const corpValuesTarget = `<section className="relative w-full max-w-6xl mx-auto px-4 md:px-0">
        <div className="relative rounded-[2rem] overflow-hidden bg-slate-800 shadow-2xl flex flex-col md:flex-row items-stretch min-h-[400px]">`;
const corpValuesReplace = `<section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12">
        <div className="relative overflow-hidden bg-slate-800 shadow-xl flex flex-col md:flex-row items-stretch min-h-[400px] w-[100vw] sm:w-[calc(100vw-0px)]">`;

content = content.replace(visionTarget, visionReplace);
content = content.replace(missionTarget, missionReplace);
content = content.replace(corpValuesTarget, corpValuesReplace);

// Let's actually adjust to use 100vw because layout padding might be hard to override completely without calc
// But `w-[100vw]` might cause horizontal scroll. 
// Standard way inside main that has px-4 is -mx-4 to negate it.
// If main has `w-full px-4 sm:px-8 lg:px-12` then `-mx-4 sm:-mx-8 lg:-mx-12` makes it full width, no need for w-[100vw].
