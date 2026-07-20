function lineChartSvg({ points, min, max, step, width = 760, height = 220, unit = "", showArea = false, avgLine = null }) {
  const padL = 40, padR = 20, padT = 20, padB = 26;
  const plotW = width - padL - padR, plotH = height - padT - padB;
  const range = (max - min) || 1;
  const n = points.length;
  const x = (i) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v) => padT + plotH - ((v - min) / range) * plotH;
  const ticks = [];
  for (let v = min; v <= max; v += step) ticks.push(v);
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const areaPath = showArea ? `${linePath} L ${x(n - 1).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${x(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z` : null;

  let svg = `<svg width="100%" viewBox="0 0 ${width} ${height}" style="display:block">`;
  ticks.forEach((t) => {
    svg += `<line x1="${padL}" x2="${width - padR}" y1="${y(t)}" y2="${y(t)}" stroke="#E4E1D8" stroke-width="1"/>`;
    svg += `<text x="${padL - 8}" y="${y(t) + 3}" font-size="9" text-anchor="end" fill="#A6A093">${t}</text>`;
  });
  if (avgLine != null) {
    svg += `<line x1="${padL}" x2="${width - padR}" y1="${y(avgLine)}" y2="${y(avgLine)}" stroke="#C0392B" stroke-width="1" stroke-dasharray="4 3"/>`;
  }
  if (showArea) svg += `<path d="${areaPath}" fill="${INK}" opacity="0.06"/>`;
  svg += `<path d="${linePath}" fill="none" stroke="${INK}" stroke-width="2.25"/>`;
  points.forEach((p, i) => {
    svg += `<circle cx="${x(i)}" cy="${y(p.value)}" r="3.4" fill="${INK}"/>`;
    if (p.showLabel !== false) {
      svg += `<text x="${x(i)}" y="${y(p.value) - 9}" font-size="10" font-weight="bold" text-anchor="middle" fill="${INK}">${p.value}${unit}</text>`;
    }
    svg += `<text x="${x(i)}" y="${height - 6}" font-size="9.5" font-weight="bold" text-anchor="middle" fill="#8B8578">${p.label}</text>`;
  });
  svg += `</svg>`;
  return svg;
}

function radarChartSvg({ dims, max = 9, size = 560 }) {
  const cx = size / 2, cy = size / 2;
  const rOuter = size * 0.34;
  const n = dims.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const ringVals = [3, 6, 9];
  const ptFor = (i, val) => {
    const a = angle(i);
    const r = (Math.max(0, Math.min(max, val)) / max) * rOuter;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const dataPts = dims.map((d, i) => {
    const raw = Number(d.value) || 0;
    const displayVal = d.inverse ? max - raw : raw;
    return ptFor(i, displayVal);
  });
  const polyPath = dataPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z";

  let svg = `<svg width="100%" viewBox="0 0 ${size} ${size}" style="display:block">`;
  ringVals.forEach((rv) => {
    const pts = dims.map((_, i) => ptFor(i, rv));
    svg += `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#D8D5CC" stroke-width="1"/>`;
  });
  dims.forEach((d, i) => {
    const [ex, ey] = ptFor(i, max);
    svg += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="#E4E1D8" stroke-width="1"/>`;
  });
  svg += `<path d="${polyPath}" fill="${INK}" fill-opacity="0.12" stroke="${INK}" stroke-width="2"/>`;
  dataPts.forEach((p, i) => {
    const r = dims[i].inverse ? 4.2 : 3.4;
    const color = dims[i].inverse ? "#C0392B" : INK;
    svg += `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${color}"/>`;
  });
  dims.forEach((d, i) => {
    const a = angle(i);
    const lr = rOuter + 34;
    const lx = cx + lr * Math.cos(a), ly = cy + lr * Math.sin(a);
    svg += `<text x="${lx}" y="${ly - 5}" font-size="12" font-weight="bold" text-anchor="middle" fill="${INK}">${d.code}</text>`;
    svg += `<text x="${lx}" y="${ly + 7}" font-size="9" text-anchor="middle" fill="#8B8578">${d.value === "" || d.value == null ? "-" : d.value}</text>`;
  });
  svg += `</svg>`;
  return svg;
}

function hBarHtml(label, value, max, display) {
  const pct = Math.max(0, Math.min(100, (Number(value) / (max || 1)) * 100));
  return `<div class="flex items-center gap-3 mb-2">
    <div class="text-xs font-bold" style="width:32px;color:${INK}">${label}</div>
    <div class="flex-1" style="height:12px;border-radius:9999px;background:#E4E1D8;">
      <div style="height:12px;border-radius:9999px;width:${pct}%;background:${INK};"></div>
    </div>
    <div class="text-xs font-bold text-right" style="width:80px;color:#57534E;">${display}</div>
  </div>`;
}

function scaleBarHtml(pos) {
  let s = `<div class="flex" style="gap:2px;">`;
  for (let i = 0; i < 10; i++) {
    s += `<div style="width:14px;height:14px;border-radius:3px;background:${i + 1 === pos ? INK : "#EEEBE3"};"></div>`;
  }
  return s + `</div>`;
}
