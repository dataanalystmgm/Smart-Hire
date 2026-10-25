import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { getJobs } from '../data/jobs';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Loader2,
  Volume2,
  VolumeX,
  CheckCircle,
  Play,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Send,
  FileText,
  Sparkles,
  Check
} from 'lucide-react';

const DEFAULT_FALLBACK_QUESTIONS = (position: string): string[] => [
  `Silakan perkenalkan diri Anda secara singkat serta ceritakan latar belakang dan pengalaman kerja Anda yang paling relevan untuk posisi ${position}.`,
  `Berdasarkan pemahaman Anda mengenai Job Description posisi ${position}, kompetensi atau keahlian utama apa yang Anda miliki untuk mendukung peran ini?`,
  `Ceritakan pengalaman nyata ketika Anda berhasil menyelesaikan tugas atau tantangan teknis yang kompleks di pekerjaan atau proyek sebelumnya. Bagaimana langkah Anda dan apa hasilnya?`,
  `Bagaimana cara Anda menjaga kualitas kerja, ketelitian, serta kerja sama tim saat menghadapi target atau tenggat waktu yang ketat pada posisi ${position}?`,
  `Apa motivasi utama Anda bergabung dengan PT Mercindo Global Manufaktur dan kontribusi apa yang ingin Anda capai dalam 3 hingga 6 bulan pertama?`
];

