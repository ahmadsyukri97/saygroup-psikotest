// ============================================================================
// EDITOR LAPORAN (IST / Focusync / PAPI / MBTI / MSDT)
// ============================================================================
let __repState = null;
let __repTab = "identitas";

function App_editReport() {
  const c = App.editingCandidate;
  __repState = JSON.parse(JSON.stringify(c.report || emptyReport()));
  __repTab = "identitas";
  App.navigate("report-editor");
}

function repTabBtn(key, label) {
  return `<button onclick="App_repSetTab('${key}')" style="padding:10px 14px;font-size:12px;font-weight:700;border-bottom:2px solid ${__repTab === key ? "var(--ink)" : "transparent"};color:${__repTab === key ? "var(--ink)" : "var(--muted)"}">${label}</button>`;
}
function App_repSetTab(key) { __repTab = key; App.renderCurrent(); }

function renderReportEditor() {
  const c = App.editingCandidate;
  const r = __repState;
  let body = "";
  if (__repTab === "identitas") body = repIdentityForm(r);
  else if (__repTab === "ist") body = repIstForm(r);
  else if (__repTab === "focusync") body = repFocusyncForm(r);
  else if (__repTab === "papi") body = repPapiForm(r);
  else if (__repTab === "mbti") body = repMbtiForm(r);
  else if (__repTab === "msdt") body = repMsdtForm(r);

  render(`<div class="min-h-screen">${adminHeader("hasil")}
    <div class="p-6"><div class="max-w-4xl mx-auto">
      <button class="text-sm mb-4" style="color:var(--muted)" onclick="App.navigate('admin-detail')">&larr; Kembali ke detail kandidat</button>
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-bold serif" style="color:var(--ink)">Laporan Instrumen &mdash; ${escapeHtml(c.name)}</h2>
        <button class="btn btn-primary" onclick="App_saveReport()">Simpan Laporan</button>
      </div>
      <div class="flex gap-1 mb-5" style="border-bottom:1px solid var(--border);">
        ${repTabBtn("identitas", "Identitas")}${repTabBtn("ist", "IST")}${repTabBtn("focusync", "Focusync")}${repTabBtn("papi", "PAPI")}${repTabBtn("mbti", "MBTI")}${repTabBtn("msdt", "MSDT")}
      </div>
      <div class="card p-6">${body}</div>
    </div></div>
  </div>`);
}

function textField(label, val, path) {
  return `<div class="field-wrap"><label class="field-label">${label}</label><div class="field-box"><input value="${escapeHtml(val ?? "")}" oninput="repSet('${path}', this.value)"></div></div>`;
}
function numField(label, val, path, width = "") {
  return `<div class="field-wrap" style="${width}"><label class="field-label">${label}</label><div class="field-box"><input type="number" value="${val ?? ""}" oninput="repSet('${path}', this.value)"></div></div>`;
}
function repSet(path, value) {
  const parts = path.split(".");
  let obj = __repState;
  for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
  obj[parts[parts.length - 1]] = value;
}
function repSetArr(path, idx, key, value) {
  const parts = path.split(".");
  let obj = __repState;
  for (let i = 0; i < parts.length; i++) obj = obj[parts[i]];
  obj[idx][key] = value;
}

