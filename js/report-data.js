const IST_SUBTESTS = [
  { key: "SE", name: "Melengkapi Kalimat (SE)", desc: "Mengukur kemampuan berpikir konkret-praktis, pengambilan keputusan, pemahaman realitas, dan kemandirian dalam menilai suatu situasi." },
  { key: "WA", name: "Melengkapi Kata (WA)", desc: "Mengukur kemampuan bahasa dalam menangkap inti makna, empati, serta cara berpikir induktif menggunakan kata-kata." },
  { key: "AN", name: "Persamaan Kata (AN)", desc: "Mengukur fleksibilitas berpikir, kemampuan menghubungkan atau mengkombinasikan konsep, serta daya adaptasi cara berpikir." },
  { key: "GE", name: "Persamaan Sifat (GE)", desc: "Mengukur kemampuan menangkap esensi suatu konsep dan menemukan kesamaan mendasar di antara beberapa hal yang berbeda." },
  { key: "ME", name: "Simbol (ME)", desc: "Mengukur daya ingat, termasuk kemampuan memperhatikan dan menyimpan informasi dalam jangka waktu tertentu." },
  { key: "RA", name: "Berhitung (RA)", desc: "Mengukur kemampuan berpikir logis-matematis dan memecahkan persoalan praktis melalui perhitungan." },
  { key: "ZR", name: "Deret Angka (ZR)", desc: "Mengukur kemampuan analisis pola numerik serta konsistensi cara berpikir yang runtut dalam menarik kesimpulan." },
  { key: "FA", name: "Memilih Bentuk (FA)", desc: "Mengukur kemampuan membayangkan dan menyusun potongan objek visual menjadi satu bentuk yang utuh." },
  { key: "WU", name: "Daya Bayang Ruang (WU)", desc: "Mengukur kemampuan visuospasial, imajinasi, dan fleksibilitas berpikir dalam membayangkan perubahan bentuk ruang." },
];
function istBand(score) {
  const s = score || 0;
  if (s < 70) return { label: "Sangat Rendah" };
  if (s < 90) return { label: "Rendah" };
  if (s < 110) return { label: "Rata-Rata" };
  if (s < 120) return { label: "Tinggi" };
  return { label: "Sangat Tinggi" };
}
function istScalePos(score) { return Math.max(1, Math.min(10, Math.round(((score || 55) - 55) / 9))); }

