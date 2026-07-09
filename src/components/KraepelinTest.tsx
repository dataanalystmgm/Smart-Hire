import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, CheckCircle } from 'lucide-react';

export default function KraepelinTest({ onComplete }: { onComplete: (score: number) => void }) {
  const TOTAL_SECTIONS = 40;
  const COLUMN_SIZE = 50;
  const SECTION_TIME = 30; // seconds

  const [currentSection, setCurrentSection] = useState(0);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [answers, setAnswers] = useState<string[]>(Array(COLUMN_SIZE - 1).fill(''));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECTION_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [totalCorrect, setTotalCorrect] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateNumbers = () => {
    return Array.from({ length: COLUMN_SIZE }, () => Math.floor(Math.random() * 9) + 1);
  };

  useEffect(() => {
    setNumbers(generateNumbers());
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      nextSection();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentSection, answers, numbers]);

  const startTest = () => {
    setIsActive(true);
    setTimeout(() => {
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 100);
  };

  const calculateSectionCorrect = () => {
    let correct = 0;
    for (let i = 0; i < COLUMN_SIZE - 1; i++) {
      const expected = (numbers[i] + numbers[i+1]) % 10;
      if (answers[i] === expected.toString()) correct++;
    }
    return correct;
  };

  const nextSection = () => {
    const currentCorrect = calculateSectionCorrect();
    const newTotalCorrect = totalCorrect + currentCorrect;
    setTotalCorrect(newTotalCorrect);
    
    if (currentSection < TOTAL_SECTIONS - 1) {
      setCurrentSection(prev => prev + 1);
      setNumbers(generateNumbers());
      setAnswers(Array(COLUMN_SIZE - 1).fill(''));
      setCurrentIndex(0);
      setTimeLeft(SECTION_TIME);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
          inputRefs.current[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    } else {
      finishTest(newTotalCorrect);
    }
  };

  const finishTest = (finalCorrect: number) => {
    setIsActive(false);
    setIsFinished(true);
    setTotalCorrect(finalCorrect);
  };

  const handleInput = (val: string, index: number) => {
    if (!/^\d$/.test(val) && val !== '') return;

    const newAnswers = [...answers];
    newAnswers[index] = val;
    setAnswers(newAnswers);

    if (val !== '' && index < COLUMN_SIZE - 2) {
      setCurrentIndex(index + 1);
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && answers[index] === '' && index > 0) {
      setCurrentIndex(index - 1);
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 50);
    }
  };

  const finalScorePercent = Math.round((totalCorrect / (TOTAL_SECTIONS * (COLUMN_SIZE - 1))) * 100) || 0;

  if (!isActive && !isFinished) {
     return (
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto"
       >
         <div className="w-16 h-16 bg-mgm-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-mgm-green" />
         </div>
         <h3 className="text-3xl font-bold text-mgm-dark mb-4">Instruksi Tes Kraepelin</h3>
         <p className="text-slate-600 mb-8 text-lg leading-relaxed">
           Tes ini mengukur kecepatan, ketelitian, dan stabilitas kerja Anda.<br/><br/>
           <strong>Cara Kerja:</strong> Anda akan melihat satu kolom angka. Jumlahkan angka atas dan bawah, lalu ketik <strong>digit terakhir</strong> dari hasil penjumlahan (Contoh: 8 + 5 = 13, ketik <strong>3</strong>). Kolom input akan berpindah otomatis ke bawah.<br/><br/>
           Terdapat <strong>{TOTAL_SECTIONS} section</strong>, masing-masing berdurasi <strong>{SECTION_TIME} detik</strong> dengan {COLUMN_SIZE} angka. Perpindahan antar section terjadi secara otomatis.
         </p>
         <div className="bg-mgm-light p-4 rounded-xl mb-8 flex flex-wrap justify-center gap-8 text-sm">
            <div><strong className="text-mgm-dark block text-xl">{TOTAL_SECTIONS}</strong>Section</div>
            <div><strong className="text-mgm-dark block text-xl">{SECTION_TIME}s</strong>Per Section</div>
            <div><strong className="text-mgm-dark block text-xl">{COLUMN_SIZE}</strong>Angka per Kolom</div>
         </div>
         <button 
           onClick={startTest} 
           className="bg-mgm-green text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition shadow-lg hover:shadow-xl flex items-center mx-auto"
         >
           <Play className="w-5 h-5 mr-2 fill-current" /> Mulai Tes Sekarang
         </button>
       </motion.div>
     )
  }

  if (isFinished) {
    return (
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-lg mx-auto"
       >
         <CheckCircle className="w-16 h-16 text-mgm-green mx-auto mb-6" />
         <h3 className="text-3xl font-bold text-mgm-dark mb-4">Tes Selesai!</h3>
         <p className="text-slate-600 mb-8 text-lg">
           Anda telah menyelesaikan semua {TOTAL_SECTIONS} section tes Kraepelin.
         </p>
         <button 
           onClick={() => onComplete(finalScorePercent)} 
           className="bg-mgm-dark text-white px-8 py-3 rounded-xl font-medium hover:bg-opacity-90 transition"
         >
           Kirim Hasil ({finalScorePercent}%)
         </button>
       </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-xl mx-auto">
      <div className="flex w-full items-center justify-between mb-8 pb-6 border-b border-slate-100 sticky top-0 bg-white z-10">
        <div>
          <h2 className="font-bold text-xl text-mgm-dark">Tes Kraepelin</h2>
          <p className="text-sm font-medium text-mgm-green">Section {currentSection + 1} dari {TOTAL_SECTIONS}</p>
        </div>
        <div className={`flex items-center text-2xl font-bold px-4 py-2 rounded-xl ${timeLeft <= 5 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-mgm-light text-mgm-dark'}`}>
          <Clock className="mr-2 w-6 h-6" /> 00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex flex-col items-center space-y-1 w-full max-h-[60vh] overflow-y-auto px-4 pb-32 custom-scrollbar"
      >
        <AnimatePresence mode="popLayout">
          {numbers.map((num, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.01 }}
              key={`${currentSection}-${i}`} 
              className="flex flex-col items-center w-full"
            >
              <span className={`text-3xl font-bold ${currentIndex === i || currentIndex === i - 1 ? 'text-mgm-dark' : 'text-slate-400'}`}>
                {num}
              </span>
              
              {i < numbers.length - 1 && (
                <div className="relative my-2 h-14 flex items-center justify-center">
                  <input
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={answers[i]}
                    onChange={(e) => handleInput(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    disabled={!isActive || timeLeft === 0}
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl transition-all outline-none 
                      ${currentIndex === i ? 'border-4 border-mgm-green bg-mgm-light text-mgm-dark scale-110 shadow-lg' : 
                        answers[i] !== '' ? 'border-2 border-slate-200 bg-slate-50 text-slate-600' : 'border-2 border-slate-200 bg-white'}
                    `}
                  />
                  {currentIndex === i && (
                     <motion.div 
                        layoutId="indicator"
                        className="absolute -right-12 w-6 h-6 text-mgm-green flex items-center"
                     >
                       ◄
                     </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
