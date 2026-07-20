// ============================================================================
// ADMIN LOGIN (Supabase Auth — bukan PIN hardcoded)
// ============================================================================
function renderAdminLogin() {
  render(`
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card p-8 w-full max-w-md">
      <button class="text-sm mb-4" style="color:var(--muted)" onclick="App.navigate('landing')">&larr; Kembali</button>
      <h2 class="text-xl font-bold serif mb-1" style="color:var(--ink)">Login Admin</h2>
      <p class="text-sm mb-6" style="color:var(--text-3)">Khusus tim HR yang sudah terdaftar.</p>
      ${App.error ? `<div class="rounded-lg px-3 py-2 mb-4 text-sm" style="background:var(--danger-bg);color:var(--danger)">${App.error}</div>` : ""}
      <div class="field-wrap"><label class="field-label">Email</label><div class="field-box"><input id="a-email" type="email" placeholder="hr@perusahaan.com"></div></div>
      <div class="field-wrap"><label class="field-label">Password</label><div class="field-box"><input id="a-pass" type="password" placeholder="••••••••"></div></div>
      <button class="btn btn-primary w-full py-3 mt-2" onclick="App_adminLogin()">Masuk</button>
    </div>
  </div>`);
}
async function App_adminLogin() {
  const email = document.getElementById("a-email").value.trim();
  const password = document.getElementById("a-pass").value;
  if (!email || !password) { App.error = "Email dan password wajib diisi."; return App.renderCurrent(); }
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) { App.error = "Login gagal: " + error.message; return App.renderCurrent(); }
  App.session = data.session;
  await App_checkAdmin();
  if (!App.isAdmin) {
    await db.auth.signOut();
    App.error = "Akun ini belum terdaftar sebagai admin.";
    return App.navigate("admin-login");
  }
  App.navigate("admin-dashboard");
}
async function App_checkAdmin() {
  const uid = App.session?.user?.id;
  if (!uid) { App.isAdmin = false; return; }
  const { data } = await db.from("admins").select("user_id").eq("user_id", uid).maybeSingle();
  App.isAdmin = !!data;
}
async function App_logout() {
  await db.auth.signOut();
  App.session = null; App.isAdmin = false;
  App.navigate("landing");
}

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================
function adminHeader(activeTab) {
  return `
  <div class="topbar">
    <div class="flex items-center gap-3">
      <div class="topbar-logo"><div style="width:16px;height:16px;background:#fff;border-radius:4px;"></div></div>
      <div><div class="topbar-title">SAYGROUP</div><div class="topbar-subtitle">Admin Dashboard</div></div>
    </div>
    <button class="btn btn-outline" onclick="App_logout()">Keluar</button>
  </div>
  <div class="flex gap-2 px-6" style="border-bottom:1px solid var(--border);background:#FCFBF8;">
    ${["hasil", "soal"].map((t) => `
      <button onclick="App_setAdminTab('${t}')" style="padding:12px 16px;font-size:13px;font-weight:700;border-bottom:2px solid ${activeTab === t ? "var(--ink)" : "transparent"};color:${activeTab === t ? "var(--ink)" : "var(--muted)"}">
        ${t === "hasil" ? "Hasil Tes Kandidat" : "Bank Soal"}
      </button>`).join("")}
  </div>`;
}
function App_setAdminTab(tab) { App.adminTab = tab; App.navigate("admin-dashboard"); }

async function renderAdminDashboard() {
  render(`<div class="min-h-screen">${adminHeader(App.adminTab)}<div class="p-6"><div class="max-w-6xl mx-auto"><div class="spinner"></div></div></div></div>`);
  if (App.adminTab === "hasil") {
    const { data, error } = await db.from("candidates").select("*").order("submitted_at", { ascending: false });
    if (error) { showToast("Gagal memuat data: " + error.message); }
    App.candidates = data || [];
    renderAdminHasilTab();
  } else {
    const { data, error } = await db.from("questions").select("*").order("order_no");
    if (error) { showToast("Gagal memuat soal: " + error.message); }
    App.questionsAdmin = data || [];
    renderAdminSoalTab();
  }
}
function renderAdminHasilTab() {
  const rows = App.candidates.map((c) => `
    <tr class="border-t" style="cursor:pointer" onclick="App_openCandidate('${c.id}')">
      <td class="px-3 py-3">
        <div class="font-semibold text-sm">${escapeHtml(c.name)}</div>
        <div class="text-xs" style="color:var(--muted)">${escapeHtml(c.position)}</div>
      </td>
      <td class="px-3 py-3"><span class="chip ${chipClassForTone(c.tone)}">${escapeHtml(c.category)}</span></td>
      <td class="px-3 py-3 font-bold text-sm" style="color:var(--ink)">${c.iq}</td>
      <td class="px-3 py-3 text-sm">${c.correct}/${c.total}</td>
      <td class="px-3 py-3 text-sm" style="color:var(--muted)">${fmtDuration(c.duration_sec)}</td>
      <td class="px-3 py-3 text-xs" style="color:var(--muted)">${fmtDate(c.submitted_at)}</td>
    </tr>`).join("");
  render(`<div class="min-h-screen">${adminHeader("hasil")}
    <div class="p-6"><div class="max-w-6xl mx-auto card" style="overflow:hidden">
      ${App.candidates.length === 0 ? `<div class="p-8 text-center text-sm" style="color:var(--muted)">Belum ada kandidat yang mengirim hasil tes.</div>` : `
      <table><thead><tr style="background:#FAF9F5;">
        <th class="px-3 py-3 text-xs" style="color:var(--muted)">Kandidat</th>
        <th class="px-3 py-3 text-xs" style="color:var(--muted)">Kategori</th>
        <th class="px-3 py-3 text-xs" style="color:var(--muted)">IQ</th>
        <th class="px-3 py-3 text-xs" style="color:var(--muted)">Benar</th>
        <th class="px-3 py-3 text-xs" style="color:var(--muted)">Durasi</th>
        <th class="px-3 py-3 text-xs" style="color:var(--muted)">Tanggal</th>
      </tr></thead><tbody>${rows}</tbody></table>`}
    </div></div>
  </div>`);
}
function App_openCandidate(id) {
  App.editingCandidate = App.candidates.find((c) => c.id === id);
  App.navigate("admin-detail");
}

