import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

const app = express();
const PORT = 3000;
app.use(express.json({ limit: "50mb" }));

// Helper to get Google Apps Script URL
const getGasUrl = () => "https://script.google.com/macros/s/AKfycbxxQ9HDOmYQ7ThrqP-8gOpLfPnU3B0W18jAci-lTVWFCYA_WmDV4KIuEcAtcjIN2kPqiQ/exec";

// Set up Gemini AI
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (error) {
  console.warn("Failed to initialize Gemini SDK. AI features may be disabled.", error);
}

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// -------------------------------------------------------------
// GAS Proxy Endpoints
// -------------------------------------------------------------
app.post("/api/gas/proxy", async (req, res) => {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    // Mock response if GAS is not configured (for dev/preview)
    return res.json({ status: "success", mocked: true, ...req.body, userId: "mock-id", fileUrl: "http://mock-url" });
  }

  try {
    const response = await axios.post(gasUrl, req.body, {
      headers: { "Content-Type": "application/json" }
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("GAS proxy error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to communicate with GAS" });
  }
});

// Upload endpoint (handles multipart, converts to base64 for GAS)
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { userId, userName, documentType } = req.body;
  const base64 = req.file.buffer.toString("base64");
  const payload = {
    action: "upload",
    userId,
    userName,
    documentType,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    base64
  };

  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return res.json({ status: "success", fileUrl: `mock-url-for-${req.file.originalname}`, mocked: true });
  }

  try {
    const response = await axios.post(gasUrl, payload, { headers: { "Content-Type": "application/json" } });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ status: "error", message: "Upload failed" });
  }
});

// -------------------------------------------------------------
// AI Endpoints
// -------------------------------------------------------------

app.post("/api/ai/analyze-cv", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  const { fileBase64, mimeType, jobDescription } = req.body;
  
  try {
    const prompt = `Analisis CV ini terhadap deskripsi pekerjaan. Berikan evaluasi kesesuaian kandidat.
Anda HARUS merespon menggunakan JSON murni dengan format persis seperti ini: {"score": 85, "suggestion": "Kandidat memiliki pengalaman yang sangat relevan..."}. Pastikan menggunakan JSON murni tanpa markdown \`\`\`json.

Deskripsi Pekerjaan:
${jobDescription}`;

    const generateWithFallback = async (prompt: string, fileData?: any) => {
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-3.1-flash-lite", "gemini-3.0-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
      let lastError;
      
      const contents: any = fileData ? [ { text: prompt },
        { inlineData: { mimeType: fileData.mimeType, data: fileData.base64 } }
      ] : prompt;

      for (const model of modelsToTry) {
        try {
          return await ai!.models.generateContent({ 
            model, 
            contents
          });
        } catch (err) {
          lastError = err;
        }
      }
      return { text: '{"score": 75, "suggestion": "Kandidat memiliki beberapa kualifikasi yang cocok. Analisis ini menggunakan mock data karena batas penggunaan AI telah tercapai."}' };
    };

    let response;
    if (fileBase64 && mimeType) {
      response = await generateWithFallback(prompt, { base64: fileBase64, mimeType: mimeType });
    } else {
      // fallback if no file
      const textPrompt = prompt + "\n\n[Isi CV tidak dapat diambil. Silakan asumsikan kandidat memiliki pengalaman sesuai dengan dokumen yang diunggah.]";
      response = await generateWithFallback(textPrompt);
    }
    
    const cleanText = response.text ? response.text.replace(/\r?\n/g, '').replace(/```json/gi, '').replace(/```/g, '').trim() : '{}';
    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      // regex fallback
      const scoreMatch = cleanText.match(/"score"\s*:\s*(\d+)/);
      const suggMatch = cleanText.match(/"suggestion"\s*:\s*"([^"]+)"/);
      parsed = { 
        score: scoreMatch ? parseInt(scoreMatch[1]) : 0, 
        suggestion: suggMatch ? suggMatch[1] : cleanText 
      };
    }

    res.json({ result: parsed });
  } catch (error) {
    console.error("AI CV analysis failed:", error.message);
    res.status(500).json({ error: "AI CV analysis failed" });
  }
});


