const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminTestsEditor.tsx', 'utf8');

const matchBtn = `<button onClick={handleSave} className="bg-mgm-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-opacity-90 transition-all text-sm">
               <Save className="w-4 h-4 mr-1.5" /> Simpan Perubahan
            </button>`;

const replaceBtn = `<div className="flex gap-2">
            <button 
                onClick={() => {
                  if (confirm('Anda yakin ingin mereset semua tes ke default pabrik? Perubahan Anda akan hilang.')) {
                    localStorage.removeItem('mgm_tests');
                    window.location.reload();
                  }
                }}
                className="bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-slate-300 transition-all text-sm"
              >
                Reset Default
              </button>
            <button onClick={handleSave} className="bg-mgm-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-opacity-90 transition-all text-sm">
               <Save className="w-4 h-4 mr-1.5" /> Simpan Perubahan
            </button>
            </div>`;

content = content.replace(matchBtn, replaceBtn);
fs.writeFileSync('src/pages/AdminTestsEditor.tsx', content, 'utf8');
