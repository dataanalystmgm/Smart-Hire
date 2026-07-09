import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User as UserIcon, 
  Bot, 
  Mic, 
  MicOff, 
  Loader2, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  Play,
  Settings,
  HelpCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function Interview({ user }: { user: User }) {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true); // AI Voice by default
  const [isSttEnabled, setIsSttEnabled] = useState<boolean>(true); // Mic Input by default
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('Generalist');
  const [fetchingJob, setFetchingJob] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [finalSummary, setFinalSummary] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isAllowedToInterview, setIsAllowedToInterview] = useState<boolean | null>(null);
  const [allowedReason, setAllowedReason] = useState<string>('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Speech Recognition setup
  const recognitionRef = useRef<any>(null);

  // Helper to determine the prompt structure for 10 sequential general questions
  const getPromptContextForQuestion = (num: number, position: string) => {
    const base = `Anda adalah AI interviewer profesional untuk MGM SmartHire. Anda mewawancarai kandidat bernama ${user.name} untuk posisi ${position}. Jaga pertanyaan Anda tetap profesional, ramah, singkat, dan padat (maksimal 2 kalimat). Ajukan tepat SATU pertanyaan saja per giliran. Anda HARUS merespon menggunakan Bahasa Indonesia.`;
    
    switch(num) {
      case 1:
        return `${base} Ini adalah Pertanyaan ke-1 dari total 10 pertanyaan wawancara. Mulailah dengan meminta kandidat untuk memperkenalkan diri secara singkat (nama, latar belakang, dan minat utama).`;
      case 2:
        return `${base} Ini adalah Pertanyaan ke-2 dari total 10 pertanyaan wawancara. Berdasarkan perkenalan diri mereka sebelumnya, tanyakan alasan utama mereka tertarik untuk melamar posisi ${position} di MGM SmartHire.`;
      case 3:
        return `${base} Ini adalah Pertanyaan ke-3 dari total 10 pertanyaan wawancara. Mari mendalami pengalaman kerja (job) sebelumnya atau pengalaman organisasi/proyek terdekat. Tanyakan apa peran dan tanggung jawab paling signifikan yang pernah mereka pegang.`;
      case 4:
        return `${base} Ini adalah Pertanyaan ke-4 dari total 10 pertanyaan wawancara. Mari bahas latar belakang pendidikan, jurusan, atau pelatihan relevan yang pernah mereka ikuti. Tanyakan bagaimana hal tersebut mempersiapkan mereka untuk peran ${position} ini.`;
      case 5:
        return `${base} Ini adalah Pertanyaan ke-5 dari total 10 pertanyaan wawancara. Bahas mengenai keahlian utama (skills). Tanyakan apa keterampilan terkuat mereka (hard skill atau soft skill) yang paling menonjol dan relevan untuk posisi ini.`;
      case 6:
        return `${base} Ini adalah Pertanyaan ke-6 dari total 10 pertanyaan wawancara. Masuk ke topik tantangan (general). Mintalah kandidat menceritakan salah satu tantangan atau masalah terbesar yang pernah mereka hadapi di lingkungan kerja atau akademik.`;
      case 7:
        return `${base} Ini adalah Pertanyaan ke-7 dari total 10 pertanyaan wawancara. Tindak lanjuti cerita tantangan tersebut. Tanyakan tindakan atau langkah konkret apa yang mereka lakukan untuk mengatasi tantangan tersebut dan bagaimana hasilnya.`;
      case 8:
        return `${base} Ini adalah Pertanyaan ke-8 dari total 10 pertanyaan wawancara. Tanyakan mengenai kerja sama tim dan komunikasi. Bagaimana gaya kolaborasi mereka dalam tim, dan bagaimana cara mereka mengatasi jika terjadi perbedaan pendapat dengan rekan kerja.`;
      case 9:
        return `${base} Ini adalah Pertanyaan ke-9 dari total 10 pertanyaan wawancara. Tanyakan mengenai visi karir dan kontribusi jangka panjang. Di mana mereka melihat diri mereka dalam 3 hingga 5 tahun ke depan dan kontribusi apa yang ingin mereka berikan kepada perusahaan ini.`;
      case 10:
        return `${base} Ini adalah Pertanyaan ke-10 (PERTANYAAN TERAKHIR) dari total 10 pertanyaan wawancara. Tanyakan apakah mereka memiliki pertanyaan untuk perusahaan atau ada pesan penutup yang ingin disampaikan sebelum wawancara ditutup. Nyatakan dengan ramah bahwa ini adalah pertanyaan terakhir.`;
      default:
        return `${base} Lanjutkan wawancara secara profesional dan terfokus pada kualifikasi umum kandidat.`;
    }
  };

  // Determine eligibility and job title on load
  useEffect(() => {
    async function checkEligibility() {
      let title = 'Generalist';
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
        if (d.status === 'success' && d.data && d.data.length > 0) {
          applicationsList = d.data;
        }
      } catch (err) {
        console.warn('Failed to fetch applications from GAS:', err);
      }

      // Fallback/merge with local storage applications
      try {
        const storedApps = localStorage.getItem('mgm_applications');
        if (storedApps) {
          const parsed = JSON.parse(storedApps);
          parsed.forEach((localApp: any) => {
            const exists = applicationsList.some((app: any) => String(app.ID || app.id || '') === String(localApp.id));
            if (!exists) {
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

      // Find user applications
      const userApps = applicationsList.filter((app: any) => 
        String(app.UserID || app.userId || app.UserId || '').toLowerCase() === String(user.userId).toLowerCase()
      );

      // Find approved applications (Approved, Disetujui, Testing, Interview, Offered)
      const approvedApps = userApps.filter((app: any) => {
        const st = String(app.Status || app.status || '').toLowerCase();
        return ['approved', 'disetujui', 'testing', 'interview', 'offered'].includes(st);
      });

      // 2. Fetch Interviews from Sheet
      try {
        const res = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_data', type: 'Interviews' })
        });
        const d = await res.json();
        if (d.status === 'success' && d.data && d.data.length > 0) {
          interviewsList = d.data;
        }
      } catch (err) {
        console.warn('Failed to fetch interviews from GAS:', err);
      }

      // Fallback/merge with local storage interviews
      try {
        const storedInt = localStorage.getItem('mgm_interviews');
        if (storedInt) {
          const parsed = JSON.parse(storedInt);
          parsed.forEach((localInt: any) => {
            const exists = interviewsList.some((i: any) => 
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

      // Find user interviews
      const userInterviews = interviewsList.filter((i: any) => 
        String(i.UserID || i.userId || i.UserId || '').toLowerCase() === String(user.userId).toLowerCase()
      );

      // Evaluate eligibility
      if (approvedApps.length === 0) {
        setIsAllowedToInterview(false);
        setAllowedReason("Maaf, sesi wawancara AI saat ini belum tersedia karena Anda belum memiliki lamaran aktif yang disetujui (Approved) oleh HR.");
        setFetchingJob(false);
        return;
      }

      // Find latest approved application
      let latestApprovedApp = approvedApps[0];
      for (const app of approvedApps) {
        if (new Date(app.CreatedAt || app.createdAt) > new Date(latestApprovedApp.CreatedAt || latestApprovedApp.createdAt)) {
          latestApprovedApp = app;
        }
      }

      // Set Job Title based on latest approved app
      if (latestApprovedApp && (latestApprovedApp.JobTitle || latestApprovedApp.jobTitle)) {
        title = latestApprovedApp.JobTitle || latestApprovedApp.jobTitle;
      }
      setJobTitle(title);

      // Check if there is an interview *after* this latest approved application
      if (userInterviews.length > 0) {
        // Find latest interview
        let latestInterview = userInterviews[0];
        for (const i of userInterviews) {
          if (new Date(i.CreatedAt || i.createdAt) > new Date(latestInterview.CreatedAt || latestInterview.createdAt)) {
            latestInterview = i;
          }
        }

        const appDate = new Date(latestApprovedApp.CreatedAt || latestApprovedApp.createdAt);
        const intDate = new Date(latestInterview.CreatedAt || latestInterview.createdAt);

        if (intDate >= appDate) {
          // Interview was done after or on the same time as approval
          setIsAllowedToInterview(false);
          setAllowedReason("Anda sudah melakukan sesi wawancara untuk lamaran terbaru Anda. Hasil evaluasi otomatis dan 'Summary by AI' Anda telah terekam.");
          
          // Show the completion screen with their Summary by AI!
          setFinalSummary(latestInterview['Summary by AI'] || latestInterview.aiSummary || 'Evaluasi otomatis tersedia.');
          setIsCompleted(true);
        } else {
          // Latest approved app is newer than the latest interview, they applied again and got approved again!
          setIsAllowedToInterview(true);
          setAllowedReason("Lamaran baru Anda disetujui! Silakan ikuti sesi wawancara AI kembali.");
        }
      } else {
        // No interview yet
        setIsAllowedToInterview(true);
        setAllowedReason("");
      }

      setFetchingJob(false);
    }

    checkEligibility();
  }, [user]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech synthesis & speech recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'id-ID';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        const text = finalTranscript || interimTranscript;
        if (text) {
          setInput(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert("Akses mikrofon ditolak. Pastikan Anda telah memberikan izin mikrofon di browser Anda.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Cancel speech synthesis if TTS is toggled off
  useEffect(() => {
    if (!isTtsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isTtsEnabled]);

  // Handle automatically playing AI voice and triggering mic listening
  const speak = (text: string) => {
    if (!isTtsEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      
      utterance.onstart = () => {
        if (isListening && recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
        }
      };

      utterance.onend = () => {
        // Automatically start microphone input after AI finishes speaking
        if (isSttEnabled && recognitionRef.current && !isListening && !isCompleted) {
          try {
            setInput('');
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            console.error("Autostart mic failed:", e);
          }
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setInput('');
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Browser Anda tidak mendukung fitur perekaman suara (Speech-to-Text).");
      }
    }
  };

  const startInterviewSession = () => {
    setIsStarted(true);
    const welcomeMsg = `Halo ${user.name}, saya agen AI wawancara MGM SmartHire untuk posisi ${jobTitle}. Apakah Anda siap untuk memulai wawancara untuk posisi tersebut?`;
    
    setMessages([
      { role: 'ai', content: welcomeMsg }
    ]);
    
    if (isTtsEnabled) {
      // Small timeout to let browser register active interaction context
      setTimeout(() => {
        speak(welcomeMsg);
      }, 300);
    } else if (isSttEnabled && recognitionRef.current) {
      setTimeout(() => {
        try {
          setInput('');
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      }, 300);
    }
  };

  const handleFinish = async (customMessages?: Message[]) => {
    setLoading(true);
    // Cancel any ongoing speech and stop listening
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const msgs = customMessages || messages;
    const summary = msgs.map(m => `${m.role === 'ai' ? 'AI' : 'Candidate'}: ${m.content}`).join('\n');
    
    let aiSummaryResult = "Evaluasi otomatis belum tergenerasi.";
    try {
      // Call Gemini API to generate professional Summary by AI
      const aiRes = await fetch('/api/ai/interpret-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: summary })
      });
      const aiData = await aiRes.json();
      if (aiData.result) {
        aiSummaryResult = aiData.result;
      }
    } catch (err) {
      console.error("Failed to generate AI Summary for interview:", err);
    }

    try {
      // Save locally in localStorage for persistent fallback
      const storedInterviews = localStorage.getItem('mgm_interviews') ? JSON.parse(localStorage.getItem('mgm_interviews')!) : [];
      const newInterview = {
        userId: user.userId,
        userName: user.name,
        summary,
        aiSummary: aiSummaryResult,
        validated: 'Belum Divalidasi',
        createdAt: new Date().toISOString()
      };
      
      // Filter out older attempts if any to ensure single record
      const cleanedInterviews = storedInterviews.filter((i: any) => String(i.userId).toLowerCase() !== String(user.userId).toLowerCase());
      cleanedInterviews.push(newInterview);
      localStorage.setItem('mgm_interviews', JSON.stringify(cleanedInterviews));

      // Sync via GAS proxy to Google Sheet (kolom C sheet Interviews)
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
      alert('Wawancara selesai! Hasil wawancara dan "Summary by AI" telah sukses disimpan di Google Sheet (Interviews).');
    } catch (e) {
      alert('Gagal menyimpan hasil wawancara ke Google Sheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    // Cancel any active AI speaking if the user submits input
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const newMessages = [...messages, { role: 'user', content: input } as Message];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // If we've already asked 10 questions and the user has just replied to the 10th question, complete!
    if (questionCount >= 10) {
      await handleFinish(newMessages);
      return;
    }

    try {
      const nextQuestionNum = questionCount + 1;
      const promptContext = getPromptContextForQuestion(nextQuestionNum, jobTitle);

      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          context: promptContext
        })
      });
      const data = await res.json();
      const aiResponseText = data.text || "Terima kasih atas jawaban Anda. Mari kita lanjut ke pertanyaan berikutnya.";
      
      const updatedMessages = [...newMessages, { role: 'ai', content: aiResponseText } as Message];
      setMessages(updatedMessages);
      setQuestionCount(nextQuestionNum);

      // Speak AI response out loud if enabled
      if (isTtsEnabled) {
        speak(aiResponseText);
      } else if (isSttEnabled && recognitionRef.current) {
        // If speaking is disabled, immediately start recording user voice
        setTimeout(() => {
          try {
            setInput('');
            recognitionRef.current.start();
            setIsListening(true);
          } catch (err) {
            console.error(err);
          }
        }, 300);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'ai', content: "Maaf, terjadi gangguan koneksi ke AI. Bisa silakan ulangi jawaban Anda?" }]);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col justify-center items-center bg-white rounded-[2rem] border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <Loader2 className="w-10 h-10 animate-spin text-mgm-green mb-4" />
        <p className="text-slate-500 font-bold text-sm">Menghubungkan wawancara dengan posisi lamaran Anda...</p>
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
          <h1 className="text-2xl font-bold text-mgm-dark tracking-tight">Sesi Wawancara AI Belum Tersedia</h1>
          <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed font-semibold">
            {allowedReason || "Anda belum diizinkan untuk memulai wawancara AI saat ini."}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl max-w-lg mx-auto text-left text-xs space-y-2 text-slate-500 font-medium">
          <p className="font-bold text-mgm-dark">Mengapa ini terjadi?</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sesi wawancara AI telepon interaktif hanya dibuka jika lamaran Anda telah disetujui (Approved) oleh HR.</li>
            <li>Jika Anda sudah menyelesaikan wawancara sebelumnya untuk lamaran ini, Anda tidak perlu mengulanginya lagi, kecuali jika Anda mengajukan lamaran posisi baru yang disetujui kembali.</li>
          </ul>
        </div>
      </div>
    );
  }

  // Completed State UI
  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden p-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-mgm-dark tracking-tight">Wawancara AI Selesai</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Selamat, Anda telah menyelesaikan seluruh rangkaian pertanyaan wawancara untuk posisi <span className="font-bold text-mgm-green">{jobTitle}</span>. Rangkuman wawancara dan ulasan "Summary by AI" telah sukses tersimpan di Google Sheet.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
            <Bot className="w-6 h-6 text-mgm-green" />
            <h2 className="text-lg font-bold text-mgm-dark">Summary by AI (Ulasan Otomatis HR)</h2>
          </div>
          
          <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed max-h-[400px] overflow-y-auto pr-2 custom-scrollbar font-medium">
            {finalSummary || "Sedang memproses rangkuman evaluasi AI..."}
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">MGM SmartHire • Sesi Wawancara Dikunci</p>
        </div>
      </div>
    );
  }

  // Welcome/Setup Screen
  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
        {/* Header Call Style */}
        <div className="bg-gradient-to-r from-mgm-dark to-slate-800 p-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></span> Sinyal Baik
          </div>
          <div className="w-20 h-20 bg-mgm-green/20 border-2 border-mgm-green rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Phone className="w-10 h-10 text-mgm-green" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">MGM SmartHire AI Telephony</h1>
          <p className="text-slate-300 mt-2 text-sm font-medium">Wawancara Suara (Speech-to-Speech) Otomatis Berbasis Telepon</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-mgm-dark">Rincian Sesi Wawancara</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Posisi Lamaran</p>
                <p className="text-base font-bold text-mgm-green mt-1">{jobTitle}</p>
              </div>
              <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Jumlah Pertanyaan</p>
                <p className="text-base font-bold text-mgm-dark mt-1">10 Pertanyaan Terstruktur</p>
              </div>
            </div>
          </div>

          {/* Mode Configuration Toggles */}
          <div className="border border-slate-200 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-mgm-dark text-base flex items-center">
                <Settings className="w-5 h-5 mr-2 text-mgm-green" />
                Konfigurasi Suara & Teks
              </h3>
              <button 
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs font-semibold text-mgm-green hover:underline"
              >
                {showSettings ? 'Sembunyikan' : 'Kustomisasi'}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsTtsEnabled(true);
                  setIsSttEnabled(true);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${isTtsEnabled && isSttEnabled ? 'border-mgm-green bg-emerald-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-mgm-green" />
                  <Mic className="w-5 h-5 text-mgm-green" />
                </div>
                <p className="font-bold text-sm text-mgm-dark mt-2">Speech-to-Speech</p>
                <p className="text-xs text-slate-500 mt-1">Seperti panggilan telepon interaktif (Rekomendasi).</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTtsEnabled(false);
                  setIsSttEnabled(false);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${!isTtsEnabled && !isSttEnabled ? 'border-mgm-green bg-emerald-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-slate-500" />
                </div>
                <p className="font-bold text-sm text-mgm-dark mt-2">Mode Teks (Chat)</p>
                <p className="text-xs text-slate-500 mt-1">Gunakan keyboard Anda untuk menjawab, tanpa suara.</p>
              </button>
            </div>

            {(showSettings || (!isTtsEnabled && isSttEnabled) || (isTtsEnabled && !isSttEnabled)) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-slate-100 space-y-4"
              >
                {/* TTS Switch */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-mgm-dark">Suara AI Wawancara (Text-to-Speech)</p>
                    <p className="text-xs text-slate-500 mt-0.5">AI akan membacakan teks pertanyaan secara otomatis.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isTtsEnabled} 
                      onChange={(e) => setIsTtsEnabled(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mgm-green"></div>
                  </label>
                </div>

                {/* STT Switch */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-mgm-dark">Gunakan Perekam Suara (Speech-to-Text)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Mengaktifkan mikrofon otomatis agar Anda bisa berbicara.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isSttEnabled} 
                      onChange={(e) => setIsSttEnabled(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mgm-green"></div>
                  </label>
                </div>
              </motion.div>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-sm space-y-2 text-slate-600">
            <p className="font-bold text-mgm-dark flex items-center">
              <HelpCircle className="w-4 h-4 mr-2 text-mgm-green" /> Petunjuk Sesi Telepon AI:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pastikan browser Anda diizinkan mengakses mikrofon.</li>
              <li>Wawancara berlangsung sebanyak <span className="font-bold text-mgm-green">10 pertanyaan terstruktur</span> (Perkenalan, Latar Belakang Job/Pendidikan, Tantangan & Kerja Sama, Penutup).</li>
              <li>Setelah AI selesai membacakan pertanyaan, mikrofon akan terbuka secara otomatis (ditandai box hijau mendengarkan). Cukup bicarakan tanggapan Anda secara alami.</li>
              <li>Klik tombol "Kirim" atau tekan Enter jika Anda selesai berbicara untuk mengirim jawaban ke AI.</li>
            </ul>
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            onClick={startInterviewSession}
            className="w-full py-4 bg-mgm-green text-white rounded-2xl font-bold text-lg hover:bg-opacity-95 shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 animate-pulse"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Hubungkan Sesi & Mulai Wawancara</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Chat/Call interface
  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      <header className="p-6 border-b border-slate-100 bg-white flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-mgm-light rounded-full flex items-center justify-center relative">
             <Bot className="w-6 h-6 text-mgm-green" />
             <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-mgm-dark">MGM AI Interviewer</h2>
            <p className="text-sm text-slate-500 font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> 
              {isTtsEnabled && isSttEnabled ? "Mode Telepon Aktif" : "Mode Teks / Kustom"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progres Wawancara</span>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-mgm-green transition-all duration-300" 
                  style={{ width: `${(questionCount / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-mgm-dark">{questionCount} / 10</span>
            </div>
          </div>

          {/* Quick Toolbar Toggles */}
          <div className="flex items-center space-x-2 border-l border-slate-200 pl-4 mr-2">
            <button
              type="button"
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              className={`p-2 rounded-xl transition-colors ${isTtsEnabled ? 'text-mgm-green bg-emerald-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              title={isTtsEnabled ? 'Matikan Suara AI' : 'Aktifkan Suara AI'}
            >
              {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsSttEnabled(!isSttEnabled)}
              className={`p-2 rounded-xl transition-colors ${isSttEnabled ? 'text-mgm-green bg-emerald-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              title={isSttEnabled ? 'Matikan Perekam Suara' : 'Aktifkan Perekam Suara'}
            >
              {isSttEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>

          <button 
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengakhiri sesi wawancara ini? Jawaban Anda sejauh ini akan disimpan dan dievaluasi otomatis.')) {
                handleFinish();
              }
            }}
            disabled={loading}
            className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
          >
            Selesai
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scrollbar">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-mgm-dark ml-3 shadow-md' : 'bg-mgm-light mr-3 shadow-sm'}`}>
                {m.role === 'user' ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-mgm-green" />}
              </div>
              <div className="relative group">
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-mgm-dark text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                
                {/* Audio replay button for AI messages */}
                {m.role === 'ai' && 'speechSynthesis' in window && (
                  <button
                    type="button"
                    onClick={() => speak(m.content)}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-mgm-green hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
                    title="Putar Suara Kembali"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
             <div className="flex bg-white p-4 rounded-2xl border border-slate-200 shadow-sm rounded-tl-none space-x-2 items-center h-12 ml-12">
               <div className="w-2 h-2 bg-mgm-green rounded-full animate-bounce" />
               <div className="w-2 h-2 bg-mgm-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
               <div className="w-2 h-2 bg-mgm-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
             </div>
           </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input controls */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex space-x-3 items-end">
          <div className="flex-1 relative">
            <textarea 
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? "Silakan bicara, kami sedang mendengarkan..." : "Ketik balasan Anda atau klik mikrofon..."}
              className={`w-full pl-4 pr-12 py-4 border rounded-2xl focus:ring-2 focus:ring-mgm-green outline-none text-[15px] resize-none transition-colors ${isListening ? 'border-mgm-green bg-emerald-50 text-mgm-dark placeholder-emerald-600/50' : 'border-slate-200'}`}
              style={{ minHeight: '60px' }}
            />
            
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${isListening ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' : 'text-slate-400 hover:text-mgm-green hover:bg-mgm-light'}`}
              title="Rekam Suara"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="bg-mgm-green text-white p-4 rounded-2xl hover:bg-opacity-90 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center h-[60px] w-[60px]"
            title="Kirim"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-xs text-slate-400 font-medium">
          <p className="flex items-center">
            {isListening && <span className="flex h-2 w-2 relative mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
            {isListening ? "Mikrofon aktif mendengarkan... katakan jawaban Anda." : "Tekan Enter untuk mengirim."}
          </p>
          <p className="mt-1 sm:mt-0 font-semibold text-mgm-green uppercase tracking-wider">Pertanyaan ke {questionCount} dari 10</p>
        </div>
      </div>
    </div>
  );
}
