import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { getJobs } from '../data/jobs';
import { GoogleSheetsService } from '../services/googleSheets';
import { motion, AnimatePresence } from 'framer-motion';
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
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ListOrdered,
  Layers,
  StopCircle,
  Clock,
  MessageSquare
} from 'lucide-react';

const DEFAULT_FALLBACK_QUESTIONS = (position: string): string[] => [
  `Silakan perkenalkan diri Anda secara singkat serta ceritakan latar belakang dan pengalaman kerja Anda yang paling relevan untuk posisi ${position}.`,
  `Berdasarkan pemahaman Anda mengenai Job Description posisi ${position}, kompetensi atau keahlian utama apa yang Anda miliki untuk mendukung peran ini?`,
  `Ceritakan pengalaman nyata ketika Anda berhasil menyelesaikan tugas atau tantangan teknis yang kompleks di pekerjaan atau proyek sebelumnya. Bagaimana langkah Anda dan apa hasilnya?`,
  `Bagaimana cara Anda menjaga kualitas kerja, ketelitian, serta kerja sama tim saat menghadapi target atau tenggat waktu yang ketat pada posisi ${position}?`,
  `Apa motivasi utama Anda bergabung dengan PT Mercindo Global Manufaktur dan kontribusi apa yang ingin Anda capai dalam 3 hingga 6 bulan pertama?`
];