const PAPI_GROUPS = [
  { group: "ARAH KERJA", dims: [
    { code: "N", label: "Tuntas Kerja", eng: "Need to finish task", desc: "Kebutuhan untuk menyelesaikan pekerjaan hingga tuntas." },
    { code: "G", label: "Kerja Keras", eng: "Hard intense worked", desc: "Peran sebagai pekerja keras dan tekun." },
    { code: "A", label: "Berprestasi", eng: "Need to achieve", desc: "Hasrat untuk berprestasi dan mencapai target." },
  ]},
  { group: "KEPEMIMPINAN", dims: [
    { code: "L", label: "Memimpin", eng: "Leadership role", desc: "Kecenderungan mengambil peran sebagai pemimpin." },
    { code: "P", label: "Kontrol Orang", eng: "Need to control others", desc: "Keinginan mengontrol atau mengarahkan orang lain." },
    { code: "I", label: "Ambil Keputusan", eng: "Ease in decision making", desc: "Kemudahan dan sikap pragmatis dalam mengambil keputusan." },
  ]},
  { group: "AKTIVITAS", dims: [
    { code: "T", label: "Tempo Kerja", eng: "Pace", desc: "Preferensi terhadap kecepatan/tempo dalam bekerja." },
    { code: "V", label: "Sangat Aktif", eng: "Vigorous type", desc: "Kecenderungan tipe yang serba cepat dan enerjik." },
  ]},
  { group: "SIKAP SOSIAL", dims: [
    { code: "X", label: "Diperhatikan", eng: "Need to be noticed", desc: "Kebutuhan untuk selalu diperhatikan orang lain." },
    { code: "S", label: "Jalin Sosial", eng: "Social extension", desc: "Keinginan untuk memperluas relasi dan lingkup sosial." },
    { code: "B", label: "Ikut Kelompok", eng: "Need to belong to groups", desc: "Kebutuhan untuk diterima dan terlibat dalam kelompok." },
    { code: "O", label: "Kedekatan", eng: "Need for closeness and affection", desc: "Kebutuhan akan kedekatan dan keakraban interpersonal." },
  ]},
  { group: "GAYA KERJA", dims: [
    { code: "R", label: "Tipe Teoritis", eng: "Theoretical type", desc: "Kecenderungan berpikir konseptual dan teoritis." },
    { code: "D", label: "Kerja Detail", eng: "Interest in working with details", desc: "Minat dan ketelitian dalam bekerja dengan hal-hal rinci." },
    { code: "C", label: "Terorganisir", eng: "Organized type", desc: "Kecenderungan bekerja secara rapi, sistematis, dan terorganisir." },
  ]},
  { group: "TEMPRAMEN", dims: [
    { code: "Z", label: "Suka Perubahan", eng: "Need for Change", desc: "Keinginan akan variasi dan keterbukaan pada perubahan.", inverse: true },
    { code: "E", label: "Stabil Emosi", eng: "Emotional Resistant", desc: "Tingkat stabilitas dan ketahanan emosi." },
    { code: "K", label: "Dominasi Orang", eng: "Need to be forceful", desc: "Kecenderungan untuk bersikap tegas/mendominasi pihak lain.", inverse: true },
  ]},
  { group: "KEIKUTSERTAAN", dims: [
    { code: "F", label: "Dukung Atasan", eng: "Need to support authority", desc: "Kecenderungan untuk mendukung dan patuh pada pihak atasan." },
    { code: "W", label: "Ikut Peraturan", eng: "Need for rules and supervision", desc: "Kebutuhan akan aturan baku dan pengawasan yang jelas." },
  ]},
];
const PAPI_DIMS = PAPI_GROUPS.flatMap((g) => g.dims.map((d) => ({ ...d, group: g.group })));
function papiCategory(score) {
  const s = score || 0;
  if (s <= 5) return "ACCEPTABLE";
  if (s <= 7) return "DEVELOPMENT";
  return "OPTIMAL";
}

const MBTI_INFO = {
  ISTJ: { title: "The Inspector", desc: "Bertanggung jawab, teliti, dan konsisten menjalankan tugas sesuai aturan dan prosedur yang berlaku." },
  ISFJ: { title: "The Protector", desc: "Setia, penuh perhatian, dan berdedikasi menjaga keharmonisan serta kebutuhan orang di sekitarnya." },
  INFJ: { title: "The Advocate", desc: "Idealis, berwawasan, dan berkomitmen pada nilai serta tujuan jangka panjang yang bermakna." },
  INTJ: { title: "The Architect", desc: "Strategis, mandiri, dan sistematis dalam merancang serta mengeksekusi rencana jangka panjang." },
  ISTP: { title: "The Craftsman", desc: "Praktis, tenang, dan cekatan memecahkan masalah teknis dengan pendekatan langsung." },
  ISFP: { title: "The Composer", desc: "Fleksibel, peka secara estetis, dan mengutamakan keselarasan nilai personal dalam bekerja." },
  INFP: { title: "The Healer", desc: "Idealis, reflektif, dan didorong oleh nilai-nilai pribadi dalam setiap keputusan." },
  INTP: { title: "The Thinker", desc: "Analitis, ingin tahu, dan senang mengeksplorasi ide serta konsep secara mendalam." },
  ESTP: { title: "The Dynamo", desc: "Enerjik, adaptif, dan tanggap menghadapi situasi yang menuntut aksi cepat." },
  ESFP: { title: "The Performer", desc: "Ramah, spontan, dan membawa energi positif dalam interaksi sehari-hari." },
  ENFP: { title: "The Champion", desc: "Antusias, kreatif, dan piawai menggerakkan orang lain menuju kemungkinan baru." },
  ENTP: { title: "The Visionary", desc: "Inovatif, cepat beradaptasi, dan senang menantang cara berpikir konvensional." },
  ESTJ: { title: "The Supervisor", desc: "Terorganisir, tegas, dan efektif mengelola orang maupun proses menuju target." },
  ESFJ: { title: "The Provider", desc: "Kooperatif, peduli, dan aktif menjaga keharmonisan tim serta lingkungan kerja." },
  ENFJ: { title: "The Teacher", desc: "Karismatik, suportif, dan alami dalam memotivasi serta mengembangkan orang lain." },
  ENTJ: { title: "The Commander", desc: "Tegas, strategis, dan alami memimpin dalam mengorganisir orang menuju tujuan besar." },
};
function computeMbtiType(m) {
  return (m.E >= 50 ? "E" : "I") + (m.S >= 50 ? "S" : "N") + (m.T >= 50 ? "T" : "F") + (m.J >= 50 ? "J" : "P");
}

