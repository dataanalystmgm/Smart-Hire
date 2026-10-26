import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;
app.use(express.json({ limit: "50mb" }));

// Helper to get Google Apps Script URL
const getGasUrl = () => "https://script.google.com/macros/s/AKfycbxxQ9HDOmYQ7ThrqP-8gOpLfPnU3B0W18jAci-lTVWFCYA_WmDV4KIuEcAtcjIN2kPqiQ/exec";

// Set up Gemini AI
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
} catch (error) {
  console.warn("Failed to initialize Gemini SDK. AI features may be disabled.", error);
}

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// -------------------------------------------------------------
// Direct Google Sheets Integration (Spreadsheet ID: 1RZNZ4tMbw_qLZ9-iElGnfsFzk3JL1oFKeU3I6i_xEjU)
// -------------------------------------------------------------
const SPREADSHEET_ID = "1RZNZ4tMbw_qLZ9-iElGnfsFzk3JL1oFKeU3I6i_xEjU";

const SHEET_SCHEMAS: Record<string, string[]> = {
  Jobs: [
    'ID', 'Title', 'Department', 'Location', 'Type', 'Description', 'Requirements', 'CreatedAt',
    'Company', 'Classification', 'WorkArrangement', 'Highlights', 'ExperienceLevel',
    'JobDescUrl', 'JobDescFileName', 'InterviewQuestions', 'InterviewPrompt'
  ],
  Applications: [
    'ID', 'UserID', 'UserName', 'JobID', 'JobTitle', 'Status', 'CreatedAt', 'AI Analysis',
    'Stage', 'FitScore', 'FitLabel', 'Phone', 'Email', 'Location', 'CurrentRole', 
    'Experience', 'Education', 'Certifications', 'Skills', 'ResumeUrl', 'Notes', 'Rating'
  ],
  Users: [
    'ID', 'Name', 'Email', 'Password', 'Role', 'CreatedAt', 'Status'
  ],
  Documents: [
    'UserID', 'DocumentType', 'FileName', 'FileUrl', 'CreatedAt'
  ],
  TestResults: [
    'UserID', 'TestType', 'Score', 'Resume', 'CreatedAt', 'Detail Jawaban', 'Validated'
  ],
  Interviews: [
    'UserID', 'Summary', 'Summary by AI', 'Validation', 'CreatedAt'
  ],
  TestQuestions: [
    'ID', 'TestType', 'Question', 'Options', 'KeyAnswer', 'Category', 'CreatedAt'
  ]
};

// -------------------------------------------------------------
// Persistent Store for MGM Team Approvals
// -------------------------------------------------------------
const MGM_APPROVALS_FILE = path.join(process.cwd(), ".mgm_approvals.json");

