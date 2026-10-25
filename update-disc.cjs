const fs = require('fs');
let content = fs.readFileSync('src/data/tests.ts', 'utf8');

const replacement = `  { id: 'disc', name: 'Tes DISC (Kepribadian)', duration: '15 Min', desc: 'Tes untuk mengukur karakteristik perilaku individu.', questions: [
    { id: "disc1", text: "Manakah yang paling menggambarkan Anda?", type: "multiple", options: ["Suka tantangan dan hasil cepat", "Suka bergaul dan optimis", "Tenang dan sabar", "Teliti dan perfeksionis"] },
    { id: "disc2", text: "Dalam bekerja, saya lebih suka:", type: "multiple", options: ["Mengambil kendali", "Bekerja sama dalam tim", "Mengikuti prosedur", "Menganalisis data"] },
    { id: "disc3", text: "Orang lain melihat saya sebagai:", type: "multiple", options: ["Tegas", "Antusias", "Pendengar yang baik", "Kritis"] },
    { id: "disc4", text: "Saat menghadapi masalah, saya:", type: "multiple", options: ["Segera mengambil keputusan", "Mencari ide dari orang lain", "Meminta panduan", "Mengumpulkan informasi"] },
    { id: "disc5", text: "Saya merasa paling termotivasi oleh:", type: "multiple", options: ["Pencapaian dan kekuasaan", "Pengakuan sosial", "Lingkungan yang stabil", "Standar kualitas yang tinggi"] },
    { id: "disc6", text: "Dalam situasi konflik, saya biasanya:", type: "multiple", options: ["Menghadapinya secara langsung", "Berusaha mencairkan suasana", "Menghindari konflik", "Mencari akar penyebab masalah"] },
    { id: "disc7", text: "Kelemahan terbesar saya mungkin adalah:", type: "multiple", options: ["Kurang sabar", "Mudah teralih fokus", "Sulit menerima perubahan", "Terlalu kaku"] },
    { id: "disc8", text: "Gaya komunikasi saya cenderung:", type: "multiple", options: ["Langsung dan to the point", "Ekspresif dan bercerita", "Hati-hati dan lembut", "Faktual dan detail"] },
    { id: "disc9", text: "Saat diberi tugas baru, saya:", type: "multiple", options: ["Fokus pada tujuan akhir", "Berdiskusi dengan tim", "Meminta contoh cara mengerjakannya", "Membaca semua instruksi dengan detail"] },
    { id: "disc10", text: "Saya paling tidak suka jika:", type: "multiple", options: ["Merasa tidak memiliki kendali", "Merasa diabaikan", "Terjadi perubahan mendadak", "Mendapat kritik atas pekerjaan saya"] },
    { id: "disc11", text: "Saat berada di lingkungan baru, saya:", type: "multiple", options: ["Mengambil inisiatif", "Berusaha mengenal banyak orang", "Mengamati terlebih dahulu", "Menilai situasi dengan hati-hati"] },
    { id: "disc12", text: "Saya merasa bangga ketika:", type: "multiple", options: ["Mencapai target yang sulit", "Mendapat pujian dari orang lain", "Membantu orang lain berhasil", "Menghasilkan pekerjaan tanpa kesalahan"] },
    { id: "disc13", text: "Dalam mengambil risiko, saya:", type: "multiple", options: ["Berani mengambil risiko tinggi", "Cenderung ikut arus", "Menghindari risiko sebisa mungkin", "Mengkalkulasi risiko secara detail"] },
    { id: "disc14", text: "Saat bekerja di bawah tekanan, saya:", type: "multiple", options: ["Merasa tertantang", "Mencari dukungan teman", "Berusaha tetap tenang", "Fokus pada prosedur yang benar"] },
    { id: "disc15", text: "Saya lebih suka dipimpin oleh orang yang:", type: "multiple", options: ["Memberikan kebebasan bertindak", "Ramah dan inspiratif", "Mendukung dan bisa diandalkan", "Jelas dan menuntut kualitas"] },
    { id: "disc16", text: "Ketika marah atau kesal, saya cenderung:", type: "multiple", options: ["Mengekspresikannya langsung", "Berbicara dengan suara keras", "Memendamnya", "Menarik diri"] },
    { id: "disc17", text: "Saya ingin dikenal sebagai orang yang:", type: "multiple", options: ["Kuat dan penentu", "Menyenangkan dan ramah", "Setia dan dapat diandalkan", "Pintar dan berpengetahuan"] },
    { id: "disc18", text: "Di waktu luang, saya biasanya:", type: "multiple", options: ["Melakukan aktivitas kompetitif", "Pergi ke acara sosial", "Bersantai bersama keluarga", "Membaca atau mengerjakan hobi yang butuh ketelitian"] },
    { id: "disc19", text: "Saat memberikan umpan balik, saya:", type: "multiple", options: ["Sangat jujur dan langsung", "Menyampaikannya dengan nada positif", "Berhati-hati agar tidak menyinggung", "Fokus pada fakta dan data"] },
    { id: "disc20", text: "Hal yang membuat saya stres adalah:", type: "multiple", options: ["Orang yang lambat", "Penolakan sosial", "Konflik atau ketidakharmonisan", "Ketidakteraturan"] },
    { id: "disc21", text: "Sebagai seorang pemimpin, saya cenderung:", type: "multiple", options: ["Menginstruksikan", "Memotivasi", "Melayani", "Mengevaluasi"] },
    { id: "disc22", text: "Dalam membuat perencanaan, saya:", type: "multiple", options: ["Hanya melihat gambaran besar", "Suka mendiskusikannya", "Merencanakannya secara bertahap", "Sangat detail dan terstruktur"] },
    { id: "disc23", text: "Jika ide saya ditolak, saya:", type: "multiple", options: ["Mencoba memaksakannya", "Merasa tersinggung secara emosional", "Menerima demi kedamaian", "Mempertanyakan alasannya secara logis"] },
    { id: "disc24", text: "Saya belajar hal baru dengan cara:", type: "multiple", options: ["Langsung mencoba (trial and error)", "Belajar bersama orang lain", "Mendapat bimbingan selangkah demi selangkah", "Mempelajari teori dan panduannya"] },
    { id: "disc25", text: "Menurut teman-teman, saya adalah orang yang:", type: "multiple", options: ["Kompetitif", "Humoris", "Pendengar yang baik", "Pemikir"] },
    { id: "disc26", text: "Jika terjadi perubahan aturan secara tiba-tiba, saya:", type: "multiple", options: ["Cepat menyesuaikan diri", "Antusias melihat peluang baru", "Merasa cemas dan butuh waktu", "Mempertanyakan tujuan perubahan tersebut"] },
    { id: "disc27", text: "Saya paling tidak nyaman jika berada dalam situasi yang:", type: "multiple", options: ["Tidak menantang", "Sepi dan membosankan", "Penuh dengan ketegangan", "Tidak ada kejelasan aturan"] },
    { id: "disc28", text: "Keputusan besar dalam hidup saya biasanya didasarkan pada:", type: "multiple", options: ["Ambisi", "Pengaruh lingkungan", "Keamanan", "Logika"] },
    { id: "disc29", text: "Gaya berpakaian saya sehari-hari cenderung:", type: "multiple", options: ["Praktis dan fungsional", "Mengikuti tren terbaru", "Nyaman dan santai", "Rapi dan konservatif"] },
    { id: "disc30", text: "Saya merasa berhasil jika:", type: "multiple", options: ["Menjadi pemenang", "Disukai banyak orang", "Menciptakan harmoni", "Mengerjakan sesuatu dengan sempurna"] }
  ] }`;

const startIdx = content.indexOf(`  { id: 'disc', name: 'Tes DISC (Kepribadian)'`);
const endIdx = content.indexOf(`  { id: 'creplin', name: 'Tes Kraepelin'`);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + replacement + ',\n' + content.substring(endIdx);
  fs.writeFileSync('src/data/tests.ts', content, 'utf8');
  console.log('Successfully updated questions!');
} else {
  console.log('Could not find start or end index.');
}