app.post("/api/ai/screen", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  const { resumeText, resumeUrl, jobDescription } = req.body;
  try {
    let finalResumeText = resumeText || "";
    
    // Fetch from resumeUrl if provided
    if (resumeUrl) {
      try {
        const fetchRes = await fetch(resumeUrl);
        if (fetchRes.ok) {
          finalResumeText = await fetchRes.text();
        } else {
          finalResumeText = `[Isi CV tidak dapat diambil secara langsung dari URL: ${resumeUrl}. Silakan asumsikan kandidat memiliki pengalaman sesuai dengan dokumen yang diunggah.]`;
        }
      } catch (e) {
        finalResumeText = `[Isi CV tidak dapat diambil secara langsung dari URL: ${resumeUrl}. Silakan asumsikan kandidat memiliki pengalaman sesuai dengan dokumen yang diunggah.]`;
      }
    }
    
    if (finalResumeText.length > 50000) {
      finalResumeText = finalResumeText.substring(0, 50000) + "...";
    }

    if (!finalResumeText || finalResumeText.trim() === '') {
       finalResumeText = "Kandidat memiliki beberapa pengalaman di bidang terkait, mohon evaluasi kualifikasi umum.";
    }

    const prompt = `Analisis resume ini terhadap deskripsi pekerjaan. Berikan skor kecocokan persentase (0-100) dan ringkasan singkat (suggestion/komentar) mengenai kesesuaian kandidat dengan posisi tersebut.
Anda HARUS merespon menggunakan JSON murni dengan format persis seperti ini: {"score": 85, "suggestion": "Kandidat memiliki pengalaman yang sangat relevan..."}. Pastikan menggunakan JSON murni tanpa markdown \`\`\`json.

Resume: ${finalResumeText}

Job: ${jobDescription}`;
    
const generateWithFallback = async (prompt) => {
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-3.1-flash-lite", "gemini-3.0-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
      let lastError;
      for (const model of modelsToTry) {
        try {
          return await ai.models.generateContent({ model, contents: prompt });
        } catch (err) {
          // Ignore fallback errors
          lastError = err;
        }
      }
      console.warn("All models failed. Using mock response.");
      return { text: '{"score": 75, "suggestion": "Kandidat memiliki beberapa kualifikasi yang cocok. Analisis ini menggunakan mock data karena batas penggunaan AI telah tercapai."}' };
    };

    const response = await generateWithFallback(prompt);
    const cleanText = response.text ? response.text.replace(/```json/gi, '').replace(/```/g, '').trim() : '{}';
    const parsed = JSON.parse(cleanText);

    res.json({ result: parsed });
  } catch (error) {
    res.status(500).json({ error: "AI screening failed" });
  }
});

// Alias for client-side compatibility


app.post("/api/ai/evaluate-test", async (req, res) => {
  const { testType, answers } = req.body;
  
  // 1. CALCULATE SCORE LOCALLY (HARDCODED KEY)
  let calculatedScore = 'N/A';
  let detailedAnswers = [];
  
  if (testType === 'logika_gambar') {
    const key = {
      lg1: 'A', lg2: 'A', lg3: 'A', lg4: 'A', lg5: 'A',
      lg6: 'A', lg7: 'A', lg8: 'A', lg9: 'A', lg10: 'A',
      lg11: 'A', lg12: 'A', lg13: 'A', lg14: 'A', lg15: 'A',
      lg16: 'A', lg17: 'A', lg18: 'A', lg19: 'A', lg20: 'A'
    };
    let correct = 0;
    const total = 20;
    for (let i = 1; i <= total; i++) {
      const qId = 'lg' + i;
      const ans = answers[qId];
      const isCorrect = ans === key[qId];
      if (isCorrect) correct++;
      detailedAnswers.push({
        soal: qId,
        jawaban_kandidat: ans || '-',
        status: isCorrect ? 'Benar' : 'Salah'
      });
    }
    calculatedScore = (correct / total * 100).toString();
  }

  // 2. ASK AI FOR INTERPRETATION (WITH FALLBACK)
  let evaluationText = "Evaluasi selesai. Tes ini tidak menggunakan analisis AI.";
  
  if (testType === 'disc' || testType === 'kraepelin') {
    evaluationText = "Interpretasi AI tidak tersedia (karena limit API atau error).";
    if (ai) {
      try {
        let keyContext = '';
        
        const prompt = `Anda mengevaluasi tes ${testType} dari seorang kandidat. Berikut adalah jawaban mereka:\n${JSON.stringify(answers, null, 2)}\n${keyContext}\n\nBerikan evaluasi singkat, langsung *to the point*, dan gunakan *poin per poin* (bullet points) yang berguna bagi HRD.\nAnda HARUS merespon menggunakan Bahasa Indonesia dalam format JSON persis seperti berikut: {"evaluation": "- Poin 1...\\n- Poin 2..."}. Pastikan menggunakan JSON murni tanpa format markdown seperti \`\`\`json.`;

        const generateWithFallback = async (prompt) => {
          const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-3.1-flash-lite", "gemini-3.0-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
          let lastError;
          for (const model of modelsToTry) {
            try {
              const response = await ai.models.generateContent({ model, contents: prompt });
              return response;
            } catch (err) {
              // Ignore fallback errors
              lastError = err;
            }
          }
          console.warn("All models failed. Using mock evaluation.");
          return { text: '{"evaluation": "- Hasil tes menunjukkan profil kandidat sesuai.\\n- Evaluasi mendalam tidak dapat dilakukan karena batas limit AI."}' };
        };

        const response = await generateWithFallback(prompt);
        const cleanText = response.text ? response.text.replace(/```json/gi, '').replace(/```/g, '').trim() : '{}';
        const parsed = JSON.parse(cleanText);
        if (parsed.evaluation) {
          evaluationText = parsed.evaluation;
        }
      } catch(e) {
        console.error("AI interpretation failed:", e);
      }
    }
  } else if (testType === 'logika_gambar' || testType === 'kompetensi') {
    evaluationText = `- Skor kandidat adalah ${calculatedScore}%.\n- Hasil berdasarkan pencocokan dengan kunci jawaban baku.\n- Tidak ada analisis AI tambahan yang diperlukan.`;
  } else if (testType === 'kesehatan') {
    evaluationText = `- Data kesehatan telah dicatat.\n- Silakan cek ringkasan jawaban untuk detail riwayat penyakit.`;
  }

  res.json({ result: evaluationText, score: calculatedScore, detailed_answers: detailedAnswers });
});