export default function Interview({ user }: { user: User }) {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [autoReadQuestion, setAutoReadQuestion] = useState<boolean>(true);
  const [jobTitle, setJobTitle] = useState<string>('Generalist');
  const [jobDepartment, setJobDepartment] = useState<string>('');
  const [jobDescName, setJobDescName] = useState<string>('');
  const [hasCustomAdminQuestions, setHasCustomAdminQuestions] = useState<boolean>(false);

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  const [fetchingJob, setFetchingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [finalSummary, setFinalSummary] = useState<string>('');
  const [isAllowedToInterview, setIsAllowedToInterview] = useState<boolean | null>(null);
  const [allowedReason, setAllowedReason] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const currentIdxRef = useRef<number>(0);
  const baseAnswerBeforeSpeechRef = useRef<string>('');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  // Recording timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Check eligibility and load Admin's Interview Questions for the job
  useEffect(() => {
    async function checkEligibilityAndLoadQuestions() {
      let title = 'Generalist';
      let targetJobId = '';
      let applicationsList: any[] = [];
      let interviewsList: any[] = [];

      // 1. Fetch Applications from Sheet
      try {
        const res = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_data', type: 'Applications' })
        });
        const d = await res.json();
        if (d.status === 'success' && Array.isArray(d.data) && d.data.length > 0) {
          applicationsList = d.data;
        }
      } catch (err) {
        console.warn('Failed to fetch applications from GAS:', err);
      }

      // Merge with local storage applications
      try {
        const storedApps = localStorage.getItem('mgm_applications');
        if (storedApps) {
          const parsed = JSON.parse(storedApps);
          parsed.forEach((localApp: any) => {
            const existingIdx = applicationsList.findIndex(
              (app: any) => String(app.ID || app.id || '') === String(localApp.id)
            );
            if (existingIdx !== -1) {
              applicationsList[existingIdx].Status = localApp.status || applicationsList[existingIdx].Status;
              applicationsList[existingIdx].status = localApp.status || applicationsList[existingIdx].status;
            } else {
              applicationsList.push({
                ID: localApp.id,
                UserID: localApp.userId,
                UserName: user.name,
                JobID: localApp.jobId,
                JobTitle: localApp.jobTitle || 'Generalist',
                Status: localApp.status,
                CreatedAt: localApp.createdAt || new Date().toISOString()
              });
            }
          });
        }
      } catch (e) {
        console.error('Error loading local storage applications:', e);
      }

      const userApps = applicationsList.filter(
        (app: any) =>
          String(app.UserID || app.userId || app.UserId || '').toLowerCase() ===
          String(user.userId).toLowerCase()
      );

      const allowedInterviewStages = [
        'approved',
        'disetujui',
        'testing',
        'interview',
        'offered',
        'terpilih',
        'wawancara',
        'penawaran',
        'menerima tawaran',
        'menerima tawaran / tidak'
      ];
      const approvedApps = userApps.filter((app: any) => {
        const st = String(app.Status || app.status || '').toLowerCase();
        return allowedInterviewStages.includes(st);
      });

      // 2. Fetch Interviews from Sheet
      try {
        const res = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_data', type: 'Interviews' })
        });
        const d = await res.json();
        if (d.status === 'success' && Array.isArray(d.data) && d.data.length > 0) {
          interviewsList = d.data;
        }
      } catch (err) {
        console.warn('Failed to fetch interviews from GAS:', err);
      }

      try {
        const storedInt = localStorage.getItem('mgm_interviews');
        if (storedInt) {
          const parsed = JSON.parse(storedInt);
          parsed.forEach((localInt: any) => {
            const exists = interviewsList.some(
              (i: any) =>
                String(i.UserID || i.userId || '') === String(localInt.userId) &&
                String(i.CreatedAt || i.createdAt || '') === String(localInt.createdAt)
            );
            if (!exists) {
              interviewsList.push({
                UserID: localInt.userId,
                Summary: localInt.summary,
                'Summary by AI': localInt.aiSummary,
                Validated: localInt.validated,
                CreatedAt: localInt.createdAt || new Date().toISOString()
              });
            }
          });
        }
      } catch (e) {
        console.error('Error loading local storage interviews:', e);
      }

      const userInterviews = interviewsList.filter(
        (i: any) =>
          String(i.UserID || i.userId || i.UserId || '').toLowerCase() ===
          String(user.userId).toLowerCase()
      );

      if (approvedApps.length === 0) {
        setIsAllowedToInterview(false);
        setAllowedReason(
          'Maaf, sesi wawancara 1 arah saat ini belum tersedia karena Anda belum memiliki lamaran aktif pada tahap Terpilih / Wawancara yang disetujui oleh HR.'
        );
        setFetchingJob(false);
        return;
      }

      let latestApprovedApp = approvedApps[0];
      for (const app of approvedApps) {
        if (
          new Date(app.CreatedAt || app.createdAt) >
          new Date(latestApprovedApp.CreatedAt || latestApprovedApp.createdAt)
        ) {
          latestApprovedApp = app;
        }
      }

      targetJobId = String(latestApprovedApp?.JobID || latestApprovedApp?.jobId || '').trim();
      if (latestApprovedApp && (latestApprovedApp.JobTitle || latestApprovedApp.jobTitle)) {
        title = String(latestApprovedApp.JobTitle || latestApprovedApp.jobTitle).trim();
      }

      // 3. Load open jobs and find matching job's Admin Interview Questions
      let loadedQuestions: string[] = [];
      try {
        const allJobs = await getJobs();
        const matchedJob = allJobs.find(
          j =>
            (targetJobId && String(j.id).trim().toLowerCase() === targetJobId.toLowerCase()) ||
            (title && String(j.title).trim().toLowerCase() === title.toLowerCase())
        );

        if (matchedJob) {
          title = matchedJob.title || title;
          setJobDepartment(matchedJob.department || '');
          setJobDescName(matchedJob.jobDescFileName || '');
          if (Array.isArray(matchedJob.interviewQuestions) && matchedJob.interviewQuestions.length > 0) {
            loadedQuestions = matchedJob.interviewQuestions.filter(Boolean);
            setHasCustomAdminQuestions(true);
          }
        }
      } catch (e) {
        console.warn('Failed to load job interview questions:', e);
      }

      setJobTitle(title);
      if (loadedQuestions.length === 0) {
        loadedQuestions = DEFAULT_FALLBACK_QUESTIONS(title);
        setHasCustomAdminQuestions(false);
      }
      setQuestions(loadedQuestions);

      // Check if candidate already completed an interview after this application
      if (userInterviews.length > 0) {
        let latestInterview = userInterviews[0];
        for (const i of userInterviews) {
          if (
            new Date(i.CreatedAt || i.createdAt) >
            new Date(latestInterview.CreatedAt || latestInterview.createdAt)
          ) {
            latestInterview = i;
          }
        }

        const appDate = new Date(latestApprovedApp.CreatedAt || latestApprovedApp.createdAt);
        const intDate = new Date(latestInterview.CreatedAt || latestInterview.createdAt);

        if (intDate >= appDate) {
          setIsAllowedToInterview(false);
          setAllowedReason(
            "Anda sudah menyelesaikan sesi wawancara 1 arah untuk lamaran terbaru Anda. Hasil jawaban dan 'Summary by AI' Anda telah terekam."
          );
          setFinalSummary(
            latestInterview['Summary by AI'] ||
              latestInterview.aiSummary ||
              'Evaluasi wawancara telah terekam.'
          );
          setIsCompleted(true);
        } else {
          setIsAllowedToInterview(true);
          setAllowedReason('');
        }
      } else {
        setIsAllowedToInterview(true);
        setAllowedReason('');
      }

      setFetchingJob(false);
    }

    checkEligibilityAndLoadQuestions();
  }, [user]);

  // Initialize Web Speech API (SpeechRecognition & SpeechSynthesis)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.getVoices();
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onresult = (event: any) => {
        let sessionFinal = '';
        let sessionInterim = '';
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            sessionFinal += transcript + ' ';
          } else {
            sessionInterim += transcript;
          }
        }
        const combinedSpeech = (sessionFinal + sessionInterim).trim();
        const prefix = baseAnswerBeforeSpeechRef.current
          ? baseAnswerBeforeSpeechRef.current.trim() + ' '
          : '';
        setAnswers(prev => ({
          ...prev,
          [currentIdxRef.current]: (prefix + combinedSpeech).trim()
        }));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const stopListening = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    baseAnswerBeforeSpeechRef.current = answers[currentIdxRef.current] || '';
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Start mic warning:', e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    stopListening();
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID');
    if (idVoice) utterance.voice = idVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartOneWayInterview = () => {
    setIsStarted(true);
    setCurrentIdx(0);
    if (autoReadQuestion && questions[0]) {
      setTimeout(() => {
        speakQuestion(`Pertanyaan nomor 1. ${questions[0]}`);
      }, 300);
    }
  };

  const handleGoToQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    stopListening();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentIdx(targetIdx);
    if (autoReadQuestion && questions[targetIdx]) {
      setTimeout(() => {
        speakQuestion(`Pertanyaan nomor ${targetIdx + 1}. ${questions[targetIdx]}`);
      }, 250);
    }
  };

  const handleSubmitAllAnswers = async () => {
    stopListening();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setSubmitting(true);

    // Format 1-Way Interview transcript clearly for Admin & AI evaluation
    const transcriptLines = questions.map((q, idx) => {
      const candidateAns = (answers[idx] || '').trim() || '(Tidak ada jawaban)';
      return `Pertanyaan ${idx + 1}: ${q}\nJawaban Kandidat: ${candidateAns}`;
    });
    const summary = transcriptLines.join('\n\n');

    let aiSummaryResult = 'Evaluasi otomatis belum tergenerasi.';
    try {
      const aiRes = await fetch('/api/ai/interpret-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: `Posisi Lamaran: ${jobTitle}\nMetode: Wawancara 1 Arah (Berdasarkan Pertanyaan Job Desc Admin)\n\n${summary}`
        })
      });
      const aiData = await aiRes.json();
      if (aiData.result) {
        aiSummaryResult = aiData.result;
      }
    } catch (err) {
      console.error('Failed to generate AI Summary for interview:', err);
    }

    try {
      const storedInterviews = localStorage.getItem('mgm_interviews')
        ? JSON.parse(localStorage.getItem('mgm_interviews')!)
        : [];
      const newInterview = {
        userId: user.userId,
        userName: user.name,
        summary,
        aiSummary: aiSummaryResult,
        validated: 'Belum Divalidasi',
        createdAt: new Date().toISOString()
      };

      const cleanedInterviews = storedInterviews.filter(
        (i: any) => String(i.userId).toLowerCase() !== String(user.userId).toLowerCase()
      );
      cleanedInterviews.push(newInterview);
      localStorage.setItem('mgm_interviews', JSON.stringify(cleanedInterviews));

      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_interview',
          userId: user.userId,
          summary,
          aiSummary: aiSummaryResult,
          validated: 'Belum Divalidasi'
        })
      });

      setFinalSummary(aiSummaryResult);
      setIsCompleted(true);
    } catch (e) {
      console.error('Failed saving interview:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (fetchingJob) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col justify-center items-center bg-white rounded-[2rem] border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <Loader2 className="w-10 h-10 animate-spin text-mgm-green mb-4" />
        <p className="text-slate-500 font-bold text-sm">
          Menyiapkan daftar pertanyaan wawancara untuk posisi lamaran Anda...
        </p>
      </div>
    );
  }

  if (isAllowedToInterview === false && !isCompleted) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden p-8 space-y-6 text-center animate-fade-in my-8">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-mgm-dark tracking-tight">
            Sesi Wawancara Belum Tersedia
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed font-semibold">
            {allowedReason || 'Anda belum diizinkan untuk memulai wawancara saat ini.'}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl max-w-lg mx-auto text-left text-xs space-y-2 text-slate-500 font-medium">
          <p className="font-bold text-mgm-dark">Informasi Tahapan Wawancara:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sesi Wawancara 1 Arah dibuka apabila lamaran Anda telah lolos seleksi awal (Tahap Terpilih / Wawancara) oleh Admin HR.</li>
            <li>Jika Anda sudah menyelesaikan wawancara untuk lamaran ini, hasil jawaban Anda telah tersimpan di sistem HR.</li>
          </ul>
        </div>
      </div>
    );
  }

  // COMPLETED STATE UI
  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden p-8 md:p-10 space-y-6 animate-fade-in my-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-mgm-dark tracking-tight">
            Wawancara 1 Arah Selesai
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm font-medium leading-relaxed">
            Terima kasih, <strong>{user.name}</strong>! Seluruh jawaban lisan dan teks Anda untuk posisi{' '}
            <strong>{jobTitle}</strong> telah berhasil direkam, dievaluasi oleh AI, dan dikirimkan ke tim HR/Admin.
          </p>
        </div>

        {finalSummary && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-2xl mx-auto space-y-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-mgm-dark uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-mgm-green" />
              <span>Status Evaluasi AI</span>
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              Jawaban wawancara Anda telah dirangkum oleh sistem MGM SmartHire AI dan siap ditinjau oleh Administrator.
            </p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            MGM SmartHire • Sesi Wawancara 1 Arah Selesai
          </p>
        </div>
      </div>
    );
  }

  // PRE-INTERVIEW INSTRUCTION SCREEN (SEBELUM MULAI WAWANCARA 1 ARAH)
  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-fade-in my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-mgm-dark via-[#24484e] to-slate-900 p-8 text-center text-white relative">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-mgm-yellow border border-white/15 mb-3">
            <Mic className="w-3.5 h-3.5 text-mgm-yellow" />
            <span>Wawancara 1 Arah (One-Way Voice Interview)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Instruksi Sesi Wawancara Pelamar
          </h1>
          <p className="text-slate-200 mt-2 text-sm max-w-xl mx-auto font-normal">
            Harap baca instruksi di bawah ini dengan seksama sebelum memulai sesi menjawab pertanyaan wawancara untuk posisi <strong>{jobTitle}</strong>.
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Job & Question Summary */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border border-slate-200 bg-slate-50/80 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Posisi yang Dilamar</p>
              <p className="text-sm font-extrabold text-mgm-dark mt-1">{jobTitle}</p>
              {jobDepartment && <p className="text-[11px] text-slate-500 mt-0.5">{jobDepartment}</p>}
            </div>
            <div className="border border-slate-200 bg-slate-50/80 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Metode Wawancara</p>
              <p className="text-sm font-extrabold text-mgm-green mt-1">1 Arah (Bicara & Jawab)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Fokus menjawab per nomor soal</p>
            </div>
            <div className="border border-slate-200 bg-slate-50/80 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Jumlah Pertanyaan</p>
              <p className="text-sm font-extrabold text-mgm-dark mt-1">
                {questions.length} Pertanyaan
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {hasCustomAdminQuestions ? 'Disusun Admin sesuai Job Desc' : 'Terstruktur sesuai Posisi'}
              </p>
            </div>
          </div>

          {/* Detailed Instructions Box */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-base font-extrabold text-mgm-dark flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-mgm-green shrink-0" />
              Instruksi Penting Wawancara 1 Arah:
            </h2>

            <ol className="space-y-3 text-xs sm:text-sm text-slate-700 list-decimal pl-5 leading-relaxed font-medium">
              <li>
                <strong>Sistem Wawancara 1 Arah (One-Way Interview):</strong> Sesi ini berlangsung{' '}
                <span className="font-extrabold text-mgm-dark">1 arah</span>. Sistem hanya akan menampilkan daftar pertanyaan yang telah dibuat oleh Admin/HR berdasarkan <strong>Job Description {jobTitle}</strong> tanpa memotong atau menyela pembicaraan Anda.
              </li>
              <li>
                <strong>Berbicara Langsung untuk Menjawab:</strong> Pada setiap pertanyaan, klik tombol{' '}
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-mgm-green text-white text-[11px] font-bold">
                  Mulai Bicara / Rekam Jawaban
                </span>{' '}
                dan **berbicaralah dengan jelas melalui mikrofon** untuk menjawab pertanyaan tersebut. Ucapan Anda akan langsung diubah menjadi teks secara otomatis.
              </li>
              <li>
                <strong>Periksa & Lengkapi Jawaban:</strong> Anda dapat memeriksa hasil transkrip suara Anda di kotak jawaban, mengulangi rekaman suara jika diperlukan, atau merapikan teks jawaban sebelum beralih ke nomor berikutnya.
              </li>
              <li>
                <strong>Penyelesaian & Evaluasi AI:</strong> Jawablah seluruh <strong>{questions.length} pertanyaan</strong> secara berurutan. Di akhir sesi, klik tombol <strong>"Selesai & Kirim Jawaban Wawancara"</strong> agar jawaban Anda direkam dan dianalisis oleh AI untuk tim HR.
              </li>
            </ol>
          </div>

          {/* Audio Reader Option */}
          <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-mgm-light text-mgm-green flex items-center justify-center shrink-0">
                {autoReadQuestion ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-mgm-dark">
                  Bacakan Pertanyaan dengan Suara Otomatis (Opsional)
                </p>
                <p className="text-[11px] text-slate-500">
                  Sistem akan membacakan teks pertanyaan saat nomor soal dibuka sebelum Anda mulai berbicara.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoReadQuestion}
                onChange={e => setAutoReadQuestion(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mgm-green"></div>
            </label>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartOneWayInterview}
            className="w-full py-4 bg-mgm-green text-white rounded-2xl font-extrabold text-base md:text-lg hover:bg-opacity-95 shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Saya Mengerti Instruksi & Mulai Wawancara 1 Arah</span>
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE 1-WAY INTERVIEW INTERFACE
  const currentQuestion = questions[currentIdx] || '';
  const currentAnswer = answers[currentIdx] || '';
  const answeredCount = questions.filter((_, idx) => (answers[idx] || '').trim().length > 0).length;
  const isLastQuestion = currentIdx === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden my-4">
      {/* TOP BAR */}
      <header className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-mgm-dark to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-mgm-green text-white">
              Wawancara 1 Arah
            </span>
            {jobDescName && (
              <span className="text-[11px] text-white/75 flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                {jobDescName}
              </span>
            )}
          </div>
          <h2 className="text-lg md:text-xl font-extrabold mt-1">
            Posisi: {jobTitle}
          </h2>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          <div className="text-right">
            <span className="text-[11px] text-white/70 font-bold uppercase tracking-wider block">
              Progres Jawaban
            </span>
            <span className="text-sm font-extrabold text-mgm-yellow">
              {answeredCount} / {questions.length} Terjawab
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAutoReadQuestion(!autoReadQuestion)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              autoReadQuestion
                ? 'bg-white/15 border-white/30 text-mgm-yellow'
                : 'bg-white/5 border-white/10 text-white/60'
            }`}
            title={autoReadQuestion ? 'Suara Pembaca Soal Aktif' : 'Suara Pembaca Soal Nonaktif'}
          >
            {autoReadQuestion ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* QUESTION NUMBER STEPPER PILLS */}
      <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
        <div className="flex items-center space-x-2">
          {questions.map((_, idx) => {
            const isCurrent = idx === currentIdx;
            const isAnswered = (answers[idx] || '').trim().length > 0;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleGoToQuestion(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-extrabold flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-mgm-dark text-white border-mgm-dark shadow-sm scale-105'
                    : isAnswered
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
                title={`Pertanyaan ${idx + 1}`}
              >
                {isAnswered && !isCurrent ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-extrabold text-mgm-dark shrink-0">
          Pertanyaan {currentIdx + 1} dari {questions.length}
        </span>
      </div>

      {/* MAIN 1-WAY QUESTION & VOICE ANSWER BODY */}
      <div className="p-6 md:p-8 space-y-6">
        {/* QUESTION CARD FROM ADMIN */}
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-mgm-green">
              Pertanyaan Wawancara #{currentIdx + 1}
            </span>
            <button
              type="button"
              onClick={() => speakQuestion(currentQuestion)}
              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-white text-mgm-dark border border-slate-200 hover:border-mgm-green transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 mr-1.5 text-mgm-green" />
              Dengarkan Pertanyaan
            </button>
          </div>

          <p className="text-base md:text-lg font-extrabold text-mgm-dark leading-relaxed">
            {currentQuestion}
          </p>
        </motion.div>

        {/* APPLICANT VOICE RECORDING & ANSWER PANEL */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-mgm-dark">
                Jawaban Anda (Silakan Berbicara melalui Mikrofon atau Ketik)
              </h3>
              <p className="text-xs text-slate-500">
                Klik tombol rekam suara di bawah untuk berbicara menjawab pertanyaan di atas secara langsung.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center shadow-sm transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-mgm-green text-white hover:bg-opacity-90'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Berhenti Merekam ({formatTimer(recordingSeconds)})
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Mulai Bicara / Rekam Jawaban
                  </>
                )}
              </button>

              {currentAnswer && (
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    baseAnswerBeforeSpeechRef.current = '';
                    setAnswers(prev => ({ ...prev, [currentIdx]: '' }));
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-all flex items-center cursor-pointer"
                  title="Ulangi / Bersihkan Jawaban Nomor Ini"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Ulangi
                </button>
              )}
            </div>
          </div>

          {/* Active Listening Indicator Banner */}
          {isListening && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold text-emerald-900">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                </span>
                <span>Mikrofon Aktif Mendengarkan — Silakan bicarakan jawaban Anda dengan jelas...</span>
              </div>
              <span className="font-mono text-emerald-700">{formatTimer(recordingSeconds)}</span>
            </div>
          )}

          {/* Answer Textarea */}
          <textarea
            rows={6}
            value={currentAnswer}
            onChange={e => {
              const val = e.target.value;
              baseAnswerBeforeSpeechRef.current = val;
              setAnswers(prev => ({ ...prev, [currentIdx]: val }));
            }}
            placeholder="Transkrip ucapan suara Anda akan muncul secara otomatis di sini saat Anda berbicara, atau Anda juga dapat mengetik/menyempurnakan jawaban Anda di sini..."
            className={`w-full p-4 rounded-2xl border text-sm md:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-mgm-green transition-colors ${
              isListening
                ? 'border-mgm-green bg-emerald-50/30 text-mgm-dark'
                : 'border-slate-200 bg-white text-slate-800'
            }`}
          />
        </div>

        {/* BOTTOM NAVIGATION CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={currentIdx === 0 || submitting}
            onClick={() => handleGoToQuestion(currentIdx - 1)}
            className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Pertanyaan Sebelumnya
          </button>

          <div className="flex items-center justify-end gap-3">
            {!isLastQuestion ? (
              <button
                type="button"
                onClick={() => handleGoToQuestion(currentIdx + 1)}
                className="bg-mgm-dark hover:bg-opacity-90 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center shadow-md transition-all cursor-pointer"
              >
                <span>Simpan & Pertanyaan Berikutnya</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitAllAnswers}
                className="bg-mgm-green hover:bg-opacity-95 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan & Mengevaluasi Jawaban...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Selesai & Kirim Seluruh Jawaban Wawancara
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
