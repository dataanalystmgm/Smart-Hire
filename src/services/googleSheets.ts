import { getAccessToken, googleSignIn } from '../lib/auth';
import { ApplicationStage } from '../types';

export const SPREADSHEET_ID = '1RZNZ4tMbw_qLZ9-iElGnfsFzk3JL1oFKeU3I6i_xEjU';

// Schema definitions for sheets
export const SHEET_SCHEMAS = {
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
    'ID', 'Name', 'Email', 'Password', 'Role', 'CreatedAt', 'Status', 'AvatarUrl'
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

/**
 * Reads a sheet directly from Google Sheet ID 1RZNZ4tMbw_qLZ9-iElGnfsFzk3JL1oFKeU3I6i_xEjU
 * Uses Sheets API v4 if OAuth token is available, or instant gviz JSON query.
 */
export async function readSheetDirect(sheetName: string): Promise<Record<string, any>[]> {
  const token = await getAccessToken();

  // Try direct Sheets API v4 if authenticated
  if (token) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
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
    } catch (e) {
      console.warn('Sheets API v4 direct read failed, falling back to public endpoint:', e);
    }
  }

  // Direct fetch via Google Sheet Query endpoint (public read)
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

    // When headers=1 is used, parsed.table.cols contains the header names
    const tableCols = (parsed.table.cols || []).map((c: any) => String(c?.label || c?.id || '').trim()).filter(Boolean);
    const schemaHeaders = SHEET_SCHEMAS[sheetName as keyof typeof SHEET_SCHEMAS] || [];
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
    return results;
  } catch (err) {
    console.error(`Failed to read sheet ${sheetName}:`, err);
    return [];
  }
}

export const GAS_URL = 'https://script.google.com/macros/s/AKfycbxxQ9HDOmYQ7ThrqP-8gOpLfPnU3B0W18jAci-lTVWFCYA_WmDV4KIuEcAtcjIN2kPqiQ/exec';

/**
 * Appends a new row directly to a Google Sheet via Sheets API v4, server proxy, or Google Apps Script
 */
