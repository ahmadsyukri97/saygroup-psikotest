function miniHeaderHtml(record, age) {
  return `<div class="flex items-center justify-between mb-5" style="padding-bottom:12px;border-bottom:1px solid #E4E1D8;">
    <div class="flex items-center gap-3">
      <div class="rounded" style="width:44px;height:44px;background:${INK};"></div>
      <div>
        <div class="font-bold text-sm" style="color:${INK}">${escapeHtml(record.name)}</div>
        <div class="text-xs" style="color:#8B8578;">${escapeHtml(record.report?.identity?.gender || "-")} &middot; ${escapeHtml(record.report?.identity?.birthDate || "-")} &middot; ${age} Tahun</div>
      </div>
    </div>
    <div class="text-xs font-bold" style="color:#B3261E;letter-spacing:2px;">RAHASIA</div>
  </div>`;
}
function reportFooter(record, pageNo) {
  return `<div class="report-footer"><span>SAYGROUP Talent Assessment. Dokumen Rahasia.</span><span>${escapeHtml(record.name)} &middot; ${pageNo}</span></div>`;
}

function buildFullReportHtml(record) {
  const report = record.report || emptyReport();
  const age = reportAge(report.identity?.birthDate);
  const initials = record.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const todayStr = new Date(record.submitted_at || Date.now()).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const pages = [];

  // PAGE 1 — COVER
  pages.push(`<div class="report-page" style="overflow:hidden;">
    <div style="position:absolute;top:0;left:0;right:0;height:72%;background:${INK};border-bottom-left-radius:48px;border-bottom-right-radius:48px;">
      <div style="padding:16mm 18mm;">
        <div style="margin-top:140px;">
          <div style="color:#9AA0C0;font-family:Georgia,serif;font-size:30px;">Laporan Hasil</div>
          <div style="color:#fff;font-family:Georgia,serif;font-weight:bold;font-size:42px;">Asesmen</div>
        </div>
        <div style="position:absolute;bottom:46px;left:68px;color:#9AA0C0;font-size:11px;letter-spacing:2px;">RAHASIA &mdash; ${todayStr}</div>
      </div>
    </div>
    <div style="position:absolute;top:76%;left:18mm;">
      <div style="border-left:3px solid ${INK};padding-left:10px;">
        <div style="font-family:Georgia,serif;font-weight:bold;font-size:20px;color:${INK};">${escapeHtml(record.name)}</div>
        <div style="font-size:11px;color:#8B8578;">No. ${record.id.slice(-4)}</div>
      </div>
    </div>
  </div>`);

  // PAGE 2 — DISCLAIMER
  pages.push(`<div class="report-page"><div class="flex-1" style="font-size:12px;line-height:1.6;color:#3A362F;">
    <h1 class="text-2xl font-bold mb-6 serif" style="color:${INK}">Catatan Penting</h1>
    <h3 class="font-bold mb-1" style="color:${INK}">Pentingnya Interpretasi oleh Psikolog</h3>
    <p class="mb-4">Hasil yang tercantum dalam laporan ini menggambarkan profil psikologis pada saat asesmen berlangsung, dan bukan merupakan diagnosa klinis. Laporan ini sebaiknya diinterpretasikan oleh psikolog terlatih yang dapat mempertimbangkan konteks serta tujuan asesmen.</p>
    <h3 class="font-bold mb-1" style="color:${INK}">Validitas dan Keterbatasan Laporan</h3>
    <p class="mb-4">Hasil asesmen dipengaruhi berbagai faktor, termasuk kondisi fisik dan psikologis kandidat saat mengerjakan tes, tingkat motivasi, dan pemahaman terhadap instruksi.</p>
    <h3 class="font-bold mb-1" style="color:${INK}">Kerahasiaan</h3>
    <p>Dokumen ini bersifat RAHASIA. Penyebarluasannya hanya boleh dilakukan kepada pihak yang berkepentingan dan berwenang sesuai kebijakan internal perusahaan.</p>
  </div>${reportFooter(record, 2)}</div>`);

  // PAGE 3 — IDENTITAS
  const idRows = [
    ["Nama Lengkap", record.name], ["ID / NIK", record.id.slice(-4)],
    ["Jenis Kelamin", report.identity?.gender || "-"], ["Usia", `${age} tahun`],
    ["Tempat, Tanggal Lahir", `${report.identity?.birthPlace || "-"}, ${report.identity?.birthDate || "-"}`],
    ["Email", record.email || "-"], ["Pendidikan Terakhir", report.identity?.education || "-"],
    ["Kota Domisili", report.identity?.city || "-"], ["Nomor Telepon", report.identity?.phone || "-"],
    ["Provinsi", report.identity?.province || "-"],
  ];
  pages.push(`<div class="report-page"><div class="flex-1">
    <div style="background:${INK};margin:-22mm -18mm 8mm -18mm;padding:10mm 18mm;">
      <div class="text-xl font-bold" style="color:#fff;letter-spacing:1px;">IDENTITAS KANDIDAT</div>
    </div>
    <div class="rounded-2xl border p-8" style="background:#F8F7F3;">
      <div class="rounded-full flex items-center justify-center font-bold text-xl" style="width:80px;height:80px;background:${INK};color:#fff;margin:0 auto 24px auto;">${initials}</div>
      <div class="grid grid-cols-2" style="column-gap:32px;row-gap:16px;font-size:13px;">
        ${idRows.map(([lbl, val]) => `<div><div class="text-xs font-bold mb-1" style="color:#57534E;">${lbl}</div><div class="rounded-lg border px-3 py-2" style="background:#fff;">${escapeHtml(String(val))}</div></div>`).join("")}
      </div>
    </div>
  </div>${reportFooter(record, 3)}</div>`);

  // PAGE 4 — IST OVERVIEW
  const istPts = IST_SUBTESTS.map((s) => ({ label: s.key, value: Number(report.ist?.subtests?.[s.key]) || 0 }));
  const istChart = lineChartSvg({ points: istPts, min: 55, max: 145, step: 15, height: 200 });
  const istRows = IST_SUBTESTS.map((s) => {
    const v = Number(report.ist?.subtests?.[s.key]) || 0;
    return `<tr class="border-t"><td class="px-3 py-2">${s.name}</td><td class="px-3 py-2 font-bold">${v}</td>
      <td class="px-3 py-2">${istBand(v).label}</td><td class="px-3 py-2">${scaleBarHtml(istScalePos(v))}</td></tr>`;
  }).join("");
  pages.push(`<div class="report-page"><div class="flex-1">
    ${miniHeaderHtml(record, age)}
    <h1 class="text-2xl font-bold mb-3 serif" style="color:${INK}">Intelligenz Struktur Test</h1>
    <p class="text-sm mb-5" style="color:#3A362F;line-height:1.6;">IST mengukur struktur kemampuan kognitif seseorang melalui sembilan subtes verbal, numerik, dan figural. Hasilnya menunjukkan skor kemampuan umum sekaligus profil kekuatan dan kelemahan kognitif.</p>
    <div class="rounded-2xl border p-4 mb-5">${istChart}</div>
    <table>
      <thead><tr style="background:${INK};"><th style="color:#fff;padding:8px 12px;">Kemampuan</th><th style="color:#fff;padding:8px 12px;">Skor</th><th style="color:#fff;padding:8px 12px;">Kategori</th><th style="color:#fff;padding:8px 12px;">Skala</th></tr></thead>
      <tbody>
        <tr style="background:#F0F1F7;"><td class="px-3 py-2 font-bold" style="color:${INK}">Kemampuan Umum (IQ)</td><td class="px-3 py-2 font-bold" style="color:${INK}">${record.iq}</td><td class="px-3 py-2" style="color:${INK}">${escapeHtml(record.category)}</td><td class="px-3 py-2">${scaleBarHtml(istScalePos(record.iq))}</td></tr>
        ${istRows}
      </tbody>
    </table>
  </div>${reportFooter(record, 4)}</div>`);

  // PAGE 5 — IST DETAIL
  const istDetail = IST_SUBTESTS.map((s) => {
    const v = Number(report.ist?.subtests?.[s.key]) || 0;
    return `<div class="mb-4" style="padding-bottom:16px;border-bottom:1px solid #EEEBE3;">
      <div class="font-bold text-sm mb-1" style="color:${INK}">${s.name}</div>
      <p class="text-xs mb-2" style="color:#57534E;line-height:1.5;">${s.desc}</p>
      <div class="flex items-center gap-3"><span class="chip" style="background:#EEF0F8;color:${INK}">${istBand(v).label}</span><span class="font-bold" style="color:${INK};font-size:17px;">${v}</span></div>
    </div>`;
  }).join("");
  pages.push(`<div class="report-page"><div class="flex-1"><h2 class="text-lg font-bold mb-4 serif" style="color:${INK}">Intelligenz Struktur Test &mdash; Rincian</h2>${istDetail}</div>${reportFooter(record, 5)}</div>`);

  // PAGE 6 — FOCUSYNC
  const fs = report.focusync || emptyReport().focusync;
  const trialPts = fs.trials.map((t) => ({ label: `T${t.no}`, value: Number(t.dijawab) || 0, showLabel: false }));
  const trialAvg = Math.round(trialPts.reduce((a, p) => a + p.value, 0) / (trialPts.length || 1));
  const trialMax = Math.max(10, ...trialPts.map((p) => p.value)) + 5;
  const fsChart = lineChartSvg({ points: trialPts, min: 0, max: trialMax, step: Math.max(5, Math.round(trialMax / 6)), height: 170, showArea: true, avgLine: trialAvg });
  const trialHead = fs.trials.map((t) => `<th style="text-align:center;color:#8B8578;padding:4px;">T${t.no}</th>`).join("");
  const trialDijawab = fs.trials.map((t) => `<td style="text-align:center;padding:4px;">${t.dijawab || 0}</td>`).join("");
  const trialSalah = fs.trials.map((t) => `<td style="text-align:center;padding:4px;color:${Number(t.salahPct) ? "#B3261E" : "#C7C3B8"}">${t.salahPct || 0}%</td>`).join("");
  pages.push(`<div class="report-page"><div class="flex-1">
    ${miniHeaderHtml(record, age)}
    <h1 class="text-2xl font-bold mb-3 serif" style="color:${INK}">Focusync</h1>
    <p class="text-sm mb-5" style="color:#3A362F;line-height:1.6;">Focusync mengukur kecepatan, ketahanan, dan stabilitas kerja seseorang di bawah tekanan waktu.</p>
    <table class="mb-5">
      <thead><tr style="background:${INK};"><th style="color:#fff;padding:8px 12px;"></th><th style="color:#fff;padding:8px 12px;">Jumlah</th><th style="color:#fff;padding:8px 12px;">Salah</th><th style="color:#fff;padding:8px 12px;">Simpangan</th><th style="color:#fff;padding:8px 12px;">Tinggi</th><th style="color:#fff;padding:8px 12px;">Puncak</th></tr></thead>
      <tbody>
        <tr style="background:#F6F4EF;"><td class="px-3 py-2 font-bold">Good</td><td class="px-3 py-2">${fs.good.jumlah || 0}</td><td class="px-3 py-2">&mdash;</td><td class="px-3 py-2">${fs.good.simpangan || 0}%</td><td class="px-3 py-2">&mdash;</td><td class="px-3 py-2">&mdash;</td></tr>
        <tr class="border-t"><td class="px-3 py-2 font-bold">Fair</td><td class="px-3 py-2">&mdash;</td><td class="px-3 py-2">${fs.fair.salah || 0}%</td><td class="px-3 py-2">&mdash;</td><td class="px-3 py-2">${fs.fair.tinggi || 0}</td><td class="px-3 py-2">${fs.fair.puncak || 0}</td></tr>
        <tr class="border-t"><td class="px-3 py-2 font-bold">Poor</td><td class="px-3 py-2">${fs.poor.jumlah || 0}</td><td class="px-3 py-2">${fs.poor.salah || 0}%</td><td class="px-3 py-2">&mdash;</td><td class="px-3 py-2">&mdash;</td><td class="px-3 py-2">&mdash;</td></tr>
      </tbody>
    </table>
    <div class="rounded-2xl border p-4 mb-5">${fsChart}</div>
    <table><thead><tr><th></th>${trialHead}</tr></thead><tbody>
      <tr><td class="font-semibold" style="color:#8B8578;">Dijawab</td>${trialDijawab}</tr>
      <tr><td class="font-semibold" style="color:#B3261E;">Salah%</td>${trialSalah}</tr>
    </tbody></table>
  </div>${reportFooter(record, 6)}</div>`);

  // PAGE 7 — PAPI RADAR
  const radarDims = PAPI_DIMS.map((d) => ({ code: d.code, value: report.papi?.[d.code] ?? "", inverse: !!d.inverse }));
  pages.push(`<div class="report-page"><div class="flex-1">
    ${miniHeaderHtml(record, age)}
    <h1 class="text-2xl font-bold mb-3 serif" style="color:${INK}">PAPI Kostick</h1>
    <p class="text-sm mb-5" style="color:#3A362F;line-height:1.6;">PAPI Kostick mengukur 20 aspek kepribadian yang berfokus pada konteks kerja &mdash; orientasi tugas, hubungan interpersonal, kepemimpinan, hingga gaya kerja.</p>
    <div class="rounded-2xl border p-4">${radarChartSvg({ dims: radarDims })}</div>
    <p class="text-xs mt-3" style="color:#A6A093;">* Dimensi Z dan K bersifat inverse (titik merah) &mdash; posisi radar dihitung dari skor yang dibalik.</p>
  </div>${reportFooter(record, 7)}</div>`);

  // PAGE 8/9 — PAPI DETAIL
  function papiDetailBlock(groups) {
    return groups.map((g) => `<div class="mb-4"><div class="text-xs font-bold mb-2" style="color:#8B8578;letter-spacing:1px;">${g.group}</div>
      ${g.dims.map((d) => {
        const score = Number(report.papi?.[d.code]) || 0;
        return `<div class="mb-2" style="padding-bottom:8px;border-bottom:1px solid #F2F0E9;">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold" style="color:${INK}">${d.label} <span style="color:#A6A093;font-weight:normal;">(${d.eng})</span></div>
            <div class="flex items-center gap-2"><span class="chip" style="background:#F3EFE3;color:#92621A;">${papiCategory(score)}</span><span class="font-bold text-sm" style="color:${INK}">${score}</span></div>
          </div>
          <p class="text-xs" style="color:#57534E;">${d.desc}</p>
        </div>`;
      }).join("")}</div>`).join("");
  }
  pages.push(`<div class="report-page"><div class="flex-1"><h2 class="text-lg font-bold mb-4 serif" style="color:${INK}">PAPI Kostick &mdash; Rincian</h2>${papiDetailBlock(PAPI_GROUPS.slice(0, 4))}</div>${reportFooter(record, 8)}</div>`);
  pages.push(`<div class="report-page"><div class="flex-1">${papiDetailBlock(PAPI_GROUPS.slice(4))}</div>${reportFooter(record, 9)}</div>`);

  // PAGE 10 — MBTI
  const mbti = report.mbti || { E: 50, S: 50, T: 50, J: 50 };
  const mbtiType = computeMbtiType(mbti);
  const mbtiInfo = MBTI_INFO[mbtiType] || { title: "-", desc: "Deskripsi tipe belum tersedia." };
  const mbtiRows = [["Energi", "E", "E", "I"], ["Informasi", "S", "S", "N"], ["Keputusan", "T", "T", "F"], ["Gaya Hidup", "J", "J", "P"]]
    .map(([lbl, a, key, b]) => `<tr class="border-t"><td class="px-3 py-2">${lbl}</td><td class="px-3 py-2 font-bold" style="color:${INK}">${a}</td>
      <td class="px-3 py-2 font-bold" style="color:${INK}">${mbti[key]}%</td><td class="px-3 py-2" style="color:#A6A093;">${100 - mbti[key]}%</td><td class="px-3 py-2" style="color:#A6A093;">${b}</td></tr>`).join("");
  pages.push(`<div class="report-page"><div class="flex-1">
    ${miniHeaderHtml(record, age)}
    <h1 class="text-2xl font-bold mb-3 serif" style="color:${INK}">Myers-Briggs Type Indicator</h1>
    <p class="text-sm mb-5" style="color:#3A362F;line-height:1.6;">MBTI mengidentifikasi preferensi kepribadian berdasarkan empat dimensi: orientasi energi, cara memproses informasi, cara mengambil keputusan, dan gaya hidup.</p>
    <div class="rounded-2xl border p-6 mb-5 flex items-center gap-5">
      <div class="rounded-2xl flex items-center justify-center font-bold text-2xl" style="width:90px;height:90px;background:${INK};color:#fff;">${mbtiType}</div>
      <div><div class="text-xs font-bold" style="color:#A6A093;letter-spacing:1px;">TIPE KEPRIBADIAN</div>
        <div class="text-lg font-bold mb-1 serif" style="color:${INK}">${mbtiInfo.title}</div>
        <p class="text-xs" style="color:#57534E;line-height:1.5;">${mbtiInfo.desc}</p></div>
    </div>
    <table class="mb-5"><thead><tr style="background:${INK};"><th style="color:#fff;padding:8px 12px;">Dimensi</th><th style="color:#fff;padding:8px 12px;">Kutub A</th><th style="color:#fff;padding:8px 12px;">% A</th><th style="color:#fff;padding:8px 12px;">% B</th><th style="color:#fff;padding:8px 12px;">Kutub B</th></tr></thead><tbody>${mbtiRows}</tbody></table>
  </div>${reportFooter(record, 10)}</div>`);

  // PAGE 11 — MSDT
  const m = report.msdt || emptyReport().msdt;
  const currentStyle = MSDT_STYLES.find((s) => s.name === m.style) || MSDT_STYLES[5];
  const totals = msdtTotals(m);
  const rowHtml = (label, dic) => `<tr class="border-t"><td class="px-2 py-1 font-semibold">${label}</td>${MSDT_COLS.map((c) => `<td class="px-2 py-1">${dic?.[c] || 0}</td>`).join("")}</tr>`;
  const jumlahRow = `<tr class="border-t" style="background:#F6F4EF;"><td class="px-2 py-1 font-bold">Jumlah</td>${MSDT_COLS.map((c) => `<td class="px-2 py-1 font-bold" style="color:${INK}">${msdtJumlah(m, c)}</td>`).join("")}</tr>`;
  const baseRow = `<tr><td></td>${MSDT_COLS.map((c) => `<td class="px-2 py-1 text-xs" style="color:#A6A093;">${MSDT_BASE_DIM[c]}</td>`).join("")}</tr>`;
  const mappingRows = MSDT_STYLES.map((s) => {
    const j = msdtJumlah(m, s.col);
    const cells = ["TO", "RO", "E", "O"].map((dim) => `<td class="px-2 py-1">${s.dims.includes(dim) ? `<span style="border:1px solid #D8D5CC;border-radius:4px;padding:1px 8px;font-weight:700;">${j}</span>` : ""}</td>`).join("");
    return `<tr class="border-t"><td class="px-2 py-1">${s.name}</td>${cells}</tr>`;
  }).join("");
  const totalRow = `<tr class="border-t font-bold" style="background:#F6F4EF;"><td class="px-2 py-1">Total</td>${["TO", "RO", "E", "O"].map((d) => `<td class="px-2 py-1" style="color:${INK}">${totals[d]}</td>`).join("")}</tr>`;
  const konversiHtml = ["TO", "RO", "E", "O"].map((k) => hBarHtml(k, m.konversi?.[k] || 0, 3, `${m.konversi?.[k] || 0} (${totals[k]})`)).join("");
  pages.push(`<div class="report-page"><div class="flex-1">
    ${miniHeaderHtml(record, age)}
    <h1 class="text-2xl font-bold mb-3 serif" style="color:${INK}">Management Style Diagnosis Test</h1>
    <p class="text-sm mb-5" style="color:#3A362F;line-height:1.6;">MSDT mengidentifikasi gaya kepemimpinan melalui tiga dimensi utama: orientasi tugas (TO), orientasi hubungan (RO), dan efektivitas (E).</p>
    <div class="rounded-2xl border p-5 mb-5 flex items-center gap-5">
      <div class="rounded-xl px-4 py-3 font-bold text-center" style="background:${INK};color:#fff;min-width:130px;">${currentStyle.name}</div>
      <p class="text-xs" style="color:#57534E;line-height:1.5;">${currentStyle.desc}</p>
    </div>
    <table class="mb-5"><thead><tr style="background:${INK};"><th style="color:#fff;padding:8px 12px;"></th>${MSDT_COLS.map((c) => `<th style="color:#fff;padding:8px 12px;">${c}</th>`).join("")}</tr></thead>
      <tbody>${rowHtml("A", m.A)}${rowHtml("B", m.B)}${rowHtml("Koreksi", m.koreksi)}${jumlahRow}${baseRow}</tbody></table>
    <div class="text-xs font-bold mb-2" style="color:#8B8578;letter-spacing:1px;">PEMETAAN DIMENSI</div>
    <table class="mb-5"><thead><tr><th></th><th style="color:#8B8578;">TO</th><th style="color:#8B8578;">RO</th><th style="color:#8B8578;">E</th><th style="color:#8B8578;">O</th></tr></thead><tbody>${mappingRows}${totalRow}</tbody></table>
    <div class="text-xs font-bold mb-2" style="color:#8B8578;letter-spacing:1px;">KONVERSI</div>${konversiHtml}
  </div>${reportFooter(record, 11)}</div>`);

  return `<div id="report-print-root">${pages.join("")}</div>`;
}
