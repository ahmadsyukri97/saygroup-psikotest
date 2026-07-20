// ============================================================================
// STATE GLOBAL
// ============================================================================
const App = {
  view: "landing",
  questions: [],       // soal publik (TANPA jawaban) — dimuat sekali sebelum tes
  candidate: { name: "", position: "", email: "" },
  answers: {},          // { questionId: "a" }
  qIndex: 0,
  timeLeft: 30 * 60,
  timerHandle: null,
  session: null,
  isAdmin: false,
  adminTab: "hasil",
  candidates: [],
  questionsAdmin: [],
  editingQuestion: null,
  editingCandidate: null,
  loading: false,
  error: "",
};

const root = () => document.getElementById("app");
function render(html) { root().innerHTML = html; window.scrollTo(0, 0); }
function showToast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDuration(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s}s`;
}
function chipClassForTone(tone) {
  return { great: "chip-great", good: "chip-good", mid: "chip-mid", low: "chip-low" }[tone] || "chip-mid";
}

async function App_init() {
  const { data } = await db.auth.getSession();
  App.session = data?.session || null;
  if (App.session) await App_checkAdmin();
  App.navigate(App.isAdmin && location.hash === "#admin" ? "admin-dashboard" : "landing");
}

App.navigate = function (view, opts = {}) {
  App.view = view;
  App.error = "";
  Object.assign(App, opts);
  App.renderCurrent();
};

App.renderCurrent = function () {
  switch (App.view) {
    case "landing": return renderLanding();
    case "form": return renderForm();
    case "test": return renderTest();
    case "submitted": return renderSubmitted();
    case "admin-login": return renderAdminLogin();
    case "admin-dashboard": return renderAdminDashboard();
    case "admin-detail": return renderAdminDetail();
    case "question-editor": return renderQuestionEditor();
    case "report-editor": return renderReportEditor();
    case "report-print": return renderReportPrint();
    default: return renderLanding();
  }
};

// ============================================================================
// LANDING
// ============================================================================
function renderLanding() {
  render(`
  <div class="min-h-screen flex flex-col">
    <div class="topbar">
      <div class="flex items-center gap-3">
        <div class="topbar-logo"><div style="width:16px;height:16px;background:#fff;border-radius:4px;"></div></div>
        <div><div class="topbar-title">SAYGROUP</div><div class="topbar-subtitle">Talent Assessment</div></div>
      </div>
      <button class="btn btn-outline" onclick="App.navigate('admin-login')">Login Admin</button>
    </div>
    <div class="flex-1 flex items-center justify-center py-16 px-4">
      <div class="max-w-lg text-center">
        <div class="chip chip-good mb-3" style="letter-spacing:1px;">TES BAKAT & POTENSI</div>
        <h1 class="text-3xl font-bold serif mb-3" style="color:var(--ink)">Aptitude Test</h1>
        <p class="text-base mb-8" style="color:var(--text-3);line-height:1.6;">
          Tes ini terdiri dari 60 soal pilihan ganda untuk mengukur kemampuan logika, verbal, numerik,
          dan spasial. Waktu pengerjaan 30 menit. Pastikan koneksi internet stabil sebelum memulai.
        </p>
        <button class="btn btn-primary px-6 py-3" style="font-size:14px;" onclick="App.navigate('form')">Mulai Tes &rarr;</button>
      </div>
    </div>
  </div>`);
}

// ============================================================================
// FORM KANDIDAT
// ============================================================================
function renderForm() {
  const c = App.candidate;
  render(`
  <div class="min-h-screen flex items-center justify-center py-16 px-4">
    <div class="card p-8 w-full max-w-md">
      <button class="text-sm mb-4" style="color:var(--muted)" onclick="App.navigate('landing')">&larr; Kembali</button>
      <h2 class="text-xl font-bold serif mb-1" style="color:var(--ink)">Data Diri</h2>
      <p class="text-sm mb-6" style="color:var(--text-3)">Isi data berikut sebelum memulai tes.</p>
      ${App.error ? `<div class="rounded-lg px-3 py-2 mb-4 text-sm" style="background:var(--danger-bg);color:var(--danger)">${App.error}</div>` : ""}
      <div class="field-wrap">
        <label class="field-label">Nama Lengkap *</label>
        <div class="field-box"><input id="f-name" value="${escapeHtml(c.name)}" placeholder="Nama sesuai KTP"></div>
      </div>
      <div class="field-wrap">
        <label class="field-label">Posisi yang Dilamar *</label>
        <div class="field-box"><input id="f-position" value="${escapeHtml(c.position)}" placeholder="mis. Staff Marketing"></div>
      </div>
      <div class="field-wrap">
        <label class="field-label">Email (opsional)</label>
        <div class="field-box"><input id="f-email" type="email" value="${escapeHtml(c.email)}" placeholder="nama@email.com"></div>
      </div>
      <button class="btn btn-primary w-full py-3 mt-2" onclick="App_startTest()">Mulai Tes &rarr;</button>
    </div>
  </div>`);
}

async function App_startTest() {
  const name = document.getElementById("f-name").value.trim();
  const position = document.getElementById("f-position").value.trim();
  const email = document.getElementById("f-email").value.trim();
  if (!name || !position) { App.error = "Nama dan posisi wajib diisi."; return App.renderCurrent(); }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) { App.error = "Format email tidak valid."; return App.renderCurrent(); }
  App.candidate = { name, position, email };

  render(`<div class="min-h-screen flex items-center justify-center"><div class="spinner"></div></div>`);
  const { data, error } = await db.from("questions_public").select("*").order("order_no");
  if (error || !data || !data.length) {
    App.error = "Gagal memuat soal. Cek koneksi atau konfigurasi Supabase.";
    return App.navigate("form");
  }
  App.questions = data;
  App.answers = {};
  App.qIndex = 0;
  App.timeLeft = 30 * 60;
  App.navigate("test");
  App_startTimer();
}

// ============================================================================
// TES BERJALAN
// ============================================================================
function App_startTimer() {
  clearInterval(App.timerHandle);
  App.timerHandle = setInterval(() => {
    App.timeLeft--;
    if (App.timeLeft <= 0) { clearInterval(App.timerHandle); App_submitTest(); return; }
    const el = document.getElementById("timer-display");
    if (el) el.textContent = fmtTimer(App.timeLeft);
  }, 1000);
}
function fmtTimer(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}
const LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"];

function renderTest() {
  const q = App.questions[App.qIndex];
  const answered = Object.keys(App.answers).length;
  const total = App.questions.length;
  const pct = Math.round(((App.qIndex + 1) / total) * 100);
  render(`
  <div class="min-h-screen flex flex-col">
    <div class="topbar sticky">
      <div class="text-sm font-bold" style="color:var(--ink)">Soal ${App.qIndex + 1} / ${total}</div>
      <div class="flex items-center gap-4">
        <div class="text-sm" style="color:var(--text-3)">Terjawab: ${answered}/${total}</div>
        <div class="chip chip-mid mono" id="timer-display" style="font-size:13px;padding:6px 12px;">${fmtTimer(App.timeLeft)}</div>
      </div>
    </div>
    <div style="height:4px;background:var(--border);"><div style="height:4px;background:var(--ink);width:${pct}%;transition:width .2s;"></div></div>

    <div class="flex-1 py-10 px-4">
      <div class="max-w-lg mx-auto">
        <div class="card p-6 mb-5">
          ${q.prompt_image ? `<img src="${q.prompt_image}" class="rounded-lg mb-4 w-full" style="max-height:220px;object-fit:contain;">` : ""}
          <p class="text-base font-semibold" style="color:var(--text);line-height:1.5;">${escapeHtml(q.prompt)}</p>
        </div>
        <div class="flex flex-col gap-2.5 mb-6">
          ${q.options.map((opt, i) => {
            const letter = LETTERS[i];
            const filled = App.answers[q.id] === letter;
            return `<button class="bubble ${filled ? "filled" : ""}" onclick="App_answer('${q.id}','${letter}')">
              <span class="bubble-letter">${letter.toUpperCase()}</span>
              <span class="flex-1">${optionContentHtml(opt)}</span>
            </button>`;
          }).join("")}
        </div>
        <div class="flex items-center justify-between">
          <button class="btn btn-outline" ${App.qIndex === 0 ? "disabled" : ""} onclick="App_prevQ()">&larr; Sebelumnya</button>
          ${App.qIndex === total - 1
            ? `<button class="btn btn-teal" onclick="App_confirmSubmit()">Selesai &amp; Kirim</button>`
            : `<button class="btn btn-primary" onclick="App_nextQ()">Berikutnya &rarr;</button>`}
        </div>
      </div>
    </div>
  </div>`);
}
function App_answer(qid, letter) {
  App.answers[qid] = letter;
  App.renderCurrent();
}
function App_nextQ() { if (App.qIndex < App.questions.length - 1) { App.qIndex++; App.renderCurrent(); } }
function App_prevQ() { if (App.qIndex > 0) { App.qIndex--; App.renderCurrent(); } }
function App_confirmSubmit() {
  const unanswered = App.questions.length - Object.keys(App.answers).length;
  const msg = unanswered > 0 ? `Masih ada ${unanswered} soal belum dijawab. Tetap kirim?` : "Kirim jawaban sekarang?";
  if (confirm(msg)) App_submitTest();
}
async function App_submitTest() {
  clearInterval(App.timerHandle);
  const durationSec = 30 * 60 - App.timeLeft;
  render(`<div class="min-h-screen flex flex-col items-center justify-center gap-3"><div class="spinner"></div><div class="text-sm" style="color:var(--muted)">Mengirim jawaban...</div></div>`);
  const { error } = await db.rpc("submit_test_result", {
    p_name: App.candidate.name,
    p_position: App.candidate.position,
    p_email: App.candidate.email || null,
    p_answers: App.answers,
    p_duration_sec: durationSec,
  });
  if (error) { showToast("Gagal mengirim: " + error.message); return App.navigate("test"); }
  App.navigate("submitted");
}

function renderSubmitted() {
  render(`
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card p-10 text-center max-w-md">
      <div class="rounded-full mx-auto mb-4" style="width:56px;height:56px;background:var(--good-bg);display:flex;align-items:center;justify-content:center;">
        <span style="font-size:26px;color:var(--good-fg);">&#10003;</span>
      </div>
      <h2 class="text-xl font-bold serif mb-2" style="color:var(--ink)">Terima Kasih!</h2>
      <p class="text-sm" style="color:var(--text-3);line-height:1.6;">
        Jawaban Anda, <b>${escapeHtml(App.candidate.name)}</b>, telah berhasil dikirim.
        Hasil akan diproses oleh tim HR dan dihubungi jika diperlukan.
      </p>
    </div>
  </div>`);
}