const MSDT_COLS = ["Ds", "Mi", "Au", "Co", "Bu", "Dv", "Ba", "Ex"];
const MSDT_STYLES = [
  { name: "Deserter", col: "Ds", dims: ["O"], desc: "Cenderung menghindari tanggung jawab dan bersikap defensif — lebih memilih menjaga status-quo daripada mengambil keputusan atau menghadapi konflik." },
  { name: "Missionary", col: "Mi", dims: ["RO"], desc: "Mengutamakan keharmonisan hubungan dan diterima oleh orang lain, kadang mengorbankan pencapaian tugas demi menjaga suasana tetap nyaman." },
  { name: "Autocrat", col: "Au", dims: ["TO"], desc: "Berorientasi kuat pada penyelesaian tugas dengan gaya memerintah, kurang memperhatikan hubungan interpersonal dalam prosesnya." },
  { name: "Compromiser", col: "Co", dims: ["TO", "RO"], desc: "Cenderung mengambil jalan tengah dalam banyak keputusan, namun berisiko kurang tegas saat situasi menuntut ketegasan." },
  { name: "Bureaucrat", col: "Bu", dims: ["E"], desc: "Mengandalkan aturan dan prosedur formal sebagai dasar bekerja, efektif dalam konteks yang membutuhkan konsistensi dan kepatuhan." },
  { name: "Developer", col: "Dv", dims: ["RO", "E"], desc: "Menyeimbangkan perhatian pada tugas dan hubungan, cenderung dipercaya serta membina pengembangan anggota tim." },
  { name: "Benevolent Autocrat", col: "Ba", dims: ["TO", "E"], desc: "Tegas dan berorientasi hasil, namun tetap mampu menjaga penerimaan tim terhadap arahan yang diberikan." },
  { name: "Executive", col: "Ex", dims: ["TO", "RO", "E"], desc: "Efektif menyeimbangkan orientasi tugas dan hubungan, mampu memotivasi tim sekaligus mencapai target dengan baik." },
];
const MSDT_BASE_DIM = Object.fromEntries(MSDT_STYLES.map((s) => [s.col, s.dims[0]]));
function msdtJumlah(m, col) { return (m.A?.[col] || 0) + (m.B?.[col] || 0) + (m.koreksi?.[col] || 0); }
function msdtTotals(m) {
  const totals = { TO: 0, RO: 0, E: 0, O: 0 };
  MSDT_STYLES.forEach((s) => { const j = msdtJumlah(m, s.col); s.dims.forEach((d) => (totals[d] += j)); });
  return totals;
}

function emptyReport() {
  return {
    identity: { gender: "", birthPlace: "", birthDate: "", education: "", phone: "", city: "", province: "" },
    ist: { subtests: Object.fromEntries(IST_SUBTESTS.map((s) => [s.key, ""])) },
    focusync: {
      good: { jumlah: "", simpangan: "" }, fair: { salah: "", tinggi: "", puncak: "" }, poor: { jumlah: "", salah: "" },
      trials: Array.from({ length: 20 }, (_, i) => ({ no: i + 1, dijawab: "", salahPct: "" })),
    },
    papi: Object.fromEntries(PAPI_DIMS.map((d) => [d.code, ""])),
    mbti: { E: 50, S: 50, T: 50, J: 50 },
    msdt: {
      A: Object.fromEntries(MSDT_COLS.map((c) => [c, ""])),
      B: Object.fromEntries(MSDT_COLS.map((c) => [c, ""])),
      koreksi: Object.fromEntries(MSDT_COLS.map((c) => [c, ""])),
      konversi: { TO: "", RO: "", E: "", O: "" },
      style: "Developer",
    },
  };
}
function reportAge(birthDateStr) {
  if (!birthDateStr) return "-";
  const b = new Date(birthDateStr), t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
  return age;
}
