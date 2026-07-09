const fs = require('fs');

const healthQuestions = [
  "Apakah Anda pernah didiagnosis menderita penyakit jantung?",
  "Apakah Anda memiliki tekanan darah tinggi?",
  "Apakah Anda menderita diabetes atau gula darah tinggi?",
  "Apakah Anda memiliki riwayat asma atau sesak napas?",
  "Apakah Anda pernah menjalani operasi besar dalam 5 tahun terakhir?",
  "Apakah Anda sering mengalami sakit kepala parah atau migrain?",
  "Apakah Anda memiliki masalah pencernaan kronis (asam lambung, maag)?",
  "Apakah Anda memiliki riwayat penyakit ginjal?",
  "Apakah Anda memiliki riwayat penyakit hati (hepatitis)?",
  "Apakah Anda pernah menderita TBC atau penyakit paru-paru lainnya?",
  "Apakah Anda memiliki alergi terhadap obat-obatan tertentu?",
  "Apakah Anda memiliki alergi makanan parah?",
  "Apakah Anda saat ini sedang mengonsumsi obat-obatan rutin setiap hari?",
  "Apakah Anda merokok atau pernah merokok dalam jumlah banyak?",
  "Apakah Anda mengonsumsi alkohol secara rutin?",
  "Apakah Anda memiliki riwayat penyakit epilepsi atau kejang?",
  "Apakah Anda sering merasa mudah lelah tanpa alasan yang jelas?",
  "Apakah Anda mengalami penurunan atau kenaikan berat badan drastis akhir-akhir ini?",
  "Apakah Anda memiliki masalah pendengaran?",
  "Apakah Anda memiliki masalah penglihatan yang tidak dapat dikoreksi dengan kacamata?",
  "Apakah Anda sering mengalami nyeri sendi atau rematik?",
  "Apakah Anda memiliki riwayat penyakit tulang belakang atau saraf terjepit?",
  "Apakah Anda memiliki riwayat penyakit kulit kronis?",
  "Apakah Anda sering mengalami gangguan tidur (insomnia)?",
  "Apakah Anda pernah mengalami gangguan kesehatan mental (depresi, kecemasan)?",
  "Apakah Anda memiliki riwayat penyakit tiroid?",
  "Apakah Anda pernah mengalami cedera kepala berat?",
  "Apakah Anda mudah memar atau mengalami pendarahan yang sulit berhenti?",
  "Apakah Anda memiliki riwayat hernia?",
  "Apakah Anda memiliki wasir/ambeien kronis?",
  "Apakah Anda memiliki riwayat batu ginjal atau saluran kemih?",
  "Apakah Anda memiliki riwayat penyakit autoimun?",
  "Apakah Anda pernah pingsan secara tiba-tiba dalam 1 tahun terakhir?",
  "Apakah Anda sering mengalami palpitasi (jantung berdebar keras)?",
  "Apakah Anda pernah mengalami patah tulang yang membutuhkan pen atau plat?",
  "Apakah Anda memiliki riwayat tumor atau kanker?",
  "Apakah Anda sering merasa kesemutan atau mati rasa pada bagian tubuh tertentu?",
  "Apakah Anda memiliki riwayat asma bawaan dari keluarga?",
  "Apakah Anda rutin melakukan olahraga minimal 2 kali seminggu?",
  "Apakah Anda merasa kondisi fisik Anda saat ini cukup sehat untuk bekerja?"
].map((text, i) => ({ id: `h${i+1}`, text: text, type: 'boolean' }));