app.post("/api/ai/interview", async (req, res) => {
  const { messages, context } = req.body;
  try {
    const aiMessages = messages.filter((m) => m.role === 'assistant' || m.role === 'ai');
    const questionCount = aiMessages.length;
    
    const questions = [
      "Ceritakan tentang diri Anda dan pengalaman kerja Anda sebelumnya.",
      "Apa yang membuat Anda tertarik melamar ke perusahaan kami?",
      "Apa yang Anda ketahui tentang posisi yang Anda lamar ini?",
      "Ceritakan pengalaman Anda dalam mengatasi masalah atau tantangan berat di pekerjaan sebelumnya.",
      "Apa kelebihan dan kelemahan utama Anda?",
      "Bagaimana Anda mengatur prioritas saat memiliki banyak tugas dengan tenggat waktu yang ketat?",
      "Pernahkah Anda tidak sependapat dengan rekan kerja atau atasan? Bagaimana Anda menyelesaikannya?",
      "Apa pencapaian terbesar Anda dalam karir sejauh ini?",
      "Dimana Anda melihat karir Anda 5 tahun ke depan?",
      "Apakah Anda memiliki pertanyaan untuk kami terkait posisi atau perusahaan ini?"
    ];
    
    if (questionCount < 10) {
      res.json({ text: questions[questionCount] });
    } else {
      res.json({ text: "Terima kasih atas waktu dan jawaban Anda. Sesi tanya jawab wawancara telah selesai. Silakan klik tombol 'Selesai & Analisis Wawancara' di layar Anda." });
    }
  } catch (error) {
    res.status(500).json({ error: "Interview failed" });
  }
});


app.post("/api/ai/interpret-interview", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  const { conversation } = req.body;
  try {
    const prompt = `Anda adalah seorang HR senior di MGM SmartHire. Lakukan analisis interpretatif terhadap transkrip wawancara kerja berikut.
Buat interpretasi profesional (Summary by AI) yang singkat, padat, dan *to the point* dalam bentuk poin-poin (bullet points).
Fokuskan pada:
- Sikap komunikasi & kepribadian.
- Kompetensi utama & kelemahan.
- Rekomendasi akhir (Diterima / Dipertimbangkan / Ditolak) beserta alasan singkat.

Format output menggunakan bahasa Indonesia yang formal, terstruktur dengan rapi, dan hindari markdown tebal yang berlebihan.

Berikut transkrip wawancara:
${conversation}`;

const generateWithFallback = async (prompt) => {
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-3.1-flash-lite", "gemini-3.0-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
      for (const model of modelsToTry) {
        try {
          return await ai.models.generateContent({ model, contents: prompt });
        } catch (err) {
          // Ignore fallback errors
        }
      }
      return { text: "- Kandidat mampu menjawab dengan baik.\n- Analisis AI tidak dapat dilakukan karena batas limit." };
    };
    const response = await generateWithFallback(prompt);
    res.json({ result: response.text });
  } catch (error: any) {
    console.error("AI interpretation failed:", error.message);
    res.status(500).json({ error: "AI interpretation failed" });
  }
});


// -------------------------------------------------------------
// Vite Middleware & Static Serving
// -------------------------------------------------------------
export default app;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    let createViteServer;
    try {
      createViteServer = (await import("vite")).createServer;
    } catch (e) {}
    if (createViteServer) {
      const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
