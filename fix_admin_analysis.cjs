const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const correctLogic = `
  useEffect(() => {
    const analyzePendingCVs = async () => {
      if (activeTab !== 'applications' || data.length === 0) return;

      const jobs = await getJobs();
      
      let docs = [];
      try {
        const resDocs = await fetch('/api/gas/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_data', type: 'Documents' })
        });
        const dDocs = await resDocs.json();
        if (dDocs.status === 'success' && !dDocs.mocked) {
          docs = dDocs.data || [];
        } else {
          docs = localStorage.getItem('mgm_documents') ? JSON.parse(localStorage.getItem('mgm_documents')!) : [];
        }
      } catch (e) {
        docs = localStorage.getItem('mgm_documents') ? JSON.parse(localStorage.getItem('mgm_documents')!) : [];
      }

      const updatedApps = [...data];
      let hasUpdates = false;

      for (let i = 0; i < updatedApps.length; i++) {
        const app = updatedApps[i];
        
        // Only analyze if status is Applied or Pending
        const status = String(app.status || app.Status || '').toLowerCase();
        const isPending = status === 'applied' || status === 'pending';
        
        if (isPending && !app.cvScore && !analyzingCVs[app.id || app.ID]) {
          const jobId = app.jobId || app.JobId;
          const userId = app.userId || app.UserID;
          const job = jobs.find((j: any) => String(j.id) === String(jobId) || j.title === (app.jobTitle || app.JobTitle));
          
          const cvDoc = docs.find((d: any) => (String(d.UserID) === String(userId) || String(d.userId) === String(userId)) && (d.DocumentType === 'CV' || d.documentType === 'CV'));
          
          if (job && cvDoc && (cvDoc.FileUrl || cvDoc.fileUrl)) {
            setAnalyzingCVs(prev => ({ ...prev, [app.id || app.ID]: true }));
            
            try {
              const res = await fetch('/api/ai/screen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  resumeUrl: cvDoc.FileUrl || cvDoc.fileUrl,
                  jobDescription: job.description + "\\nPersyaratan: " + job.requirements.join(", ")
                })
              });
              
              const resData = await res.json();
              if (resData.result) {
                app.cvScore = resData.result.score;
                app.cvSuggestion = resData.result.suggestion;
                hasUpdates = true;
                
                // Update local storage
                const storedApps = localStorage.getItem('mgm_applications') ? JSON.parse(localStorage.getItem('mgm_applications')!) : [];
                const updatedStored = storedApps.map((a: any) => (a.id === (app.id || app.ID)) ? { ...a, cvScore: app.cvScore, cvSuggestion: app.cvSuggestion } : a);
                localStorage.setItem('mgm_applications', JSON.stringify(updatedStored));
                
                // Try sync to GAS sheet
                try {
                  await fetch('/api/gas/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'update_application_cv_score',
                      applicationId: app.id || app.ID,
                      cvScore: app.cvScore,
                      cvSuggestion: app.cvSuggestion
                    })
                  });
                } catch (e) {
                  console.error("Failed to sync CV Score to GAS", e);
                }
              }
            } catch (err) {
              console.error("Failed to analyze CV for app", app.id || app.ID, err);
            } finally {
              setAnalyzingCVs(prev => ({ ...prev, [app.id || app.ID]: false }));
            }
          } else if (job && !cvDoc) {
             const localCVText = localStorage.getItem('mgm_user_cv');
             if (localCVText) {
                setAnalyzingCVs(prev => ({ ...prev, [app.id || app.ID]: true }));
                try {
                  const res = await fetch('/api/ai/screen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      resumeText: localCVText,
                      jobDescription: job.description + "\\nPersyaratan: " + job.requirements.join(", ")
                    })
                  });
                  const resData = await res.json();
                  if (resData.result) {
                    app.cvScore = resData.result.score;
                    app.cvSuggestion = resData.result.suggestion;
                    hasUpdates = true;
                    // Update local storage
                    const storedApps = localStorage.getItem('mgm_applications') ? JSON.parse(localStorage.getItem('mgm_applications')!) : [];
                    const updatedStored = storedApps.map((a: any) => (a.id === (app.id || app.ID)) ? { ...a, cvScore: app.cvScore, cvSuggestion: app.cvSuggestion } : a);
                    localStorage.setItem('mgm_applications', JSON.stringify(updatedStored));

                    // Try sync to GAS sheet
                    try {
                      await fetch('/api/gas/proxy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'update_application_cv_score',
                          applicationId: app.id || app.ID,
                          cvScore: app.cvScore,
                          cvSuggestion: app.cvSuggestion
                        })
                      });
                    } catch (e) {
                      console.error("Failed to sync CV Score to GAS", e);
                    }
                  }
                } catch (e) {
                } finally {
                  setAnalyzingCVs(prev => ({ ...prev, [app.id || app.ID]: false }));
                }
             }
          }
        }
      }

      if (hasUpdates) {
        setData([...updatedApps]);
      }
    };

    analyzePendingCVs();
  }, [data, activeTab]);
`;

content = content.replace(/  useEffect\(\(\) => \{\n    const analyzePendingCVs = async \(\) => \{[\s\S]*?analyzePendingCVs\(\);\n  \}, \[data, activeTab\]\);/, correctLogic.trim());

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);

