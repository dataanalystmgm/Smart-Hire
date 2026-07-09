import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

const app = express();
const PORT = 3000;
app.use(express.json({ limit: "50mb" }));

// Helper to get Google Apps Script URL
const getGasUrl = () => process.env.VITE_GAS_WEB_APP_URL || process.env.GAS_WEB_APP_URL;

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
app.post("/api/ai/screen", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  const { resumeText, jobDescription } = req.body;
  try {
    const prompt = `Analisis resume ini terhadap deskripsi pekerjaan. Berikan skor kecocokan dari 0-100 dan ringkasan singkat kualifikasinya. Anda HARUS merespon menggunakan Bahasa Indonesia.\n\nResume: ${resumeText}\n\nJob: ${jobDescription}`;
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    res.json({ result: response.text });
  } catch (error) {
    res.status(500).json({ error: "AI screening failed" });
  }
});

// Alias for client-side compatibility
app.post("/api/analyze-resume", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  const { resumeText, jobDescription } = req.body;
  try {
    const prompt = `Analisis resume ini terhadap deskripsi pekerjaan. Berikan skor kecocokan dari 0-100 dan ringkasan singkat kualifikasinya. Anda HARUS merespon menggunakan Bahasa Indonesia.\n\nResume: ${resumeText}\n\nJob: ${jobDescription}`;
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    res.json({ result: response.text });
  } catch (error) {
    res.status(500).json({ error: "AI screening failed" });
  }
});

app.post("/api/ai/evaluate-test", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  const { testType, answers } = req.body;
  try {
    let keyContext = "";
    if (testType === 'logika_gambar') {
      keyContext = `\nCatatan Kunci Jawaban Tes Logika Gambar:\n- lg1: A\n- lg2: A\n- lg3: A\n- lg4: A\n- lg5: A\n- lg6: A\n- lg7: A\n- lg8: A\n- lg9: A\n- lg10: A\n\nHitung jawaban benar (masing-masing bernilai 10 poin) dan berikan Skor Akhir (0-100) serta ulasan analisis kemampuan logika visual spasial kandidat.`;
    }
    const prompt = `Anda mengevaluasi tes ${testType} dari seorang kandidat. Berikut adalah jawaban mereka:\n${JSON.stringify(answers, null, 2)}\n${keyContext}\n\nBerikan evaluasi. Jika ini adalah tes logika atau kompetensi, berikan skor numerik (0-100). Untuk yang lain (MBTI, DISC, Health), berikan ringkasan kualitatif. Format respons dengan rapi. Anda HARUS merespon menggunakan Bahasa Indonesia.`;
    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
    });
    res.json({ result: response.text });
  } catch (error) {
    res.status(500).json({ error: "AI evaluation failed" });
  }
});

app.post("/api/ai/interview", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  const { messages, context } = req.body;
  try {
    const systemPrompt = `Anda adalah AI interviewer untuk MGM SmartHire AI. Anda mewawancarai kandidat untuk konteks berikut: ${context}. Jaga pertanyaan Anda tetap profesional, singkat, dan satu per satu. Evaluasi respons mereka secara diam-diam dan arahkan percakapan. Anda HARUS berkomunikasi dalam Bahasa Indonesia.`;
    
    // Formatting history for gemini
    const formattedMessages = messages.map((m: any) => m.content).join("\n\n");
    const prompt = `${systemPrompt}\n\nRiwayat Percakapan:\n${formattedMessages}\n\nBerikan respons berikutnya dari AI Interviewer (hanya teks balasan saja):`;

    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
    });
    res.json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: "AI interview failed" });
  }
});

app.post("/api/ai/interpret-interview", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  const { conversation } = req.body;
  try {
    const prompt = `Anda adalah seorang HR senior yang sangat berpengalaman di MGM SmartHire. Lakukan analisis interpretatif mendalam terhadap transkrip percakapan wawancara kerja berikut.
Tugas Anda adalah membuat interpretasi profesional (Summary by AI), bukan sekadar rangkuman biasa.
Fokuskan analisis pada aspek-aspek berikut:
1. Sikap komunikasi dan kelayakan kepribadian kandidat.
2. Kompetensi utama dan kelemahan yang terdeteksi dari jawaban mereka.
3. Rekomendasi akhir apakah kandidat layak dilanjutkan ke tahap berikutnya (Diterima / Dipertimbangkan / Ditolak) beserta ulasan alasannya.

Format output Anda menggunakan bahasa Indonesia yang formal, terstruktur dengan poin-poin yang rapi, bersih tanpa markdown tebal berlebih.

Berikut transkrip wawancara:
${conversation}`;

    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
    });
    res.json({ result: response.text });
  } catch (error: any) {
    console.error("AI interpretation failed:", error.message);
    res.status(500).json({ error: "AI interpretation failed" });
  }
});


// -------------------------------------------------------------
// Vite Middleware & Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
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

startServer();