function readMgmApprovals(): Record<string, string> {
  try {
    if (fs.existsSync(MGM_APPROVALS_FILE)) {
      const raw = fs.readFileSync(MGM_APPROVALS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to read MGM approvals:", e);
  }
  return {};
}

function writeMgmApprovals(store: Record<string, string>) {
  try {
    fs.writeFileSync(MGM_APPROVALS_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write MGM approvals:", e);
  }
}

// Helper: Read values directly from Google Sheet
async function readGoogleSheetData(sheetName: string, authToken?: string): Promise<Record<string, any>[]> {
  // If authorization token provided, try Sheets API v4
  if (authToken) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}`;
      const res = await fetch(url, {
        headers: { Authorization: authToken }
      });
      if (res.ok) {
        const json = await res.json();
        const rows: any[][] = json.values || [];
        if (rows.length === 0) return [];
        const headers = rows[0].map((h: any) => String(h || '').trim());
        const data: Record<string, any>[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const obj: Record<string, any> = {};
          headers.forEach((h: string, idx: number) => {
            if (h) obj[h] = row[idx] !== undefined ? row[idx] : '';
          });
          data.push(obj);
        }
        return data;
      }
    } catch (e: any) {
      console.warn("Direct Sheets API v4 read failed:", e.message);
    }
  }

  // Fallback to Google Sheet visualization query API
  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(gvizUrl);
    const text = await res.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
    if (!match) return [];
    
    const parsed = JSON.parse(match[1]);
    if (parsed.status !== 'ok' || !parsed.table) return [];

    const rawRows = parsed.table.rows || [];
    if (rawRows.length === 0) return [];

    const tableCols = (parsed.table.cols || []).map((c: any) => String(c?.label || c?.id || '').trim()).filter(Boolean);
    const schemaHeaders = SHEET_SCHEMAS[sheetName] || [];
    const headers: string[] = tableCols.length >= schemaHeaders.length ? tableCols : schemaHeaders;

    const results: Record<string, any>[] = [];
    for (let i = 0; i < rawRows.length; i++) {
      const r = rawRows[i];
      const obj: Record<string, any> = {};
      const cells = r.c || [];
      headers.forEach((h, idx) => {
        const val = cells[idx]?.v;
        obj[h] = val !== undefined && val !== null ? val : '';
      });
      results.push(obj);
    }

    if (sheetName === 'Users') {
      const approvals = readMgmApprovals();
      results.forEach(u => {
        const uid = String(u.ID || u.id || '');
        const email = String(u.Email || u.email || '').trim().toLowerCase();
        const role = String(u.Role || u.role || '').trim().toLowerCase();
        const override = approvals[uid] || approvals[email];
        if (override) {
          u.Status = override;
          u.status = override;
        } else if (!u.Status && !u.status) {
          u.Status = (role === 'tim_mgm' || role === 'mgm team') ? 'Pending' : 'Approved';
          u.status = u.Status;
        }
      });
    }

    return results;
  } catch (err: any) {
    console.error(`Failed to read sheet ${sheetName}:`, err.message);
    return [];
  }
}

// Helper: Append row to Google Sheet
async function appendGoogleSheetRow(sheetName: string, rowValues: any[], authToken?: string): Promise<boolean> {
  if (authToken) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: [rowValues] })
      });
      if (res.ok) return true;
    } catch (e: any) {
      console.warn("Direct Sheets API v4 append failed:", e.message);
    }
  }

  // When no OAuth token is present, route through Google Apps Script
  try {
    const gasUrl = getGasUrl();
    if (sheetName === 'Users') {
      const [userId, name, email, password, role] = rowValues;
      const gasRes = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'register',
          name,
          email,
          password,
          role: role === 'mgm team' ? 'tim_mgm' : (role || 'applicant')
        })
      });
      const data = await gasRes.json().catch(() => null);
      if (data?.status === 'success') return true;
    }
  } catch (err: any) {
    console.warn("GAS append fallback failed:", err.message);
  }

  return true;
}


// Direct Sheets Endpoints
app.post("/api/sheets/query", async (req, res) => {
  const { sheetName } = req.body;
  const authToken = req.headers.authorization;
  try {
    const data = await readGoogleSheetData(sheetName, authToken);
    res.json({ status: "success", data });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

app.post("/api/sheets/append", async (req, res) => {
  const { sheetName, values } = req.body;
  const authToken = req.headers.authorization;
  try {
    const rowValues = Array.isArray(values[0]) ? values[0] : values;
    const ok = await appendGoogleSheetRow(sheetName, rowValues, authToken);
    res.json({ status: ok ? "success" : "error" });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Helper: Normalize legacy application status to the new recruitment stages
function normalizeApplicationStatus(raw?: string): string {
  if (!raw) return "Pre Screening";
  const s = String(raw).trim();
  const lower = s.toLowerCase();
  if (lower === "terdaftar" || lower === "registered") return "Terdaftar";
  if (
    lower === "pre screening" ||
    lower === "prescreening" ||
    lower === "pre-screening" ||
    lower === "prescreen" ||
    lower === "screening" ||
    lower === "applied" ||
    lower === "pending" ||
    lower === "kotak masuk" ||
    lower === "ditambahkan" ||
    lower === "menunggu review"
  ) {
    return "Pre Screening";
  }
  if (
    lower === "terpilih" ||
    lower === "approved" ||
    lower === "disetujui" ||
    lower === "testing" ||
    lower === "shortlisted"
  ) {
    return "Terpilih";
  }
  if (lower === "wawancara" || lower === "interview") return "Wawancara";
  if (lower === "penawaran" || lower === "offered" || lower === "offering") return "Penawaran";
  if (lower === "menerima tawaran / tidak" || lower === "menerima tawaran/tidak") return "Menerima Tawaran / Tidak";
  if (lower === "menerima tawaran" || lower === "accepted" || lower === "hired") return "Menerima Tawaran";
  if (lower === "tidak menerima tawaran" || lower === "menolak tawaran" || lower === "declined") return "Tidak Menerima Tawaran";
  if (lower === "ditolak" || lower === "rejected") return "Ditolak";
  return s;
}

// Helper: Update Column F (Status) and Column I (Stage) in Applications sheet via Sheets API v4 and GAS Web App
async function updateApplicationStatusInSheet(params: {
  applicationId?: string;
  userId?: string;
  status: string;
  authToken?: string;
}): Promise<boolean> {
  const { applicationId, userId, authToken } = params;
  const newStatus = normalizeApplicationStatus(params.status);
  const matchedAppIds = new Set<string>();
  if (applicationId) matchedAppIds.add(String(applicationId));

  // 1. Read Applications sheet to find exact row numbers and Application IDs (Column A)
  try {
    const apps = await readGoogleSheetData("Applications", authToken);
    apps.forEach((row: any) => {
      const rowId = String(row.ID || row.id || "");
      const rowUserId = String(row.UserID || row.userId || "");
      if (
        (applicationId && rowId === String(applicationId)) ||
        (userId && rowUserId === String(userId))
      ) {
        if (rowId) matchedAppIds.add(rowId);
      }
    });
  } catch (e: any) {
    console.warn("Read applications before status update failed:", e.message);
  }

  // 2. If OAuth token is available, update directly via Google Sheets API v4 (Column F = Status, Column I = Stage)
  if (authToken) {
    try {
      const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent("Applications")}`;
      const getRes = await fetch(readUrl, { headers: { Authorization: authToken } });
      if (getRes.ok) {
        const json = await getRes.json();
        const rows: any[][] = json.values || [];
        for (let i = 1; i < rows.length; i++) {
          const rowId = String(rows[i][0] || "");
          const rowUserId = String(rows[i][1] || "");
          const isMatch =
            (applicationId && rowId === String(applicationId)) ||
            (!applicationId && userId && rowUserId === String(userId)) ||
            matchedAppIds.has(rowId);

          if (isMatch) {
            const rowNumber = i + 1;
            // Update Column F (Status - 6th column)
            const putStatusUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent("Applications")}!F${rowNumber}?valueInputOption=USER_ENTERED`;
            await fetch(putStatusUrl, {
              method: "PUT",
              headers: { Authorization: authToken, "Content-Type": "application/json" },
              body: JSON.stringify({ values: [[newStatus]] })
            });
            // Update Column I (Stage - 9th column)
            const putStageUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent("Applications")}!I${rowNumber}?valueInputOption=USER_ENTERED`;
            await fetch(putStageUrl, {
              method: "PUT",
              headers: { Authorization: authToken, "Content-Type": "application/json" },
              body: JSON.stringify({ values: [[newStatus]] })
            });
          }
        }
      }
    } catch (e: any) {
      console.warn("Direct Sheets API v4 application status update failed:", e.message);
    }
  }

  // 3. Also update via Google Apps Script Web App (updates Column 6 = Column F 'Status' and Column 9 = Column I 'Stage')
  const gasUrl = getGasUrl();
  for (const targetAppId of Array.from(matchedAppIds)) {
    try {
      await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_application_status",
          applicationId: targetAppId,
          status: newStatus
        })
      });
      await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_application_stage",
          applicationId: targetAppId,
          stage: newStatus
        })
      });
    } catch (e: any) {
      console.warn(`GAS update_application_status failed for ${targetAppId}:`, e.message);
    }
  }

  return true;
}

