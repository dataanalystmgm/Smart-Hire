import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, Clock, FileText } from 'lucide-react';
import KraepelinTest from '../components/KraepelinTest';
import GenericTest from '../components/GenericTest';
import { getTests } from '../data/tests';

export default function Tests({ user }: { user: User }) {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [scoreResult, setScoreResult] = useState('');
  const [testList, setTestList] = useState<any[]>([]);

  useEffect(() => {
    setTestList(getTests());
  }, []);

  const handleKraepelinComplete = async (score: number) => {
    setLoading(true);
    setResult('');
    setScoreResult('');
    
    const evaluation = `Kandidat menyelesaikan tes Kraepelin dengan tingkat akurasi ${score}%. ${score > 80 ? 'Hasil sangat baik, menunjukkan ketelitian dan stabilitas kerja yang tinggi di bawah tekanan.' : 'Hasil di bawah rata-rata, menunjukkan potensi kelelahan atau kurang ketelitian.'}`;

    try {
      setResult(evaluation);
      setScoreResult(score.toString());
      
      // Save to localStorage for fallback persistence
      const storedResults = localStorage.getItem('mgm_test_results') ? JSON.parse(localStorage.getItem('mgm_test_results')!) : [];
      storedResults.push({
        userId: user.userId,
        userName: user.name,
        testType: 'creplin',
        score: score.toString(),
        resume: evaluation,
        answers: { raw_score: score },
        validated: 'Belum Divalidasi',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('mgm_test_results', JSON.stringify(storedResults));

      // Save result via proxy
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'save_test', 
          sheetName: 'Tes_creplin',
          userId: user.userId, 
          testType: 'creplin',
          score: score.toString(),
          resume: evaluation,
          answers: JSON.stringify({ raw_score: score }),
          validated: 'Belum Divalidasi'
        })
      });
    } catch (err) {
      setResult('Gagal menghubungi server untuk menyimpan hasil.');
    } finally {
      setLoading(false);
    }
  };

  const submitGenericTest = async (testId: string, answers: any) => {
    setLoading(true);
    setResult('');
    setScoreResult('');
    
    try {
      const res = await fetch('/api/ai/evaluate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: testId, answers: answers })
      });
      const data = await res.json();
      const evaluationText = data.result || data.error || 'Test evaluated.';
      const score = data.score || 'N/A';
      const detailAnswersToSave = data.detailed_answers || answers;
      setResult(evaluationText);
      setScoreResult(score);
      
      const payloadToSave = {
        userId: user.userId,
        userName: user.name,
        testType: testId,
        score: score,
        resume: evaluationText,
        answers: detailAnswersToSave,
        validated: 'Belum Divalidasi',
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage for fallback persistence
      const storedResults = localStorage.getItem('mgm_test_results') ? JSON.parse(localStorage.getItem('mgm_test_results')!) : [];
      storedResults.push(payloadToSave);
      localStorage.setItem('mgm_test_results', JSON.stringify(storedResults));

      // Save result via proxy
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'save_test', 
          sheetName: `Tes_${testId}`,
          userId: user.userId, 
          testType: testId,
          score: score,
          resume: evaluationText,
          answers: JSON.stringify(detailAnswersToSave),
          validated: 'Belum Divalidasi'
        })
      });

    } catch (err) {
      setResult('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-mgm-dark tracking-tight mb-4 flex items-center justify-center">
          <Brain className="w-10 h-10 mr-4 text-mgm-green" />
          Pusat Assessment
        </h1>
        <p className="text-slate-600 text-lg">Selesaikan rangkaian tes di bawah ini. Hasil akan dievaluasi secara otomatis oleh AI dan diteruskan ke tim rekrutmen.</p>
      </header>

      <AnimatePresence mode="wait">
        {activeTest === 'creplin' ? (
          <motion.div key="creplin-test" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {result ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-mgm-light text-mgm-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl text-mgm-dark mb-4">Tes Selesai</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                  <p className="text-slate-700 leading-relaxed font-medium">Terima kasih telah menyelesaikan tes ini. Semoga Anda bisa segera bekerja sama dengan kami.</p>
                </div>
                <button 
                  onClick={() => { setActiveTest(null); setResult(''); }}
                  className="bg-mgm-dark text-white px-8 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-colors"
                >
                  Kembali ke Daftar Tes
                </button>
              </div>
            ) : (
              <KraepelinTest onComplete={handleKraepelinComplete} />
            )}
          </motion.div>
        ) : activeTest ? (
          <motion.div key="mock-test" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
            {result ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-mgm-light text-mgm-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl text-mgm-dark mb-4">Tes Selesai</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 text-center">
                  <p className="text-slate-700 leading-relaxed font-medium">Terima kasih telah menyelesaikan tes ini. Semoga Anda bisa segera bekerja sama dengan kami.</p>
                </div>
                <button 
                  onClick={() => { setActiveTest(null); setResult(''); setScoreResult(''); }}
                  className="bg-mgm-dark text-white px-8 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-colors"
                >
                  Kembali ke Daftar Tes
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-w-3xl mx-auto">
                 <button onClick={() => setActiveTest(null)} className="text-slate-500 hover:text-mgm-dark flex items-center font-medium">
                    ← Kembali
                 </button>
                 {loading ? (
                    <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
                      <div className="w-12 h-12 border-4 border-mgm-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600">AI Sedang Mengevaluasi Jawaban Anda...</p>
                    </div>
                 ) : (
                    <GenericTest test={testList.find(t => t.id === activeTest)} onComplete={(answers) => submitGenericTest(activeTest, answers)} />
                 )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testList.map((test, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={test.id} 
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-mgm-green/30 transition-all group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-mgm-light rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {test.id === 'creplin' ? <FileText className="w-6 h-6 text-mgm-green" /> : <Brain className="w-6 h-6 text-mgm-green" />}
                  </div>
                  <span className="flex items-center text-xs font-bold text-mgm-dark bg-mgm-yellow px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    {test.duration}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-mgm-dark mb-3">{test.name}</h3>
                <p className="text-sm text-slate-500 mb-8 flex-1 leading-relaxed">{test.desc}</p>
                
                <button 
                  onClick={() => setActiveTest(test.id)}
                  className="w-full bg-slate-50 border border-slate-200 text-mgm-dark font-semibold py-3 rounded-xl hover:bg-mgm-dark hover:text-white hover:border-mgm-dark transition-colors"
                >
                  Mulai Tes
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
