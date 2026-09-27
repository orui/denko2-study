// 暗記カード用の図（すべてインラインSVG。色はページのCSS変数を使うのでダークモードでも見える）
// FIG(spec) → SVG文字列。spec は ['種類', ...引数]
(function(){
const E = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" class="fig" role="img" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.s || 13}" text-anchor="${o.a || 'middle'}" class="${o.c || 'ft'}"${o.w ? ` font-weight="${o.w}"` : ''}>${E(s)}</text>`;
const L = (x1, y1, x2, y2, c = 'fs', extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c}" ${extra}/>`;
const C = (x, y, r, c = 'fs') => `<circle cx="${x}" cy="${y}" r="${r}" class="${c}"/>`;
const R = (x, y, w, h, c = 'fs', rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${c}"/>`;
const P = (d, c = 'fs') => `<path d="${d}" class="${c}"/>`;
const arrowHead = (x, y, ang, c = 'fk', s = 7) => { const a = ang * Math.PI / 180, p = [[x, y], [x - s * Math.cos(a - .45), y - s * Math.sin(a - .45)], [x - s * Math.cos(a + .45), y - s * Math.sin(a + .45)]]; return `<polygon points="${p.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}" class="${c}"/>`; };
const arrow = (x1, y1, x2, y2, c = 'fs', hc = 'fk') => L(x1, y1, x2, y2, c) + arrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, hc);

// ---------- 図記号（1つ分。中心0,0、おおよそ±22の範囲に描く） ----------
const sub = (s, x = 16, y = 12) => s ? T(x, y, s, {s: 13, a: 'start'}) : '';
const SYM = {
  // 照明
  lamp: s => C(0, 0, 13) + sub(s),
  lampWall: () => C(0, 0, 13) + P('M0,-13 A13,13 0 0 0 0,13 Z', 'fk'),
  lampOut: () => C(0, 0, 14) + C(0, 0, 8),
  fluor: s => R(-28, -6, 56, 12) + C(0, 0, 11, 'fs fbg') + (s ? T(0, 4, s, {s: 10}) : ''),
  circTxt: s => C(0, 0, 15) + T(0, 5, s, {s: 12}),
  pendant: () => C(0, 0, 13) + L(-13, 0, 13, 0),
  hikKaku: () => R(-16, -10, 32, 20) + T(0, 5, '( )', {s: 12}),
  hikMaru: () => C(0, 0, 14) + T(0, 5, '( )', {s: 12}),
  yudo: () => C(0, 0, 13) + P('M-9.2,-9.2 L9.2,9.2 M9.2,-9.2 L-9.2,9.2') + P('M0,0 L-9.2,-9.2 A13,13 0 0 1 9.2,-9.2 Z', 'fk') + P('M0,0 L9.2,9.2 A13,13 0 0 1 -9.2,9.2 Z', 'fk'),
  // コンセント
  outlet: s => C(0, 0, 14) + L(-4, -13.4, -4, 13.4) + L(4, -13.4, 4, 13.4) + sub(s, 17),
  outletWall: s => P('M0,-14 A14,14 0 0 0 0,14 Z', 'fk') + C(0, 0, 14) + L(0, -4, 13.4, -4) + L(0, 4, 13.4, 4) + sub(s, 17),
  outletFloor: s => C(0, -4, 14) + L(-4, -17.4, -4, 9.4) + L(4, -17.4, 4, 9.4) + `<polygon points="0,11 -6,21 6,21" class="fk"/>` + sub(s, 17, 8),
  earthTerm: () => C(0, 0, 14) + L(0, -8, 0, 0) + L(-8, 0, 8, 0) + L(-5, 4, 5, 4) + L(-2, 8, 2, 8),
  // スイッチ
  sw: s => C(0, 0, 6, 'fk') + sub(s, 10, 6),
  swWide: () => `<polygon points="0,-9 9,0 0,9 -9,0" class="fk"/>`,
  dimmer: () => C(0, 0, 6, 'fk') + arrow(-16, 12, 17, -12),
  pilot: () => C(0, 0, 8),
  swBox: s => R(-13, -13, 26, 26) + C(0, 0, 5, 'fk') + sub(s, 17),
  dot: s => C(0, 0, 11) + C(0, 0, 6, 'fk') + sub(s, 14, 10),
  relay: n => Array.from({length: n || 1}, (_, k) => `<polygon points="${-9 + (k - ((n || 1) - 1) / 2) * 20},8 ${(k - ((n || 1) - 1) / 2) * 20},-8 ${9 + (k - ((n || 1) - 1) / 2) * 20},8" class="fk"/>`).join(''),
  selector: () => C(0, 0, 14) + [0, 45, 90, 135].map(a => { const r = a * Math.PI / 180; return L(-14 * Math.cos(r), -14 * Math.sin(r), 14 * Math.cos(r), 14 * Math.sin(r)); }).join(''),
  trans: s => C(0, 0, 13) + T(0, 5, 'T', {s: 14}) + sub(s, 14, 14),
  // ボックス・配線
  vvfJB: () => C(0, 0, 14) + [-7, 0, 7].map(o => { const hh = Math.sqrt(14 * 14 - o * o), cx = o / Math.SQRT2, cy = o / Math.SQRT2, d = hh / Math.SQRT2; return L((cx - d).toFixed(1), (cy + d).toFixed(1), (cx + d).toFixed(1), (cy - d).toFixed(1)); }).join(''),
  jb: () => R(-12, -12, 24, 24),
  pull: () => R(-12, -12, 24, 24) + L(-12, -12, 12, 12) + L(12, -12, -12, 12),
  ld: () => R(-26, -6, 12, 12) + L(-14, 0, 26, 0, 'fs', 'stroke-dasharray="5 4"') + T(0, 17, 'LD', {s: 11}),
  earth: s => L(0, -14, 0, -2) + L(-12, -2, 12, -2) + L(-8, 4, 8, 4) + L(-4, 10, 4, 10) + sub(s, 14, 8),
  up: () => C(-6, 6, 5) + arrow(-2.5, 2.5, 13, -13),
  down: () => C(-6, 6, 5) + L(13, -13, -2.5, 2.5) + arrowHead(-2.5, 2.5, 135),
  thru: () => C(0, 0, 5) + L(-14, 14, -3.5, 3.5) + arrow(3.5, -3.5, 14, -14),
  juden: () => P('M-10,-10 L4,-10 L-4,2 L10,2') + arrowHead(10, 2, 0),
  // 盤・機器
  wh: () => C(0, 0, 15) + T(0, 5, 'Wh', {s: 13}),
  panel: () => R(-22, -10, 44, 20) + `<polygon points="-22,10 22,-10 22,10" class="fk"/>`,
  ctrlPanel: () => R(-22, -10, 44, 20) + `<polygon points="-22,-10 0,0 -22,10" class="fk"/><polygon points="22,-10 0,0 22,10" class="fk"/>`,
  distPanel: () => R(-22, -10, 44, 20) + L(-22, -10, 22, 10) + L(22, -10, -22, 10),
  box: s => R(-15, -13, 30, 26) + T(0, 6, s, {s: s.length > 1 ? 13 : 16}),
  boxS: () => R(-15, -13, 30, 26) + C(0, 0, 10) + T(0, 5, 'S', {s: 13}),
  mb: () => R(-15, -13, 30, 26) + T(0, 6, 'B', {s: 16}) + T(22, 12, 'M', {s: 11}),
  mb2: () => R(-15, -13, 30, 26) + T(0, 6, 'B', {s: 16}) + L(-7, -6, 7, 6),
  motor: () => C(0, 0, 14) + T(0, 5, 'M', {s: 14}),
  heater: () => C(0, 0, 14) + T(0, 5, 'H', {s: 14}),
  cond: () => R(-13, -13, 26, 26) + L(0, -13, 0, -3) + L(-8, -3, 8, -3) + L(-8, 3, 8, 3) + L(0, 3, 0, 13),
  fanWall: () => C(0, 0, 15) + C(-5, 0, 5) + C(5, 0, 5),
  fanCeil: () => R(-15, -15, 30, 30) + C(-5, 0, 5) + C(5, 0, 5),
  rc: s => R(-17, -9, 34, 18) + T(0, 5, 'RC', {s: 11}) + sub(s, 20, 10)
};
function sym(key, arg){ const f = SYM[key]; return f ? f(arg) : ''; }

// 記号を横に並べて名前を添える： ['syms', [[key,arg,名前], ...], {hi: 強調する番号}]
function syms(list, o = {}){
  const n = list.length, cw = o.cw || (n > 4 ? 76 : 96), w = cw * n, h = 92;
  return svg(w, h, list.map(([k, a, name], i) => {
    const x = cw * i + cw / 2;
    return `<g transform="translate(${x},36)">${o.hi === i ? R(-cw / 2 + 4, -30, cw - 8, 84, 'fhi', 8) : ''}${sym(k, a)}</g>` + (name ? T(x, 84, name, {s: 12, c: o.hi === i ? 'ft fa' : 'ft'}) : '');
  }).join(''));
}
// 記号1つを大きく見せる： ['sym', key, arg, 名前]
function big(key, arg, name){ return svg(200, 110, `<g transform="translate(100,48) scale(1.7)">${sym(key, arg)}</g>` + (name ? T(100, 104, name, {s: 13}) : '')); }

// ---------- 配線の線種 ----------
function line1(i){
  const d = ['', 'stroke-dasharray="14 7"', 'stroke-dasharray="3 4"', 'stroke-dasharray="14 5 3 5"'][i];
  return svg(260, 60, L(20, 30, 240, 30, 'fs fbold', d));
}
function lines(hi){
  const kinds = [['天井隠ぺい', ''], ['床隠ぺい', 'stroke-dasharray="14 7"'], ['露出', 'stroke-dasharray="3 4"'], ['地中埋設', 'stroke-dasharray="14 5 3 5"']];
  return svg(300, 150, kinds.map(([n, d], i) => { const y = 22 + i * 34, on = hi === undefined || hi === i;
    return L(12, y, 170, y, on ? 'fs fbold' : 'fs fdim', d) + T(184, y + 5, n + '配線', {s: 13, a: 'start', c: hi === i ? 'ft fa' : on ? 'ft' : 'ft fdim'}); }).join(''));
}

// ---------- 帯グラフ（数値の範囲） ['bands', [[ラベル, 値テキスト, 相対幅, 強調?], ...], 見出し] ----------
function bands(rows, title){
  const tot = rows.reduce((a, r) => a + r[2], 0), W = 300, x0 = 10; let x = x0;
  const cls = ['fb1', 'fb2', 'fb3', 'fb4'];
  const body = rows.map((r, i) => { const w = (W - 20) * r[2] / tot, g = R(x, 34, w, 30, (r[3] ? 'fhi2 ' : '') + cls[i % 4], 0) + T(x + w / 2, 54, r[0], {s: 13, w: 700}) + T(x + w / 2, 84, r[1], {s: 11}); x += w; return g; }).join('');
  return svg(W, 100, (title ? T(W / 2, 20, title, {s: 12}) : '') + body);
}

// ---------- 数値を大きく： ['big', 値, 単位, 説明] ----------
function bignum(v, unit, cap){ return svg(260, 100, T(130, 58, v, {s: 40, w: 700, c: 'ft fa'}) + (unit ? T(130, 82, unit, {s: 13}) : '') + (cap ? T(130, 18, cap, {s: 12}) : '')); }

// ---------- 対応表： ['kv', [[左, 右], ...], 強調行] ----------
function kv(rows, hi){
  const rh = 30, W = 300, H = rows.length * rh + 8;
  return svg(W, H, rows.map(([a, b], i) => { const y = 4 + i * rh, on = hi === undefined || hi === i;
    return R(4, y, W - 8, rh - 4, hi === i ? 'fhi' : 'fcell', 6) + T(16, y + 18, a, {s: 13, a: 'start', w: 700, c: on ? 'ft' : 'ft fdim'}) + T(W - 16, y + 18, b, {s: 13, a: 'end', c: hi === i ? 'ft fa' : on ? 'ft' : 'ft fdim'}); }).join(''));
}

// ---------- 流れ図： ['flow', [手順...], 強調] ----------
function flow(steps, hi){
  const n = steps.length, W = 300, bh = 30, gap = 14, H = n * (bh + gap);
  return svg(W, H, steps.map((s, i) => { const y = i * (bh + gap);
    return R(30, y, W - 60, bh, hi === i ? 'fhi' : 'fcell', 8) + T(W / 2, y + 20, s, {s: 13, w: hi === i ? 700 : 400, c: hi === i ? 'ft fa' : 'ft'}) + (i < n - 1 ? arrow(W / 2, y + bh + 1, W / 2, y + bh + gap - 1) : ''); }).join(''));
}

// ---------- 数式： ['eq', 式, 補足] ----------
function eq(f, note){ return svg(300, note ? 96 : 70, R(10, 8, 280, 52, 'fcell', 10) + T(150, 42, f, {s: 22, w: 700, c: 'ft fa'}) + (note ? T(150, 86, note, {s: 12}) : '')); }

// ---------- 個別の図 ----------
const PIC = {
  // 単線とより線
  wires: () => svg(300, 110, C(60, 45, 22) + C(60, 45, 12, 'fk') + T(60, 92, '単線：直径 mm', {s: 12}) +
      C(210, 45, 22) + [[0, 0], [-8, -5], [8, -5], [0, 9], [-8, 5], [8, 5], [0, -10]].map(([a, b]) => C(210 + a, 45 + b, 4.2, 'fk')).join('') + T(210, 92, 'より線：断面積 mm²', {s: 12})),
  // VVFケーブル（平形）
  vvf: () => svg(300, 100, `<rect x="70" y="30" width="160" height="40" rx="20" class="fs fcell"/>` + C(120, 50, 12, 'fk') + C(180, 50, 12, 'fs fbg') + T(120, 88, '黒', {s: 11}) + T(180, 88, '白', {s: 11}) + T(150, 18, 'VVF：断面が平たい', {s: 12, c: 'ft fa'})),

  // 複線図の原則
  principle: k => { const hiW = k === 'white', hiB = k === 'black', hi3 = k === 'sw';
    return svg(300, 130, T(16, 24, '非接地側（黒）', {s: 11, a: 'start', c: hiB ? 'ft fa' : 'ft'}) + L(16, 32, 284, 32, hiB ? 'fs fbold faS' : 'fs fbold') + T(16, 124, '接地側（白）', {s: 11, a: 'start', c: hiW ? 'ft fa' : 'ft'}) + L(16, 110, 284, 110, hiW ? 'fs fbold faS' : 'fs fbold fwline') +
      L(110, 32, 110, 46, hiB ? 'fs fbold faS' : 'fs') + C(110, 46, 2.5, 'fk') + L(110, 46, 120, 60, 'fs fbold') + C(110, 64, 2.5, 'fk') + T(90, 58, 'SW', {s: 10}) +
      L(110, 64, 110, 72, hi3 ? 'fs fbold faS' : 'fs') + L(110, 72, 200, 72, hi3 ? 'fs fbold faS' : 'fs') + C(200, 82, 10) + L(193, 75, 207, 89) + L(207, 75, 193, 89) + T(222, 86, '電灯', {s: 10, a: 'start'}) + L(200, 92, 200, 110, hiW ? 'fs fbold faS' : 'fs') +
      L(260, 32, 260, 58, hiB ? 'fs fbold faS' : 'fs') + C(260, 70, 11) + L(256, 64, 256, 76) + L(264, 64, 264, 76) + L(260, 81, 260, 110, hiW ? 'fs fbold faS' : 'fs') + T(272, 74, 'コンセント', {s: 9, a: 'start'})); },
  // スイッチに至る電線の本数
  swCount: n => { const lab = {2: '単極1個 → 2本', 3: '単極2個（同じボックス）→ 3本', '3w': '3路スイッチ → 3本', '4w': '4路スイッチ → 4本'}[n], cnt = {2: 2, 3: 3, '3w': 3, '4w': 4}[n];
    return svg(300, 110, Array.from({length: cnt}, (_, i) => L(110 + i * 26, 14, 110 + i * 26, 70, 'fs fbold')).join('') + P(`M${96},42 a${(cnt - 1) * 13 + 20},8 0 1 0 ${(cnt - 1) * 26 + 28},0 a${(cnt - 1) * 13 + 20},8 0 1 0 ${-((cnt - 1) * 26 + 28)},0`, 'fs faS') + T(150, 100, lab, {s: 13, w: 700, c: 'ft fa'})); },
  // リングスリーブの計算
  sleeveCalc: (s) => { const [f, r] = s.split('|'); return svg(300, 110, R(10, 8, 280, 44, 'fcell', 10) + T(150, 36, f, {s: 17, w: 700}) + T(150, 86, r, {s: 18, w: 700, c: 'ft fa'})); },
  // ケーブル本数
  cableN: n => svg(300, 100, (n === 4 ? [0, 1] : [0]).map(k => `<rect x="${60 + k * 100}" y="30" width="${n === 3 ? 120 : 80}" height="34" rx="17" class="fs fcell"/>` + (n === 3 ? ['fk', 'fbg fs', 'fk'] : ['fk', 'fbg fs']).map((c, i) => C(78 + k * 100 + i * 28 + (n === 3 ? 12 : 8), 47, 9, c)).join('')).join('') + T(150, 90, {2: '2本 → VVF 2心×1', 3: '3本 → VVF 3心×1', 4: '4本 → VVF 2心×2'}[n], {s: 13, w: 700, c: 'ft fa'})),
  // 三相Y・Δ
  yd: () => svg(300, 120, T(70, 16, 'Y結線', {s: 12, w: 700}) + P('M70,40 L70,66 M70,66 L46,90 M70,66 L94,90', 'fs fbold') + T(70, 112, '線間電圧＝√3×相電圧', {s: 11, c: 'ft fa'}) + T(220, 16, 'Δ結線', {s: 12, w: 700}) + `<polygon points="220,34 192,88 248,88" class="fs fbold"/>` + T(220, 112, '線電流＝√3×相電流', {s: 11, c: 'ft fa'})),
  // 中性線の断線
  neutral: () => svg(300, 120, L(30, 24, 250, 24, 'fs fbold') + L(30, 60, 110, 60, 'fs fbold fwline') + P('M112,54 l6,12 M122,54 l6,12', 'fs fred') + L(130, 60, 250, 60, 'fs fbold fwline') + L(30, 96, 250, 96, 'fs fbold') + R(200, 30, 24, 22, 'fcell') + R(200, 66, 24, 22, 'fcell') + L(212, 24, 212, 30) + L(212, 52, 212, 66) + L(212, 88, 212, 96) + T(236, 44, '負荷A', {s: 10, a: 'start'}) + T(236, 80, '負荷B', {s: 10, a: 'start'}) + T(120, 44, '断線', {s: 11, c: 'ft fa'}) + T(150, 114, '軽い負荷側に200V近い電圧がかかる', {s: 11, c: 'ft fa'})),
  // 絶縁抵抗の測り方
  megTest: k => svg(300, 120, L(20, 30, 230, 30, 'fs fbold') + L(20, 66, 230, 66, 'fs fbold') + T(150, 16, k === 'line' ? '電線相互間：負荷を外す・スイッチは入れる' : '大地との間：負荷はつないだまま・スイッチは入れる', {s: 11, c: 'ft fa'}) +
      (k === 'line' ? R(236, 30, 30, 36, 'fs fdash') + T(251, 84, '負荷を外す', {s: 9}) + L(120, 30, 120, 80) + L(150, 66, 150, 80) + R(110, 80, 50, 26, 'fcell', 5) + T(135, 98, 'MΩ', {s: 11}) : R(236, 36, 30, 24, 'fcell') + L(230, 30, 251, 36) + L(230, 66, 251, 60) + L(120, 30, 120, 80) + R(110, 80, 50, 26, 'fcell', 5) + T(135, 98, 'MΩ', {s: 11}) + L(160, 93, 200, 93) + L(200, 93, 200, 110) + L(190, 110, 210, 110) + T(222, 112, '大地', {s: 9, a: 'start'}))),
  // 接地抵抗計の配置
  earthLine: () => svg(300, 100, L(10, 60, 290, 60, 'fs fdim') + [[40, 'E', '被測定接地極'], [150, 'P', '補助'], [260, 'C', '補助']].map(([x, n, s]) => L(x, 40, x, 80, 'fs fbold') + T(x, 32, n, {s: 14, w: 700, c: 'ft fa'}) + T(x, 96, s, {s: 10})).join('') + arrow(48, 50, 142, 50) + arrow(158, 50, 252, 50) + T(95, 46, '約10m', {s: 10}) + T(205, 46, '約10m', {s: 10})),
  // 変圧器と接地側
  transGround: () => svg(300, 130, T(40, 16, '柱上変圧器', {s: 11}) + R(18, 26, 44, 60) + P('M40,30 q8,5 0,10 q8,5 0,10 q8,5 0,10 q8,5 0,10 q8,5 0,10') +
      L(62, 36, 250, 36, 'fs fbold') + T(262, 40, '黒', {s: 12, a: 'start'}) + L(62, 76, 250, 76, 'fs fbold fwline') + T(262, 80, '白', {s: 12, a: 'start'}) +
      L(90, 76, 90, 100) + L(78, 100, 102, 100) + L(82, 106, 98, 106) + L(86, 112, 94, 112) + T(130, 108, 'B種接地（対地電圧0V）', {s: 12, a: 'start', c: 'ft fa'}) +
      T(160, 30, '非接地側', {s: 11}) + T(160, 70, '接地側', {s: 11})),
  // コンセントの穴
  outletFace: () => svg(220, 130, R(50, 10, 120, 100, 'fcell', 14) + R(80, 32, 12, 56, 'fk', 2) + R(128, 40, 12, 40, 'fk', 2) +
      T(86, 124, '長い穴 9mm', {s: 11, a: 'end', c: 'ft fa'}) + T(86, 26, '接地側 W', {s: 11, a: 'end', c: 'ft fa'}) + T(134, 124, '短い穴 7mm', {s: 11, a: 'start'}) + T(134, 26, '非接地側', {s: 11, a: 'start'})),
  // スイッチは非接地側
  swNonGround: () => svg(300, 120, T(20, 30, '非接地側（黒）', {s: 11, a: 'start'}) + L(20, 40, 280, 40, 'fs fbold') + T(20, 106, '接地側（白）', {s: 11, a: 'start'}) + L(20, 96, 280, 96, 'fs fbold fwline') +
      L(150, 40, 150, 52) + C(150, 54, 2.5, 'fk') + L(150, 54, 162, 64, 'fs fbold') + C(150, 68, 2.5, 'fk') + L(150, 68, 150, 72) + T(180, 64, 'スイッチ', {s: 11, a: 'start', c: 'ft fa'}) +
      C(150, 82, 9) + L(144, 76, 156, 88) + L(156, 76, 144, 88) + L(150, 91, 150, 96) + T(180, 86, '電灯', {s: 11, a: 'start'})),
  // 保護装置
  protect: () => svg(300, 110, R(10, 10, 130, 90, 'fcell', 10) + T(75, 34, '短絡・過負荷', {s: 13, w: 700}) + T(75, 62, '過電流遮断器', {s: 12, c: 'ft fa'}) + T(75, 82, 'ヒューズ／配線用遮断器', {s: 10}) +
      R(160, 10, 130, 90, 'fcell', 10) + T(225, 34, '地絡（漏電）', {s: 13, w: 700}) + T(225, 62, '漏電遮断器', {s: 12, c: 'ft fa'}) + T(225, 82, '零相変流器ZCTで検出', {s: 10})),
  // 正弦波
  sine: () => { let d = 'M20,60'; for(let x = 0; x <= 260; x += 4) d += ` L${20 + x},${(60 - 40 * Math.sin(x / 260 * 2 * Math.PI)).toFixed(1)}`;
    return svg(300, 124, L(20, 60, 285, 60, 'fs fdim') + P(d, 'fs fbold faS') + L(20, 20, 150, 20, 'fs', 'stroke-dasharray="4 3"') + T(160, 24, '最大値 141V', {s: 12, a: 'start'}) +
      L(20, 31.7, 150, 31.7, 'fs', 'stroke-dasharray="2 3"') + T(160, 40, '実効値 100V', {s: 12, a: 'start', c: 'ft fa'}) + T(150, 118, '最大値 ＝ 実効値 × √2', {s: 12})); },
  // 配電方式
  haiden: k => svg(300, 120, {
    '1p2w': T(150, 16, '単相2線式 100V（1φ2W）', {s: 12, w: 700}) + L(40, 40, 260, 40, 'fs fbold') + L(40, 90, 260, 90, 'fs fbold fwline') + T(270, 70, '100V', {s: 12, a: 'start'}) + L(262, 42, 262, 88),
    '1p3w': T(150, 16, '単相3線式 100/200V（1φ3W）', {s: 12, w: 700}) + L(40, 34, 250, 34, 'fs fbold') + L(40, 64, 250, 64, 'fs fbold fwline') + L(40, 94, 250, 94, 'fs fbold') + T(20, 68, '中性線', {s: 10, a: 'start'}) +
      L(255, 36, 255, 62) + T(262, 53, '100V', {s: 11, a: 'start'}) + L(255, 66, 255, 92) + T(262, 83, '100V', {s: 11, a: 'start'}) + T(150, 114, '外側の2線の間は200V', {s: 12, c: 'ft fa'}),
    '3p3w': T(150, 16, '三相3線式 200V（3φ3W）', {s: 12, w: 700}) + L(40, 34, 250, 34, 'fs fbold') + L(40, 64, 250, 64, 'fs fbold fwline') + L(40, 94, 250, 94, 'fs fbold') + T(262, 68, '各線間 200V', {s: 11, a: 'start'}) + T(150, 114, '対地電圧も200V（1線を接地）', {s: 12, c: 'ft fa'})
  }[k]),
  // ボックス内で接続
  jbConnect: () => svg(300, 110, C(150, 55, 38, 'fs fdash') + L(20, 45, 150, 45) + L(150, 45, 280, 45) + L(150, 45, 150, 100) + C(150, 45, 4, 'fk') + T(150, 14, 'ジョイントボックス', {s: 12}) + T(196, 90, '接続点はボックスの中', {s: 11, a: 'start', c: 'ft fa'})),
  // 並列
  parallel: () => svg(300, 110, L(30, 25, 270, 25, 'fs fbold') + L(30, 90, 270, 90, 'fs fbold fwline') + [120, 200].map(x => L(x, 25, x, 45) + C(x, 57, 11) + L(x - 8, 49, x + 8, 65) + L(x + 8, 49, x - 8, 65) + L(x, 68, x, 90)).join('') + T(40, 60, '並列', {s: 14, a: 'start', c: 'ft fa', w: 700})),
  // 3路スイッチ
  sw3: () => svg(300, 120, T(70, 16, '3路スイッチ', {s: 12}) + C(40, 60, 3, 'fk') + T(28, 64, '0', {s: 12}) + L(40, 60, 90, 38, 'fs fbold') + C(96, 36, 3, 'fk') + T(106, 34, '1', {s: 12}) + C(96, 84, 3, 'fk') + T(106, 90, '3', {s: 12}) +
      T(220, 16, '4路スイッチ', {s: 12}) + [[180, 40, '1'], [260, 40, '2'], [180, 84, '3'], [260, 84, '4']].map(([x, y, n]) => C(x, y, 3, 'fk') + T(x + (x < 200 ? -12 : 12), y + 4, n, {s: 12})).join('') + L(180, 40, 260, 84, 'fs fbold') + L(180, 84, 260, 40, 'fs fbold')),
  // パイロットランプ
  pilot: k => { const t = {always: ['常時点灯', '電源と並列'], sync: ['同時点滅', '電灯と並列'], async: ['異時点滅', 'スイッチと並列']}[k];
    let pl = ''; if(k === 'always') pl = L(90, 30, 90, 48) + C(90, 58, 9) + T(90, 62, 'PL', {s: 8}) + L(90, 67, 90, 90);
    if(k === 'sync') pl = L(215, 55, 250, 55) + L(250, 55, 250, 60) + C(250, 70, 9) + T(250, 74, 'PL', {s: 8}) + L(250, 79, 250, 90);
    if(k === 'async') pl = L(150, 38, 190, 38) + L(190, 38, 190, 42) + C(190, 50, 8) + T(190, 53, 'PL', {s: 7}) + L(190, 58, 190, 66) + L(150, 66, 190, 66);
    return svg(300, 120, T(150, 14, t[0] + '：' + t[1], {s: 13, w: 700, c: 'ft fa'}) + L(20, 30, 280, 30, 'fs fbold') + L(20, 90, 280, 90, 'fs fbold fwline') +
      L(150, 30, 150, 38) + C(150, 38, 2.5, 'fk') + L(150, 38, 160, 52, 'fs fbold') + C(150, 66, 2.5, 'fk') + L(150, 66, 150, 72) + L(150, 72, 215, 72) + L(215, 55, 215, 60) + C(215, 70, 9) + L(209, 64, 221, 76) + L(221, 64, 209, 76) + L(215, 79, 215, 90) + L(215, 55, 215, 60) + L(150, 72, 150, 72) + P('M150,72 L215,72', 'fs fnone') + pl + T(128, 56, 'SW', {s: 10}) + T(236, 108, '電灯', {s: 10})); },
  // リングスリーブ
  sleeve: k => { const lab = {sho: '小', chu: '中', dai: '大', maru: '○'}[k] || k, big2 = {sho: 1, maru: 1, chu: 1.25, dai: 1.5}[k] || 1;
    return svg(200, 120, `<g transform="translate(100,60) scale(${big2})">` + R(-16, -26, 32, 44, 'fcell', 4) + P('M-16,18 q16,8 32,0') + P('M-19,-26 h38', 'fs fbold') + T(0, 2, lab, {s: 18, w: 700, c: 'ft fa'}) + `</g>`); },
  // 抵抗の変化
  resist: k => svg(300, 100, {
    len: R(20, 40, 100, 20, 'fcell') + T(70, 30, '長さ L', {s: 12}) + T(150, 55, '→', {s: 20}) + R(180, 40, 110, 20, 'fcell') + T(235, 30, '長さ 2L', {s: 12}) + T(150, 92, '抵抗は2倍', {s: 13, w: 700, c: 'ft fa'}),
    area: C(70, 50, 14, 'fcell') + T(70, 24, '断面積 A', {s: 12}) + T(150, 55, '→', {s: 20}) + C(230, 50, 20, 'fcell') + T(230, 22, '断面積 2A', {s: 12}) + T(150, 92, '抵抗は1/2', {s: 13, w: 700, c: 'ft fa'}),
    dia: C(70, 50, 10, 'fcell') + T(70, 30, '直径 D', {s: 12}) + T(150, 55, '→', {s: 20}) + C(230, 50, 20, 'fcell') + T(230, 22, '直径 2D（断面積4倍）', {s: 12}) + T(150, 92, '抵抗は1/4', {s: 13, w: 700, c: 'ft fa'})
  }[k]),
  // 直列・並列
  series: () => svg(300, 90, L(10, 40, 40, 40) + R(40, 30, 60, 20, 'fcell') + T(70, 45, 'R1', {s: 12}) + L(100, 40, 130, 40) + R(130, 30, 60, 20, 'fcell') + T(160, 45, 'R2', {s: 12}) + L(190, 40, 220, 40) + T(150, 80, '直列：R1＋R2', {s: 14, w: 700, c: 'ft fa'})),
  par2: () => svg(300, 110, L(20, 45, 60, 45) + L(60, 20, 60, 70) + L(60, 20, 110, 20) + R(110, 10, 60, 20, 'fcell') + T(140, 25, 'R1', {s: 12}) + L(170, 20, 220, 20) + L(60, 70, 110, 70) + R(110, 60, 60, 20, 'fcell') + T(140, 75, 'R2', {s: 12}) + L(170, 70, 220, 70) + L(220, 20, 220, 70) + L(220, 45, 260, 45) + T(150, 102, '2個並列：R1R2／(R1＋R2)', {s: 13, w: 700, c: 'ft fa'})),
  // 位相
  phase: k => { const lag = {R: 0, L: 90, C: -90}[k]; let dv = 'M20,55', di = 'M20,55';
    for(let x = 0; x <= 260; x += 4){ const t = x / 260 * 2 * Math.PI; dv += ` L${20 + x},${(55 - 36 * Math.sin(t)).toFixed(1)}`; di += ` L${20 + x},${(55 - 24 * Math.sin(t - lag * Math.PI / 180)).toFixed(1)}`; }
    return svg(300, 118, L(20, 55, 285, 55, 'fs fdim') + P(dv, 'fs fbold') + P(di, 'fs fbold faS') + T(150, 112, {R: '抵抗：電流と電圧は同相', L: 'コイル：電流が90°遅れる', C: 'コンデンサ：電流が90°進む'}[k], {s: 13, w: 700, c: 'ft fa'}) + T(270, 14, '電圧', {s: 11, a: 'end'}) + T(270, 28, '電流', {s: 11, a: 'end', c: 'ft fa'})); }
};
function pic(k, a){ const f = PIC[k]; return f ? f(a) : ''; }

(function(){ const st = document.createElement('style'); st.textContent = `
.fig{display:block;max-width:100%;height:auto;margin:0 auto;overflow:visible}
.fig .fs{stroke:var(--text);stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round}
.fig .fbold{stroke-width:2.6}
.fig .fdim{opacity:.35}
.fig .fk{fill:var(--text);stroke:none}
.fig .fbg{fill:var(--surface)}
.fig .fw{stroke:var(--surface)}
.fig .fwline{stroke:var(--muted);stroke-dasharray:none}
.fig .faS{stroke:var(--accent)}
.fig .fdash{stroke-dasharray:4 4;stroke:var(--muted)}
.fig .fcell{fill:var(--surface2);stroke:var(--border);stroke-width:1}
.fig .fhi{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.fig .fhi2{stroke:var(--accent);stroke-width:3}
.fig .fb1{fill:var(--ok-soft);stroke:var(--border)} .fig .fb2{fill:var(--warn-soft);stroke:var(--border)} .fig .fb3{fill:var(--ng-soft);stroke:var(--border)} .fig .fb4{fill:var(--surface2);stroke:var(--border)}
.fig .ft{fill:var(--text);font-family:inherit}
.fig .fa{fill:var(--accent)}
.fig text.fdim{opacity:.4}
`; document.head.appendChild(st); })();
window.FIG = function(spec){
  if(!spec) return '';
  const [t, ...a] = spec;
  switch(t){
    case 'syms': return syms(a[0], a[1] || {});
    case 'sym': return big(a[0], a[1], a[2]);
    case 'lines': return lines(a[0]);
    case 'line1': return line1(a[0]);
    case 'bands': return bands(a[0], a[1]);
    case 'big': return bignum(a[0], a[1], a[2]);
    case 'kv': return kv(a[0], a[1]);
    case 'flow': return flow(a[0], a[1]);
    case 'eq': return eq(a[0], a[1]);
    case 'pic': return pic(a[0], a[1]);
    case 'tool': return window.TOOL ? window.TOOL(a[0], a[1], a[2]) : '';
    default: return '';
  }
};
window.FIG_PARTS = {svg, T, L, C, R, P, arrow, arrowHead, E};
})();