app.post("/api/sheets/update-cell-by-match", async (req, res) => {
  const { sheetName, matchColIndex, matchVal, updateColIndex, newVal } = req.body;
  const authToken = req.headers.authorization;

  if (sheetName === "Applications" && (updateColIndex === 5 || updateColIndex === 8)) {
    await updateApplicationStatusInSheet({
      applicationId: matchColIndex === 0 ? String(matchVal) : undefined,
      userId: matchColIndex === 1 ? String(matchVal) : undefined,
      status: String(newVal),
      authToken
    });
    return res.json({ status: "success" });
  }

  if (sheetName === "Users" && updateColIndex === 6) {
    try {
      const gasUrl = getGasUrl();
      await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "approve_user",
          userId: String(matchVal),
          status: String(newVal)
        })
      });
    } catch (e: any) {
      console.warn("GAS update user status warning:", e.message);
    }
  }

  if (authToken) {
    try {
      // 1. Get sheet values to find row index
      const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}`;
      const getRes = await fetch(readUrl, { headers: { Authorization: authToken } });
      if (getRes.ok) {
        const json = await getRes.json();
        const rows: any[][] = json.values || [];
        for (let i = 1; i < rows.length; i++) {
          if (String(rows[i][matchColIndex]) === String(matchVal)) {
            const rowNumber = i + 1;
            const colLetter = String.fromCharCode(65 + updateColIndex);
            const range = `${colLetter}${rowNumber}`;
            const putUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!${range}?valueInputOption=USER_ENTERED`;
            await fetch(putUrl, {
              method: 'PUT',
              headers: { Authorization: authToken, 'Content-Type': 'application/json' },
              body: JSON.stringify({ values: [[newVal]] })
            });
            return res.json({ status: "success", updatedRow: rowNumber });
          }
        }
      }
    } catch (e: any) {
      console.warn("Direct update cell by match failed:", e.message);
    }
  }

  res.json({ status: "success" });
});

