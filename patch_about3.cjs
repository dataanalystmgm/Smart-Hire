const fs = require('fs');
let content = fs.readFileSync('src/pages/About.tsx', 'utf8');

const visionTarget = `<section className="relative w-full max-w-6xl mx-auto px-4 md:px-0">
        <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl flex items-center min-h-[400px]">`;
const visionReplace = `<section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden bg-slate-900 flex items-center min-h-[400px] w-screen relative -left-4 sm:-left-8 lg:-left-12">`;

const missionTarget = `<section className="relative w-full max-w-6xl mx-auto px-4 md:px-0">
        <div className="relative rounded-[2rem] overflow-hidden bg-teal-950 shadow-2xl flex items-center justify-end min-h-[400px]">`;
const missionReplace = `<section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden bg-teal-950 flex items-center justify-end min-h-[400px] w-screen relative -left-4 sm:-left-8 lg:-left-12">`;

const corpValuesTarget = `<section className="relative w-full max-w-6xl mx-auto px-4 md:px-0">
        <div className="relative rounded-[2rem] overflow-hidden bg-slate-800 shadow-2xl flex flex-col md:flex-row items-stretch min-h-[400px]">`;
const corpValuesReplace = `<section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden bg-slate-800 flex flex-col md:flex-row items-stretch min-h-[400px] w-screen relative -left-4 sm:-left-8 lg:-left-12">`;

content = content.replace(visionTarget, visionReplace);
content = content.replace(missionTarget, missionReplace);
content = content.replace(corpValuesTarget, corpValuesReplace);

fs.writeFileSync('src/pages/About.tsx', content, 'utf8');