const analogiData = [
  { p: "Siang : Matahari = Malam : ?", o: ["Bintang", "Bulan", "Gelap", "Tidur"], a: "Bulan" },
  { p: "Buku : Perpustakaan = Obat : ?", o: ["Apotek", "Rumah Sakit", "Dokter", "Pasien"], a: "Apotek" },
  { p: "Air : Haus = Makanan : ?", o: ["Lapar", "Kenyang", "Piring", "Mulut"], a: "Lapar" },
  { p: "Burung : Terbang = Ikan : ?", o: ["Berenang", "Air", "Sirip", "Laut"], a: "Berenang" },
  { p: "Kaca : Bening = Arang : ?", o: ["Hitam", "Api", "Kayu", "Panas"], a: "Hitam" },
  { p: "Murid : Sekolah = Karyawan : ?", o: ["Kantor", "Pekerjaan", "Gaji", "Bos"], a: "Kantor" },
  { p: "Roda : Mobil = Kaki : ?", o: ["Manusia", "Sepatu", "Jalan", "Lari"], a: "Manusia" },
  { p: "Bumi : Planet = Matahari : ?", o: ["Bintang", "Tata Surya", "Panas", "Langit"], a: "Bintang" },
  { p: "Pensil : Menulis = Pisau : ?", o: ["Memotong", "Tajam", "Besi", "Dapur"], a: "Memotong" },
  { p: "Timur : Barat = Utara : ?", o: ["Selatan", "Kompas", "Arah", "Kutub"], a: "Selatan" },
  { p: "Dokter : Penyakit = Polisi : ?", o: ["Kejahatan", "Lalu Lintas", "Pistol", "Penjara"], a: "Kejahatan" },
  { p: "Ulat : Kupu-kupu = Berudu : ?", o: ["Katak", "Air", "Ekor", "Ikan"], a: "Katak" },
  { p: "Panas : Api = Dingin : ?", o: ["Es", "Salju", "Kulkas", "Air"], a: "Es" },
  { p: "Buta : Melihat = Tuli : ?", o: ["Mendengar", "Bicara", "Telinga", "Suara"], a: "Mendengar" },
  { p: "Pilot : Pesawat = Masinis : ?", o: ["Kereta Api", "Stasiun", "Rel", "Gerbong"], a: "Kereta Api" },
  { p: "Rumput : Lapangan = Bintang : ?", o: ["Langit", "Malam", "Bulan", "Angkasa"], a: "Langit" },
  { p: "Tinggi : Rendah = Panjang : ?", o: ["Pendek", "Jauh", "Meter", "Kecil"], a: "Pendek" },
  { p: "Tidur : Ngantuk = Minum : ?", o: ["Haus", "Air", "Gelas", "Kenyang"], a: "Haus" },
  { p: "Kayu : Meja = Benang : ?", o: ["Kain", "Jarum", "Pakaian", "Kapas"], a: "Kain" },
  { p: "Cahaya : Terang = Suara : ?", o: ["Bising", "Telinga", "Musik", "Gema"], a: "Bising" },
  { p: "Rambut : Botak = Uang : ?", o: ["Miskin", "Kaya", "Dompet", "Bank"], a: "Miskin" },
  { p: "Timbangan : Berat = Termometer : ?", o: ["Suhu", "Panas", "Dingin", "Cuaca"], a: "Suhu" },
  { p: "Gula : Manis = Garam : ?", o: ["Asin", "Laut", "Putih", "Bumbu"], a: "Asin" },
  { p: "Kapal : Pelabuhan = Pesawat : ?", o: ["Bandara", "Udara", "Langit", "Terminal"], a: "Bandara" },
  { p: "Mata : Melihat = Telinga : ?", o: ["Mendengar", "Suara", "Kuping", "Tuli"], a: "Mendengar" },
  { p: "Tikus : Kucing = Cacing : ?", o: ["Burung", "Tanah", "Ular", "Ayam"], a: "Burung" },
  { p: "Sepatu : Kaki = Topi : ?", o: ["Kepala", "Rambut", "Panas", "Matahari"], a: "Kepala" },
  { p: "Januari : Februari = Senin : ?", o: ["Selasa", "Minggu", "Rabu", "Hari"], a: "Selasa" },
  { p: "Kering : Air = Gelap : ?", o: ["Cahaya", "Malam", "Hitam", "Lampu"], a: "Cahaya" },
  { p: "Besar : Kecil = Lebar : ?", o: ["Sempit", "Panjang", "Luas", "Tinggi"], a: "Sempit" }
];

const analogiQuestions = analogiData.map((d, i) => ({ id: `av${i+1}`, text: d.p, type: 'multiple', options: d.o }));