export async function appendSheetRow(sheetName: string, rowValues: any[]): Promise<boolean> {
  const token = await getAccessToken();

  if (token) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [rowValues]
        })
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn(`Direct Sheets API append failed for ${sheetName}:`, e);
    }
  }

  // Fallback to server route (local Express server or Vercel serverless /api)
  try {
    const res = await fetch('/api/sheets/append', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        sheetName,
        values: [rowValues]
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') return true;
    }
  } catch (err) {
    console.warn(`Proxy append row to ${sheetName} failed:`, err);
  }

  // Fallback to direct Google Apps Script Web App call (works directly on Vercel without backend)
  try {
    if (sheetName === 'Users') {
      const [userId, name, email, password, role] = rowValues;
      const gasRes = await fetch(GAS_URL, {
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
  } catch (gasErr) {
    console.warn(`Direct GAS append fallback failed for ${sheetName}:`, gasErr);
  }

  return false;
}

/**
 * Updates a specific cell or range directly in Google Sheets
 */
export async function updateSheetRange(sheetName: string, rangeA1: string, values: any[][]): Promise<boolean> {
  const token = await getAccessToken();

  if (token) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!${rangeA1}?valueInputOption=USER_ENTERED`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn(`Direct Sheets API update range failed:`, e);
    }
  }

  // Server proxy fallback
  try {
    const res = await fetch('/api/sheets/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        sheetName,
        range: rangeA1,
        values
      })
    });
    const data = await res.json();
    return data.status === 'success';
  } catch (err) {
    console.error(`Error updating range in ${sheetName}:`, err);
    return false;
  }
}

/**
 * Finds a row by matching column value, then updates specified column value
 */
export async function findAndUpdateRow(
  sheetName: string,
  matchColIndex: number, // 0-based
  matchVal: string,
  updateColIndex: number, // 0-based
  newVal: any
): Promise<boolean> {
  const token = await getAccessToken();

  // Try via server helper which finds row and updates range
  try {
    const res = await fetch('/api/sheets/update-cell-by-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        sheetName,
        matchColIndex,
        matchVal,
        updateColIndex,
        newVal
      })
    });
    const data = await res.json();
    return data.status === 'success';
  } catch (e) {
    console.error('findAndUpdateRow error:', e);
    return false;
  }
}

// Helper to get A1 Column Letter from 1-based index (e.g. 1->A, 22->V, 27->AA)
export function getColumnLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

export interface SchemaSyncResult {
  success: boolean;
  message: string;
  sheetsCreated?: string[];
  columnsUpdated?: Record<string, string[]>;
  columnsAdded?: Record<string, string[]>;
  existingSheets?: string[];
}

/**
 * Automatically creates sheets or extends header columns according to SHEET_SCHEMAS
 */
export async function ensureSpreadsheetSchema(requestAuthIfNeeded = true): Promise<SchemaSyncResult> {
  let token = await getAccessToken();

  if (!token && requestAuthIfNeeded) {
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        token = res.accessToken;
      }
    } catch (e: any) {
      console.warn("User dismissed or encountered auth error during schema sync:", e.message);
    }
  }

  // 1. If we have OAuth token, perform direct Google Sheets API v4 calls
  if (token) {
    try {
      // 1.1 Fetch spreadsheet metadata to check existing sheets
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!metaRes.ok) {
        throw new Error(`Sheets API responded with ${metaRes.status}`);
      }

      const meta = await metaRes.json();
      const sheetDetails: Record<string, { sheetId: number; columnCount: number }> = {};
      (meta.sheets || []).forEach((s: any) => {
        sheetDetails[s.properties.title] = {
          sheetId: s.properties.sheetId,
          columnCount: s.properties.gridProperties?.columnCount || 26
        };
      });

      const existingSheetTitles = Object.keys(sheetDetails);

      // 1.2 Add any missing sheets
      const requiredSheetTitles = Object.keys(SHEET_SCHEMAS);
      const missingSheets = requiredSheetTitles.filter(t => !existingSheetTitles.includes(t));
      const sheetsCreated: string[] = [];

      if (missingSheets.length > 0) {
        const addRequests = missingSheets.map(title => ({
          addSheet: {
            properties: {
              title,
              gridProperties: { rowCount: 500, columnCount: 35 }
            }
          }
        }));

        const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: addRequests })
        });

        if (batchRes.ok) {
          sheetsCreated.push(...missingSheets);
          const batchData = await batchRes.json().catch(() => null);
          if (batchData?.replies) {
            batchData.replies.forEach((rep: any, idx: number) => {
              const addedTitle = missingSheets[idx];
              if (rep?.addSheet?.properties) {
                sheetDetails[addedTitle] = {
                  sheetId: rep.addSheet.properties.sheetId,
                  columnCount: rep.addSheet.properties.gridProperties?.columnCount || 35
                };
              }
            });
          }
        }
      }

      // 1.3 Ensure headers on Row 1 for each required sheet
      const columnsUpdated: Record<string, string[]> = {};
      const columnsAdded: Record<string, string[]> = {};

      for (const [sheetTitle, expectedHeaders] of Object.entries(SHEET_SCHEMAS)) {
        try {
          const row1Res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetTitle)}!1:1`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          let currentHeaders: string[] = [];
          if (row1Res.ok) {
            const data = await row1Res.json();
            if (data.values && data.values.length > 0 && Array.isArray(data.values[0])) {
              currentHeaders = data.values[0].map((h: any) => String(h || '').trim()).filter((h: string) => h.length > 0);
            }
          }

          // Build merged header list (preserving existing and appending missing expected headers)
          const finalHeaders = [...currentHeaders];
          const newHeaders: string[] = [];
          for (const exp of expectedHeaders) {
            if (!finalHeaders.some(h => h.toLowerCase() === exp.toLowerCase())) {
              finalHeaders.push(exp);
              newHeaders.push(exp);
            }
          }

          // Safety: ensure sheet grid has enough columns before writing
          const currentDetail = sheetDetails[sheetTitle];
          if (currentDetail && currentDetail.columnCount < finalHeaders.length) {
            const expandColCount = Math.max(35, finalHeaders.length + 5);
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                requests: [{
                  updateSheetProperties: {
                    properties: {
                      sheetId: currentDetail.sheetId,
                      gridProperties: { columnCount: expandColCount }
                    },
                    fields: 'gridProperties.columnCount'
                  }
                }]
              })
            }).catch(e => console.warn('Column expansion warning:', e));
          }

          // If no headers existed or new columns were added, update Row 1
          if (currentHeaders.length === 0 || newHeaders.length > 0) {
            const colLetter = getColumnLetter(finalHeaders.length);
            const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetTitle)}!A1:${colLetter}1?valueInputOption=USER_ENTERED`;
            const putRes = await fetch(updateUrl, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ values: [finalHeaders] })
            });

            if (putRes.ok) {
              columnsUpdated[sheetTitle] = finalHeaders;
              columnsAdded[sheetTitle] = newHeaders;
            }
          } else {
            columnsUpdated[sheetTitle] = currentHeaders;
            columnsAdded[sheetTitle] = [];
          }
        } catch (e: any) {
          console.warn(`Error updating headers for ${sheetTitle}:`, e.message);
        }
      }

      return {
        success: true,
        message: 'Struktur sheet dan kolom Google Sheet berhasil disinkronkan langsung!',
        sheetsCreated,
        columnsUpdated,
        columnsAdded,
        existingSheets: Object.keys(sheetDetails)
      };
    } catch (e: any) {
      console.warn("Direct Sheets API schema sync error:", e.message);
    }
  }

  // 2. Fallback to server endpoint
  try {
    const res = await fetch('/api/sheets/init-schema', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const d = await res.json();
    return {
      success: d.status === 'success',
      message: d.message || 'Skema berhasil diperbarui via server proxy.'
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Gagal sinkronisasi skema Google Sheet.'
    };
  }
}

export async function uploadFileToDrive(file: File): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda harus login dengan Google terlebih dahulu untuk mengunggah ke Drive.');
  }
  const metadata = {
    name: file.name || `photo_${Date.now()}.jpg`,
    mimeType: file.type || 'image/jpeg'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal mengunggah ke Google Drive: ${errText}`);
  }

  const data = await res.json();
  const fileId = data.id;
  const fileUrl = data.webViewLink || `https://lh3.googleusercontent.com/d/${fileId}`;
  return fileUrl;
}

