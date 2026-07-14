function doPost(e) {
  const sheetId = '1RZNZ4tMbw_qLZ9-iElGnfsFzk3JL1oFKeU3I6i_xEjU';
  const folderId = '1jYM4xSas4utspIysuN_8mvmY7avVNGt0';
  
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'register') {
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Users') || SpreadsheetApp.openById(sheetId).insertSheet('Users');
      
      // If empty, add headers
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['ID', 'Name', 'Email', 'Password', 'Role', 'CreatedAt']);
      }
      
      // Basic check
      const dataRange = sheet.getDataRange().getValues();
      const exists = dataRange.some(row => row[2] === data.email);
      if (exists) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Email already exists' })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const userId = Utilities.getUuid();
      sheet.appendRow([userId, data.name, data.email, data.password, data.role || 'applicant', new Date().toISOString()]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', userId: userId, name: data.name, email: data.email, role: data.role || 'applicant' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'login') {
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Users');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Users not initialized' })).setMimeType(ContentService.MimeType.JSON);
      
      const dataRange = sheet.getDataRange().getValues();
      const user = dataRange.find(row => row[2] === data.email && row[3] === data.password);
      
      if (user) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'success', userId: user[0], name: user[1], email: user[2], role: user[4] })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid credentials' })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    if (action === 'upload') {
      // data.userId, data.userName, data.documentType, data.fileName, data.mimeType, data.base64
      const mainFolder = DriveApp.getFolderById(folderId);
      const subFolderName = `${data.userName}_${data.documentType}`;
      
      // Find or create subfolder
      let subFolder;
      const subFolders = mainFolder.searchFolders(`title = '${subFolderName}'`);
      if (subFolders.hasNext()) {
        subFolder = subFolders.next();
      } else {
        subFolder = mainFolder.createFolder(subFolderName);
      }
      
      const blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType, data.fileName);
      const file = subFolder.createFile(blob);
      
      // Log upload to sheet
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Documents') || SpreadsheetApp.openById(sheetId).insertSheet('Documents');
      if (sheet.getLastRow() === 0) sheet.appendRow(['UserID', 'DocumentType', 'FileName', 'FileUrl', 'CreatedAt']);
      sheet.appendRow([data.userId, data.documentType, data.fileName, file.getUrl(), new Date().toISOString()]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', fileUrl: file.getUrl() })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'applyJob' || action === 'apply') {
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Applications') || SpreadsheetApp.openById(sheetId).insertSheet('Applications');
      if (sheet.getLastRow() === 0) sheet.appendRow(['ID', 'UserID', 'UserName', 'JobID', 'JobTitle', 'Status', 'CreatedAt', 'AI Analysis']);
      const appId = Utilities.getUuid();
      sheet.appendRow([appId, data.userId, data.userName || '', data.jobId, data.jobTitle || '', data.status || 'Applied', new Date().toISOString()]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', applicationId: appId })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'save_test') {
       const targetSheetName = data.sheetName || 'TestResults';
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(targetSheetName) || SpreadsheetApp.openById(sheetId).insertSheet(targetSheetName);
       if (sheet.getLastRow() === 0) sheet.appendRow(['UserID', 'TestType', 'Score', 'Resume (Interpretasi AI)', 'Detail Jawaban', 'Validated', 'CreatedAt']);
       sheet.appendRow([data.userId, data.testType, data.score || '', data.resume || '', data.answers || '', data.validated || 'Belum Divalidasi', new Date().toISOString()]);
       return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'save_interview') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Interviews') || SpreadsheetApp.openById(sheetId).insertSheet('Interviews');
       if (sheet.getLastRow() === 0) sheet.appendRow(['UserID', 'Summary', 'Summary by AI', 'Validated', 'CreatedAt']);
       sheet.appendRow([data.userId, data.summary, data.aiSummary || '', data.validated || 'Belum Divalidasi', new Date().toISOString()]);
       return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'add_job') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Jobs') || SpreadsheetApp.openById(sheetId).insertSheet('Jobs');
       if (sheet.getLastRow() === 0) sheet.appendRow(['ID', 'Title', 'Department', 'Location', 'Type', 'Description', 'Requirements', 'CreatedAt']);
       const jobId = data.id || Utilities.getUuid();
       sheet.appendRow([jobId, data.title, data.department, data.location, data.type, data.description, JSON.stringify(data.requirements || []), new Date().toISOString()]);
       return ContentService.createTextOutput(JSON.stringify({ status: 'success', jobId: jobId })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'edit_job') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Jobs');
       if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Jobs sheet not found' })).setMimeType(ContentService.MimeType.JSON);
       const values = sheet.getDataRange().getValues();
       for (let i = 1; i < values.length; i++) {
         if (String(values[i][0]) === String(data.id)) {
           sheet.getRange(i + 1, 2).setValue(data.title);
           sheet.getRange(i + 1, 3).setValue(data.department);
           sheet.getRange(i + 1, 4).setValue(data.location);
           sheet.getRange(i + 1, 5).setValue(data.type);
           sheet.getRange(i + 1, 6).setValue(data.description);
           sheet.getRange(i + 1, 7).setValue(JSON.stringify(data.requirements || []));
           return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Job ID not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'update_application_cv_analysis') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Applications');
       if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Applications sheet not found' })).setMimeType(ContentService.MimeType.JSON);
       
       const header = sheet.getRange(1, 8).getValue();
       if (!header) sheet.getRange(1, 8).setValue('AI Analysis');

       const values = sheet.getDataRange().getValues();
       for (let i = 1; i < values.length; i++) {
         if (String(values[i][0]) === String(data.applicationId)) {
           sheet.getRange(i + 1, 8).setValue(data.aiAnalysis); // Kolom H (8th column)
           return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Application not found' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'get_file_base64') {
       try {
         const fileIdMatch = data.fileUrl.match(/[-\w]{25,}/);
         if (fileIdMatch) {
           const file = DriveApp.getFileById(fileIdMatch[0]);
           const base64 = Utilities.base64Encode(file.getBlob().getBytes());
           const mimeType = file.getMimeType();
           return ContentService.createTextOutput(JSON.stringify({ status: 'success', base64: base64, mimeType: mimeType })).setMimeType(ContentService.MimeType.JSON);
         }
         return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'File ID not found in URL' })).setMimeType(ContentService.MimeType.JSON);
       } catch (e) {
         return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() })).setMimeType(ContentService.MimeType.JSON);
       }
    }

    if (action === 'update_application_status') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Applications');
       if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Applications sheet not found' })).setMimeType(ContentService.MimeType.JSON);
       const values = sheet.getDataRange().getValues();
       for (let i = 1; i < values.length; i++) {
         if (values[i][0] === data.applicationId) {
           sheet.getRange(i + 1, 6).setValue(data.status); // Status is the 6th column
           return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Application ID not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'update_test_evaluation') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('TestResults');
       if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'TestResults sheet not found' })).setMimeType(ContentService.MimeType.JSON);
       
       const values = sheet.getDataRange().getValues();
       for (let i = values.length - 1; i >= 1; i--) {
         if (values[i][0] === data.userId && values[i][1] === data.testType) {
           sheet.getRange(i + 1, 4).setValue(data.resume); // Resume is 4th column
           return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Test result not found' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'update_interview_summary') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Interviews');
       if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Interviews sheet not found' })).setMimeType(ContentService.MimeType.JSON);
       
       const values = sheet.getDataRange().getValues();
       for (let i = values.length - 1; i >= 1; i--) {
         if (values[i][0] === data.userId) {
           sheet.getRange(i + 1, 3).setValue(data.aiSummary); // 'Summary by AI' is 3rd column
           return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Interview result not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'validate_test') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('TestResults');
       if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'TestResults sheet not found' })).setMimeType(ContentService.MimeType.JSON);
       const values = sheet.getDataRange().getValues();
       for (let i = values.length - 1; i >= 1; i--) {
         if (values[i][0] === data.userId && values[i][1] === data.testType) {
           sheet.getRange(i + 1, 5).setValue(data.validated || 'Valid'); // Validated is the 5th column
           return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Test result not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'validate_interview') {
       const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Interviews');
       if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Interviews sheet not found' })).setMimeType(ContentService.MimeType.JSON);
       const values = sheet.getDataRange().getValues();
       for (let i = values.length - 1; i >= 1; i--) {
         if (values[i][0] === data.userId) {
           sheet.getRange(i + 1, 4).setValue(data.validated || 'Valid'); // Validated is the 4th column
           return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Interview result not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'delete_document') {
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Documents');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Documents sheet not found' })).setMimeType(ContentService.MimeType.JSON);
      
      const values = sheet.getDataRange().getValues();
      // Find row and delete it
      for (let i = values.length - 1; i >= 1; i--) {
        if (String(values[i][0]) === String(data.userId) && String(values[i][1]) === String(data.documentType)) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Document not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'get_data') {
      const type = data.type;
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(type);
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] })).setMimeType(ContentService.MimeType.JSON);
      
      const dataRange = sheet.getDataRange().getValues();
      const headers = dataRange[0];
      const result = [];
      for(let i=1; i<dataRange.length; i++) {
        const obj = {};
        for(let j=0; j<headers.length; j++) {
           obj[headers[j]] = dataRange[i][j];
        }
        result.push(obj);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  // CORS 
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}