const teksData = [
  { a: "Jl. Merdeka Raya No. 45 Blok C", b: "Jl. Merdeka Raya No. 45 Blok C" },
  { a: "Ahmad Zainuddin B.Sc", b: "Ahmad Zainudin B.Sc" },
  { a: "PT. Maju Mundur Sejahtera Tbk", b: "PT. Maju Mundur Sejahtera Tbk" },
  { a: "0812-3456-7890", b: "0812-3456-7809" },
  { a: "Rp. 1.250.000,00", b: "Rp. 1.250.000,00" },
  { a: "Kecamatan Sukamaju, Kelurahan Sukabakti", b: "Kecamatan Sukamaju, Kelurahan Sukabakti" },
  { a: "Gedung Cyber Lantai 12A", b: "Gedung Cyber Lantai 12B" },
  { a: "145.789.023.1", b: "145.789.023.1" },
  { a: "Jl. Pangeran Diponegoro KM 14", b: "Jl. Pangeran Diponegoro KM 14" },
  { a: "XJ-9021-AA", b: "XJ-9012-AA" },
  { a: "No. Rek: 123-456-789", b: "No. Rek: 123-456-789" },
  { a: "dr. Herman Santoso, Sp.PD", b: "dr. Herman Santosa, Sp.PD" },
  { a: "www.perusahaan-hebat.com/karier", b: "www.perusahaan-hebat.com/karier" },
  { a: "Surat Edaran No. 12/SE/2023", b: "Surat Edaran No. 12/SE/2023" },
  { a: "15 Oktober 1995", b: "15 November 1995" },
  { a: "abcde12345vwxyz", b: "abcde12345vwxyz" },
  { a: "Invoice #INV-2023-11-004", b: "Invoice #INV-2023-11-004" },
  { a: "NIP: 198001012005011003", b: "NIP: 198001012005011008" },
  { a: "Kompleks Perumahan Asri Indah", b: "Kompleks Perumahan Asri Indah" },
  { a: "Gudang Logistik Sektor B", b: "Gudang Logistik Sektor D" },
  { a: "Plaza Indonesia Lt. Dasar Unit 5", b: "Plaza Indonesia Lt. Dasar Unit 5" },
  { a: "Rp. 9.999.000,00", b: "Rp. 9.999.000,00" },
  { a: "10110011", b: "10110010" },
  { a: "Sertifikat HGB No. 12345", b: "Sertifikat HGB No. 12345" },
  { a: "Kepala Departemen IT", b: "Kepala Depatemen IT" },
  { a: "Gedung Graha Irama Lt. 11", b: "Gedung Graha Irama Lt. 11" },
  { a: "Jl. Jenderal Sudirman Kav. 25-26", b: "Jl. Jenderal Sudirman Kav. 25-26" },
  { a: "A1B2 C3D4 E5F6", b: "A1B2 C3D4 E5F6" },
  { a: "PO Box 1234 Jakarta Pusat", b: "PO Box 1243 Jakarta Pusat" },
  { a: "www.tokoonline-murah.co.id", b: "www.tokoonline-murah.co.id" }
];

const menelitiTeksQuestions = teksData.map((d, i) => ({
  id: `mt${i+1}`, text: `Apakah teks A dan teks B ini identik?\nA: ${d.a}\nB: ${d.b}`, type: 'boolean'
}));

