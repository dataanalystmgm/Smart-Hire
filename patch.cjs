const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminTestsEditor.tsx', 'utf8');

const replacementOptions = `
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
                    
                    {['multiple', 'boolean', 'visual_pattern'].includes(q.type) && (
                      <div className="mt-2">
                        <label className="text-xs font-semibold text-mgm-green uppercase tracking-wider block mb-1">Kunci Jawaban</label>
                        <input 
                          type="text" 
                          value={q.keyAnswer || ''} 
                          onChange={(e) => updateQuestion(test.id, q.id, 'keyAnswer', e.target.value)}
                          className="w-full p-2 text-sm border border-mgm-green rounded-lg outline-none focus:ring-2 focus:ring-mgm-green/20"
                          placeholder="Masukkan kunci jawaban (Contoh: Ya, A, B, dsb)"
                        />
                      </div>
                    )}

                    {q.type === 'visual_pattern' && (
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1">URL Gambar Soal Utama (Opsional)</label>
                          <input 
                            type="text" 
                            value={q.imageUrl || ''} 
                            onChange={(e) => updateQuestion(test.id, q.id, 'imageUrl', e.target.value)}
                            className="w-full p-2 text-sm border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="https://example.com/image.png"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1">URL Opsi A (Opsional)</label>
                          <input type="text" value={q.optionImages?.A || ''} onChange={(e) => updateQuestion(test.id, q.id, 'optionImages', { ...q.optionImages, A: e.target.value })} className="w-full p-2 text-sm border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 mb-1" placeholder="URL Opsi A" />
                          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1">URL Opsi B (Opsional)</label>
                          <input type="text" value={q.optionImages?.B || ''} onChange={(e) => updateQuestion(test.id, q.id, 'optionImages', { ...q.optionImages, B: e.target.value })} className="w-full p-2 text-sm border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 mb-1" placeholder="URL Opsi B" />
                          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1">URL Opsi C (Opsional)</label>
                          <input type="text" value={q.optionImages?.C || ''} onChange={(e) => updateQuestion(test.id, q.id, 'optionImages', { ...q.optionImages, C: e.target.value })} className="w-full p-2 text-sm border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 mb-1" placeholder="URL Opsi C" />
                          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1">URL Opsi D (Opsional)</label>
                          <input type="text" value={q.optionImages?.D || ''} onChange={(e) => updateQuestion(test.id, q.id, 'optionImages', { ...q.optionImages, D: e.target.value })} className="w-full p-2 text-sm border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="URL Opsi D" />
                        </div>
                      </div>
                    )}
`;

const matchStr = `                    {q.type === 'multiple' && (
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
                    )}`;

content = content.replace(matchStr, replacementOptions);
fs.writeFileSync('src/pages/AdminTestsEditor.tsx', content, 'utf8');
