import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, Clock } from 'lucide-react';
import VisualLogicQuestion from './VisualLogicQuestion';

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
}

interface TestData {
  id: string;
  name: string;
  duration: string;
  desc: string;
  questions: Question[];
}

export default function GenericTest({ test, onComplete }: { test: TestData, onComplete: (answers: any) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Parse duration like "12 Min" -> 12 * 60 seconds
  const parseDuration = (dur: string) => {
    const match = dur.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) * 60;
    }
    return 60 * 60; // default 1 hr
  };

  const [timeLeft, setTimeLeft] = useState(() => parseDuration(test.duration));
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      // Auto submit on timeout
      setIsActive(false);
      setIsFinished(true);
      onComplete(answers);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, answers, onComplete]);

  const handleAnswer = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsActive(false);
    setIsFinished(true);
    onComplete(answers);
  };

  const startTest = () => {
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!test.questions || test.questions.length === 0) {
     return (
       <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
         <h3 className="text-2xl font-bold text-mgm-dark mb-4">{test.name}</h3>
         <p className="text-slate-600 mb-6">Tidak ada pertanyaan yang dikonfigurasi untuk tes ini. (Hanya simulasi)</p>
         <button onClick={() => onComplete({})} className="bg-mgm-green text-white px-6 py-3 rounded-xl font-medium">Kirim Simulasi Kosong</button>
       </div>
     )
  }

  if (isFinished) {
     return (
       <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-lg mx-auto">
         <CheckCircle className="w-16 h-16 text-mgm-green mx-auto mb-6" />
         <h3 className="text-3xl font-bold text-mgm-dark mb-4">Tes Selesai!</h3>
         <p className="text-slate-600 mb-8 text-lg">
           Terima kasih, jawaban Anda telah dikirim.
         </p>
       </div>
     );
  }

  if (!isActive) {
     return (
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto text-center"
       >
         <div className="bg-mgm-light w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
           <Brain className="w-10 h-10 text-mgm-dark" />
         </div>
         <h3 className="text-3xl font-bold text-mgm-dark mb-4">{test.name}</h3>
         <p className="text-slate-600 mb-8 text-lg leading-relaxed">
           {test.desc}<br/><br/>
           Waktu pengerjaan: <strong>{test.duration}</strong>. Tes akan otomatis terkirim jika waktu habis.
         </p>
         <button 
           onClick={startTest} 
           className="bg-mgm-dark text-white px-10 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-lg"
         >
           Mulai Tes Sekarang
         </button>
       </motion.div>
     );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto text-left relative">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6 sticky top-0 bg-white z-10 pt-2">
        <div>
          <h2 className="text-2xl font-bold text-mgm-dark">{test.name}</h2>
          <p className="text-slate-500 text-sm">Jawab semua pertanyaan sebelum waktu habis.</p>
        </div>
        <div className={`flex items-center text-xl font-bold px-4 py-2 rounded-xl ${timeLeft <= 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-mgm-light text-mgm-dark'}`}>
          <Clock className="mr-2 w-5 h-5" /> {formatTime(timeLeft)}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {test.questions.map((q, i) => (
          <div key={q.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-semibold text-mgm-dark mb-4 text-lg">{i + 1}. {q.text}</h4>
            
            {q.type === 'multiple' && q.options && (
              <div className="space-y-3">
                {q.options.map(opt => (
                  <label key={opt} className="flex items-center p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-mgm-light transition-colors">
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt} 
                      required
                      checked={answers[q.id] === opt}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      className="w-5 h-5 text-mgm-green focus:ring-mgm-green"
                    />
                    <span className="ml-3 text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'visual_pattern' && (
              <VisualLogicQuestion 
                questionId={q.id}
                selectedOption={answers[q.id] || ''}
                onChange={(val) => handleAnswer(q.id, val)}
              />
            )}
            
            {q.type === 'boolean' && (
               <div className="flex space-x-4">
                  <label className="flex items-center p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-mgm-light transition-colors flex-1">
                    <input type="radio" name={q.id} value="Ya" required checked={answers[q.id] === 'Ya'} onChange={(e) => handleAnswer(q.id, e.target.value)} className="w-5 h-5 text-mgm-green" />
                    <span className="ml-3 text-slate-700">Ya</span>
                  </label>
                  <label className="flex items-center p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-mgm-light transition-colors flex-1">
                    <input type="radio" name={q.id} value="Tidak" required checked={answers[q.id] === 'Tidak'} onChange={(e) => handleAnswer(q.id, e.target.value)} className="w-5 h-5 text-mgm-green" />
                    <span className="ml-3 text-slate-700">Tidak</span>
                  </label>
               </div>
            )}

            {q.type === 'text' && (
              <input 
                type="text" 
                required
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-mgm-green outline-none" 
                placeholder="Jawaban Anda..." 
              />
            )}

            {q.type === 'longtext' && (
              <textarea 
                required
                rows={4}
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-mgm-green outline-none resize-none" 
                placeholder="Jawaban Anda..." 
              />
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t border-slate-200 text-center pb-8">
           <button type="submit" className="bg-mgm-dark text-white px-10 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-lg">
             Kirim Jawaban
           </button>
        </div>
      </form>
    </div>
  );
}