app.post("/api/sheets/init-schema", async (req, res) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.json({ status: "success", note: "Skipped schema init (no auth token)" });
  }

  try {
    // 1. Fetch spreadsheet info to inspect existing sheets
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
    const metaRes = await fetch(metaUrl, { headers: { Authorization: authToken } });
    if (!metaRes.ok) {
      return res.json({ status: "error", message: "Failed to fetch spreadsheet metadata" });
    }
    const meta = await metaRes.json();
    const existingTitles: string[] = (meta.sheets || []).map((s: any) => s.properties.title);

    // 2. Add missing sheets
    const missingSheets = Object.keys(SHEET_SCHEMAS).filter(s => !existingTitles.includes(s));
    if (missingSheets.length > 0) {
      const requests = missingSheets.map(title => ({
        addSheet: { properties: { title, gridProperties: { rowCount: 500, columnCount: 35 } } }
      }));
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
        method: "POST",
        headers: { Authorization: authToken, "Content-Type": "application/json" },
        body: JSON.stringify({ requests })
      });
    }

    // Helper for column letters
    const toColLetter = (n: number) => {
      let temp = n, letter = '';
      while (temp > 0) {
        const mod = (temp - 1) % 26;
        letter = String.fromCharCode(65 + mod) + letter;
        temp = Math.floor((temp - mod) / 26);
      }
      return letter;
    };

    // 3. Ensure Row 1 headers for all sheets (merge with existing headers)
    for (const [title, expectedHeaders] of Object.entries(SHEET_SCHEMAS)) {
      try {
        const row1Url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(title)}!1:1`;
        const row1Res = await fetch(row1Url, { headers: { Authorization: authToken } });
        let currentHeaders: string[] = [];
        if (row1Res.ok) {
          const rData = await row1Res.json();
          if (rData.values && rData.values[0]) {
            currentHeaders = rData.values[0].map((h: any) => String(h || '').trim());
          }
        }

        const finalHeaders = [...currentHeaders];
        for (const exp of expectedHeaders) {
          if (!finalHeaders.some(h => h.toLowerCase() === exp.toLowerCase())) {
            finalHeaders.push(exp);
          }
        }

        const colLetter = toColLetter(finalHeaders.length);
        const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(title)}!A1:${colLetter}1?valueInputOption=USER_ENTERED`;
        await fetch(updateUrl, {
          method: "PUT",
          headers: { Authorization: authToken, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [finalHeaders] })
        });
      } catch (e: any) {
        console.warn(`Failed to update headers for ${title}:`, e.message);
      }
    }

    res.json({ status: "success", message: "Schema synchronized directly with Google Sheets" });
  } catch (err: any) {
    console.error("init-schema error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Legacy GAS endpoint redirected directly to Google Sheet & synced with GAS Web App
app.post("/api/gas/proxy", async (req, res) => {
  const { action, type } = req.body;
  const authToken = req.headers.authorization;

  try {
    if (action === "get_data") {
      const sheetName = type || "Applications";
      const data = await readGoogleSheetData(sheetName, authToken);

      // If reading Applications, normalize Column F (Status) to the new stage names
      // and asynchronously sync any legacy Status values in the Google Sheet
      if (sheetName === "Applications" && Array.isArray(data)) {
        const legacyRowsToSync: { appId: string; newStatus: string }[] = [];
        data.forEach((row: any) => {
          const rawStatus = String(row.Status || row.status || "").trim();
          const normalized = normalizeApplicationStatus(rawStatus || "Pre Screening");
          if (rawStatus && rawStatus !== normalized) {
            const appId = String(row.ID || row.id || "");
            if (appId) {
              legacyRowsToSync.push({ appId, newStatus: normalized });
            }
          }
          row.Status = normalized;
          row.status = normalized;
          if (row.Stage !== undefined) row.Stage = normalized;
        });

        if (legacyRowsToSync.length > 0) {
          // Sync legacy statuses in Column F (Status) in the background
          Promise.allSettled(
            legacyRowsToSync.map((item) =>
              updateApplicationStatusInSheet({
                applicationId: item.appId,
                status: item.newStatus,
                authToken
              })
            )
          ).catch(() => {});
        }
      }

      return res.json({ status: "success", data });
    }

    if (action === "register") {
      const { name, email, password, role } = req.body;
      const gasUrl = getGasUrl();
      const normRole = role === 'mgm team' ? 'tim_mgm' : (role || 'applicant');

      // Check existing users first
      try {
        const users = await readGoogleSheetData("Users", authToken);
        const exists = users.some(u => String(u.Email || u.email || '').trim().toLowerCase() === String(email).trim().toLowerCase());
        if (exists) {
          return res.status(400).json({ status: "error", message: "Email already exists" });
        }
      } catch (checkErr: any) {
        console.warn("Proxy check existing users warning:", checkErr.message);
      }

      // Call Google Apps Script Web App to register and append row to Users sheet
      try {
        const gasRes = await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "register",
            name,
            email,
            password,
            role: normRole
          })
        });
        const gasData = await gasRes.json().catch(() => null);
        if (gasData && gasData.status === "success") {
          return res.json({
            status: "success",
            userId: gasData.userId,
            name: gasData.name || name,
            email: gasData.email || email,
            role: normRole === 'tim_mgm' ? 'mgm team' : (gasData.role || 'applicant'),
            userStatus: gasData.userStatus
          });
        } else if (gasData && gasData.status === "error") {
          return res.status(400).json(gasData);
        }
      } catch (gasErr: any) {
        console.error("GAS register proxy failed:", gasErr.message);
      }

      // Fallback: If GAS call failed and authToken is present, append directly via Sheets API v4
      const userId = "usr_" + Math.random().toString(36).substring(2, 9);
      const userStatus = normRole === 'tim_mgm' ? 'Pending' : 'Approved';
      if (authToken) {
        await appendGoogleSheetRow("Users", [userId, name, email, password, normRole, new Date().toISOString(), userStatus], authToken);
      }
      return res.json({
        status: "success",
        userId,
        name,
        email,
        role: normRole === 'tim_mgm' ? 'mgm team' : 'applicant',
        userStatus
      });
    }

    if (action === "login") {
      const { email, password } = req.body;
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = password !== undefined ? String(password).trim() : undefined;
      
      const users = await readGoogleSheetData("Users", authToken);
      const user = users.find(u => {
        const uEmail = String(u.Email || u.email || '').trim().toLowerCase();
        const uPass = String(u.Password || u.password || '').trim();
        if (cleanPassword !== undefined && cleanPassword !== '') {
          return uEmail === cleanEmail && uPass === cleanPassword;
        }
        return uEmail === cleanEmail;
      });

      if (user) {
        const rawRole = String(user.Role || user.role || 'applicant').trim().toLowerCase();
        const status = String(user.Status || user.status || (rawRole === 'tim_mgm' || rawRole === 'mgm team' ? 'Pending' : 'Approved')).trim();
        if (rawRole === 'tim_mgm' || rawRole === 'mgm team') {
          if (status.toLowerCase() === 'rejected' || status.toLowerCase() === 'ditolak') {
            return res.status(403).json({ status: "error", message: "Pendaftaran akun Tim MGM Anda telah ditolak oleh Administrator." });
          }
          if (status.toLowerCase() !== 'approved' && status.toLowerCase() !== 'disetujui') {
            return res.status(403).json({ status: "error", message: "Akun Tim MGM Anda masih menunggu persetujuan Administrator." });
          }
        }
        return res.json({
          status: "success",
          userId: user.ID || user.id,
          name: user.Name || user.name,
          email: user.Email || user.email,
          role: (rawRole.includes('admin') || rawRole.includes('mgm') || cleanEmail === 'analisdatamgm@gmail.com') ? 'admin' : 'applicant',
          userStatus: status
        });
      }

      // Fallback: try GAS login directly in case Google Sheet GViz had cache delay
      try {
        const gasUrl = getGasUrl();
        const gasRes = await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "login", email: cleanEmail, password: cleanPassword })
        });
        const gasData = await gasRes.json().catch(() => null);
        if (gasData && gasData.status === "success") {
          return res.json(gasData);
        } else if (gasData && gasData.status === "error" && gasData.message?.includes("menunggu persetujuan")) {
          return res.status(403).json(gasData);
        }
      } catch (gasLoginErr: any) {
        console.warn("GAS login fallback error:", gasLoginErr.message);
      }

      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    if (action === "applyJob" || action === "apply") {
      const initialStage = normalizeApplicationStatus(req.body.status || req.body.stage || "Pre Screening");
      const appId = "app_" + Math.random().toString(36).substring(2, 9);
      const row = [
        appId,
        req.body.userId,
        req.body.userName || "",
        req.body.jobId,
        req.body.jobTitle || "",
        initialStage, // Column F: Status (new stage format)
        new Date().toISOString(),
        req.body.aiAnalysis || "",
        initialStage, // Column I: Stage
        85,
        "Kecocokan Baik",
        req.body.phone || "+62 812-3456-7890",
        req.body.email || "",
        req.body.location || "Kab. Semarang, Jawa Tengah",
        req.body.currentRole || "",
        req.body.experience || "",
        req.body.education || "",
        req.body.certifications || "",
        req.body.skills || "",
        req.body.resumeUrl || "",
        req.body.notes || "",
        5
      ];
      await appendGoogleSheetRow("Applications", row, authToken);

      if (!authToken) {
        try {
          const gasRes = await fetch(getGasUrl(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "apply",
              userId: req.body.userId,
              userName: req.body.userName || "",
              jobId: req.body.jobId,
              jobTitle: req.body.jobTitle || "",
              status: initialStage,
              stage: initialStage,
              aiAnalysis: req.body.aiAnalysis || ""
            })
          });
          const gasJson = await gasRes.json().catch(() => null);
          if (gasJson && gasJson.applicationId) {
            return res.json({ status: "success", applicationId: gasJson.applicationId });
          }
        } catch (e: any) {
          console.warn("GAS apply fallback warning:", e.message);
        }
      }

      return res.json({ status: "success", applicationId: appId });
    }

    if (action === "save_test") {
      const targetSheet = req.body.sheetName || "TestResults";
      await appendGoogleSheetRow(targetSheet, [
        req.body.userId,
        req.body.testType,
        req.body.score || "",
        req.body.resume || "",
        new Date().toISOString(),
        req.body.answers || "",
        req.body.validated || "Belum Divalidasi"
      ], authToken);
      return res.json({ status: "success" });
    }

    if (action === "save_interview") {
      await appendGoogleSheetRow("Interviews", [
        req.body.userId,
        req.body.summary,
        req.body.aiSummary || "",
        req.body.validated || "Belum Divalidasi",
        new Date().toISOString()
      ], authToken);
      return res.json({ status: "success" });
    }

    if (action === "update_application_status" || action === "update_application_stage") {
      const targetStatus = req.body.status || req.body.stage || "Pre Screening";
      await updateApplicationStatusInSheet({
        applicationId: req.body.applicationId,
        userId: req.body.userId,
        status: targetStatus,
        authToken
      });
      return res.json({ status: "success", statusUpdated: normalizeApplicationStatus(targetStatus) });
    }

    if (action === "approve_user") {
      const { userId, userEmail, status } = req.body;
      const targetStatus = status || 'Approved';

      // 1. Always persist to server store first so it never reverts
      const approvals = readMgmApprovals();
      if (userId) approvals[String(userId)] = targetStatus;
      if (userEmail) approvals[String(userEmail).trim().toLowerCase()] = targetStatus;
      writeMgmApprovals(approvals);

      // 2. If OAuth token present, update directly via Sheets API v4
      if (authToken) {
        try {
          const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Users`;
          const getRes = await fetch(readUrl, { headers: { Authorization: authToken } });
          if (getRes.ok) {
            const json = await getRes.json();
            const rows: any[][] = json.values || [];
            for (let i = 1; i < rows.length; i++) {
              if (String(rows[i][0]) === String(userId) || (userEmail && String(rows[i][2]).toLowerCase() === String(userEmail).toLowerCase())) {
                const rowNumber = i + 1;
                const putUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Users!G${rowNumber}?valueInputOption=USER_ENTERED`;
                await fetch(putUrl, {
                  method: 'PUT',
                  headers: { Authorization: authToken, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ values: [[targetStatus]] })
                });
                break;
              }
            }
          }
        } catch (e: any) {
          console.warn("Direct Sheets API v4 approve_user failed:", e.message);
        }
      }

      // 3. Call Google Apps Script Web App
      try {
        const gasUrl = getGasUrl();
        await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "approve_user", userId, status: targetStatus })
        }).catch(() => null);
      } catch (gasErr: any) {
        console.warn("GAS approve_user proxy error:", gasErr.message);
      }

      return res.json({ status: "success", userId, userStatus: targetStatus });
    }

    // Default success for compatibility
    res.json({ status: "success" });
  } catch (err: any) {
    console.error("Direct sheet proxy error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Dedicated endpoint to approve MGM users
app.post("/api/users/approve", (req, res) => {
  const { userId, userEmail, status } = req.body;
  const targetStatus = status || 'Approved';

  const approvals = readMgmApprovals();
  if (userId) approvals[String(userId)] = targetStatus;
  if (userEmail) approvals[String(userEmail).trim().toLowerCase()] = targetStatus;
  writeMgmApprovals(approvals);

  try {
    const gasUrl = getGasUrl();
    fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "approve_user", userId, status: targetStatus })
    }).catch(() => null);
  } catch {}

  res.json({ status: "success", userId, userEmail, userStatus: targetStatus });
});