const silogismeData = [
  { p: "Semua manusia bisa mati. Socrates adalah manusia. Kesimpulan?", o: ["Socrates bisa mati", "Socrates bukan manusia", "Socrates tidak bisa mati", "Semua yang bisa mati adalah Socrates"] },
  { p: "Semua karyawan MGM memakai seragam. Budi adalah karyawan MGM. Kesimpulan?", o: ["Budi memakai seragam", "Budi tidak memakai seragam", "Semua yang memakai seragam adalah Budi", "Budi mungkin memakai seragam"] },
  { p: "Jika hujan turun, maka jalanan basah. Jalanan tidak basah. Kesimpulan?", o: ["Hujan tidak turun", "Hujan turun", "Jalanan kering", "Bisa jadi hujan turun"] },
  { p: "Beberapa mahasiswa suka membaca. Semua yang suka membaca pintar. Kesimpulan?", o: ["Beberapa mahasiswa pintar", "Semua mahasiswa pintar", "Tidak ada mahasiswa pintar", "Semua yang pintar adalah mahasiswa"] },
  { p: "Semua burung memiliki sayap. Tidak ada anjing yang memiliki sayap. Kesimpulan?", o: ["Anjing bukan burung", "Burung bukan anjing", "Keduanya benar", "Tidak ada kesimpulan"] },
  { p: "Sebagian pelamar kerja lulus tes. Semua yang lulus tes dipanggil wawancara. Kesimpulan?", o: ["Sebagian pelamar kerja dipanggil wawancara", "Semua pelamar kerja dipanggil wawancara", "Semua yang dipanggil wawancara adalah pelamar kerja", "Tidak ada pelamar kerja yang dipanggil wawancara"] },
  { p: "Semua siswa rajin belajar. Sebagian siswa mendapat nilai bagus. Kesimpulan?", o: ["Sebagian yang mendapat nilai bagus rajin belajar", "Semua yang mendapat nilai bagus rajin belajar", "Sebagian siswa tidak rajin belajar", "Semua siswa mendapat nilai bagus"] },
  { p: "Barang A lebih mahal dari Barang B. Barang C lebih murah dari Barang B. Kesimpulan?", o: ["Barang C paling murah", "Barang A lebih murah dari Barang C", "Barang B paling murah", "Tidak ada yang benar"] },
  { p: "Jika Amir lulus ujian, dia akan dibelikan sepeda. Amir tidak dibelikan sepeda. Kesimpulan?", o: ["Amir tidak lulus ujian", "Amir lulus ujian", "Amir tidak suka sepeda", "Tidak dapat disimpulkan"] },
  { p: "Semua kucing mengeong. Sebagian hewan yang mengeong bulunya putih. Kesimpulan?", o: ["Sebagian kucing bulunya putih", "Semua kucing bulunya putih", "Tidak dapat disimpulkan", "Semua hewan putih mengeong"] },
  { p: "Sebagian A adalah B. Semua B adalah C. Kesimpulan?", o: ["Sebagian A adalah C", "Semua A adalah C", "Semua C adalah A", "Sebagian C adalah B"] },
  { p: "Semua dokter ahli kesehatan. Sebagian dokter bekerja di rumah sakit. Kesimpulan?", o: ["Sebagian ahli kesehatan bekerja di rumah sakit", "Semua ahli kesehatan bekerja di rumah sakit", "Semua yang bekerja di rumah sakit adalah dokter", "Sebagian yang bekerja di rumah sakit bukan ahli kesehatan"] },
  { p: "Tidak ada mahasiswa yang pemalas. Semua pemuda adalah mahasiswa. Kesimpulan?", o: ["Tidak ada pemuda yang pemalas", "Sebagian pemuda pemalas", "Semua mahasiswa adalah pemuda", "Sebagian mahasiswa pemuda"] },
  { p: "Jika saya belajar, saya akan pintar. Jika saya pintar, saya lulus ujian. Kesimpulan?", o: ["Jika saya belajar, saya lulus ujian", "Saya pasti lulus ujian", "Jika saya lulus ujian, saya pasti belajar", "Saya belajar dan lulus ujian"] },
  { p: "Semua ikan bernapas dengan insang. Paus bernapas dengan paru-paru. Kesimpulan?", o: ["Paus bukan ikan", "Paus adalah ikan", "Paus bisa bernapas dengan insang", "Tidak dapat disimpulkan"] },
  { p: "Sebagian karyawan datang terlambat. Semua yang datang terlambat akan ditegur. Kesimpulan?", o: ["Sebagian karyawan akan ditegur", "Semua karyawan akan ditegur", "Semua yang ditegur adalah karyawan", "Sebagian yang ditegur bukan karyawan"] },
  { p: "Semua mobil membutuhkan bahan bakar. Sebagian kendaraan bermotor adalah mobil. Kesimpulan?", o: ["Sebagian kendaraan bermotor membutuhkan bahan bakar", "Semua kendaraan bermotor membutuhkan bahan bakar", "Semua yang membutuhkan bahan bakar adalah mobil", "Sebagian mobil tidak membutuhkan bahan bakar"] },
  { p: "Semua tanaman hijau membutuhkan cahaya matahari. Jamur tidak membutuhkan cahaya matahari. Kesimpulan?", o: ["Jamur bukan tanaman hijau", "Jamur adalah tanaman hijau", "Sebagian jamur membutuhkan cahaya", "Tidak dapat disimpulkan"] },
  { p: "Jika listrik padam, maka lampu mati. Lampu mati. Kesimpulan?", o: ["Tidak dapat disimpulkan (bisa karena sebab lain)", "Listrik pasti padam", "Lampu rusak", "Listrik menyala"] },
  { p: "Semua politisi pintar bicara. Sebagian orang yang pintar bicara adalah pengacara. Kesimpulan?", o: ["Tidak dapat disimpulkan", "Sebagian politisi adalah pengacara", "Semua pengacara adalah politisi", "Sebagian pengacara adalah politisi"] },
  { p: "Sebagian pelaut suka berenang. Semua yang suka berenang memiliki fisik kuat. Kesimpulan?", o: ["Sebagian pelaut memiliki fisik kuat", "Semua pelaut memiliki fisik kuat", "Semua yang memiliki fisik kuat adalah pelaut", "Sebagian yang memiliki fisik kuat bukan pelaut"] },
  { p: "Semua bintang bersinar di malam hari. Matahari bersinar di siang hari. Kesimpulan?", o: ["Matahari mungkin bukan bintang dalam konteks kalimat pertama", "Matahari adalah bintang", "Matahari bersinar di malam hari", "Semua bintang bersinar di siang hari"] },
  { p: "Jika Budi makan nasi, dia kenyang. Budi makan nasi. Kesimpulan?", o: ["Budi kenyang", "Budi lapar", "Budi tidak kenyang", "Budi makan roti"] },
  { p: "Sebagian guru matematika sabar. Semua orang sabar disukai siswa. Kesimpulan?", o: ["Sebagian guru matematika disukai siswa", "Semua guru matematika disukai siswa", "Semua yang disukai siswa adalah guru matematika", "Tidak dapat disimpulkan"] },
  { p: "Semua anak kecil suka bermain. Budi bukan anak kecil. Kesimpulan?", o: ["Tidak dapat disimpulkan", "Budi tidak suka bermain", "Budi suka bermain", "Budi suka diam"] },
  { p: "Semua mamalia menyusui anaknya. Kelelawar menyusui anaknya. Kesimpulan?", o: ["Kelelawar adalah mamalia", "Kelelawar bukan mamalia", "Kelelawar bisa terbang", "Kelelawar adalah burung"] },
  { p: "Tidak ada polisi yang takut gelap. Sebagian pria takut gelap. Kesimpulan?", o: ["Sebagian pria bukan polisi", "Semua pria bukan polisi", "Semua polisi adalah pria", "Sebagian pria adalah polisi"] },
  { p: "Semua X adalah Y. Tidak ada Y yang Z. Kesimpulan?", o: ["Tidak ada X yang Z", "Sebagian X adalah Z", "Semua X adalah Z", "Sebagian Z adalah Y"] },
  { p: "Jika alarm berbunyi, ada bahaya. Tidak ada bahaya. Kesimpulan?", o: ["Alarm tidak berbunyi", "Alarm rusak", "Alarm berbunyi", "Bahaya belum datang"] },
  { p: "Semua pohon berdaun rindang menghasilkan buah. Sebagian pohon mangga tidak menghasilkan buah. Kesimpulan?", o: ["Sebagian pohon mangga daunnya tidak rindang", "Semua pohon mangga daunnya rindang", "Semua pohon mangga menghasilkan buah", "Pohon mangga bukan pohon"] }
];