// ------------------------------------------------------------------
// High-level Domain Services directly mapped to Google Sheets tabs
// ------------------------------------------------------------------

export const GoogleSheetsService = {
  // JOBS
  async getJobs() {
    const rows = await readSheetDirect('Jobs');
    return rows.map(r => {
      let parsedQuestions: string[] = [];
      const rawQuestions = r.InterviewQuestions || r.interviewQuestions || '';
      if (Array.isArray(rawQuestions)) {
        parsedQuestions = rawQuestions;
      } else if (typeof rawQuestions === 'string' && rawQuestions.trim()) {
        try {
          const p = JSON.parse(rawQuestions);
          if (Array.isArray(p)) parsedQuestions = p;
        } catch {
          parsedQuestions = rawQuestions.split('\n').map((q: string) => q.trim()).filter(Boolean);
        }
      }

      return {
        id: r.ID || r.id,
        title: r.Title || r.title,
        department: r.Department || r.department,
        location: r.Location || r.location,
        type: r.Type || r.type,
        description: r.Description || r.description,
        requirements: typeof r.Requirements === 'string' 
          ? (() => { try { return JSON.parse(r.Requirements); } catch { return [r.Requirements]; } })()
          : (r.Requirements || []),
        createdAt: r.CreatedAt || r.createdAt,
        company: r.Company || 'PT Mercindo Global Manufaktur',
        classification: r.Classification || r.Department || 'Manufaktur & Teknik',
        workArrangement: r.WorkArrangement || 'On-site',
        highlights: r.Highlights ? (() => { try { return JSON.parse(r.Highlights); } catch { return [r.Highlights]; } })() : [],
        experienceLevel: r.ExperienceLevel || '1-3 Tahun',
        jobDescUrl: r.JobDescUrl || r.jobDescUrl || '',
        jobDescFileName: r.JobDescFileName || r.jobDescFileName || '',
        interviewQuestions: parsedQuestions,
        interviewPrompt: r.InterviewPrompt || r.interviewPrompt || ''
      };
    });
  },

  async addJob(job: any) {
    const id = job.id || 'job_' + Math.random().toString(36).substring(2, 9);
    // Avoid storing huge base64 strings directly inside a single Sheet cell (>50,000 chars limit in Google Sheets)
    const safeSheetJobDescUrl =
      job.jobDescUrl && String(job.jobDescUrl).length > 40000
        ? `file://${job.jobDescFileName || 'job_desc_document'}`
        : (job.jobDescUrl || '');

    const row = [
      id,
      job.title,
      job.department,
      job.location,
      job.type,
      job.description,
      JSON.stringify(job.requirements || []),
      new Date().toISOString(),
      job.company || 'PT Mercindo Global Manufaktur',
      job.classification || job.department || '',
      job.workArrangement || 'On-site',
      JSON.stringify(job.highlights || []),
      job.experienceLevel || '1-3 Tahun',
      safeSheetJobDescUrl,
      job.jobDescFileName || '',
      JSON.stringify(job.interviewQuestions || []),
      job.interviewPrompt || ''
    ];
    const success = await appendSheetRow('Jobs', row);
    return { success, id };
  },

  // APPLICATIONS
  async getApplications() {
    const rows = await readSheetDirect('Applications');
    return rows.map(r => {
      // Map stages according to SEEK 7-stage workflow
      const rawStage = r.Stage || r.stage || r.Status || r.status || 'Kotak masuk';
      let stage: ApplicationStage = 'Kotak masuk';
      if (['Kotak masuk', 'Prescreen', 'Terpilih', 'Wawancara', 'Penawaran', 'Menerima Tawaran', 'Tidak cocok'].includes(rawStage)) {
        stage = rawStage as ApplicationStage;
      } else if (rawStage.toLowerCase().includes('interview') || rawStage.toLowerCase().includes('wawancara')) {
        stage = 'Wawancara';
      } else if (rawStage.toLowerCase().includes('shortlist') || rawStage.toLowerCase().includes('terpilih')) {
        stage = 'Terpilih';
      } else if (rawStage.toLowerCase().includes('reject') || rawStage.toLowerCase().includes('tidak cocok') || rawStage.toLowerCase().includes('ditolak')) {
        stage = 'Tidak cocok';
      } else if (rawStage.toLowerCase().includes('offer') || rawStage.toLowerCase().includes('penawaran')) {
        stage = 'Penawaran';
      } else if (rawStage.toLowerCase().includes('accept') || rawStage.toLowerCase().includes('menerima')) {
        stage = 'Menerima Tawaran';
      } else if (rawStage.toLowerCase().includes('screen') || rawStage.toLowerCase().includes('prescreen')) {
        stage = 'Prescreen';
      }

      return {
        id: r.ID || r.id,
        userId: r.UserID || r.userId,
        userName: r.UserName || r.userName || 'Kandidat',
        jobId: r.JobID || r.jobId,
        jobTitle: r.JobTitle || r.jobTitle,
        status: r.Status || r.status || 'Applied',
        stage: stage,
        createdAt: r.CreatedAt || r.createdAt || new Date().toISOString(),
        aiAnalysis: r['AI Analysis'] || r.aiAnalysis || '',
        fitScore: r.FitScore ? parseInt(r.FitScore) : (stage === 'Terpilih' ? 92 : stage === 'Wawancara' ? 88 : stage === 'Prescreen' ? 80 : 75),
        fitLabel: r.FitLabel || (stage === 'Terpilih' ? 'Kandidat Sangat Cocok' : 'Kecocokan Baik'),
        phone: r.Phone || '+62 812-3456-7890',
        email: r.Email || '',
        location: r.Location || 'Kab. Semarang, Jawa Tengah',
        currentRole: r.CurrentRole || '',
        experience: r.Experience || '',
        education: r.Education || '',
        certifications: r.Certifications || '',
        skills: r.Skills || '',
        resumeUrl: r.ResumeUrl || '',
        notes: r.Notes || '',
        rating: r.Rating ? parseInt(r.Rating) : 5
      };
    });
  },

  async submitApplication(appData: {
    userId: string;
    userName: string;
    jobId: string;
    jobTitle: string;
    phone?: string;
    email?: string;
    location?: string;
    currentRole?: string;
    experience?: string;
    education?: string;
    certifications?: string;
    skills?: string;
    resumeUrl?: string;
    notes?: string;
    aiAnalysis?: string;
    fitScore?: number;
    fitLabel?: string;
    stage?: ApplicationStage;
  }) {
    const id = 'app_' + Math.random().toString(36).substring(2, 9);
    const stage = appData.stage || 'Pre Screening';
    const row = [
      id,
      appData.userId,
      appData.userName,
      appData.jobId,
      appData.jobTitle,
      stage, // Column F: Status (new recruitment stage)
      new Date().toISOString(),
      appData.aiAnalysis || '',
      stage, // Column I: Stage
      appData.fitScore || 85,
      appData.fitLabel || 'Kecocokan Baik',
      appData.phone || '',
      appData.email || '',
      appData.location || 'Kab. Semarang, Jawa Tengah',
      appData.currentRole || '',
      appData.experience || '',
      appData.education || '',
      appData.certifications || '',
      appData.skills || '',
      appData.resumeUrl || '',
      appData.notes || '',
      5 // Rating
    ];

    const success = await appendSheetRow('Applications', row);
    return { success, id };
  },

  async updateApplicationStage(applicationId: string, newStage: ApplicationStage, notes?: string, userId?: string) {
    // Column 5 is Status (0-indexed 5 = Column F), Column 8 is Stage (0-indexed 8 = Column I)
    const successStatus = await findAndUpdateRow('Applications', 0, applicationId, 5, newStage);
    const successStage = await findAndUpdateRow('Applications', 0, applicationId, 8, newStage);
    if (notes) {
      await findAndUpdateRow('Applications', 0, applicationId, 20, notes);
    }
    try {
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_application_status',
          applicationId,
          userId,
          status: newStage
        })
      });
    } catch (e) {
      console.warn('Proxy status sync warning:', e);
    }
    return successStage || successStatus;
  },

  async updateApplicationAiAnalysis(applicationId: string, aiAnalysisText: string, fitScore?: number) {
    await findAndUpdateRow('Applications', 0, applicationId, 7, aiAnalysisText);
    if (fitScore !== undefined) {
      await findAndUpdateRow('Applications', 0, applicationId, 9, fitScore);
    }
    return true;
  },

  // USERS
  async getUsers() {
    return await readSheetDirect('Users');
  },

  async registerUser(userData: { name: string; email: string; password?: string; role?: string; avatarUrl?: string }) {
    const cleanEmail = String(userData.email || '').trim().toLowerCase();
    const cleanName = String(userData.name || '').trim();
    const cleanPassword = String(userData.password || '').trim();
    const cleanRole = userData.role === 'mgm team' ? 'tim_mgm' : (userData.role || 'applicant');

    // 1. Check if email already exists in Users sheet
    try {
      const existing = await readSheetDirect('Users');
      const duplicate = existing.find(u => String(u.Email || u.email || '').trim().toLowerCase() === cleanEmail);
      if (duplicate) {
        throw new Error('Email sudah terdaftar di sistem. Silakan masuk menggunakan akun Anda.');
      }
    } catch (checkErr: any) {
      if (checkErr.message?.includes('sudah terdaftar')) {
        throw checkErr;
      }
      console.warn('Pre-check for existing user warning:', checkErr.message);
    }

    let registeredUserId = '';
    let userStatus = cleanRole === 'tim_mgm' ? 'Pending' : 'Approved';

    // 2. Try proxy endpoint /api/gas/proxy first (local dev server or Vercel serverless /api)
    try {
      const res = await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          role: cleanRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.userId) {
          registeredUserId = data.userId;
          if (data.userStatus) userStatus = data.userStatus;
        } else if (data.status === 'error' && (data.message?.includes('already exists') || data.message?.includes('sudah terdaftar'))) {
          throw new Error('Email sudah terdaftar di sistem. Silakan masuk menggunakan akun Anda.');
        }
      }
    } catch (proxyErr: any) {
      if (proxyErr.message?.includes('sudah terdaftar')) {
        throw proxyErr;
      }
      console.warn('Proxy registration failed, attempting direct GAS Web App call:', proxyErr);
    }

    // 3. Fallback: Direct call to GAS Web App (works directly on Vercel static hosting)
    if (!registeredUserId) {
      try {
        const gasRes = await fetch(GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'register',
            name: cleanName,
            email: cleanEmail,
            password: cleanPassword,
            role: cleanRole
          })
        });
        const gasData = await gasRes.json().catch(() => null);
        if (gasData?.status === 'success' && gasData.userId) {
          registeredUserId = gasData.userId;
          if (gasData.userStatus) userStatus = gasData.userStatus;
        } else if (gasData?.status === 'error' && (gasData.message?.includes('already exists') || gasData.message?.includes('sudah terdaftar'))) {
          throw new Error('Email sudah terdaftar di sistem. Silakan masuk menggunakan akun Anda.');
        }
      } catch (gasErr: any) {
        if (gasErr.message?.includes('sudah terdaftar')) {
          throw gasErr;
        }
        console.warn('Direct GAS Web App register failed, trying appendSheetRow:', gasErr);
      }
    }

    // 4. Fallback: Sheets API v4 or /api/sheets/append
    if (!registeredUserId) {
      const fallbackId = 'usr_' + Math.random().toString(36).substring(2, 9);
      const row = [
        fallbackId,
        cleanName,
        cleanEmail,
        cleanPassword,
        cleanRole,
        new Date().toISOString(),
        userStatus
      ];
      const appended = await appendSheetRow('Users', row);
      if (appended) {
        registeredUserId = fallbackId;
      }
    }

    if (!registeredUserId) {
      throw new Error('Gagal menyimpan pendaftaran ke Google Sheet. Silakan coba beberapa saat lagi.');
    }

    return {
      userId: registeredUserId,
      name: cleanName,
      email: cleanEmail,
      role: cleanRole === 'tim_mgm' ? 'mgm team' : 'applicant',
      userStatus,
      avatarUrl: userData.avatarUrl || ''
    };
  },

  async loginUser(email: string, password?: string) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = password !== undefined ? String(password).trim() : undefined;
    
    // 1. Try reading from sheet
    const existing = await readSheetDirect('Users');
    const user = existing.find(u => {
      const uEmail = String(u.Email || u.email || '').trim().toLowerCase();
      const uPass = String(u.Password || u.password || '').trim();
      if (cleanPass !== undefined && cleanPass !== '') {
        return uEmail === cleanEmail && uPass === cleanPass;
      }
      return uEmail === cleanEmail;
    });

    if (user) {
      const rawRole = String(user.Role || user.role || '').trim().toLowerCase();
      let status = String(user.Status || user.status || '').trim();

      // Check local storage approval overrides
      try {
        const stored = localStorage.getItem('mgm_user_approvals');
        if (stored) {
          const parsed = JSON.parse(stored);
          const override = parsed[user.ID || user.id] || parsed[cleanEmail];
          if (override) status = override;
        }
      } catch {}

      if (!status) {
        status = (rawRole === 'tim_mgm' || rawRole === 'mgm team') ? 'Pending' : 'Approved';
      }

      if (rawRole === 'tim_mgm' || rawRole === 'mgm team') {
        if (status.toLowerCase() === 'rejected' || status.toLowerCase() === 'ditolak') {
          throw new Error('Pendaftaran akun Tim MGM Anda telah ditolak oleh Administrator.');
        }
        if (status.toLowerCase() !== 'approved' && status.toLowerCase() !== 'disetujui') {
          throw new Error('Akun Tim MGM Anda masih menunggu persetujuan Administrator.');
        }
      }
      const mappedRole = (rawRole.includes('admin') || rawRole.includes('mgm') || cleanEmail === 'analisdatamgm@gmail.com') ? 'admin' : 'applicant';

      return {
        userId: user.ID || user.id,
        name: user.Name || user.name,
        email: user.Email || user.email,
        role: mappedRole,
        userStatus: status,
        avatarUrl: user.AvatarUrl || user.avatarUrl || ''
      };
    }

    // 2. Fallback: Direct query to GAS login action in case Google Sheet GViz had a cache delay
    try {
      const gasRes = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', email: cleanEmail, password: cleanPass })
      });
      const gasData = await gasRes.json().catch(() => null);
      if (gasData?.status === 'success' && gasData.userId) {
        const rawRole = String(gasData.role || '').trim().toLowerCase();
        const mappedRole = (rawRole.includes('admin') || rawRole.includes('mgm') || cleanEmail === 'analisdatamgm@gmail.com') ? 'admin' : 'applicant';
        return {
          userId: gasData.userId,
          name: gasData.name,
          email: gasData.email,
          role: mappedRole,
          avatarUrl: ''
        };
      } else if (gasData?.message?.includes('menunggu persetujuan') || gasData?.message?.includes('ditolak')) {
        throw new Error(gasData.message);
      }
    } catch (gasLoginErr: any) {
      if (gasLoginErr.message?.includes('menunggu persetujuan') || gasLoginErr.message?.includes('ditolak')) {
        throw gasLoginErr;
      }
    }

    throw new Error('Kredensial tidak valid. Silakan periksa kembali email dan password Anda.');
  },

  async approveUser(userId: string, status: 'Approved' | 'Rejected' | 'Pending' = 'Approved', userEmail?: string) {
    // 1. Update server store via dedicated endpoint
    try {
      await fetch('/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail, status })
      });
    } catch (e) {
      console.warn('API /api/users/approve warning:', e);
    }

    // 2. Call local / server proxy /api/gas/proxy
    try {
      await fetch('/api/gas/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_user', userId, userEmail, status })
      });
    } catch (e) {
      console.warn('Proxy approve_user call warning:', e);
    }

    // 3. Update Column G (0-indexed 6: Status) in Google Sheets Users sheet
    await findAndUpdateRow('Users', 0, userId, 6, status);

    // 4. Direct GAS fallback
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'approve_user', userId, status })
      });
    } catch (gasErr) {
      console.warn('Direct GAS approve_user call warning:', gasErr);
    }

    return true;
  },

  async updateUserAvatar(userId: string, avatarUrl: string) {
    return await findAndUpdateRow('Users', 0, userId, 7, avatarUrl);
  },

  // DOCUMENTS
  async getDocuments(userId?: string) {
    const docs = await readSheetDirect('Documents');
    if (userId) {
      return docs.filter(d => String(d.UserID || d.userId) === String(userId));
    }
    return docs;
  },

  async getApplicantExistingCv(userId: string): Promise<{ fileName: string; fileUrl?: string; uploadedAt?: string } | null> {
    if (!userId) return null;

    // 1. Check local storage documents (fastest)
    try {
      const storedDocs = localStorage.getItem(`mgm_uploaded_docs_${userId}`);
      if (storedDocs) {
        const parsed = JSON.parse(storedDocs);
        if (parsed && (parsed.CV || parsed.cv)) {
          const cvDoc = parsed.CV || parsed.cv;
          return {
            fileName: cvDoc.fileName || cvDoc.name || 'CV_Pelamar.pdf',
            fileUrl: cvDoc.fileUrl || '',
            uploadedAt: cvDoc.uploadedAt || ''
          };
        }
      }
    } catch (e) {
      console.warn('Error reading local uploaded docs:', e);
    }

    // 2. Check local raw CV text in localStorage
    try {
      const rawCv = localStorage.getItem('mgm_user_cv');
      if (rawCv && rawCv.trim().length > 20) {
        return {
          fileName: 'CV_Profil_Pelamar.pdf',
          fileUrl: '',
          uploadedAt: new Date().toISOString()
        };
      }
    } catch {}

    // 3. Check Google Sheet Documents tab
    try {
      const docs = await this.getDocuments(userId);
      const cvDoc = docs.find((d: any) => {
        const type = String(d.DocumentType || d.documentType || '').trim().toUpperCase();
        const name = String(d.FileName || d.fileName || '').trim().toLowerCase();
        return type === 'CV' || name.includes('cv') || name.includes('resume');
      });
      if (cvDoc) {
        const fileName = cvDoc.FileName || cvDoc.fileName || 'CV_Pelamar.pdf';
        const fileUrl = cvDoc.FileUrl || cvDoc.fileUrl || '';
        const uploadedAt = cvDoc.CreatedAt || cvDoc.createdAt || '';

        // Cache in localStorage for future instant access
        try {
          const stored = localStorage.getItem(`mgm_uploaded_docs_${userId}`);
          const parsed = stored ? JSON.parse(stored) : {};
          parsed.CV = { fileName, fileUrl, uploadedAt };
          localStorage.setItem(`mgm_uploaded_docs_${userId}`, JSON.stringify(parsed));
        } catch {}

        return {
          fileName,
          fileUrl,
          uploadedAt
        };
      }
    } catch (e) {
      console.warn('Error fetching docs from Google Sheets:', e);
    }

    return null;
  },

  async saveDocument(docData: { userId: string; documentType: string; fileName: string; fileUrl: string }) {
    const row = [
      docData.userId,
      docData.documentType,
      docData.fileName,
      docData.fileUrl,
      new Date().toISOString()
    ];
    return await appendSheetRow('Documents', row);
  },

  // TEST RESULTS
  async getTestResults(userId?: string) {
    const tests = await readSheetDirect('TestResults');
    if (userId) {
      return tests.filter(t => String(t.UserID || t.userId) === String(userId));
    }
    return tests;
  },

  async saveTestResult(data: {
    userId: string;
    testType: string;
    score: string | number;
    resume?: string;
    answers?: string;
    validated?: string;
  }) {
    const row = [
      data.userId,
      data.testType,
      String(data.score),
      data.resume || '',
      new Date().toISOString(),
      data.answers || '',
      data.validated || 'Belum Divalidasi'
    ];
    return await appendSheetRow('TestResults', row);
  },

  async validateTest(userId: string, testType: string, validationStatus: string) {
    // Validated column is column 6 (G)
    return await findAndUpdateRow('TestResults', 0, userId, 6, validationStatus);
  },

  // INTERVIEWS
  async getInterviews(userId?: string) {
    const rows = await readSheetDirect('Interviews');
    if (userId) {
      return rows.filter(i => String(i.UserID || i.userId) === String(userId));
    }
    return rows;
  },

  async saveInterview(data: {
    userId: string;
    summary: string;
    aiSummary?: string;
    validated?: string;
  }) {
    const row = [
      data.userId,
      data.summary,
      data.aiSummary || '',
      data.validated || 'Belum Divalidasi',
      new Date().toISOString()
    ];
    return await appendSheetRow('Interviews', row);
  },

  async validateInterview(userId: string, validationStatus: string) {
    // Validation is column 3 (D)
    return await findAndUpdateRow('Interviews', 0, userId, 3, validationStatus);
  }
};
