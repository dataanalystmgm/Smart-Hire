import React, { useState, useEffect } from 'react';
import { getTests, saveTests } from '../data/tests';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function AdminTestsEditor() {
  const [tests, setTests] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');

  // New test type form states
  const [showAddTestForm, setShowAddTestForm] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestDesc, setNewTestDesc] = useState('');
  const [newTestDuration, setNewTestDuration] = useState('15 Min');

  useEffect(() => {
    setTests(getTests());
  }, []);

  const handleSave = () => {
    saveTests(tests);
    alert('Konfigurasi soal dan jenis tes berhasil disimpan!');
  };

  const updateTestField = (testId: string, field: string, value: string) => {
    setTests(tests.map(t => t.id === testId ? { ...t, [field]: value } : t));
  };

  const handleAddTestType = () => {
    if (!newTestName || !newTestDesc || !newTestDuration) {
      alert('Semua kolom (Nama, Durasi, Deskripsi) wajib diisi.');
      return;
    }
    
    const newId = 'test_' + Math.random().toString(36).substr(2, 9);
    const newTest = {
      id: newId,
      name: newTestName.trim(),
      desc: newTestDesc.trim(),
      duration: newTestDuration.trim(),
      questions: []
    };

    const updated = [...tests, newTest];
    setTests(updated);
    saveTests(updated);

    setNewTestName('');
    setNewTestDesc('');
    setNewTestDuration('15 Min');
    setShowAddTestForm(false);

    alert(`Jenis tes "${newTest.name}" berhasil ditambahkan! Silakan tambahkan butir pertanyaan di bawah.`);
  };

  const handleRemoveTest = (testId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh instrumen tes ini beserta semua pertanyaannya?')) {
      const updated = tests.filter(t => t.id !== testId);
      setTests(updated);
      saveTests(updated);
      alert('Jenis tes berhasil dihapus.');
    }
  };

  const addQuestion = (testId: string) => {
    setTests(tests.map(t => {
      if (t.id === testId) {
        const newQ = { id: `q${Date.now()}`, text: 'Pertanyaan baru', type: 'text' };
        return { ...t, questions: [...(t.questions || []), newQ] };
      }
      return t;
    }));
  };

  const updateQuestion = (testId: string, qId: string, field: string, value: any) => {
    setTests(tests.map(t => {
      if (t.id === testId) {
        return {
          ...t,
          questions: t.questions.map((q: any) => q.id === qId ? { ...q, [field]: value } : q)
        };
      }
      return t;
    }));
  };

  const removeQuestion = (testId: string, qId: string) => {
    setTests(tests.map(t => {
      if (t.id === testId) {
        return { ...t, questions: t.questions.filter((q: any) => q.id !== qId) };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-6">
         <div>
            <h2 className="text-xl font-bold text-mgm-dark">Manajemen Soal & Jenis Tes Online</h2>
            <p className="text-sm text-slate-500 mt-1">Edit jenis tes, durasi pengerjaan, deskripsi, serta butir soal instrumen tes.</p>
         </div>
         <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 md:flex-none p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-mgm-green bg-white font-semibold text-slate-700 shadow-sm"
            >
              <option value="all">Semua Jenis Tes</option>
              {tests.filter(t => t.id !== 'creplin').map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowAddTestForm(!showAddTestForm)} 
              className="bg-mgm-dark text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-opacity-90 transition-all text-sm"
            >
               {showAddTestForm ? 'Batal' : <><Plus className="w-4 h-4 mr-1.5" /> Tambah Tes Baru</>}
            </button>
            <button onClick={handleSave} className="bg-mgm-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-opacity-90 transition-all text-sm">
               <Save className="w-4 h-4 mr-1.5" /> Simpan Perubahan
            </button>
         </div>
      </div>

      {showAddTestForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-6">
          <h3 className="font-bold text-lg text-mgm-dark">Form Tambah Jenis Instrumen Tes Baru</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Nama Tes</label>
              <input 
                type="text" 
                placeholder="Contoh: Tes Integritas & Kejujuran" 
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-mgm-green text-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Durasi Tes (misal: "15 Min")</label>
              <input 
                type="text" 
                placeholder="Contoh: 15 Min" 
                value={newTestDuration}
                onChange={(e) => setNewTestDuration(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-mgm-green text-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Deskripsi Singkat</label>
              <input 
                type="text" 
                placeholder="Contoh: Menguji tingkat kejujuran kandidat." 
                value={newTestDesc}
                onChange={(e) => setNewTestDesc(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-mgm-green text-slate-700 font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setShowAddTestForm(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              type="button" 
              onClick={handleAddTestType}
              className="bg-mgm-green text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-opacity-90 transition-colors"
            >
              Tambah Instrumen
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {tests
          .filter(t => t.id !== 'creplin')
          .filter(t => filterType === 'all' || t.id === filterType)
          .map(test => (
          <div key={test.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative animate-fade-in">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400">ID: {test.id}</span>
                <h3 className="font-bold text-xl text-mgm-dark">{test.name}</h3>
              </div>
              <button 
                onClick={() => handleRemoveTest(test.id)}
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors border border-red-100 shrink-0"
                title="Hapus seluruh jenis tes ini"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus Tes
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Nama Tes</label>
                <input 
                  type="text"
                  value={test.name || ''} 
                  onChange={(e) => updateTestField(test.id, 'name', e.target.value)}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-mgm-green bg-slate-50 font-semibold text-mgm-dark"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Durasi Tes</label>
                <input 
                  type="text"
                  value={test.duration || ''} 
                  onChange={(e) => updateTestField(test.id, 'duration', e.target.value)}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-mgm-green bg-slate-50 font-semibold text-mgm-dark"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Deskripsi Tes</label>
              <textarea 
                value={test.desc || ''} 
                onChange={(e) => updateTestField(test.id, 'desc', e.target.value)}
                className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-slate-50 leading-relaxed outline-none focus:border-mgm-green"
                rows={2}
              />
            </div>
            
            <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">Butir Pertanyaan:</h4>
            <div className="space-y-4 mb-4">
               {(test.questions || []).map((q: any) => (
                 <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                    <button 
                      onClick={() => removeQuestion(test.id, q.id)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="mb-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Pertanyaan</label>
                      <input 
                        type="text" 
                        value={q.text} 
                        onChange={(e) => updateQuestion(test.id, q.id, 'text', e.target.value)}
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-mgm-green font-medium text-slate-700"
                      />
                    </div>
                    <div className="mb-2 w-48">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Tipe</label>
                      <select 
                        value={q.type} 
                        onChange={(e) => updateQuestion(test.id, q.id, 'type', e.target.value)}
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-mgm-green font-semibold text-slate-700 bg-white"
                      >
                        <option value="text">Teks Pendek</option>
                        <option value="longtext">Teks Panjang</option>
                        <option value="boolean">Ya/Tidak</option>
                        <option value="multiple">Pilihan Ganda</option>
                      </select>
                    </div>
                    {q.type === 'multiple' && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Opsi (Pisahkan dengan koma)</label>
                        <input 
                          type="text" 
                          value={(q.options || []).join(', ')} 
                          onChange={(e) => updateQuestion(test.id, q.id, 'options', e.target.value.split(',').map((s: string) => s.trim()))}
                          className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-mgm-green"
                          placeholder="Opsi 1, Opsi 2, Opsi 3"
                        />
                      </div>
                    )}
                 </div>
               ))}
            </div>

            <button 
              onClick={() => addQuestion(test.id)}
              className="flex items-center text-sm font-medium text-mgm-green hover:text-mgm-dark transition-colors bg-mgm-light px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Pertanyaan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
