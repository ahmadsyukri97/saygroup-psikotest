// Port dari komponen <Shape> React — menggambar ikon geometris sederhana
// yang dipakai bank soal starter (bukan reproduksi karya berhak cipta apa pun).
const INK = "#1B2559";
let __shapeUid = 0;

function shapeSvg({ shape, fill = "none", rotate = 0, dashed = false, dot = false, size = 44 }) {
  const uid = `sh${__shapeUid++}`;
  const stroke = INK;
  const fillColor = fill === "solid" ? INK : fill === "half" ? `url(#half-${uid})` : "none";
  const dash = dashed ? "4 3" : "0";
  const c = `stroke="${stroke}" stroke-width="2.5" stroke-dasharray="${dash}" fill="${fillColor}"`;
  let node = "";
  switch (shape) {
    case "triangle": node = `<polygon points="22,6 40,38 4,38" ${c}/>`; break;
    case "square": node = `<rect x="6" y="6" width="32" height="32" ${c}/>`; break;
    case "circle": node = `<circle cx="22" cy="22" r="16" ${c}/>`; break;
    case "diamond": node = `<polygon points="22,4 40,22 22,40 4,22" ${c}/>`; break;
    case "pentagon": node = `<polygon points="22,4 40,17 33,38 11,38 4,17" ${c}/>`; break;
    case "hexagon": node = `<polygon points="13,4 31,4 40,22 31,40 13,40 4,22" ${c}/>`; break;
    case "rectWide": node = `<rect x="3" y="14" width="38" height="16" ${c}/>`; break;
    case "rectTall": node = `<rect x="14" y="3" width="16" height="38" ${c}/>`; break;
    case "dots3": node = `<g fill="${INK}"><circle cx="22" cy="8" r="3.2"/><circle cx="10" cy="34" r="3.2"/><circle cx="34" cy="34" r="3.2"/></g>`; break;
    case "dots4": node = `<g fill="${INK}"><circle cx="10" cy="10" r="3"/><circle cx="34" cy="10" r="3"/><circle cx="10" cy="34" r="3"/><circle cx="34" cy="34" r="3"/></g>`; break;
    case "diagLines": node = `<g stroke="${INK}" stroke-width="2.5"><line x1="4" y1="40" x2="18" y2="4"/><line x1="16" y1="40" x2="30" y2="4"/><line x1="28" y1="40" x2="42" y2="4"/></g>`; break;
    case "arrowR": node = `<g stroke="${INK}" stroke-width="3" fill="none"><line x1="4" y1="22" x2="34" y2="22"/><polyline points="26,12 38,22 26,32"/></g>`; break;
    case "arrowR2": node = `<g stroke="${INK}" stroke-width="3" fill="none"><polyline points="4,12 16,22 4,32"/><polyline points="20,12 32,22 20,32"/></g>`; break;
    case "arrowL2": node = `<g stroke="${INK}" stroke-width="3" fill="none"><polyline points="40,12 28,22 40,32"/><polyline points="24,12 12,22 24,32"/></g>`; break;
    case "stripedTri": node = `<g><polygon points="22,4 40,38 4,38" stroke="${INK}" stroke-width="2.5" fill="none"/><rect x="6" y="24" width="32" height="6" fill="${INK}" clip-path="url(#triClip-${uid})"/><clipPath id="triClip-${uid}"><polygon points="22,4 40,38 4,38"/></clipPath></g>`; break;
    case "cross": node = `<g stroke="${INK}" stroke-width="3"><line x1="8" y1="8" x2="36" y2="36"/><line x1="36" y1="8" x2="8" y2="36"/></g>`; break;
    case "star3": node = `<g stroke="${INK}" stroke-width="2.5" fill="none"><line x1="22" y1="4" x2="22" y2="40"/><line x1="6" y1="14" x2="38" y2="30"/><line x1="38" y1="14" x2="6" y2="30"/></g>`; break;
    default: node = `<rect x="6" y="6" width="32" height="32" stroke="${INK}" stroke-width="2" fill="none"/>`;
  }
  const dotNode = dot ? `<circle cx="22" cy="22" r="3" fill="${fill === "solid" ? "#fff" : INK}"/>` : "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 44 44" style="transform:rotate(${rotate}deg)">
    <defs><clipPath id="half-${uid}"><rect x="22" y="0" width="22" height="44"/></clipPath></defs>
    ${node}${dotNode}
  </svg>`;
}

function iconOptionHtml(specs) {
  return `<div style="display:flex;align-items:center;justify-content:center;gap:2px;">${specs.map(shapeSvg).join("")}</div>`;
}

function emojiHtml(symbol) {
  return `<div style="font-size:34px;line-height:1;">${symbol}</div>`;
}

// Renders the content of ANY option shape used across the app.
function optionContentHtml(opt) {
  if (typeof opt === "string") return `<span>${escapeHtml(opt)}</span>`;
  if (opt && opt.icon) return iconOptionHtml(opt.icon);
  if (opt && opt.emoji) return emojiHtml(opt.emoji);
  if (opt && (opt.image || opt.text)) {
    return `<div class="flex items-center gap-3">
      ${opt.image ? `<img src="${opt.image}" alt="" class="rounded-lg border" style="width:44px;height:44px;object-fit:cover;">` : ""}
      ${opt.text ? `<span>${escapeHtml(opt.text)}</span>` : ""}
    </div>`;
  }
  return `<span style="color:#C7C3B8">(opsi kosong)</span>`;
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s ?? "";
  return d.innerHTML;
}