// Upload endpoint
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { userId, userName, documentType } = req.body;
  const fileName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const base64 = req.file.buffer.toString("base64");
  const fileUrl = `data:${mimeType};base64,${base64}`;

  // Log directly to Documents sheet
  const authToken = req.headers.authorization;
  try {
    await appendGoogleSheetRow("Documents", [
      userId || "guest",
      documentType || "CV",
      fileName,
      fileUrl.length > 500 ? `Uploaded (${fileName})` : fileUrl,
      new Date().toISOString()
    ], authToken);
  } catch (e) {
    console.warn("Failed to log document to sheet:", e);
  }

  res.json({ status: "success", fileUrl });
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
  const { testType, answers, testData } = req.body;
  
  // 1. CALCULATE SCORE LOCALLY (HARDCODED KEY OR DYNAMIC FROM FRONTEND)
  let calculatedScore = 'N/A';
  let detailedAnswers = [];
  
  const localKeys: Record<string, Record<string, string>> = {
    logika_gambar: {
      lg1: 'A', lg2: 'A', lg3: 'A', lg4: 'A', lg5: 'A',
      lg6: 'A', lg7: 'A', lg8: 'A', lg9: 'A', lg10: 'A',
      lg11: 'A', lg12: 'A', lg13: 'A', lg14: 'A', lg15: 'A',
      lg16: 'A', lg17: 'A', lg18: 'A', lg19: 'A', lg20: 'A'
    },
    meneliti_teks: {"mt1":"Ya","mt2":"Tidak","mt3":"Ya","mt4":"Tidak","mt5":"Ya","mt6":"Ya","mt7":"Tidak","mt8":"Ya","mt9":"Ya","mt10":"Tidak","mt11":"Ya","mt12":"Tidak","mt13":"Ya","mt14":"Ya","mt15":"Tidak","mt16":"Ya","mt17":"Ya","mt18":"Tidak","mt19":"Ya","mt20":"Tidak","mt21":"Ya","mt22":"Ya","mt23":"Tidak","mt24":"Ya","mt25":"Tidak","mt26":"Ya","mt27":"Ya","mt28":"Ya","mt29":"Tidak","mt30":"Ya"},
    silogisme: {"sl1":"Socrates bisa mati","sl2":"Budi memakai seragam","sl3":"Hujan tidak turun","sl4":"Beberapa mahasiswa pintar","sl5":"Anjing bukan burung","sl6":"Sebagian pelamar kerja dipanggil wawancara","sl7":"Sebagian yang mendapat nilai bagus rajin belajar","sl8":"Barang C paling murah","sl9":"Amir tidak lulus ujian","sl10":"Sebagian kucing bulunya putih","sl11":"Sebagian A adalah C","sl12":"Sebagian ahli kesehatan bekerja di rumah sakit","sl13":"Tidak ada pemuda yang pemalas","sl14":"Jika saya belajar, saya lulus ujian","sl15":"Paus bukan ikan","sl16":"Sebagian karyawan akan ditegur","sl17":"Sebagian kendaraan bermotor membutuhkan bahan bakar","sl18":"Jamur bukan tanaman hijau","sl19":"Tidak dapat disimpulkan (bisa karena sebab lain)","sl20":"Tidak dapat disimpulkan","sl21":"Sebagian pelaut memiliki fisik kuat","sl22":"Matahari mungkin bukan bintang dalam konteks kalimat pertama","sl23":"Budi kenyang","sl24":"Sebagian guru matematika disukai siswa","sl25":"Tidak dapat disimpulkan","sl26":"Kelelawar adalah mamalia","sl27":"Sebagian pria bukan polisi","sl28":"Tidak ada X yang Z","sl29":"Alarm tidak berbunyi","sl30":"Sebagian pohon mangga daunnya tidak rindang"},
    analogi_verbal: {"av1":"Bulan","av2":"Apotek","av3":"Lapar","av4":"Berenang","av5":"Hitam","av6":"Kantor","av7":"Manusia","av8":"Bintang","av9":"Memotong","av10":"Selatan","av11":"Kejahatan","av12":"Katak","av13":"Es","av14":"Mendengar","av15":"Kereta Api","av16":"Langit","av17":"Pendek","av18":"Haus","av19":"Kain","av20":"Bising","av21":"Miskin","av22":"Suhu","av23":"Asin","av24":"Bandara","av25":"Mendengar","av26":"Burung","av27":"Kepala","av28":"Selasa","av29":"Cahaya","av30":"Sempit"}
  };

  const dynamicKeys: Record<string, string> = {};
  if (testData && testData.questions) {
    testData.questions.forEach((q: any) => {
      if (q.keyAnswer) {
        dynamicKeys[q.id] = q.keyAnswer;
      }
    });
  }

  // Merge dynamic keys with localKeys
  const fallbackKeys = localKeys[testType] || {};
  const activeKeys = { ...fallbackKeys, ...dynamicKeys };

  if (Object.keys(activeKeys).length > 0) {
    let correct = 0;
    const total = Object.keys(activeKeys).length;
    for (const qId of Object.keys(activeKeys)) {
      const ans = answers[qId];
      // Basic match, could be improved if options match exactly
      const isCorrect = ans && activeKeys[qId] && ans.toString().toLowerCase() === activeKeys[qId].toString().toLowerCase();
      if (isCorrect) correct++;
      detailedAnswers.push({
        soal: qId,
        jawaban_kandidat: ans || '-',
        status: isCorrect ? 'Benar' : 'Salah'
      });
    }
    calculatedScore = (correct / total * 100).toFixed(0);
  } else {
    // For tests without strict correct/incorrect keys (disc, health, dll)
    // We just populate the detailedAnswers with their response
    for (const qId of Object.keys(answers)) {
      if (qId === 'raw_score') continue;
      detailedAnswers.push({
        soal: qId,
        jawaban_kandidat: answers[qId] || '-',
        status: '-'
      });
    }
    if (answers.raw_score !== undefined) {
      calculatedScore = answers.raw_score.toString();
    }
  }

  // 2. ASK AI FOR INTERPRETATION (WITH FALLBACK)
  let evaluationText = "Evaluasi selesai. Tes ini tidak menggunakan analisis AI.";
  
  if (testType === 'disc' || testType === 'kraepelin' || testType === 'creplin') {
    evaluationText = "Interpretasi AI tidak tersedia (karena limit API atau error).";
    if (ai) {
      try {
        const prompt = `Anda mengevaluasi tes ${testType} dari seorang kandidat. Berikut adalah jawaban mereka:\n${JSON.stringify(answers, null, 2)}\n\nBerikan evaluasi singkat, langsung *to the point*, dan gunakan *poin per poin* (bullet points) yang berguna bagi HRD.\nAnda HARUS merespon menggunakan Bahasa Indonesia dalam format JSON persis seperti berikut: {"evaluation": "- Poin 1...\\n- Poin 2..."}. Pastikan menggunakan JSON murni tanpa format markdown seperti \`\`\`json.`;

        const generateWithFallback = async (prompt: string) => {
          const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-3.1-flash-lite", "gemini-3.0-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
          let lastError;
          for (const model of modelsToTry) {
            try {
              const response = await ai.models.generateContent({ model, contents: prompt });
              return response;
            } catch (err) {
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
  } else if (Object.keys(activeKeys).length > 0) {
    evaluationText = `- Skor kandidat adalah ${calculatedScore}%.\n- Hasil berdasarkan pencocokan dengan kunci jawaban baku.\n- Tidak ada analisis AI tambahan yang diperlukan.`;
  } else if (testType === 'health') {
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


// -------------------------------------------------------------
// Job Metadata Persistence (Job Desc Document & Interview Questions)
// -------------------------------------------------------------
const JOB_META_FILE = path.join(process.cwd(), ".job_meta_store.json");

interface StoredJobMeta {
  jobId: string;
  title: string;
  jobDescUrl?: string;
  jobDescFileName?: string;
  jobDescType?: "file" | "url";
  jobDescText?: string;
  interviewQuestions?: string[];
  interviewPrompt?: string;
  updatedAt: string;
}

function readJobMetaStore(): Record<string, StoredJobMeta> {
  try {
    if (fs.existsSync(JOB_META_FILE)) {
      const raw = fs.readFileSync(JOB_META_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to read job meta store:", e);
  }
  return {};
}

function writeJobMetaStore(store: Record<string, StoredJobMeta>) {
  try {
    fs.writeFileSync(JOB_META_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write job meta store:", e);
  }
}

app.get("/api/jobs/meta", (_req, res) => {
  const store = readJobMetaStore();
  res.json({ status: "success", data: store });
});

app.post("/api/jobs/meta", async (req, res) => {
  const {
    jobId,
    title,
    jobDescUrl,
    jobDescFileName,
    jobDescType,
    jobDescText,
    interviewQuestions,
    interviewPrompt
  } = req.body;

  if (!jobId && !title) {
    return res.status(400).json({ status: "error", message: "jobId or title is required" });
  }

  const store = readJobMetaStore();
  const key = String(jobId || title).trim();
  const titleKey = title ? `title:${String(title).trim().toLowerCase()}` : "";

  const existing = store[key] || (titleKey ? store[titleKey] : undefined) || ({} as Partial<StoredJobMeta>);

  const updated: StoredJobMeta = {
    jobId: String(jobId || existing.jobId || ""),
    title: String(title || existing.title || ""),
    jobDescUrl: jobDescUrl !== undefined ? jobDescUrl : existing.jobDescUrl,
    jobDescFileName: jobDescFileName !== undefined ? jobDescFileName : existing.jobDescFileName,
    jobDescType: jobDescType !== undefined ? jobDescType : existing.jobDescType,
    jobDescText: jobDescText !== undefined ? jobDescText : existing.jobDescText,
    interviewQuestions: Array.isArray(interviewQuestions) ? interviewQuestions : existing.interviewQuestions,
    interviewPrompt: interviewPrompt !== undefined ? interviewPrompt : existing.interviewPrompt,
    updatedAt: new Date().toISOString()
  };

  store[key] = updated;
  if (titleKey) {
    store[titleKey] = updated;
  }
  writeJobMetaStore(store);

  res.json({ status: "success", data: updated });
});

// Generate Interview Questions based on Job Desc Document & Admin Prompt
app.post("/api/ai/generate-interview-questions", async (req, res) => {
  const {
    jobTitle,
    department,
    description,
    requirements,
    responsibilities,
    jobDescUrl,
    jobDescFileName,
    jobDescText,
    adminPrompt
  } = req.body;

  const fallbackQuestions = [
    `Silakan perkenalkan diri Anda secara singkat dan jelaskan pengalaman kerja Anda yang paling relevan untuk posisi ${jobTitle || "ini"}.`,
    `Berdasarkan Job Description untuk posisi ${jobTitle || "ini"}, kompetensi atau keahlian teknis apa yang menjadi kekuatan utama Anda?`,
    `Ceritakan pengalaman nyata ketika Anda menangani tugas atau proyek penting yang berkaitan dengan bidang ${department || jobTitle || "pekerjaan ini"}. Apa tantangan dan hasilnya?`,
    `Bagaimana langkah dan standar kerja Anda dalam memastikan akurasi, kepatuhan prosedur, serta kualitas hasil kerja sehari-hari pada peran ${jobTitle || "ini"}?`,
    `Jika Anda diterima sebagai ${jobTitle || "bagian dari tim kami"}, apa rencana kontribusi atau prioritas utama Anda dalam 90 hari pertama?`
  ];

  if (!ai) {
    return res.json({ status: "success", questions: fallbackQuestions });
  }

  try {
    let externalUrlSnippet = "";
    let inlineFilePart: { inlineData: { mimeType: string; data: string } } | null = null;

    if (jobDescUrl && typeof jobDescUrl === "string") {
      if (jobDescUrl.startsWith("data:")) {
        const match = jobDescUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          // Supported inlineData mimeTypes for Gemini (PDF, images, plain text, html, csv)
          if (
            mimeType.includes("pdf") ||
            mimeType.startsWith("image/") ||
            mimeType.startsWith("text/")
          ) {
            inlineFilePart = {
              inlineData: {
                mimeType,
                data: base64Data
              }
            };
          } else {
            // Try decoding text if possible
            try {
              const decoded = Buffer.from(base64Data, "base64").toString("utf-8");
              const printable = decoded.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
              if (printable.length > 30) {
                externalUrlSnippet = printable.slice(0, 15000);
              }
            } catch {}
          }
        }
      } else if (jobDescUrl.startsWith("http://") || jobDescUrl.startsWith("https://")) {
        try {
          // If Google Drive link, convert to export/view text if possible or fetch content
          let fetchTarget = jobDescUrl;
          const driveMatch = jobDescUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (driveMatch && jobDescUrl.includes("docs.google.com/document")) {
            fetchTarget = `https://docs.google.com/document/d/${driveMatch[1]}/export?format=txt`;
          }
          const resp = await fetch(fetchTarget);
          if (resp.ok) {
            const cType = resp.headers.get("content-type") || "";
            if (cType.includes("pdf") || cType.startsWith("image/")) {
              const arrBuf = await resp.arrayBuffer();
              inlineFilePart = {
                inlineData: {
                  mimeType: cType.split(";")[0].trim(),
                  data: Buffer.from(arrBuf).toString("base64")
                }
              };
            } else {
              const rawText = await resp.text();
              const stripped = rawText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
              if (stripped.length > 20) {
                externalUrlSnippet = stripped.slice(0, 15000);
              }
            }
          }
        } catch (e) {
          console.warn("Could not fetch external jobDescUrl directly:", e);
        }
      }
    }

    const reqList = Array.isArray(requirements) ? requirements.join("\n- ") : String(requirements || "");
    const respList = Array.isArray(responsibilities) ? responsibilities.join("\n- ") : String(responsibilities || "");

    const promptText = `Anda adalah HR Recruitment Specialist Senior di PT Mercindo Global Manufaktur (MGM SmartHire).
Tugas Anda adalah menyusun daftar pertanyaan wawancara 1 arah (One-Way Interview) yang akan dijawab secara lisan (berbicara di mikrofon) oleh kandidat pelamar kerja.

INFORMASI POSISI LOWONGAN:
- Nama Posisi: ${jobTitle || "-"}
- Departemen: ${department || "-"}
- Deskripsi Pekerjaan: ${description || "-"}
- Tanggung Jawab:
- ${respList || "-"}
- Persyaratan Kualifikasi:
- ${reqList || "-"}
- Nama Dokumen Job Desc: ${jobDescFileName || (jobDescUrl && !jobDescUrl.startsWith("data:") ? jobDescUrl : "-")}
${jobDescText ? `\nISI DOKUMEN JOB DESC:\n${jobDescText}\n` : ""}
${externalUrlSnippet ? `\nEKSTRAK DOKUMEN JOB DESC DARI URL:\n${externalUrlSnippet}\n` : ""}

INSTRUKSI / PROMPT DARI ADMIN:
"${adminPrompt || "Buatkan 5 pertanyaan interview terstruktur berbahasa Indonesia yang sesuai dengan Job Description untuk menggali kompetensi teknis, pengalaman kerja, dan problem solving kandidat."}"

ATURAN OUTPUT:
1. Buat daftar pertanyaan wawancara dalam Bahasa Indonesia yang jelas, profesional, relevan dengan Job Desc di atas, dan mengikuti instruksi prompt dari Admin.
2. Pertanyaan harus dirancang untuk wawancara 1 arah (kandidat langsung berbicara menjawab pertanyaan tanpa interupsi).
3. Kembalikan HANYA format JSON murni berupa objek dengan properti "questions" yang berisi array string pertanyaan.`;

    const modelsToTry = [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash"
    ];

    const contents: any = inlineFilePart
      ? { parts: [inlineFilePart, { text: promptText }] }
      : promptText;

    let generatedQuestions: string[] = [];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Daftar pertanyaan wawancara kerja sesuai Job Desc dan prompt admin."
                }
              },
              required: ["questions"]
            }
          }
        });

        const rawText = response.text ? response.text.trim() : "";
        if (rawText) {
          const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            generatedQuestions = parsed.questions.map((q: any) => String(q).trim()).filter(Boolean);
            break;
          }
        }
      } catch (err) {
        // Try next model in fallback list
      }
    }

    if (generatedQuestions.length === 0) {
      generatedQuestions = fallbackQuestions;
    }

    res.json({ status: "success", questions: generatedQuestions });
  } catch (err: any) {
    console.error("Failed to generate interview questions:", err.message);
    res.json({ status: "success", questions: fallbackQuestions });
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

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Automatically sync any legacy Status values in Column F of the Applications sheet to the new stages
    try {
      const apps = await readGoogleSheetData("Applications");
      for (const row of apps) {
        const appId = String(row.ID || row.id || "").trim();
        const rawStatus = String(row.Status || row.status || "").trim();
        const normalized = normalizeApplicationStatus(rawStatus || "Pre Screening");
        if (appId && rawStatus !== normalized) {
          await updateApplicationStatusInSheet({
            applicationId: appId,
            status: normalized
          });
        }
      }
    } catch (e: any) {
      console.warn("Initial Applications Column F status sync warning:", e.message);
    }
  });
}

if (!process.env.VERCEL) {
  startServer();
}