export default function Interview({ user }: { user: User }) {
  // Session states
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isQuestionsMinimized, setIsQuestionsMinimized] = useState<boolean>(false);
  const [answerMode, setAnswerMode] = useState<'one_shot' | 'per_question'>('one_shot');

  // Job and questions data
  const [jobTitle, setJobTitle] = useState<string>('Generalist');
  const [jobDepartment, setJobDepartment] = useState<string>('');
  const [jobDescName, setJobDescName] = useState<string>('');
  const [hasCustomAdminQuestions, setHasCustomAdminQuestions] = useState<boolean>(false);
  const [questions, setQuestions] = useState<string[]>([]);

  // Answers: unified One-Shot answer + per question mapping
  const [oneShotAnswer, setOneShotAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  // Audio & TTS states
  const [autoReadQuestion, setAutoReadQuestion] = useState<boolean>(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  // Recording states
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Status & Eligibility
  const [fetchingJob, setFetchingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [finalSummary, setFinalSummary] = useState<string>('');
  const [isAllowedToInterview, setIsAllowedToInterview] = useState<boolean | null>(null);
  const [allowedReason, setAllowedReason] = useState<string>('');

  // Refs for speech recognition & intervals
  const recognitionRef = useRef<any>(null);
  const shouldKeepListeningRef = useRef<boolean>(false);
  const currentIdxRef = useRef<number>(0);
  const answerModeRef = useRef<'one_shot' | 'per_question'>('one_shot');
  const baseAnswerBeforeSpeechRef = useRef<string>('');
  const baseOneShotBeforeSpeechRef = useRef<string>('');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  useEffect(() => {
    answerModeRef.current = answerMode;
  }, [answerMode]);

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

  // Check candidate eligibility and load Admin's Interview Questions for the job
  useEffect(() => {
    async function checkEligibilityAndLoadQuestions() {
      let title = 'Generalist';
      let targetJobId = '';
      let applicationsList: any[] = [];
      let interviewsList: any[] = [];

      // 1. Fetch Applications from Sheet
      try {
        const directApps = await GoogleSheetsService.getApplications();
        if (Array.isArray(directApps) && directApps.length > 0) {
          applicationsList = directApps;
        }
      } catch (err) {
        console.warn('Direct fetch applications failed, trying proxy:', err);
      }

      if (applicationsList.length === 0) {
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
        const directInt = await GoogleSheetsService.getInterviews();
        if (Array.isArray(directInt) && directInt.length > 0) {
          interviewsList = directInt;
        }
      } catch (err) {
        console.warn('Direct fetch interviews failed, trying proxy:', err);
      }

      if (interviewsList.length === 0) {
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
          'Maaf, sesi wawancara AI saat ini belum tersedia karena Anda belum memiliki lamaran aktif pada tahap Terpilih / Wawancara yang disetujui oleh HR.'
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
            "Anda sudah menyelesaikan sesi wawancara untuk lamaran terbaru Anda. Hasil jawaban dan 'Summary by AI' Anda telah terekam."
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

  // Initialize SpeechRecognition & SpeechSynthesis
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

        if (answerModeRef.current === 'one_shot') {
          const prefix = baseOneShotBeforeSpeechRef.current
            ? baseOneShotBeforeSpeechRef.current.trim() + ' '
            : '';
          setOneShotAnswer((prefix + combinedSpeech).trim());
        } else {
          const prefix = baseAnswerBeforeSpeechRef.current
            ? baseAnswerBeforeSpeechRef.current.trim() + ' '
            : '';
          setAnswers(prev => ({
            ...prev,
            [currentIdxRef.current]: (prefix + combinedSpeech).trim()
          }));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error/warning:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          shouldKeepListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user hasn't explicitly stopped recording (prevents silence dropouts)
        if (shouldKeepListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            shouldKeepListeningRef.current = false;
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const stopListening = () => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Fitur Speech Recognition tidak didukung di peramban ini. Anda dapat mengetikkan jawaban secara langsung.');
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
    }

    baseOneShotBeforeSpeechRef.current = oneShotAnswer || '';
    baseAnswerBeforeSpeechRef.current = answers[currentIdxRef.current] || '';
    shouldKeepListeningRef.current = true;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Start mic warning:', e);
      // If already started, force sync
      setIsListening(true);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakQuestion = (text: string, idx?: number) => {
    if (!('speechSynthesis' in window)) return;
    stopListening();
    window.speechSynthesis.cancel();

    if (idx !== undefined) {
      setSpeakingIdx(idx);
    }

    const cleanText = text.replace(/[*#_`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID');
    if (idVoice) utterance.voice = idVoice;

    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
    }
  };

  // Start the One-Shot interview session
  const handleStartOneShotSession = () => {
    setIsStarted(true);
    // Keep questions visible, scroll into view smoothly
    window.scrollTo({ top: 180, behavior: 'smooth' });

    if (autoReadQuestion && questions.length > 0) {
      setTimeout(() => {
        speakQuestion(`Pertanyaan nomor 1. ${questions[0]}`, 0);
      }, 400);
    }
  };

  // Insert question tag marker into One-Shot transcript
  const handleInsertQuestionTag = (qIdx: number) => {
    const marker = `\n\n--- [Jawaban Pertanyaan #${qIdx + 1}: ${questions[qIdx].substring(0, 40)}...] ---\n`;
    setOneShotAnswer(prev => {
      const trimmed = prev.trim();
      return (trimmed ? trimmed + marker : marker.trimStart());
    });
  };

  // Submit all answers (Unified One-Shot response or combined per-question)
  const handleSubmitAllAnswers = async () => {
    stopListening();
    stopSpeaking();

    // Compile comprehensive interview transcript
    let summary = '';
    const hasOneShot = oneShotAnswer.trim().length > 0;
    const answeredPerQuestions = questions.filter((_, idx) => (answers[idx] || '').trim().length > 0);

    if (hasOneShot) {
      summary = `POSISI LAMARAN: ${jobTitle}
METODE: Sesi Wawancara AI One-Shot (Berdasarkan Pertanyaan Job Description Admin)

DAFTAR PERTANYAAN:
${questions.map((q, idx) => `Pertanyaan ${idx + 1}: ${q}`).join('\n')}

========================================
TRANSKRIP LENGKAP SESI WAWANCARA ONE-SHOT:
========================================
${oneShotAnswer.trim()}`;

      if (answeredPerQuestions.length > 0) {
        summary += `\n\n========================================
CATATAN TAMBAHAN PER NOMOR PERTANYAAN:
========================================\n` + questions.map((q, idx) => {
          const ans = (answers[idx] || '').trim();
          return ans ? `Pertanyaan ${idx + 1}: ${q}\nJawaban: ${ans}` : null;
        }).filter(Boolean).join('\n\n');
      }
    } else if (answeredPerQuestions.length > 0) {
      const transcriptLines = questions.map((q, idx) => {
        const candidateAns = (answers[idx] || '').trim() || '(Tidak ada jawaban)';
        return `Pertanyaan ${idx + 1}: ${q}\nJawaban Kandidat: ${candidateAns}`;
      });
      summary = transcriptLines.join('\n\n');
    } else {
      alert('Silakan rekam suara Anda atau ketikkan jawaban wawancara sebelum mengirimkan hasil wawancara.');
      return;
    }

    setSubmitting(true);

    let aiSummaryResult = 'Evaluasi otomatis wawancara telah terekam.';
    try {
      const aiRes = await fetch('/api/ai/interpret-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: `Posisi Lamaran: ${jobTitle}\nMetode: Wawancara AI One-Shot\n\n${summary}`
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

  // LOADING STATE
  if (fetchingJob) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col justify-center items-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto my-6 p-8">
        <Loader2 className="w-10 h-10 animate-spin text-mgm-green mb-4" />
        <p className="text-slate-600 font-bold text-sm">
          Menyiapkan daftar pertanyaan wawancara untuk posisi lamaran Anda...
        </p>
      </div>
    );
  }

  // NOT ALLOWED STATE
  if (isAllowedToInterview === false && !isCompleted) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 space-y-6 text-center animate-fade-in my-8">
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
            <li>Sesi Wawancara AI dibuka apabila lamaran Anda telah lolos seleksi awal (Tahap Terpilih / Wawancara) oleh Admin HR.</li>
            <li>Jika Anda sudah menyelesaikan wawancara untuk lamaran ini, hasil jawaban Anda telah tersimpan di sistem HR.</li>
          </ul>
        </div>
      </div>
    );
  }

  // COMPLETED STATE UI
  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 md:p-10 space-y-6 animate-fade-in my-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-mgm-dark tracking-tight">
            Sesi Wawancara AI One-Shot Selesai
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm font-medium leading-relaxed">
            Terima kasih, <strong>{user.name}</strong>! Seluruh jawaban Anda untuk posisi{' '}
            <strong>{jobTitle}</strong> telah berhasil direkam dan dikirimkan ke tim HR/Admin.
          </p>
        </div>

        {finalSummary && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-2xl mx-auto space-y-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-mgm-dark uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-mgm-green" />
              <span>Status Rangkuman Wawancara AI</span>
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {finalSummary}
            </p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            MGM SmartHire • Sesi Wawancara AI Berhasil Dikirimkan
          </p>
        </div>
      </div>
    );
  }

  // MAIN PAGE (Shows all questions on one page with minimize/maximize, plus One-Shot session workspace)
  return (
    <div className="max-w-4xl mx-auto space-y-6 my-4">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-mgm-dark via-[#1e4046] to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-mgm-yellow border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-mgm-yellow" />
              <span>Sesi Wawancara AI One-Shot (1 Arah)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Wawancara Posisi: {jobTitle}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm font-light">
              {jobDepartment && `${jobDepartment} • `}
              {hasCustomAdminQuestions ? 'Pertanyaan disusun Admin sesuai Job Description' : 'Pertanyaan Standar Kompetensi Posisi'}
              {jobDescName && ` • Lampiran: ${jobDescName}`}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 text-center">
              <span className="text-[10px] text-white/75 uppercase tracking-wider font-bold block">
                Total Soal
              </span>
              <span className="text-lg font-black text-mgm-yellow">
                {questions.length} Pertanyaan
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAutoReadQuestion(!autoReadQuestion)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                autoReadQuestion
                  ? 'bg-mgm-green text-white border-mgm-green shadow-md'
                  : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
              }`}
              title={autoReadQuestion ? 'Pembaca Suara Otomatis Aktif' : 'Pembaca Suara Otomatis Nonaktif'}
            >
              {autoReadQuestion ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. ALL QUESTIONS SECTION (DISPLAY ALL QUESTIONS ON ONE PAGE, MINIMIZABLE) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden transition-all">
        {/* Panel Header with Minimize/Maximize Toggle */}
        <div className="p-5 md:p-6 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-extrabold text-mgm-dark">
                  Daftar Pertanyaan Wawancara ({questions.length} Pertanyaan)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Semua di Satu Halaman
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isStarted
                  ? 'Daftar pertanyaan ini tetap terlihat selama sesi wawancara dimulai agar Anda dapat menjawab seluruh poin.'
                  : 'Pelajari seluruh pertanyaan di bawah ini sebelum memulai sesi wawancara One-Shot.'}
              </p>
            </div>
          </div>

          {/* Minimize / Maximize Button */}
          <button
            type="button"
            onClick={() => setIsQuestionsMinimized(!isQuestionsMinimized)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-mgm-green hover:text-mgm-green shadow-2xs transition-all cursor-pointer shrink-0"
            title={isQuestionsMinimized ? 'Perluas / Tampilkan Semua Pertanyaan' : 'Minimalkan Daftar Pertanyaan'}
          >
            {isQuestionsMinimized ? (
              <>
                <Maximize2 className="w-4 h-4 text-mgm-green" />
                <span className="hidden sm:inline">Tampilkan Pertanyaan</span>
                <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Minimalkan Daftar</span>
                <ChevronUp className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* QUESTIONS LIST CONTENT (EXPANDED / MINIMIZED) */}
        <AnimatePresence initial={false}>
          {isQuestionsMinimized ? (
            /* Minimized View: Compact ribbon with question pills */
            <motion.div
              key="minimized"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-emerald-50/40 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-2 text-slate-600 font-medium">
                <span className="font-bold text-mgm-dark">Ringkasan Soal:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {questions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsQuestionsMinimized(false);
                        speakQuestion(q, idx);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-white border border-slate-200 hover:border-mgm-green text-mgm-dark shadow-2xs cursor-pointer transition-all"
                      title={q}
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionsMinimized(false)}
                className="text-xs font-bold text-mgm-green hover:underline cursor-pointer"
              >
                + Buka Tampilan Lengkap ({questions.length} Soal)
              </button>
            </motion.div>
          ) : (
            /* Expanded View: All questions listed clearly on one page */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 md:p-6 space-y-3.5 divide-y divide-slate-100"
            >
              {questions.map((questionText, idx) => {
                const isSpeakingThis = speakingIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`pt-3.5 first:pt-0 rounded-2xl transition-all ${
                      isSpeakingThis ? 'bg-emerald-50/70 p-4 border border-emerald-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3.5 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-mgm-dark text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed">
                            {questionText}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {/* Audio speaker button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isSpeakingThis) {
                              stopSpeaking();
                            } else {
                              speakQuestion(questionText, idx);
                            }
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSpeakingThis
                              ? 'bg-mgm-green text-white border-mgm-green animate-pulse'
                              : 'bg-slate-50 text-slate-600 hover:text-mgm-green hover:bg-emerald-50 border-slate-200'
                          }`}
                          title={isSpeakingThis ? 'Hentikan Audio' : 'Dengarkan Soal Ini'}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Quick tag helper if interview session is started */}
                        {isStarted && (
                          <button
                            type="button"
                            onClick={() => handleInsertQuestionTag(idx)}
                            className="hidden sm:inline-flex items-center px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-mgm-green border border-slate-200 transition-all cursor-pointer"
                            title="Sisipkan penanda nomor soal ini ke kotak jawaban"
                          >
                            <span>Tandai Soal #{idx + 1}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. INTERVIEW SESSION WORKSPACE (ONE-SHOT) */}
      {!isStarted ? (
        /* INVITATION SCREEN: Prompt user to start the One-Shot interview session */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 md:p-6 space-y-3">
            <div className="flex items-center space-x-2.5 text-mgm-dark">
              <HelpCircle className="w-5 h-5 text-mgm-green shrink-0" />
              <h3 className="text-base font-extrabold">
                Persilakan Sesi Wawancara One-Shot (Satu Sesi Langsung)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Seluruh <strong>{questions.length} pertanyaan wawancara</strong> telah ditampilkan di atas.
              Anda dipersilakan untuk menjawab semua pertanyaan tersebut dalam <strong>satu sesi wawancara langsung (One-Shot)</strong>.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
              <li>
                <strong>Daftar Pertanyaan Tetap Terlihat:</strong> Saat sesi dimulai, daftar pertanyaan di atas akan tetap tampil di layar (bisa Anda minimalkan sewaktu-waktu sesuai kenyamanan).
              </li>
              <li>
                <strong>One-Shot Voice Recording:</strong> Cukup klik tombol rekam suara sekali, lalu bicaralah menjawab seluruh pertanyaan dari nomor 1 hingga {questions.length} secara berurutan. Transkrip ucapan Anda otomatis tercatat.
              </li>
              <li>
                <strong>Pemeriksaan & Pengiriman:</strong> Anda dapat memeriksa dan menyempurnakan jawaban Anda kapan saja sebelum menekan tombol kirim.
              </li>
            </ul>
          </div>

          {/* Big CTA to start session */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartOneShotSession}
              className="w-full py-4 px-6 bg-mgm-green hover:bg-[#e00050] text-white rounded-2xl font-black text-base md:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Mulai Sesi Wawancara (One-Shot) Sekarang</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE ONE-SHOT INTERVIEW SESSION WORKSPACE */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
          {/* Workspace Header & Mode Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider">
                  Sesi Wawancara Sedang Berlangsung (One-Shot)
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-mgm-dark mt-1">
                Rekam & Tulis Jawaban untuk Seluruh Pertanyaan di Atas
              </h3>
            </div>

            {/* Answer Mode Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAnswerMode('one_shot')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  answerMode === 'one_shot'
                    ? 'bg-white text-mgm-dark shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-mgm-dark'
                }`}
              >
                Jawaban Terpadu (One-Shot)
              </button>
              <button
                type="button"
                onClick={() => setAnswerMode('per_question')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  answerMode === 'per_question'
                    ? 'bg-white text-mgm-dark shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-mgm-dark'
                }`}
              >
                Per Nomor Soal ({questions.length})
              </button>
            </div>
          </div>

          {/* ONE-SHOT UNIFIED MODE */}
          {answerMode === 'one_shot' && (
            <div className="space-y-4">
              {/* Voice Controls Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center shadow-md transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-mgm-green hover:bg-[#e00050] text-white'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-5 h-5 mr-2" />
                        <span>Hentikan Rekam ({formatTimer(recordingSeconds)})</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        <span>Mulai Bicara / Rekam Jawaban One-Shot</span>
                      </>
                    )}
                  </button>

                  {oneShotAnswer && (
                    <button
                      type="button"
                      onClick={() => {
                        stopListening();
                        baseOneShotBeforeSpeechRef.current = '';
                        setOneShotAnswer('');
                      }}
                      className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 hover:bg-rose-50 transition-all flex items-center cursor-pointer"
                      title="Bersihkan Teks Jawaban"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Ulangi
                    </button>
                  )}
                </div>

                {/* Quick Helper Chips: insert question header */}
                <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                  <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">Sisipkan:</span>
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertQuestionTag(idx)}
                      className="px-2 py-1 rounded-md text-[11px] font-bold bg-white border border-slate-200 hover:border-mgm-green text-slate-700 shadow-2xs shrink-0 cursor-pointer"
                    >
                      #Soal {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Recording Waveform Indicator */}
              {isListening && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                  <div className="flex items-center space-x-3">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                    </span>
                    <span>
                      Mikrofon Aktif Merekam — Silakan bicarakan jawaban Anda untuk seluruh pertanyaan di atas secara runtut...
                    </span>
                  </div>
                  <span className="font-mono text-emerald-700 text-sm">{formatTimer(recordingSeconds)}</span>
                </div>
              )}

              {/* One-Shot Master Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Transkrip & Catatan Jawaban Sesi One-Shot
                </label>
                <textarea
                  rows={10}
                  value={oneShotAnswer}
                  onChange={e => {
                    const val = e.target.value;
                    baseOneShotBeforeSpeechRef.current = val;
                    setOneShotAnswer(val);
                  }}
                  placeholder="Transkrip suara Anda saat berbicara akan langsung terisi di sini secara otomatis. Anda juga dapat mengetik atau menyempurnakan jawaban Anda secara leluasa..."
                  className={`w-full p-4 rounded-2xl border text-sm md:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-mgm-green transition-all ${
                    isListening
                      ? 'border-mgm-green bg-emerald-50/20 text-mgm-dark shadow-inner'
                      : 'border-slate-200 bg-white text-slate-800'
                  }`}
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Panjang Teks: {oneShotAnswer.trim().length} karakter • {oneShotAnswer.trim() ? oneShotAnswer.trim().split(/\s+/).length : 0} kata</span>
                  <span>Daftar pertanyaan di atas tetap dapat Anda lihat sewaktu-waktu</span>
                </div>
              </div>
            </div>
          )}

          {/* PER QUESTION MODE (ALL QUESTIONS ON THE SAME PAGE) */}
          {answerMode === 'per_question' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Anda juga dapat mengisi jawaban terpisah per nomor pertanyaan di bawah ini. Semua nomor soal berada di halaman yang sama tanpa perlu berpindah-pindah halaman:
              </p>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const currentAnswer = answers[idx] || '';
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-mgm-green bg-emerald-50/20 shadow-xs'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-md bg-mgm-dark text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-extrabold text-mgm-dark">
                            Pertanyaan #{idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentIdx(idx);
                              toggleListening();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-all cursor-pointer ${
                              isListening && isCurrent
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900'
                            }`}
                          >
                            <Mic className="w-3.5 h-3.5 mr-1" />
                            <span>{isListening && isCurrent ? 'Hentikan' : 'Rekam Nomor Ini'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-3">
                        {q}
                      </p>

                      <textarea
                        rows={3}
                        value={currentAnswer}
                        onFocus={() => setCurrentIdx(idx)}
                        onChange={e => {
                          const val = e.target.value;
                          setAnswers(prev => ({ ...prev, [idx]: val }));
                        }}
                        placeholder={`Tuliskan atau rekam jawaban Anda untuk pertanyaan nomor ${idx + 1}...`}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mgm-green bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON BAR */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Pastikan seluruh pertanyaan nomor 1 s/d {questions.length} telah Anda jawab dengan baik sebelum mengirimkan.
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitAllAnswers}
              className="px-8 py-4 bg-mgm-green hover:bg-[#e00050] text-white rounded-2xl font-black text-sm md:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Menyimpan & Mengirimkan Jawaban...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  <span>Selesai & Kirim Seluruh Jawaban Wawancara</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