const silogismeQuestions = silogismeData.map((d, i) => ({ id: `sl${i+1}`, text: d.p, type: 'multiple', options: d.o }));

const gambarData = [
  { p: "Pola 1: Persegi panjang. Pola 2: Persegi. Pola 3: Segitiga. Pola 4: Garis lurus. Apa pola kelima?", o: ["Titik", "Lingkaran", "Sudut", "Bintang"] },
  { p: "Ada sebuah kotak berisi 1 bola, lalu kotak berikutnya berisi 3 bola, lalu kotak berikutnya berisi 6 bola. Berapa bola pada kotak selanjutnya?", o: ["10", "9", "12", "8"] },
  { p: "Jika panah menunjuk ke Atas, lalu Kanan, lalu Bawah, lalu Kiri. Ke arah mana panah selanjutnya?", o: ["Atas", "Bawah", "Kiri", "Kanan"] },
  { p: "Sebuah roda berputar seperempat lingkaran searah jarum jam setiap detiknya. Di mana titik awal berada setelah 4 detik?", o: ["Kembali di posisi awal", "Di posisi berlawanan", "Di sebelah kanan", "Di sebelah kiri"] },
  { p: "Persegi besar dibagi menjadi 4 kotak kecil. Jika 1 kotak diarsir, lalu 2, lalu 3. Apa selanjutnya?", o: ["Semua kotak diarsir (4)", "Kembali 1 diarsir", "Tidak ada yang diarsir", "Hanya setengah yang diarsir"] },
  { p: "Bentuk pertama memiliki 3 sisi, bentuk kedua 4 sisi, bentuk ketiga 5 sisi. Apa bentuk keempat?", o: ["Segienam (6 sisi)", "Lingkaran", "Bujursangkar", "Segitiga"] },
  { p: "Sebuah titik bergerak dari sudut Kiri Atas -> Kanan Atas -> Kanan Bawah -> Kiri Bawah. Kemana titik selanjutnya?", o: ["Kiri Atas", "Tengah", "Kanan Atas", "Kiri Bawah"] },
  { p: "Pola: Hitam, Putih, Abu-abu, Hitam, Putih. Warna apa selanjutnya?", o: ["Abu-abu", "Hitam", "Putih", "Merah"] },
  { p: "Sebuah garis vertikal (|), lalu miring ke kanan (/), lalu horizontal (-). Pola selanjutnya?", o: ["Miring ke kiri (\\)", "Titik", "Lingkaran", "Vertikal (|)"] },
  { p: "Di sebuah grid 3x3, kotak tengah diisi silang, lalu bergeser ke atas. Jika pola terus bergerak melingkar searah jarum jam di kotak luar, dari Atas Tengah ia akan ke?", o: ["Kanan Atas", "Kiri Atas", "Kanan Bawah", "Tengah"] }
];

