// ============================================================================
// EDITOR SOAL
// ============================================================================
let __qeState = null; // working copy sementara saat mengedit

function App_editQuestion(id) {
  const existing = id ? App.questionsAdmin.find((q) => q.id === id) : null;
  if (existing) {
    __qeState = {
      id: existing.id,
      order_no: existing.order_no,
      prompt: existing.prompt,
      prompt_image: existing.prompt_image || "",
      answer: existing.answer,
      options: existing.options.map((o) => ({
        kind: typeof o === "string" ? "text" : o.emoji ? "emoji" : "other",
        text: typeof o === "string" ? o : "",
        emoji: o && o.emoji ? o.emoji : "",
        raw: o,
      })),
    };
  } else {
    const nextNo = (App.questionsAdmin.reduce((m, q) => Math.max(m, q.order_no), 0) || 0) + 1;
    __qeState = {
      id: null, order_no: nextNo, prompt: "", prompt_image: "", answer: "a",
      options: [
        { kind: "text", text: "", emoji: "" }, { kind: "text", text: "", emoji: "" },
        { kind: "text", text: "", emoji: "" }, { kind: "text", text: "", emoji: "" },
      ],
    };
  }
  App.navigate("question-editor");
}

function renderQuestionEditor() {
  const s = __qeState;
  const optRows = s.options.map((o, i) => {
    const letter = LETTERS[i];
    if (o.kind === "other") {
      return `<div class="flex items-center gap-2 mb-2">
        <span class="bubble-letter">${letter.toUpperCase()}</span>
        <div class="text-xs flex-1" style="color:var(--muted)">Opsi bergambar (icon set) — edit manual lewat Supabase Table Editor pada kolom <code>options</code>.</div>
        <button class="btn btn-danger-outline text-xs" style="padding:4px 8px;" onclick="App_qeRemoveOption(${i})">Hapus</button>
      </div>`;
    }
    return `<div class="flex items-center gap-2 mb-2">
      <span class="bubble-letter">${letter.toUpperCase()}</span>
      <div class="field-box flex-1" style="padding:6px 10px;">
        <input placeholder="Teks opsi atau tempel emoji" value="${escapeHtml(o.text || o.emoji)}" oninput="App_qeSetOption(${i}, this.value)">
      </div>
      <button class="btn btn-danger-outline text-xs" style="padding:4px 8px;" onclick="App_qeRemoveOption(${i})">Hapus</button>
    </div>`;
  }).join("");
  const answerOptions = s.options.map((_, i) => LETTERS[i]).map((l) => `<option value="${l}" ${s.answer === l ? "selected" : ""}>${l.toUpperCase()}</option>`).join("");

  render(`<div class="min-h-screen">${adminHeader("soal")}
    <div class="p-6"><div class="max-w-lg mx-auto">
      <button class="text-sm mb-4" style="color:var(--muted)" onclick="App.navigate('admin-dashboard', {adminTab:'soal'})">&larr; Kembali</button>
      <div class="card p-8">
        <h2 class="text-lg font-bold serif mb-5" style="color:var(--ink)">${s.id ? "Edit Soal" : "Tambah Soal"}</h2>
        <div class="field-wrap"><label class="field-label">Nomor Urut</label><div class="field-box"><input type="number" value="${s.order_no}" oninput="__qeState.order_no=Number(this.value)"></div></div>
        <div class="field-wrap"><label class="field-label">Pertanyaan</label><div class="field-box"><textarea rows="3" oninput="__qeState.prompt=this.value">${escapeHtml(s.prompt)}</textarea></div></div>
        <div class="field-wrap"><label class="field-label">Opsi Jawaban</label>${optRows}
          <button class="btn btn-outline text-xs mt-1" ${s.options.length >= 8 ? "disabled" : ""} onclick="App_qeAddOption()">+ Tambah Opsi</button>
        </div>
        <div class="field-wrap"><label class="field-label">Kunci Jawaban (RAHASIA)</label><div class="field-box"><select onchange="__qeState.answer=this.value">${answerOptions}</select></div></div>
        ${App.error ? `<div class="rounded-lg px-3 py-2 mb-4 text-sm" style="background:var(--danger-bg);color:var(--danger)">${App.error}</div>` : ""}
        <div class="flex gap-3 mt-4">
          <button class="btn btn-primary flex-1" onclick="App_saveQuestion()">Simpan</button>
          <button class="btn btn-outline" onclick="App.navigate('admin-dashboard', {adminTab:'soal'})">Batal</button>
        </div>
      </div>
    </div></div>
  </div>`);
}
function App_qeAddOption() { __qeState.options.push({ kind: "text", text: "", emoji: "" }); App.renderCurrent(); }
function App_qeRemoveOption(i) { __qeState.options.splice(i, 1); App.renderCurrent(); }
function App_qeSetOption(i, val) {
  const isEmoji = /\p{Emoji}/u.test(val) && val.trim().length <= 4;
  __qeState.options[i] = isEmoji ? { kind: "emoji", text: "", emoji: val } : { kind: "text", text: val, emoji: "" };
}
async function App_saveQuestion() {
  const s = __qeState;
  if (!s.prompt.trim()) { App.error = "Pertanyaan wajib diisi."; return App.renderCurrent(); }
  if (s.options.length < 2) { App.error = "Minimal 2 opsi jawaban."; return App.renderCurrent(); }
  const options = s.options.map((o) => (o.kind === "other" ? o.raw : o.kind === "emoji" ? { emoji: o.emoji } : o.text));
  const payload = { order_no: s.order_no, prompt: s.prompt.trim(), prompt_image: s.prompt_image || null, options, answer: s.answer, visual: false };
  let error;
  if (s.id) {
    ({ error } = await db.from("questions").update(payload).eq("id", s.id));
  } else {
    const nextId = String(Date.now());
    ({ error } = await db.from("questions").insert({ id: nextId, ...payload }));
  }
  if (error) { App.error = "Gagal menyimpan: " + error.message; return App.renderCurrent(); }
  showToast("Soal disimpan.");
  App.navigate("admin-dashboard", { adminTab: "soal" });
}
