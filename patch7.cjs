const fs = require('fs');

let content = fs.readFileSync('src/data/tests.ts', 'utf8');

const keys = {
  meneliti_teks: {"mt1":"Ya","mt2":"Tidak","mt3":"Ya","mt4":"Tidak","mt5":"Ya","mt6":"Ya","mt7":"Tidak","mt8":"Ya","mt9":"Ya","mt10":"Tidak","mt11":"Ya","mt12":"Tidak","mt13":"Ya","mt14":"Ya","mt15":"Tidak","mt16":"Ya","mt17":"Ya","mt18":"Tidak","mt19":"Ya","mt20":"Tidak","mt21":"Ya","mt22":"Ya","mt23":"Tidak","mt24":"Ya","mt25":"Tidak","mt26":"Ya","mt27":"Ya","mt28":"Ya","mt29":"Tidak","mt30":"Ya"},
  silogisme: {"sl1":"Socrates bisa mati","sl2":"Budi memakai seragam","sl3":"Hujan tidak turun","sl4":"Beberapa mahasiswa pintar","sl5":"Anjing bukan burung","sl6":"Sebagian pelamar kerja dipanggil wawancara","sl7":"Sebagian yang mendapat nilai bagus rajin belajar","sl8":"Barang C paling murah","sl9":"Amir tidak lulus ujian","sl10":"Sebagian kucing bulunya putih","sl11":"Sebagian A adalah C","sl12":"Sebagian ahli kesehatan bekerja di rumah sakit","sl13":"Tidak ada pemuda yang pemalas","sl14":"Jika saya belajar, saya lulus ujian","sl15":"Paus bukan ikan","sl16":"Sebagian karyawan akan ditegur","sl17":"Sebagian kendaraan bermotor membutuhkan bahan bakar","sl18":"Jamur bukan tanaman hijau","sl19":"Tidak dapat disimpulkan (bisa karena sebab lain)","sl20":"Tidak dapat disimpulkan","sl21":"Sebagian pelaut memiliki fisik kuat","sl22":"Matahari mungkin bukan bintang dalam konteks kalimat pertama","sl23":"Budi kenyang","sl24":"Sebagian guru matematika disukai siswa","sl25":"Tidak dapat disimpulkan","sl26":"Kelelawar adalah mamalia","sl27":"Sebagian pria bukan polisi","sl28":"Tidak ada X yang Z","sl29":"Alarm tidak berbunyi","sl30":"Sebagian pohon mangga daunnya tidak rindang"},
  analogi_verbal: {"av1":"Bulan","av2":"Apotek","av3":"Lapar","av4":"Berenang","av5":"Hitam","av6":"Kantor","av7":"Manusia","av8":"Bintang","av9":"Memotong","av10":"Selatan","av11":"Kejahatan","av12":"Katak","av13":"Es","av14":"Mendengar","av15":"Kereta Api","av16":"Langit","av17":"Pendek","av18":"Haus","av19":"Kain","av20":"Bising","av21":"Miskin","av22":"Suhu","av23":"Asin","av24":"Bandara","av25":"Mendengar","av26":"Burung","av27":"Kepala","av28":"Selasa","av29":"Cahaya","av30":"Sempit"},
  logika_gambar: {"lg1":"A","lg2":"A","lg3":"A","lg4":"A","lg5":"A","lg6":"A","lg7":"A","lg8":"A","lg9":"A","lg10":"A","lg11":"A","lg12":"A","lg13":"A","lg14":"A","lg15":"A","lg16":"A","lg17":"A","lg18":"A","lg19":"A","lg20":"A"}
};

// We need to parse tests, inject keyAnswer, and re-string.
// The easiest is probably to parse the file using a regex, evaluate it, inject, stringify.
const match = content.match(/export const defaultTests = (\[[\s\S]*?\]);\s*export const getTests/);
if (match) {
  let jsObj = match[1];
  let tests = eval(jsObj);
  
  tests.forEach(test => {
    if (keys[test.id]) {
      test.questions.forEach(q => {
        if (keys[test.id][q.id]) {
          q.keyAnswer = keys[test.id][q.id];
        }
      });
    }
  });

  const newArrayStr = JSON.stringify(tests, null, 2);
  content = content.replace(match[1], newArrayStr);
  fs.writeFileSync('src/data/tests.ts', content, 'utf8');
}
