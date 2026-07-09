export const defaultTests = [
  { id: 'creplin', name: 'Tes Kraepelin', duration: '20 Min', desc: 'Tes ketelitian dan kecepatan (40 Section x 30 detik).', questions: [] },
  { id: 'health', name: 'Screening Kesehatan Awal', duration: '10 Min', desc: '40 Pertanyaan kuesioner kondisi fisik dasar.', questions: [
    {
        "id": "h1",
        "text": "Apakah Anda pernah didiagnosis menderita penyakit jantung?",
        "type": "boolean"
    },
    {
        "id": "h2",
        "text": "Apakah Anda memiliki tekanan darah tinggi?",
        "type": "boolean"
    },
    {
        "id": "h3",
        "text": "Apakah Anda menderita diabetes atau gula darah tinggi?",
        "type": "boolean"
    },
    {
        "id": "h4",
        "text": "Apakah Anda memiliki riwayat asma atau sesak napas?",
        "type": "boolean"
    },
    {
        "id": "h5",
        "text": "Apakah Anda pernah menjalani operasi besar dalam 5 tahun terakhir?",
        "type": "boolean"
    },
    {
        "id": "h6",
        "text": "Apakah Anda sering mengalami sakit kepala parah atau migrain?",
        "type": "boolean"
    },
    {
        "id": "h7",
        "text": "Apakah Anda memiliki masalah pencernaan kronis (asam lambung, maag)?",
        "type": "boolean"
    },
    {
        "id": "h8",
        "text": "Apakah Anda memiliki riwayat penyakit ginjal?",
        "type": "boolean"
    },
    {
        "id": "h9",
        "text": "Apakah Anda memiliki riwayat penyakit hati (hepatitis)?",
        "type": "boolean"
    },
    {
        "id": "h10",
        "text": "Apakah Anda pernah menderita TBC atau penyakit paru-paru lainnya?",
        "type": "boolean"
    },
    {
        "id": "h11",
        "text": "Apakah Anda memiliki alergi terhadap obat-obatan tertentu?",
        "type": "boolean"
    },
    {
        "id": "h12",
        "text": "Apakah Anda memiliki alergi makanan parah?",
        "type": "boolean"
    },
    {
        "id": "h13",
        "text": "Apakah Anda saat ini sedang mengonsumsi obat-obatan rutin setiap hari?",
        "type": "boolean"
    },
    {
        "id": "h14",
        "text": "Apakah Anda merokok atau pernah merokok dalam jumlah banyak?",
        "type": "boolean"
    },
    {
        "id": "h15",
        "text": "Apakah Anda mengonsumsi alkohol secara rutin?",
        "type": "boolean"
    },
    {
        "id": "h16",
        "text": "Apakah Anda memiliki riwayat penyakit epilepsi atau kejang?",
        "type": "boolean"
    },
    {
        "id": "h17",
        "text": "Apakah Anda sering merasa mudah lelah tanpa alasan yang jelas?",
        "type": "boolean"
    },
    {
        "id": "h18",
        "text": "Apakah Anda mengalami penurunan atau kenaikan berat badan drastis akhir-akhir ini?",
        "type": "boolean"
    },
    {
        "id": "h19",
        "text": "Apakah Anda memiliki masalah pendengaran?",
        "type": "boolean"
    },
    {
        "id": "h20",
        "text": "Apakah Anda memiliki masalah penglihatan yang tidak dapat dikoreksi dengan kacamata?",
        "type": "boolean"
    },
    {
        "id": "h21",
        "text": "Apakah Anda sering mengalami nyeri sendi atau rematik?",
        "type": "boolean"
    },
    {
        "id": "h22",
        "text": "Apakah Anda memiliki riwayat penyakit tulang belakang atau saraf terjepit?",
        "type": "boolean"
    },
    {
        "id": "h23",
        "text": "Apakah Anda memiliki riwayat penyakit kulit kronis?",
        "type": "boolean"
    },
    {
        "id": "h24",
        "text": "Apakah Anda sering mengalami gangguan tidur (insomnia)?",
        "type": "boolean"
    },
    {
        "id": "h25",
        "text": "Apakah Anda pernah mengalami gangguan kesehatan mental (depresi, kecemasan)?",
        "type": "boolean"
    },
    {
        "id": "h26",
        "text": "Apakah Anda memiliki riwayat penyakit tiroid?",
        "type": "boolean"
    },
    {
        "id": "h27",
        "text": "Apakah Anda pernah mengalami cedera kepala berat?",
        "type": "boolean"
    },
    {
        "id": "h28",
        "text": "Apakah Anda mudah memar atau mengalami pendarahan yang sulit berhenti?",
        "type": "boolean"
    },
    {
        "id": "h29",
        "text": "Apakah Anda memiliki riwayat hernia?",
        "type": "boolean"
    },
    {
        "id": "h30",
        "text": "Apakah Anda memiliki wasir/ambeien kronis?",
        "type": "boolean"
    },
    {
        "id": "h31",
        "text": "Apakah Anda memiliki riwayat batu ginjal atau saluran kemih?",
        "type": "boolean"
    },
    {
        "id": "h32",
        "text": "Apakah Anda memiliki riwayat penyakit autoimun?",
        "type": "boolean"
    },
    {
        "id": "h33",
        "text": "Apakah Anda pernah pingsan secara tiba-tiba dalam 1 tahun terakhir?",
        "type": "boolean"
    },
    {
        "id": "h34",
        "text": "Apakah Anda sering mengalami palpitasi (jantung berdebar keras)?",
        "type": "boolean"
    },
    {
        "id": "h35",
        "text": "Apakah Anda pernah mengalami patah tulang yang membutuhkan pen atau plat?",
        "type": "boolean"
    },
    {
        "id": "h36",
        "text": "Apakah Anda memiliki riwayat tumor atau kanker?",
        "type": "boolean"
    },
    {
        "id": "h37",
        "text": "Apakah Anda sering merasa kesemutan atau mati rasa pada bagian tubuh tertentu?",
        "type": "boolean"
    },
    {
        "id": "h38",
        "text": "Apakah Anda memiliki riwayat asma bawaan dari keluarga?",
        "type": "boolean"
    },
    {
        "id": "h39",
        "text": "Apakah Anda rutin melakukan olahraga minimal 2 kali seminggu?",
        "type": "boolean"
    },
    {
        "id": "h40",
        "text": "Apakah Anda merasa kondisi fisik Anda saat ini cukup sehat untuk bekerja?",
        "type": "boolean"
    }
] },
  { id: 'analogi_verbal', name: 'Tes Analogi Verbal', duration: '12 Min', desc: '30 Soal analogi verbal untuk mengukur logika bahasa.', questions: [
    {
        "id": "av1",
        "text": "Siang : Matahari = Malam : ?",
        "type": "multiple",
        "options": [
            "Bintang",
            "Bulan",
            "Gelap",
            "Tidur"
        ]
    },
    {
        "id": "av2",
        "text": "Buku : Perpustakaan = Obat : ?",
        "type": "multiple",
        "options": [
            "Apotek",
            "Rumah Sakit",
            "Dokter",
            "Pasien"
        ]
    },
    {
        "id": "av3",
        "text": "Air : Haus = Makanan : ?",
        "type": "multiple",
        "options": [
            "Lapar",
            "Kenyang",
            "Piring",
            "Mulut"
        ]
    },
    {
        "id": "av4",
        "text": "Burung : Terbang = Ikan : ?",
        "type": "multiple",
        "options": [
            "Berenang",
            "Air",
            "Sirip",
            "Laut"
        ]
    },
    {
        "id": "av5",
        "text": "Kaca : Bening = Arang : ?",
        "type": "multiple",
        "options": [
            "Hitam",
            "Api",
            "Kayu",
            "Panas"
        ]
    },
    {
        "id": "av6",
        "text": "Murid : Sekolah = Karyawan : ?",
        "type": "multiple",
        "options": [
            "Kantor",
            "Pekerjaan",
            "Gaji",
            "Bos"
        ]
    },
    {
        "id": "av7",
        "text": "Roda : Mobil = Kaki : ?",
        "type": "multiple",
        "options": [
            "Manusia",
            "Sepatu",
            "Jalan",
            "Lari"
        ]
    },
    {
        "id": "av8",
        "text": "Bumi : Planet = Matahari : ?",
        "type": "multiple",
        "options": [
            "Bintang",
            "Tata Surya",
            "Panas",
            "Langit"
        ]
    },
    {
        "id": "av9",
        "text": "Pensil : Menulis = Pisau : ?",
        "type": "multiple",
        "options": [
            "Memotong",
            "Tajam",
            "Besi",
            "Dapur"
        ]
    },
    {
        "id": "av10",
        "text": "Timur : Barat = Utara : ?",
        "type": "multiple",
        "options": [
            "Selatan",
            "Kompas",
            "Arah",
            "Kutub"
        ]
    },
    {
        "id": "av11",
        "text": "Dokter : Penyakit = Polisi : ?",
        "type": "multiple",
        "options": [
            "Kejahatan",
            "Lalu Lintas",
            "Pistol",
            "Penjara"
        ]
    },
    {
        "id": "av12",
        "text": "Ulat : Kupu-kupu = Berudu : ?",
        "type": "multiple",
        "options": [
            "Katak",
            "Air",
            "Ekor",
            "Ikan"
        ]
    },
    {
        "id": "av13",
        "text": "Panas : Api = Dingin : ?",
        "type": "multiple",
        "options": [
            "Es",
            "Salju",
            "Kulkas",
            "Air"
        ]
    },
    {
        "id": "av14",
        "text": "Buta : Melihat = Tuli : ?",
        "type": "multiple",
        "options": [
            "Mendengar",
            "Bicara",
            "Telinga",
            "Suara"
        ]
    },
    {
        "id": "av15",
        "text": "Pilot : Pesawat = Masinis : ?",
        "type": "multiple",
        "options": [
            "Kereta Api",
            "Stasiun",
            "Rel",
            "Gerbong"
        ]
    },
    {
        "id": "av16",
        "text": "Rumput : Lapangan = Bintang : ?",
        "type": "multiple",
        "options": [
            "Langit",
            "Malam",
            "Bulan",
            "Angkasa"
        ]
    },
    {
        "id": "av17",
        "text": "Tinggi : Rendah = Panjang : ?",
        "type": "multiple",
        "options": [
            "Pendek",
            "Jauh",
            "Meter",
            "Kecil"
        ]
    },
    {
        "id": "av18",
        "text": "Tidur : Ngantuk = Minum : ?",
        "type": "multiple",
        "options": [
            "Haus",
            "Air",
            "Gelas",
            "Kenyang"
        ]
    },
    {
        "id": "av19",
        "text": "Kayu : Meja = Benang : ?",
        "type": "multiple",
        "options": [
            "Kain",
            "Jarum",
            "Pakaian",
            "Kapas"
        ]
    },
    {
        "id": "av20",
        "text": "Cahaya : Terang = Suara : ?",
        "type": "multiple",
        "options": [
            "Bising",
            "Telinga",
            "Musik",
            "Gema"
        ]
    },
    {
        "id": "av21",
        "text": "Rambut : Botak = Uang : ?",
        "type": "multiple",
        "options": [
            "Miskin",
            "Kaya",
            "Dompet",
            "Bank"
        ]
    },
    {
        "id": "av22",
        "text": "Timbangan : Berat = Termometer : ?",
        "type": "multiple",
        "options": [
            "Suhu",
            "Panas",
            "Dingin",
            "Cuaca"
        ]
    },
    {
        "id": "av23",
        "text": "Gula : Manis = Garam : ?",
        "type": "multiple",
        "options": [
            "Asin",
            "Laut",
            "Putih",
            "Bumbu"
        ]
    },
    {
        "id": "av24",
        "text": "Kapal : Pelabuhan = Pesawat : ?",
        "type": "multiple",
        "options": [
            "Bandara",
            "Udara",
            "Langit",
            "Terminal"
        ]
    },
    {
        "id": "av25",
        "text": "Mata : Melihat = Telinga : ?",
        "type": "multiple",
        "options": [
            "Mendengar",
            "Suara",
            "Kuping",
            "Tuli"
        ]
    },
    {
        "id": "av26",
        "text": "Tikus : Kucing = Cacing : ?",
        "type": "multiple",
        "options": [
            "Burung",
            "Tanah",
            "Ular",
            "Ayam"
        ]
    },
    {
        "id": "av27",
        "text": "Sepatu : Kaki = Topi : ?",
        "type": "multiple",
        "options": [
            "Kepala",
            "Rambut",
            "Panas",
            "Matahari"
        ]
    },
    {
        "id": "av28",
        "text": "Januari : Februari = Senin : ?",
        "type": "multiple",
        "options": [
            "Selasa",
            "Minggu",
            "Rabu",
            "Hari"
        ]
    },
    {
        "id": "av29",
        "text": "Kering : Air = Gelap : ?",
        "type": "multiple",
        "options": [
            "Cahaya",
            "Malam",
            "Hitam",
            "Lampu"
        ]
    },
    {
        "id": "av30",
        "text": "Besar : Kecil = Lebar : ?",
        "type": "multiple",
        "options": [
            "Sempit",
            "Panjang",
            "Luas",
            "Tinggi"
        ]
    }
] },
  { id: 'meneliti_teks', name: 'Tes Meneliti Teks', duration: '4 Min', desc: '30 Soal meneliti teks bacaan dengan cepat.', questions: [
    {
        "id": "mt1",
        "text": "Apakah teks A dan teks B ini identik?\nA: Jl. Merdeka Raya No. 45 Blok C\nB: Jl. Merdeka Raya No. 45 Blok C",
        "type": "boolean"
    },
    {
        "id": "mt2",
        "text": "Apakah teks A dan teks B ini identik?\nA: Ahmad Zainuddin B.Sc\nB: Ahmad Zainudin B.Sc",
        "type": "boolean"
    },
    {
        "id": "mt3",
        "text": "Apakah teks A dan teks B ini identik?\nA: PT. Maju Mundur Sejahtera Tbk\nB: PT. Maju Mundur Sejahtera Tbk",
        "type": "boolean"
    },
    {
        "id": "mt4",
        "text": "Apakah teks A dan teks B ini identik?\nA: 0812-3456-7890\nB: 0812-3456-7809",
        "type": "boolean"
    },
    {
        "id": "mt5",
        "text": "Apakah teks A dan teks B ini identik?\nA: Rp. 1.250.000,00\nB: Rp. 1.250.000,00",
        "type": "boolean"
    },
    {
        "id": "mt6",
        "text": "Apakah teks A dan teks B ini identik?\nA: Kecamatan Sukamaju, Kelurahan Sukabakti\nB: Kecamatan Sukamaju, Kelurahan Sukabakti",
        "type": "boolean"
    },
    {
        "id": "mt7",
        "text": "Apakah teks A dan teks B ini identik?\nA: Gedung Cyber Lantai 12A\nB: Gedung Cyber Lantai 12B",
        "type": "boolean"
    },
    {
        "id": "mt8",
        "text": "Apakah teks A dan teks B ini identik?\nA: 145.789.023.1\nB: 145.789.023.1",
        "type": "boolean"
    },
    {
        "id": "mt9",
        "text": "Apakah teks A dan teks B ini identik?\nA: Jl. Pangeran Diponegoro KM 14\nB: Jl. Pangeran Diponegoro KM 14",
        "type": "boolean"
    },
    {
        "id": "mt10",
        "text": "Apakah teks A dan teks B ini identik?\nA: XJ-9021-AA\nB: XJ-9012-AA",
        "type": "boolean"
    },
    {
        "id": "mt11",
        "text": "Apakah teks A dan teks B ini identik?\nA: No. Rek: 123-456-789\nB: No. Rek: 123-456-789",
        "type": "boolean"
    },
    {
        "id": "mt12",
        "text": "Apakah teks A dan teks B ini identik?\nA: dr. Herman Santoso, Sp.PD\nB: dr. Herman Santosa, Sp.PD",
        "type": "boolean"
    },
    {
        "id": "mt13",
        "text": "Apakah teks A dan teks B ini identik?\nA: www.perusahaan-hebat.com/karier\nB: www.perusahaan-hebat.com/karier",
        "type": "boolean"
    },
    {
        "id": "mt14",
        "text": "Apakah teks A dan teks B ini identik?\nA: Surat Edaran No. 12/SE/2023\nB: Surat Edaran No. 12/SE/2023",
        "type": "boolean"
    },
    {
        "id": "mt15",
        "text": "Apakah teks A dan teks B ini identik?\nA: 15 Oktober 1995\nB: 15 November 1995",
        "type": "boolean"
    },
    {
        "id": "mt16",
        "text": "Apakah teks A dan teks B ini identik?\nA: abcde12345vwxyz\nB: abcde12345vwxyz",
        "type": "boolean"
    },
    {
        "id": "mt17",
        "text": "Apakah teks A dan teks B ini identik?\nA: Invoice #INV-2023-11-004\nB: Invoice #INV-2023-11-004",
        "type": "boolean"
    },
    {
        "id": "mt18",
        "text": "Apakah teks A dan teks B ini identik?\nA: NIP: 198001012005011003\nB: NIP: 198001012005011008",
        "type": "boolean"
    },
    {
        "id": "mt19",
        "text": "Apakah teks A dan teks B ini identik?\nA: Kompleks Perumahan Asri Indah\nB: Kompleks Perumahan Asri Indah",
        "type": "boolean"
    },
    {
        "id": "mt20",
        "text": "Apakah teks A dan teks B ini identik?\nA: Gudang Logistik Sektor B\nB: Gudang Logistik Sektor D",
        "type": "boolean"
    },
    {
        "id": "mt21",
        "text": "Apakah teks A dan teks B ini identik?\nA: Plaza Indonesia Lt. Dasar Unit 5\nB: Plaza Indonesia Lt. Dasar Unit 5",
        "type": "boolean"
    },
    {
        "id": "mt22",
        "text": "Apakah teks A dan teks B ini identik?\nA: Rp. 9.999.000,00\nB: Rp. 9.999.000,00",
        "type": "boolean"
    },
    {
        "id": "mt23",
        "text": "Apakah teks A dan teks B ini identik?\nA: 10110011\nB: 10110010",
        "type": "boolean"
    },
    {
        "id": "mt24",
        "text": "Apakah teks A dan teks B ini identik?\nA: Sertifikat HGB No. 12345\nB: Sertifikat HGB No. 12345",
        "type": "boolean"
    },
    {
        "id": "mt25",
        "text": "Apakah teks A dan teks B ini identik?\nA: Kepala Departemen IT\nB: Kepala Depatemen IT",
        "type": "boolean"
    },
    {
        "id": "mt26",
        "text": "Apakah teks A dan teks B ini identik?\nA: Gedung Graha Irama Lt. 11\nB: Gedung Graha Irama Lt. 11",
        "type": "boolean"
    },
    {
        "id": "mt27",
        "text": "Apakah teks A dan teks B ini identik?\nA: Jl. Jenderal Sudirman Kav. 25-26\nB: Jl. Jenderal Sudirman Kav. 25-26",
        "type": "boolean"
    },
    {
        "id": "mt28",
        "text": "Apakah teks A dan teks B ini identik?\nA: A1B2 C3D4 E5F6\nB: A1B2 C3D4 E5F6",
        "type": "boolean"
    },
    {
        "id": "mt29",
        "text": "Apakah teks A dan teks B ini identik?\nA: PO Box 1234 Jakarta Pusat\nB: PO Box 1243 Jakarta Pusat",
        "type": "boolean"
    },
    {
        "id": "mt30",
        "text": "Apakah teks A dan teks B ini identik?\nA: www.tokoonline-murah.co.id\nB: www.tokoonline-murah.co.id",
        "type": "boolean"
    }
] },
  { id: 'silogisme', name: 'Tes Silogisme', duration: '10 Min', desc: '30 Penalaran logis berdasarkan premis-premis.', questions: [
    {
        "id": "sl1",
        "text": "Semua manusia bisa mati. Socrates adalah manusia. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Socrates bisa mati",
            "Socrates bukan manusia",
            "Socrates tidak bisa mati",
            "Semua yang bisa mati adalah Socrates"
        ]
    },
    {
        "id": "sl2",
        "text": "Semua karyawan MGM memakai seragam. Budi adalah karyawan MGM. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Budi memakai seragam",
            "Budi tidak memakai seragam",
            "Semua yang memakai seragam adalah Budi",
            "Budi mungkin memakai seragam"
        ]
    },
    {
        "id": "sl3",
        "text": "Jika hujan turun, maka jalanan basah. Jalanan tidak basah. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Hujan tidak turun",
            "Hujan turun",
            "Jalanan kering",
            "Bisa jadi hujan turun"
        ]
    },
    {
        "id": "sl4",
        "text": "Beberapa mahasiswa suka membaca. Semua yang suka membaca pintar. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Beberapa mahasiswa pintar",
            "Semua mahasiswa pintar",
            "Tidak ada mahasiswa pintar",
            "Semua yang pintar adalah mahasiswa"
        ]
    },
    {
        "id": "sl5",
        "text": "Semua burung memiliki sayap. Tidak ada anjing yang memiliki sayap. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Anjing bukan burung",
            "Burung bukan anjing",
            "Keduanya benar",
            "Tidak ada kesimpulan"
        ]
    },
    {
        "id": "sl6",
        "text": "Sebagian pelamar kerja lulus tes. Semua yang lulus tes dipanggil wawancara. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian pelamar kerja dipanggil wawancara",
            "Semua pelamar kerja dipanggil wawancara",
            "Semua yang dipanggil wawancara adalah pelamar kerja",
            "Tidak ada pelamar kerja yang dipanggil wawancara"
        ]
    },
    {
        "id": "sl7",
        "text": "Semua siswa rajin belajar. Sebagian siswa mendapat nilai bagus. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian yang mendapat nilai bagus rajin belajar",
            "Semua yang mendapat nilai bagus rajin belajar",
            "Sebagian siswa tidak rajin belajar",
            "Semua siswa mendapat nilai bagus"
        ]
    },
    {
        "id": "sl8",
        "text": "Barang A lebih mahal dari Barang B. Barang C lebih murah dari Barang B. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Barang C paling murah",
            "Barang A lebih murah dari Barang C",
            "Barang B paling murah",
            "Tidak ada yang benar"
        ]
    },
    {
        "id": "sl9",
        "text": "Jika Amir lulus ujian, dia akan dibelikan sepeda. Amir tidak dibelikan sepeda. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Amir tidak lulus ujian",
            "Amir lulus ujian",
            "Amir tidak suka sepeda",
            "Tidak dapat disimpulkan"
        ]
    },
    {
        "id": "sl10",
        "text": "Semua kucing mengeong. Sebagian hewan yang mengeong bulunya putih. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian kucing bulunya putih",
            "Semua kucing bulunya putih",
            "Tidak dapat disimpulkan",
            "Semua hewan putih mengeong"
        ]
    },
    {
        "id": "sl11",
        "text": "Sebagian A adalah B. Semua B adalah C. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian A adalah C",
            "Semua A adalah C",
            "Semua C adalah A",
            "Sebagian C adalah B"
        ]
    },
    {
        "id": "sl12",
        "text": "Semua dokter ahli kesehatan. Sebagian dokter bekerja di rumah sakit. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian ahli kesehatan bekerja di rumah sakit",
            "Semua ahli kesehatan bekerja di rumah sakit",
            "Semua yang bekerja di rumah sakit adalah dokter",
            "Sebagian yang bekerja di rumah sakit bukan ahli kesehatan"
        ]
    },
    {
        "id": "sl13",
        "text": "Tidak ada mahasiswa yang pemalas. Semua pemuda adalah mahasiswa. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Tidak ada pemuda yang pemalas",
            "Sebagian pemuda pemalas",
            "Semua mahasiswa adalah pemuda",
            "Sebagian mahasiswa pemuda"
        ]
    },
    {
        "id": "sl14",
        "text": "Jika saya belajar, saya akan pintar. Jika saya pintar, saya lulus ujian. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Jika saya belajar, saya lulus ujian",
            "Saya pasti lulus ujian",
            "Jika saya lulus ujian, saya pasti belajar",
            "Saya belajar dan lulus ujian"
        ]
    },
    {
        "id": "sl15",
        "text": "Semua ikan bernapas dengan insang. Paus bernapas dengan paru-paru. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Paus bukan ikan",
            "Paus adalah ikan",
            "Paus bisa bernapas dengan insang",
            "Tidak dapat disimpulkan"
        ]
    },
    {
        "id": "sl16",
        "text": "Sebagian karyawan datang terlambat. Semua yang datang terlambat akan ditegur. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian karyawan akan ditegur",
            "Semua karyawan akan ditegur",
            "Semua yang ditegur adalah karyawan",
            "Sebagian yang ditegur bukan karyawan"
        ]
    },
    {
        "id": "sl17",
        "text": "Semua mobil membutuhkan bahan bakar. Sebagian kendaraan bermotor adalah mobil. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian kendaraan bermotor membutuhkan bahan bakar",
            "Semua kendaraan bermotor membutuhkan bahan bakar",
            "Semua yang membutuhkan bahan bakar adalah mobil",
            "Sebagian mobil tidak membutuhkan bahan bakar"
        ]
    },
    {
        "id": "sl18",
        "text": "Semua tanaman hijau membutuhkan cahaya matahari. Jamur tidak membutuhkan cahaya matahari. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Jamur bukan tanaman hijau",
            "Jamur adalah tanaman hijau",
            "Sebagian jamur membutuhkan cahaya",
            "Tidak dapat disimpulkan"
        ]
    },
    {
        "id": "sl19",
        "text": "Jika listrik padam, maka lampu mati. Lampu mati. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Tidak dapat disimpulkan (bisa karena sebab lain)",
            "Listrik pasti padam",
            "Lampu rusak",
            "Listrik menyala"
        ]
    },
    {
        "id": "sl20",
        "text": "Semua politisi pintar bicara. Sebagian orang yang pintar bicara adalah pengacara. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Tidak dapat disimpulkan",
            "Sebagian politisi adalah pengacara",
            "Semua pengacara adalah politisi",
            "Sebagian pengacara adalah politisi"
        ]
    },
    {
        "id": "sl21",
        "text": "Sebagian pelaut suka berenang. Semua yang suka berenang memiliki fisik kuat. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian pelaut memiliki fisik kuat",
            "Semua pelaut memiliki fisik kuat",
            "Semua yang memiliki fisik kuat adalah pelaut",
            "Sebagian yang memiliki fisik kuat bukan pelaut"
        ]
    },
    {
        "id": "sl22",
        "text": "Semua bintang bersinar di malam hari. Matahari bersinar di siang hari. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Matahari mungkin bukan bintang dalam konteks kalimat pertama",
            "Matahari adalah bintang",
            "Matahari bersinar di malam hari",
            "Semua bintang bersinar di siang hari"
        ]
    },
    {
        "id": "sl23",
        "text": "Jika Budi makan nasi, dia kenyang. Budi makan nasi. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Budi kenyang",
            "Budi lapar",
            "Budi tidak kenyang",
            "Budi makan roti"
        ]
    },
    {
        "id": "sl24",
        "text": "Sebagian guru matematika sabar. Semua orang sabar disukai siswa. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian guru matematika disukai siswa",
            "Semua guru matematika disukai siswa",
            "Semua yang disukai siswa adalah guru matematika",
            "Tidak dapat disimpulkan"
        ]
    },
    {
        "id": "sl25",
        "text": "Semua anak kecil suka bermain. Budi bukan anak kecil. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Tidak dapat disimpulkan",
            "Budi tidak suka bermain",
            "Budi suka bermain",
            "Budi suka diam"
        ]
    },
    {
        "id": "sl26",
        "text": "Semua mamalia menyusui anaknya. Kelelawar menyusui anaknya. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Kelelawar adalah mamalia",
            "Kelelawar bukan mamalia",
            "Kelelawar bisa terbang",
            "Kelelawar adalah burung"
        ]
    },
    {
        "id": "sl27",
        "text": "Tidak ada polisi yang takut gelap. Sebagian pria takut gelap. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian pria bukan polisi",
            "Semua pria bukan polisi",
            "Semua polisi adalah pria",
            "Sebagian pria adalah polisi"
        ]
    },
    {
        "id": "sl28",
        "text": "Semua X adalah Y. Tidak ada Y yang Z. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Tidak ada X yang Z",
            "Sebagian X adalah Z",
            "Semua X adalah Z",
            "Sebagian Z adalah Y"
        ]
    },
    {
        "id": "sl29",
        "text": "Jika alarm berbunyi, ada bahaya. Tidak ada bahaya. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Alarm tidak berbunyi",
            "Alarm rusak",
            "Alarm berbunyi",
            "Bahaya belum datang"
        ]
    },
    {
        "id": "sl30",
        "text": "Semua pohon berdaun rindang menghasilkan buah. Sebagian pohon mangga tidak menghasilkan buah. Kesimpulan?",
        "type": "multiple",
        "options": [
            "Sebagian pohon mangga daunnya tidak rindang",
            "Semua pohon mangga daunnya rindang",
            "Semua pohon mangga menghasilkan buah",
            "Pohon mangga bukan pohon"
        ]
    }
] },
  { id: 'logika_gambar', name: 'Tes Logika Gambar', duration: '4 Min', desc: '10 Tes logika berbasis pola gambar visual.', questions: [
    {
        "id": "lg1",
        "text": "Tentukan gambar selanjutnya yang tepat untuk melengkapi pola deret matriks berikut:",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg2",
        "text": "Pilihlah bentuk geometri yang logis untuk melengkapi akumulasi titik pola deret berikut:",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg3",
        "text": "Perhatikan arah rotasi panah berikut. Ke arah mana panah berikutnya menunjuk?",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg4",
        "text": "Pilihlah gambar arsiran kuadran lingkaran yang benar untuk melanjutkan pola berikut:",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg5",
        "text": "Tentukan bentuk poligon berikutnya berdasarkan pertambahan jumlah sisi poligon berikut:",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg6",
        "text": "Berdasarkan jumlah persilangan/irisan garis berikut, pilihlah pola garis selanjutnya yang benar:",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg7",
        "text": "Perhatikan posisi titik di sudut persegi berikut. Manakah gambar kelanjutan sudut yang tepat?",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg8",
        "text": "Tentukan kelanjutan pola lingkaran sepusat (konsentris) berikutnya dengan benar:",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg9",
        "text": "Perhatikan pergerakan jarum garis di dalam kotak berikut. Ke mana jarum selanjutnya mengarah?",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    },
    {
        "id": "lg10",
        "text": "Tentukan bentuk bintang/simbol dengan jumlah sudut yang tepat untuk melengkapi deret berikut:",
        "type": "visual_pattern",
        "options": ["A", "B", "C", "D"]
    }
] }
];

export const getTests = () => {
  const stored = localStorage.getItem('mgm_tests');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return defaultTests;
};

export const saveTests = (tests: any) => {
  localStorage.setItem('mgm_tests', JSON.stringify(tests));
};
