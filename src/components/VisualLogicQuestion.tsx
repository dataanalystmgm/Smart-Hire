import React from 'react';

interface VisualLogicQuestionProps {
  questionId: string;
  selectedOption: string;
  onChange: (value: string) => void;
}

export default function VisualLogicQuestion({ questionId, selectedOption, onChange }: VisualLogicQuestionProps) {
  // Common Box Styles
  const boxClass = "w-20 h-20 md:w-24 md:h-24 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center relative overflow-hidden";
  const labelClass = "text-[10px] md:text-xs font-bold text-slate-400 absolute bottom-1 right-1.5";

  // Render Question Sequence of 4 boxes
  const renderQuestionSequence = () => {
    switch (questionId) {
      case 'lg1': // Matrix Progression / Grid Rotation
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <rect x="5" y="5" width="50" height="50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="15" cy="15" r="8" fill="#10b981" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <rect x="5" y="5" width="50" height="50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="45" cy="15" r="8" fill="#10b981" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <rect x="5" y="5" width="50" height="50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="15" cy="45" r="8" fill="#10b981" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg2': // Dot accumulation (1, 3, 6, ?)
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="4" fill="#334155" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="18" r="4" fill="#334155" />
                <circle cx="20" cy="38" r="4" fill="#334155" />
                <circle cx="40" cy="38" r="4" fill="#334155" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="12" r="4" fill="#334155" />
                <circle cx="20" cy="28" r="4" fill="#334155" />
                <circle cx="40" cy="28" r="4" fill="#334155" />
                <circle cx="10" cy="44" r="4" fill="#334155" />
                <circle cx="30" cy="44" r="4" fill="#334155" />
                <circle cx="50" cy="44" r="4" fill="#334155" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg3': // Rotating Arrow
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <path d="M30 50 V15 M30 15 L20 25 M30 15 L40 25" stroke="#334155" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <path d="M10 30 H45 M45 30 L35 20 M45 30 L35 40" stroke="#334155" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <path d="M30 10 V45 M30 45 L20 35 M30 45 L40 35" stroke="#334155" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg4': // Pie Chart Filled Quadrant Rotation
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="22" stroke="#475569" strokeWidth="2" fill="none" />
                <line x1="30" y1="8" x2="30" y2="52" stroke="#475569" strokeWidth="1.5" />
                <line x1="8" y1="30" x2="52" y2="30" stroke="#475569" strokeWidth="1.5" />
                <path d="M30 30 L30 8 A22 22 0 0 0 8 30 Z" fill="#3b82f6" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="22" stroke="#475569" strokeWidth="2" fill="none" />
                <line x1="30" y1="8" x2="30" y2="52" stroke="#475569" strokeWidth="1.5" />
                <line x1="8" y1="30" x2="52" y2="30" stroke="#475569" strokeWidth="1.5" />
                <path d="M30 30 L52 30 A22 22 0 0 0 30 8 Z" fill="#3b82f6" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="22" stroke="#475569" strokeWidth="2" fill="none" />
                <line x1="30" y1="8" x2="30" y2="52" stroke="#475569" strokeWidth="1.5" />
                <line x1="8" y1="30" x2="52" y2="30" stroke="#475569" strokeWidth="1.5" />
                <path d="M30 30 L30 52 A22 22 0 0 0 52 30 Z" fill="#3b82f6" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg5': // Shapes Side Count: Triangle, Square, Pentagon, ?
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <polygon points="30,10 50,45 10,45" stroke="#ec4899" strokeWidth="3" fill="none" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <rect x="12" y="12" width="36" height="36" stroke="#ec4899" strokeWidth="3" fill="none" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <polygon points="30,10 49,24 42,47 18,47 11,24" stroke="#ec4899" strokeWidth="3" fill="none" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg6': // Line Crossings (1, 2, 3, ?)
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <line x1="30" y1="10" x2="30" y2="50" stroke="#f59e0b" strokeWidth="3" />
                <line x1="10" y1="30" x2="50" y2="30" stroke="#f59e0b" strokeWidth="3" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <line x1="30" y1="10" x2="30" y2="50" stroke="#f59e0b" strokeWidth="3" />
                <line x1="10" y1="20" x2="50" y2="20" stroke="#f59e0b" strokeWidth="3" />
                <line x1="10" y1="40" x2="50" y2="40" stroke="#f59e0b" strokeWidth="3" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <line x1="30" y1="10" x2="30" y2="50" stroke="#f59e0b" strokeWidth="3" />
                <line x1="10" y1="18" x2="50" y2="18" stroke="#f59e0b" strokeWidth="3" />
                <line x1="10" y1="30" x2="50" y2="30" stroke="#f59e0b" strokeWidth="3" />
                <line x1="10" y1="42" x2="50" y2="42" stroke="#f59e0b" strokeWidth="3" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg7': // Corner dots (1, 2, 3, ?)
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <rect x="12" y="12" width="36" height="36" stroke="#475569" strokeWidth="2" fill="none" />
                <circle cx="12" cy="48" r="5" fill="#a855f7" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <rect x="12" y="12" width="36" height="36" stroke="#475569" strokeWidth="2" fill="none" />
                <circle cx="12" cy="48" r="5" fill="#a855f7" />
                <circle cx="48" cy="48" r="5" fill="#a855f7" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <rect x="12" y="12" width="36" height="36" stroke="#475569" strokeWidth="2" fill="none" />
                <circle cx="12" cy="48" r="5" fill="#a855f7" />
                <circle cx="48" cy="48" r="5" fill="#a855f7" />
                <circle cx="48" cy="12" r="5" fill="#a855f7" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg8': // Concentric circles (1, 2, 3, ?)
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="8" stroke="#14b8a6" strokeWidth="3.5" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="8" stroke="#14b8a6" strokeWidth="3.5" fill="none" />
                <circle cx="30" cy="30" r="15" stroke="#14b8a6" strokeWidth="3.5" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="8" stroke="#14b8a6" strokeWidth="3.5" fill="none" />
                <circle cx="30" cy="30" r="15" stroke="#14b8a6" strokeWidth="3.5" fill="none" />
                <circle cx="30" cy="30" r="22" stroke="#14b8a6" strokeWidth="3.5" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg9': // Center pointing hand rotation (0, 45, 90, ?)
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="2" fill="#334155" />
                <line x1="30" y1="30" x2="30" y2="10" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="2" fill="#334155" />
                <line x1="30" y1="30" x2="44" y2="16" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="2" fill="#334155" />
                <line x1="30" y1="30" x2="50" y2="30" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      case 'lg10': // Star Points Count (3-point, 4-point, 5-point, ?)
        return (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={boxClass}>
              <span className={labelClass}>1</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                {/* 3 Point Star */}
                <polygon points="30,8 35,25 50,30 35,35 30,52 25,35 10,30 25,25" stroke="#ef4444" strokeWidth="1.5" fill="none" className="hidden" />
                <path d="M30 10 L35 28 L50 30 L35 32 L30 50 L25 32 L10 30 L25 28 Z" stroke="#3b82f6" strokeWidth="2.5" fill="none" className="hidden" />
                {/* Direct clean custom path */}
                <path d="M30 10 L33 24 L48 20 L35 30 L40 46 L30 36 L20 46 L25 30 L12 20 L27 24 Z" stroke="#e11d48" strokeWidth="2.5" fill="none" className="hidden" />
                {/* 3 pointed star path */}
                <path d="M30 10 L35 26 L48 38 L30 32 L12 38 L25 26 Z" stroke="#e11d48" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>2</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                {/* 4 Point Star */}
                <path d="M30 8 L35 25 L52 30 L35 35 L30 52 L25 35 L8 30 L25 25 Z" stroke="#e11d48" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={boxClass}>
              <span className={labelClass}>3</span>
              <svg width="60" height="60" viewBox="0 0 60 60">
                {/* 5 Point Star */}
                <path d="M30 8 L35 22 L50 22 L38 32 L42 48 L30 38 L18 48 L22 32 L10 22 L25 22 Z" stroke="#e11d48" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <div className={`${boxClass} bg-slate-100 border-2 border-dashed border-mgm-green/40`}>
              <span className="text-mgm-green font-extrabold text-2xl">?</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render option diagrams for choices (A, B, C, D)
  const renderOptionDiagram = (opt: string) => {
    switch (questionId) {
      case 'lg1': // Matrix Progression / Grid Rotation
        if (opt === 'A') { // Correct: Bottom-Right
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="5" y="5" width="50" height="50" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="45" cy="45" r="7" fill="#10b981" />
            </svg>
          );
        } else if (opt === 'B') { // Top-Left
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="5" y="5" width="50" height="50" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="15" cy="15" r="7" fill="#10b981" />
            </svg>
          );
        } else if (opt === 'C') { // Bottom-Left
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="5" y="5" width="50" height="50" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="15" cy="45" r="7" fill="#10b981" />
            </svg>
          );
        } else { // No circle
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="5" y="5" width="50" height="50" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
            </svg>
          );
        }

      case 'lg2': // Dot accumulation (1, 3, 6, ? -> 10)
        if (opt === 'A') { // Correct: 10 dots
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="8" r="3" fill="#334155" />
              <circle cx="21" cy="21" r="3" fill="#334155" />
              <circle cx="39" cy="21" r="3" fill="#334155" />
              <circle cx="12" cy="34" r="3" fill="#334155" />
              <circle cx="30" cy="34" r="3" fill="#334155" />
              <circle cx="48" cy="34" r="3" fill="#334155" />
              <circle cx="8" cy="48" r="3" fill="#334155" />
              <circle cx="22" cy="48" r="3" fill="#334155" />
              <circle cx="38" cy="48" r="3" fill="#334155" />
              <circle cx="52" cy="48" r="3" fill="#334155" />
            </svg>
          );
        } else if (opt === 'B') { // 9 dots in grid
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              {[15, 30, 45].map(x => [15, 30, 45].map(y => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#334155" />
              )))}
            </svg>
          );
        } else if (opt === 'C') { // 12 dots
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="10" r="3" fill="#334155" />
              {[15, 45].map(x => <circle key={x} cx={x} cy={20} r="3" fill="#334155" />)}
              {[10, 30, 50].map(x => <circle key={x} cx={x} cy={32} r="3" fill="#334155" />)}
              {[8, 22, 38, 52].map(x => <circle key={x} cx={x} cy={44} r="3" fill="#334155" />)}
              {[20, 40].map(x => <circle key={x} cx={x} cy={52} r="3" fill="#334155" />)}
            </svg>
          );
        } else { // 8 dots in circle
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              {[0, 45, 90, 135, 180, 225, 270, 315].map(ang => {
                const rad = (ang * Math.PI) / 180;
                const cx = 30 + 18 * Math.cos(rad);
                const cy = 30 + 18 * Math.sin(rad);
                return <circle key={ang} cx={cx} cy={cy} r="3" fill="#334155" />;
              })}
            </svg>
          );
        }

      case 'lg3': // Rotating Arrow (Left)
        if (opt === 'A') { // Correct: Left
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <path d="M50 30 H15 M15 30 L25 20 M15 30 L25 40" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          );
        } else if (opt === 'B') { // Up
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <path d="M30 50 V15 M30 15 L20 25 M30 15 L40 25" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          );
        } else if (opt === 'C') { // Diagonally up-right
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <path d="M16 44 L40 20 M40 20 H28 M40 20 V32" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          );
        } else { // Right
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <path d="M10 30 H45 M45 30 L35 20 M45 30 L35 40" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          );
        }

      case 'lg4': // Pie Chart Filled Quadrant Rotation
        if (opt === 'A') { // Correct: Bottom-Left
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="20" stroke="#475569" strokeWidth="1.5" fill="none" />
              <line x1="30" y1="10" x2="30" y2="50" stroke="#475569" strokeWidth="1" />
              <line x1="10" y1="30" x2="50" y2="30" stroke="#475569" strokeWidth="1" />
              <path d="M30 30 L10 30 A20 20 0 0 0 30 50 Z" fill="#3b82f6" />
            </svg>
          );
        } else if (opt === 'B') { // Top-Left
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="20" stroke="#475569" strokeWidth="1.5" fill="none" />
              <line x1="30" y1="10" x2="30" y2="50" stroke="#475569" strokeWidth="1" />
              <line x1="10" y1="30" x2="50" y2="30" stroke="#475569" strokeWidth="1" />
              <path d="M30 30 L30 10 A20 20 0 0 0 10 30 Z" fill="#3b82f6" />
            </svg>
          );
        } else if (opt === 'C') { // Top-Right
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="20" stroke="#475569" strokeWidth="1.5" fill="none" />
              <line x1="30" y1="10" x2="30" y2="50" stroke="#475569" strokeWidth="1" />
              <line x1="10" y1="30" x2="50" y2="30" stroke="#475569" strokeWidth="1" />
              <path d="M30 30 L50 30 A20 20 0 0 0 30 10 Z" fill="#3b82f6" />
            </svg>
          );
        } else { // All quadrants filled
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="20" fill="#3b82f6" stroke="#475569" strokeWidth="1.5" />
            </svg>
          );
        }

      case 'lg5': // Shape side count: Hexagon
        if (opt === 'A') { // Correct: Hexagon (6 sides)
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <polygon points="30,8 48,18 48,42 30,52 12,42 12,18" stroke="#ec4899" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            </svg>
          );
        } else if (opt === 'B') { // Circle
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="20" stroke="#ec4899" strokeWidth="2.5" fill="none" />
            </svg>
          );
        } else if (opt === 'C') { // Octagon (8 sides)
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <polygon points="30,8 44,14 50,28 44,42 30,48 16,42 10,28 16,14" stroke="#ec4899" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            </svg>
          );
        } else { // Star
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <path d="M30 10 L35 24 L50 24 L38 32 L42 46 L30 38 L18 46 L22 32 L10 24 L25 24 Z" stroke="#ec4899" strokeWidth="2.5" fill="none" />
            </svg>
          );
        }

      case 'lg6': // Line intersections: 1 vertical, 4 horizontal
        if (opt === 'A') { // Correct: 1 vertical, 4 horizontal
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <line x1="30" y1="8" x2="30" y2="52" stroke="#f59e0b" strokeWidth="2" />
              {[15, 25, 35, 45].map(y => <line key={y} x1="10" y1={y} x2="50" y2={y} stroke="#f59e0b" strokeWidth="2" />)}
            </svg>
          );
        } else if (opt === 'B') { // 2 vertical, 1 horizontal
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <line x1="20" y1="10" x2="20" y2="50" stroke="#f59e0b" strokeWidth="2" />
              <line x1="40" y1="10" x2="40" y2="50" stroke="#f59e0b" strokeWidth="2" />
              <line x1="10" y1="30" x2="50" y2="30" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          );
        } else if (opt === 'C') { // No lines
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="5" y="5" width="50" height="50" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </svg>
          );
        } else { // 2 vertical, 2 horizontal
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <line x1="20" y1="10" x2="20" y2="50" stroke="#f59e0b" strokeWidth="2" />
              <line x1="40" y1="10" x2="40" y2="50" stroke="#f59e0b" strokeWidth="2" />
              <line x1="10" y1="20" x2="50" y2="20" stroke="#f59e0b" strokeWidth="2" />
              <line x1="10" y1="40" x2="50" y2="40" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          );
        }

      case 'lg7': // Corner dots: Dots at all 4 corners
        if (opt === 'A') { // Correct: 4 corners
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="12" y="12" width="36" height="36" stroke="#475569" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="4" fill="#a855f7" />
              <circle cx="12" cy="48" r="4" fill="#a855f7" />
              <circle cx="48" cy="12" r="4" fill="#a855f7" />
              <circle cx="48" cy="48" r="4" fill="#a855f7" />
            </svg>
          );
        } else if (opt === 'B') { // 3 corners (left-top, left-bottom, right-top)
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="12" y="12" width="36" height="36" stroke="#475569" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="4" fill="#a855f7" />
              <circle cx="12" cy="48" r="4" fill="#a855f7" />
              <circle cx="48" cy="12" r="4" fill="#a855f7" />
            </svg>
          );
        } else if (opt === 'C') { // Empty
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="12" y="12" width="36" height="36" stroke="#475569" strokeWidth="1.5" fill="none" />
            </svg>
          );
        } else { // 1 corner (top-left)
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <rect x="12" y="12" width="36" height="36" stroke="#475569" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="4" fill="#a855f7" />
            </svg>
          );
        }

      case 'lg8': // Concentric circles count: 4 circles
        if (opt === 'A') { // Correct: 4 circles
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              {[6, 12, 18, 24].map(r => <circle key={r} cx="30" cy="30" r={r} stroke="#14b8a6" strokeWidth="2.5" fill="none" />)}
            </svg>
          );
        } else if (opt === 'B') { // 1 circle
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="12" stroke="#14b8a6" strokeWidth="2.5" fill="none" />
            </svg>
          );
        } else if (opt === 'C') { // 5 circles
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              {[5, 10, 15, 20, 25].map(r => <circle key={r} cx="30" cy="30" r={r} stroke="#14b8a6" strokeWidth="2.5" fill="none" />)}
            </svg>
          );
        } else { // Circle with square inside
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="20" stroke="#14b8a6" strokeWidth="2.5" fill="none" />
              <rect x="18" y="18" width="24" height="24" stroke="#14b8a6" strokeWidth="2.5" fill="none" />
            </svg>
          );
        }

      case 'lg9': // Center pointing line rotation (Right-Down / 135 deg)
        if (opt === 'A') { // Correct: Right-Down
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="1.5" fill="#334155" />
              <line x1="30" y1="30" x2="44" y2="44" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );
        } else if (opt === 'B') { // Down (180 deg)
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="1.5" fill="#334155" />
              <line x1="30" y1="30" x2="30" y2="50" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );
        } else if (opt === 'C') { // Left (270 deg)
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="1.5" fill="#334155" />
              <line x1="30" y1="30" x2="10" y2="30" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );
        } else { // Up-Left (315 deg)
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="1.5" fill="#334155" />
              <line x1="30" y1="30" x2="16" y2="16" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );
        }

      case 'lg10': // Star Points Count: 6 points
        if (opt === 'A') { // Correct: 6 points
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <path d="M30 5 L35 18 L48 12 L38 24 L50 30 L38 36 L48 48 L35 42 L30 55 L25 42 L12 48 L22 36 L10 30 L22 24 L12 12 L25 18 Z" stroke="#e11d48" strokeWidth="2" fill="none" />
            </svg>
          );
        } else if (opt === 'B') { // 3-pointed star
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <path d="M30 10 L35 26 L48 38 L30 32 L12 38 L25 26 Z" stroke="#e11d48" strokeWidth="2" fill="none" />
            </svg>
          );
        } else if (opt === 'C') { // Triangle (3 sides)
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <polygon points="30,10 48,45 12,45" stroke="#e11d48" strokeWidth="2" fill="none" />
            </svg>
          );
        } else { // Circle
          return (
            <svg width="50" height="50" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="18" stroke="#e11d48" strokeWidth="2" fill="none" />
            </svg>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Sequence Display */}
      <div className="bg-slate-100 p-4 md:p-6 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center space-y-4">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Pola Deret Gambar</span>
        {renderQuestionSequence()}
      </div>

      {/* Options Selection Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['A', 'B', 'C', 'D'].map((opt) => {
          const isSelected = selectedOption === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex flex-col items-center p-4 bg-white border rounded-2xl transition-all relative ${
                isSelected 
                  ? 'border-mgm-green bg-mgm-light/30 ring-2 ring-mgm-green/20 scale-[1.02]' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Option Radio Dot */}
              <div className="absolute top-3 left-3 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-mgm-green bg-mgm-green' : 'border-slate-300'}`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="ml-1.5 text-xs font-bold text-slate-500">{opt}</span>
              </div>

              {/* Option Image Diagram */}
              <div className="mt-4 flex items-center justify-center min-h-[50px]">
                {renderOptionDiagram(opt)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