function renderAdminSoalTab() {
  const rows = App.questionsAdmin.map((q) => `
    <tr class="border-t">
      <td class="px-3 py-3 text-xs" style="color:var(--muted)">#${q.order_no}</td>
      <td class="px-3 py-3 text-sm">${escapeHtml(q.prompt.slice(0, 70))}${q.prompt.length > 70 ? "…" : ""}</td>
      <td class="px-3 py-3 text-xs mono" style="color:var(--ink)">${q.answer.toUpperCase()}</td>
      <td class="px-3 py-3 text-right">
        <button class="btn btn-outline text-xs" style="padding:6px 10px;" onclick="App_editQuestion('${q.id}')">Edit</button>
        <button class="btn btn-danger-outline text-xs" style="padding:6px 10px;" onclick="App_deleteQuestion('${q.id}')">Hapus</button>
      </td>
    </tr>`).join("");
  render(`<div class="min-h-screen">${adminHeader("soal")}
    <div class="p-6"><div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-4">
        <div class="text-sm" style="color:var(--muted)">${App.questionsAdmin.length} soal</div>
        <button class="btn btn-primary" onclick="App_editQuestion(null)">+ Tambah Soal</button>
      </div>
      <div class="card" style="overflow:hidden">
        <table><thead><tr style="background:#FAF9F5;">
          <th class="px-3 py-3 text-xs" style="color:var(--muted)">No</th>
          <th class="px-3 py-3 text-xs" style="color:var(--muted)">Pertanyaan</th>
          <th class="px-3 py-3 text-xs" style="color:var(--muted)">Kunci</th>
          <th></th>
        </tr></thead><tbody>${rows}</tbody></table>
      </div>
    </div></div>
  </div>`);
}
async function App_deleteQuestion(id) {
  if (!confirm("Hapus soal ini? Tindakan tidak bisa dibatalkan.")) return;
  const { error } = await db.from("questions").delete().eq("id", id);
  if (error) return showToast("Gagal menghapus: " + error.message);
  showToast("Soal dihapus.");
  App.navigate("admin-dashboard", { adminTab: "soal" });
}

// ============================================================================
// DETAIL KANDIDAT
// ============================================================================
function renderAdminDetail() {
  const c = App.editingCandidate;
  if (!c) return App.navigate("admin-dashboard");
  render(`<div class="min-h-screen">${adminHeader("hasil")}
    <div class="p-6"><div class="max-w-3xl mx-auto">
      <button class="text-sm mb-4" style="color:var(--muted)" onclick="App.navigate('admin-dashboard')">&larr; Kembali ke daftar</button>
      <div class="card p-8 mb-5">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-xl font-bold serif" style="color:var(--ink)">${escapeHtml(c.name)}</h2>
            <div class="text-sm" style="color:var(--muted)">${escapeHtml(c.position)} &middot; ${escapeHtml(c.email || "-")}</div>
          </div>
          <span class="chip ${chipClassForTone(c.tone)}" style="font-size:12px;padding:6px 14px;">${escapeHtml(c.category)}</span>
        </div>
        <div class="grid grid-cols-4" style="gap:16px;">
          ${[["IQ", c.iq], ["Benar", `${c.correct}/${c.total}`], ["Durasi", fmtDuration(c.duration_sec)], ["Tanggal", fmtDate(c.submitted_at)]]
            .map(([lbl, val]) => `<div class="rounded-lg border p-3 text-center"><div class="text-xs mb-1" style="color:var(--muted)">${lbl}</div><div class="font-bold text-sm" style="color:var(--ink)">${val}</div></div>`).join("")}
        </div>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-primary" onclick="App_editReport()">Isi / Edit Laporan Instrumen</button>
        <button class="btn btn-teal" onclick="App.navigate('report-print')">Preview &amp; Export PDF</button>
        <button class="btn btn-danger-outline" onclick="App_deleteCandidate('${c.id}')">Hapus Kandidat</button>
      </div>
    </div></div>
  </div>`);
}
async function App_deleteCandidate(id) {
  if (!confirm("Hapus data kandidat ini beserta laporannya?")) return;
  const { error } = await db.from("candidates").delete().eq("id", id);
  if (error) return showToast("Gagal menghapus: " + error.message);
  showToast("Data kandidat dihapus.");
  App.navigate("admin-dashboard", { adminTab: "hasil" });
}
