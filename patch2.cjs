const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminTestsEditor.tsx', 'utf8');

const matchType = `                        <option value="longtext">Teks Panjang</option>
                        <option value="boolean">Ya/Tidak</option>
                        <option value="multiple">Pilihan Ganda</option>`;

const replaceType = `                        <option value="longtext">Teks Panjang</option>
                        <option value="boolean">Ya/Tidak</option>
                        <option value="multiple">Pilihan Ganda</option>
                        <option value="visual_pattern">Pola Gambar Visual</option>`;

content = content.replace(matchType, replaceType);
fs.writeFileSync('src/pages/AdminTestsEditor.tsx', content, 'utf8');
