const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminTestsEditor.tsx', 'utf8');

const matchBtn = `<button 
              onClick={handleSave}
              className="flex items-center text-sm font-bold text-white bg-mgm-green hover:bg-mgm-dark transition-colors px-6 py-2.5 rounded-xl shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" /> Simpan Konfigurasi
            </button>`;

const replaceBtn = `<div className="flex gap-2">
              <button 
                onClick={() => {
                  if (confirm('Anda yakin ingin mereset semua tes ke default pabrik? Perubahan Anda akan hilang.')) {
                    localStorage.removeItem('mgm_tests');
                    setTests(getTests());
                    alert('Berhasil di-reset ke default.');
                  }
                }}
                className="flex items-center text-sm font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors px-6 py-2.5 rounded-xl shadow-sm"
              >
                Reset Default
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center text-sm font-bold text-white bg-mgm-green hover:bg-mgm-dark transition-colors px-6 py-2.5 rounded-xl shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" /> Simpan Konfigurasi
              </button>
            </div>`;

content = content.replace(matchBtn, replaceBtn);
fs.writeFileSync('src/pages/AdminTestsEditor.tsx', content, 'utf8');