const gambarQuestions = gambarData.map((d, i) => ({ id: `lg${i+1}`, text: d.p, type: 'multiple', options: d.o }));

const testsDataOutput = `export const defaultTests = [
  { id: 'creplin', name: 'Tes Kraepelin', duration: '20 Min', desc: 'Tes ketelitian dan kecepatan (40 Section x 30 detik).', questions: [] },
  { id: 'health', name: 'Screening Kesehatan Awal', duration: '10 Min', desc: '40 Pertanyaan kuesioner kondisi fisik dasar.', questions: ${JSON.stringify(healthQuestions, null, 4)} },
  { id: 'analogi_verbal', name: 'Tes Analogi Verbal', duration: '12 Min', desc: '30 Soal analogi verbal untuk mengukur logika bahasa.', questions: ${JSON.stringify(analogiQuestions, null, 4)} },
  { id: 'meneliti_teks', name: 'Tes Meneliti Teks', duration: '4 Min', desc: '30 Soal meneliti teks bacaan dengan cepat.', questions: ${JSON.stringify(menelitiTeksQuestions, null, 4)} },
  { id: 'silogisme', name: 'Tes Silogisme', duration: '10 Min', desc: '30 Penalaran logis berdasarkan premis-premis.', questions: ${JSON.stringify(silogismeQuestions, null, 4)} },
  { id: 'logika_gambar', name: 'Tes Logika Gambar', duration: '4 Min', desc: '10 Tes logika berbasis pola gambar visual.', questions: ${JSON.stringify(gambarQuestions, null, 4)} }
];

export const getTests = () => {
  const stored = localStorage.getItem('mgm_tests');
  if (stored) return JSON.parse(stored);
  return defaultTests;
};

export const saveTests = (tests: any) => {
  localStorage.setItem('mgm_tests', JSON.stringify(tests));
};
`;

fs.writeFileSync('src/data/tests.ts', testsDataOutput);
console.log('Successfully wrote src/data/tests.ts');