function repIdentityForm(r) {
  const id = r.identity;
  return `<div class="grid grid-cols-2" style="gap:0 20px;">
    ${textField("Jenis Kelamin", id.gender, "identity.gender")}
    ${textField("Tempat Lahir", id.birthPlace, "identity.birthPlace")}
    <div class="field-wrap"><label class="field-label">Tanggal Lahir</label><div class="field-box"><input type="date" value="${id.birthDate || ""}" oninput="repSet('identity.birthDate', this.value)"></div></div>
    ${textField("Pendidikan Terakhir", id.education, "identity.education")}
    ${textField("Nomor Telepon", id.phone, "identity.phone")}
    ${textField("Kota Domisili", id.city, "identity.city")}
    ${textField("Provinsi", id.province, "identity.province")}
  </div>`;
}
function repIstForm(r) {
  const rows = IST_SUBTESTS.map((s) => `<div class="flex items-center justify-between border-t py-2">
    <div class="text-sm">${s.name}</div>
    <div style="width:100px;"><div class="field-box" style="padding:4px 8px;"><input type="number" value="${r.ist.subtests[s.key] ?? ""}" oninput="repSet('ist.subtests.${s.key}', this.value)"></div></div>
  </div>`).join("");
  return `<div class="text-xs mb-3" style="color:var(--muted)">Skor IST per subtes (skala umum 55&ndash;145)</div>${rows}`;
}
function repFocusyncForm(r) {
  const fs = r.focusync;
  const trialsRows = fs.trials.map((t, i) => `<div class="grid grid-cols-3" style="gap:8px;align-items:center;padding:4px 0;">
    <div class="text-xs" style="color:var(--muted)">Trial ${t.no}</div>
    <div class="field-box" style="padding:4px 8px;"><input type="number" placeholder="Dijawab" value="${t.dijawab}" oninput="repSetArr('focusync.trials', ${i}, 'dijawab', this.value)"></div>
    <div class="field-box" style="padding:4px 8px;"><input type="number" placeholder="Salah %" value="${t.salahPct}" oninput="repSetArr('focusync.trials', ${i}, 'salahPct', this.value)"></div>
  </div>`).join("");
  return `
  <div class="grid grid-cols-3 mb-4" style="gap:16px;">
    <div><div class="text-xs font-bold mb-2" style="color:var(--muted)">GOOD</div>
      ${numField("Jumlah", fs.good.jumlah, "focusync.good.jumlah")}${numField("Simpangan %", fs.good.simpangan, "focusync.good.simpangan")}</div>
    <div><div class="text-xs font-bold mb-2" style="color:var(--muted)">FAIR</div>
      ${numField("Salah %", fs.fair.salah, "focusync.fair.salah")}${numField("Tinggi", fs.fair.tinggi, "focusync.fair.tinggi")}${numField("Puncak", fs.fair.puncak, "focusync.fair.puncak")}</div>
    <div><div class="text-xs font-bold mb-2" style="color:var(--muted)">POOR</div>
      ${numField("Jumlah", fs.poor.jumlah, "focusync.poor.jumlah")}${numField("Salah %", fs.poor.salah, "focusync.poor.salah")}</div>
  </div>
  <div class="text-xs font-bold mb-2" style="color:var(--muted)">20 TRIAL</div>${trialsRows}`;
}
function repPapiForm(r) {
  return PAPI_GROUPS.map((g) => `
    <div class="mb-4"><div class="text-xs font-bold mb-2" style="color:var(--muted)">${g.group}</div>
    <div class="grid grid-cols-3" style="gap:0 16px;">
      ${g.dims.map((d) => `<div class="field-wrap"><label class="field-label">${d.code} &mdash; ${d.label}${d.inverse ? " (inverse)" : ""}</label>
        <div class="field-box"><input type="number" min="1" max="9" value="${r.papi[d.code] ?? ""}" oninput="repSet('papi.${d.code}', this.value)"></div></div>`).join("")}
    </div></div>`).join("");
}
function repMbtiForm(r) {
  const m = r.mbti;
  const slider = (label, key, a, b) => `<div class="field-wrap">
    <label class="field-label">${label} &mdash; ${a} (%) vs ${b}</label>
    <input type="range" min="0" max="100" value="${m[key]}" style="width:100%" oninput="repSet('mbti.${key}', Number(this.value)); document.getElementById('mbti-${key}-val').textContent=this.value">
    <div class="text-xs" id="mbti-${key}-val" style="color:var(--muted)">${m[key]}</div>
  </div>`;
  return slider("Energi", "E", "E", "I") + slider("Informasi", "S", "S", "N") + slider("Keputusan", "T", "T", "F") + slider("Gaya Hidup", "J", "J", "P");
}
function repMsdtForm(r) {
  const m = r.msdt;
  const grid = (label, key) => `<div class="mb-4"><div class="text-xs font-bold mb-2" style="color:var(--muted)">${label}</div>
    <div class="grid grid-cols-4" style="gap:8px;">
      ${MSDT_COLS.map((c) => `<div><div class="text-xs mb-1" style="color:var(--muted)">${c}</div><div class="field-box" style="padding:4px 8px;"><input type="number" value="${m[key][c] ?? ""}" oninput="repSet('msdt.${key}.${c}', this.value)"></div></div>`).join("")}
    </div></div>`;
  const styleOptions = MSDT_STYLES.map((s) => `<option value="${s.name}" ${m.style === s.name ? "selected" : ""}>${s.name}</option>`).join("");
  return `${grid("Kolom A", "A")}${grid("Kolom B", "B")}${grid("Koreksi", "koreksi")}
    <div class="grid grid-cols-4 mb-4" style="gap:8px;">
      ${["TO", "RO", "E", "O"].map((k) => `<div><div class="text-xs mb-1" style="color:var(--muted)">Konversi ${k}</div><div class="field-box" style="padding:4px 8px;"><input type="number" step="0.1" value="${m.konversi[k] ?? ""}" oninput="repSet('msdt.konversi.${k}', this.value)"></div></div>`).join("")}
    </div>
    <div class="field-wrap"><label class="field-label">Gaya Manajemen Dominan</label><div class="field-box"><select onchange="repSet('msdt.style', this.value)">${styleOptions}</select></div></div>`;
}

async function App_saveReport() {
  const c = App.editingCandidate;
  const { error } = await db.from("candidates").update({ report: __repState }).eq("id", c.id);
  if (error) return showToast("Gagal menyimpan laporan: " + error.message);
  c.report = __repState;
  showToast("Laporan disimpan.");
  App.navigate("admin-detail");
}

// ============================================================================
// PREVIEW & EXPORT PDF (window.print())
// ============================================================================
function renderReportPrint() {
  const c = App.editingCandidate;
  render(`
  <div class="no-print" style="position:sticky;top:0;z-index:20;background:var(--ink);padding:12px 20px;display:flex;justify-content:space-between;align-items:center;">
    <div style="color:#fff;font-weight:700;font-size:13px;">Preview Laporan &mdash; ${escapeHtml(c.name)}</div>
    <div class="flex gap-2">
      <button class="btn btn-outline" onclick="App.navigate('admin-detail')">Tutup</button>
      <button class="btn btn-teal" onclick="window.print()">Cetak / Simpan sebagai PDF</button>
    </div>
  </div>
  <div style="background:#78766E;padding:24px 0;">${buildFullReportHtml(c)}</div>`);
}
