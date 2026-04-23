// ══ SFERA 3D + EXPLORE + ANALYSIS MODAL ══
import { P, M, CONN, FB, APP_PREVIEWS, CODE_PREVIEWS, PROJECT_ANALYSIS } from './data.js';

// ── Preview markup ──────────────────────────────────────────────────────────
function escapePreviewHtml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getProjectPreviewMarkup(project, fallbackMarkup, mode) {
  const img = APP_PREVIEWS[project.id];
  if (img) return `<img src="${img}" alt="${project.n} preview" style="width:100%;height:100%;object-fit:cover;display:block;">`;
  const code = CODE_PREVIEWS[project.id];
  if (code) {
    const pad = mode === 'popup' ? '16px' : '10px';
    const fs  = mode === 'popup' ? '12px' : '10px';
    return `<pre style="margin:0;height:100%;background:#0F172A;color:#93C5FD;font-family:'DM Mono',monospace;font-size:${fs};line-height:1.55;padding:${pad};overflow:auto;">${escapePreviewHtml(code)}</pre>`;
  }
  return fallbackMarkup;
}

// ── openProjectTarget ───────────────────────────────────────────────────────
export function openProjectTarget(project) {
  const target = project.url || project.github;
  if (!target) return;
  if (/^https?:\/\//i.test(target)) {
    const popup = window.open(target, '_blank', 'noopener,noreferrer');
    if (!popup) window.location.href = target;
  } else {
    window.location.href = target;
  }
}

// ── Analysis modal ──────────────────────────────────────────────────────────
export function openAnalysisModal(p) {
  const a = PROJECT_ANALYSIS[p.id] || {};
  document.getElementById('am-tag').textContent = p.tag;
  document.getElementById('am-tag').style.cssText = `background:${p.tBg};color:${p.tC};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:100px;display:inline-block;margin-bottom:10px;`;
  document.getElementById('am-title').textContent = p.n;
  document.getElementById('am-desc').textContent  = p.desc;

  const m = a.metrics || {};
  const q = a.quality  || {};
  document.getElementById('am-body').innerHTML = `
    <div class="am-section">
      <div class="am-section-title">Metriche</div>
      <div class="am-metrics">
        <div class="am-metric"><div class="am-metric-val">${m.loc||'—'}</div><div class="am-metric-lbl">RIGHE CODICE</div></div>
        <div class="am-metric"><div class="am-metric-val">${m.files||'—'}</div><div class="am-metric-lbl">FILE</div></div>
        <div class="am-metric"><div class="am-metric-val">${m.coverage||'—'}</div><div class="am-metric-lbl">TEST COV.</div></div>
      </div>
    </div>
    <div class="am-section">
      <div class="am-section-title">Qualità</div>
      <div class="am-quality">
        <div class="am-quality-score">${q.score||'—'}</div>
        <div><div class="am-quality-label">${q.label||''}</div><div class="am-quality-note">${q.note||''}</div></div>
      </div>
    </div>
    <div class="am-section">
      <div class="am-section-title">Stack Tecnico</div>
      <div class="am-chips">${(a.stack||[]).map(s=>`<span class="am-chip">${s}</span>`).join('')}</div>
    </div>
    <div class="am-section">
      <div class="am-section-title">Pattern &amp; Architettura</div>
      <ul class="am-list">${(a.patterns||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="am-section">
      <div class="am-section-title">Suggerimenti</div>
      <ul class="am-list am-suggest">${(a.suggestions||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
    </div>`;

  document.getElementById('am-footer').innerHTML =
    (p.url    ? `<button class="am-btn-primary" onclick="window.open('${p.url}','_blank')">Apri demo →</button>` : '') +
    (p.github ? `<button class="am-btn-secondary" onclick="window.open('${p.github}','_blank')">GitHub →</button>` : '');

  const overlay = document.getElementById('analysis-overlay');
  overlay._returnFocus = document.activeElement;
  overlay.classList.add('on');
  overlay.scrollTop = 0;
  document.getElementById('analysis-modal').scrollTop = 0;
  // Sposta il focus sul pulsante chiudi appena la modale è visibile
  requestAnimationFrame(() => document.getElementById('am-close').focus());
}

// ── Explore grid ────────────────────────────────────────────────────────────
export function renderExplore() {
  const grid = document.getElementById('explore-grid');
  if (grid.children.length > 0) return;

  P.forEach(p => {
    const svg  = getProjectPreviewMarkup(p, M[p.id] || FB(p), 'card');
    const card = document.createElement('div');
    card.className = 'exp-card';
    const hasAnalysis = !!PROJECT_ANALYSIS[p.id];
    card.innerHTML =
      `<div class="exp-thumb" style="background:${p.tBg}">${svg}</div>` +
      `<div class="exp-body">` +
        `<span class="exp-tag" style="background:${p.tBg};color:${p.tC}">${p.tag}</span>` +
        `<div class="exp-name">${p.n}</div>` +
        `<div class="exp-desc">${p.desc}</div>` +
        `<div class="exp-chips">${p.chips.map(c=>`<span class="exp-chip">${c}</span>`).join('')}</div>` +
        (hasAnalysis || p.url || p.github
          ? `<div class="exp-card-footer">` +
              (hasAnalysis ? `<button class="exp-analysis-btn">Analisi codice →</button>` : '') +
              `<span></span>` +
              (p.url || p.github ? `<button class="exp-open-btn">${p.url ? 'Demo ↗' : 'GitHub ↗'}</button>` : '') +
            `</div>`
          : '') +
      `</div>`;

    if (hasAnalysis) {
      card.querySelector('.exp-analysis-btn')?.addEventListener('click', e => {
        e.stopPropagation();
        openAnalysisModal(p);
      });
    }
    if (p.url || p.github) {
      card.querySelector('.exp-open-btn')?.addEventListener('click', e => { e.stopPropagation(); openProjectTarget(p); });
      card.addEventListener('click', () => openProjectTarget(p));
    }
    grid.appendChild(card);
  });
}

// ── Sfera 3D ────────────────────────────────────────────────────────────────
let af = 'all';
let hov = null;

export function setFilter(f) {
  af = f;
  document.querySelectorAll('.fb').forEach(x => x.classList.toggle('on', x.dataset.f === f));
  document.querySelectorAll('.chip[data-f]').forEach(x => x.classList.toggle('active', x.dataset.f === f));
  closeSpop();
}

function openSpop(p) {
  const thumb = document.getElementById('sp-thumb');
  thumb.innerHTML = getProjectPreviewMarkup(p, M[p.id] || FB(p), 'popup');
  thumb.style.background = p.tBg;
  document.getElementById('spt').textContent = p.tag;
  document.getElementById('spt').style.cssText = `background:${p.tBg};color:${p.tC};font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:100px;display:inline-block;margin-bottom:10px;`;
  document.getElementById('spn').textContent = p.n;
  document.getElementById('spd').textContent = p.desc;
  document.getElementById('spc').innerHTML = p.chips.map(c => `<span>${c}</span>`).join('');
  const btn = document.getElementById('spb');
  btn.textContent = p.url ? 'Apri demo →' : (p.github ? 'Apri su GitHub →' : 'Scopri di più →');
  btn.disabled    = !(p.url || p.github);
  btn.style.opacity = btn.disabled ? '.5' : '1';
  btn.style.cursor  = btn.disabled ? 'not-allowed' : 'pointer';
  btn.onclick = btn.disabled ? null : () => openProjectTarget(p);
  document.getElementById('spop').classList.add('on');
}

function closeSpop() {
  document.getElementById('spop').classList.remove('on');
}

function showBanner(p) {
  const tag = document.getElementById('sb-tag');
  tag.textContent = p.tag;
  tag.style.cssText = `background:${p.tBg};color:${p.tC};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:2px 9px;border-radius:100px;display:inline-block;`;
  document.getElementById('sb-name').textContent = p.n;
  document.getElementById('sphere-banner').classList.add('on');
}

function hideBanner() {
  document.getElementById('sphere-banner').classList.remove('on');
}

export function initSphere() {
  const scene = document.getElementById('scene');
  const sph   = document.getElementById('sph');
  const cnv   = document.getElementById('cnv');
  const ctx   = cnv.getContext('2d');
  const spop  = document.getElementById('spop');
  const sh    = document.getElementById('sh');

  let W, H;
  function rsz() { W = scene.clientWidth; H = scene.clientHeight; cnv.width = W; cnv.height = H; }
  rsz();
  requestAnimationFrame(rsz);
  window.addEventListener('resize', rsz);

  const N = 30, R = 205, phi = (1 + Math.sqrt(5)) / 2;
  const POS = [], cards = [];
  let tk = 0;

  const PRIMARY_IDX = P.length === 5
    ? [7, 12, 18, 23, 28]
    : P.map((_, k) => Math.round(k * N / P.length));

  for (let i = 0; i < N; i++) {
    const inc = Math.acos(1 - 2 * (i / N));
    const az  = 2 * Math.PI * i / phi;
    POS.push({ x: Math.sin(inc) * Math.cos(az), y: Math.cos(inc), z: Math.sin(inc) * Math.sin(az) });

    const primPos   = PRIMARY_IDX.indexOf(i);
    const isPrimary = primPos !== -1;
    const pi        = isPrimary ? primPos : i % P.length;
    const p         = P[pi];
    const svg       = M[p.id] || FB(p);
    const c         = document.createElement('div');
    c.className = 'card ' + (isPrimary ? 'primary' : 'ghost');
    c.dataset.cat = p.cat;
    c.dataset.pi  = String(pi);
    c.innerHTML = `<div class="ci" style="border-color:${p.top};box-shadow:0 4px 14px ${p.top}66"><div class="cbt" style="background:linear-gradient(90deg,${p.top},${p.tBg})"></div><div class="cmo">${svg}</div><div class="clb"><div class="ctg" style="background:${p.tBg};color:${p.tC}">${p.tag}</div><div class="cnm">${p.n}</div></div></div>`;
    c.addEventListener('mouseenter', () => { hov = i; if (isPrimary) showBanner(p); });
    c.addEventListener('mouseleave', () => { if (hov === i) { hov = null; if (isPrimary) hideBanner(); } });
    c.addEventListener('click', e => {
      if (wd) return;
      e.stopPropagation();
      if (af !== 'all' && p.cat !== af) return;
      openSpop(p);
    });
    sph.appendChild(c);
    cards.push(c);
  }

  document.getElementById('spclose').addEventListener('click', closeSpop);
  scene.addEventListener('click', e => { if (e.target === scene || e.target === sph) closeSpop(); });

  const D2R = Math.PI / 180;
  function wz(pos) {
    const cy = Math.cos(-rY * D2R), sy = Math.sin(-rY * D2R);
    const x1 = pos.x * cy + pos.z * sy, z1 = -pos.x * sy + pos.z * cy;
    const cx2 = Math.cos(-rX * D2R), sx2 = Math.sin(-rX * D2R);
    return pos.y * sx2 + z1 * cx2;
  }
  function sp(i) {
    const pos = POS[i];
    const cy = Math.cos(rY * D2R), sy = Math.sin(rY * D2R);
    const cx2 = Math.cos(rX * D2R), sx2 = Math.sin(rX * D2R);
    const x3 = pos.x * cy + pos.z * sy, z3 = -pos.x * sy + pos.z * cy;
    const y3 = pos.y * cx2 - z3 * sx2;
    return { x: W / 2 + x3 * R, y: H / 2 + y3 * R * .88, z: wz(pos) };
  }

  function drawLines() {
    ctx.clearRect(0, 0, W, H);
    if (hov === null) return;
    const hp = parseInt(cards[hov].dataset.pi);
    CONN.filter(c => c[0] === hp || c[1] === hp).forEach(([a, b, lbl, col]) => {
      const aC = cards.map((_, i) => i).filter(i => parseInt(cards[i].dataset.pi) === a);
      const bC = cards.map((_, i) => i).filter(i => parseInt(cards[i].dataset.pi) === b);
      aC.forEach(ai => bC.forEach(bi => {
        const A = sp(ai), B = sp(bi);
        if (A.z < -.5 || B.z < -.5) return;
        const al = Math.min((A.z + 1) / 2, (B.z + 1) / 2) * .55;
        ctx.save();
        ctx.setLineDash([5, 6]); ctx.strokeStyle = col; ctx.globalAlpha = al; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = al * 1.7; ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(A.x, A.y, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(B.x, B.y, 3.5, 0, Math.PI * 2); ctx.fill();
        const pg = (tk * .009 + ai * .13 + bi * .07) % 1;
        const px = A.x + (B.x - A.x) * pg, py = A.y + (B.y - A.y) * pg;
        ctx.globalAlpha = al * 2.2; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
        const pg2 = (pg - .05 + 1) % 1;
        const px2 = A.x + (B.x - A.x) * pg2, py2 = A.y + (B.y - A.y) * pg2;
        ctx.globalAlpha = al * .75; ctx.beginPath(); ctx.arc(px2, py2, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }));
    });
    [...new Set(CONN.filter(c => c[0] === parseInt(cards[hov].dataset.pi) || c[1] === parseInt(cards[hov].dataset.pi)).map(c => c[2]))].forEach((l, i) => {
      const hs = sp(hov);
      const lx = hs.x + 15, ly = hs.y - 4 + i * 14;
      ctx.save();
      ctx.globalAlpha = .8; ctx.fillStyle = 'rgba(28,16,23,.8)'; ctx.font = '8px DM Mono,monospace';
      const tw = ctx.measureText(l).width + 12;
      ctx.beginPath(); ctx.roundRect(lx, ly - 9, tw, 14, 7); ctx.fill();
      ctx.fillStyle = '#F0F7FF'; ctx.fillText(l, lx + 6, ly + 2);
      ctx.restore();
    });
  }

  const isMobileLayout = () => window.matchMedia('(max-width:768px)').matches;
  let rX = 15, rY = 0, vX = 0, vY = 0.007;
  let drag = false, wd = false, lmx = 0, lmy = 0, lvX = 0, lvY = 0;

  ;(function loop() {
    if (!isMobileLayout()) {
      if (!drag) { rY += vY; rX += vX; vY += (0.007 - vY) * .01; vX *= .95; rX += (15 - rX) * .008; }
      sph.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
      cards.forEach((c, i) => {
        const pos = POS[i], z = wz(pos), t = (z + 1) / 2, p = P[i % P.length];
        const isM = af === 'all' || p.cat === af;
        const isC = hov !== null && (() => {
          const hp = parseInt(cards[hov].dataset.pi), tp = parseInt(c.dataset.pi);
          return CONN.some(x => (x[0] === hp && x[1] === tp) || (x[1] === hp && x[0] === tp));
        })();
        let sc = isM ? (0.46 + 0.54 * t) : 0.18;
        let al = isM ? (0.08 + 0.92 * t) : 0.06;
        if (isC && isM) { sc = Math.min(sc * 1.12, 1.05); al = Math.min(al * 1.3, 1); }
        c.style.transform    = `translate3d(${pos.x * R - 58}px,${pos.y * R - 42}px,${pos.z * R}px) scale(${sc.toFixed(3)})`;
        c.style.opacity      = al.toFixed(3);
        c.style.zIndex       = isM ? Math.round(t * 100) : 0;
        c.style.filter       = !isM ? 'blur(2px) saturate(0.1) grayscale(0.5)' : (z < 0 ? `blur(${((1 - t) * 1.3).toFixed(1)}px)` : 'none');
        c.style.pointerEvents = (!isM || z < -.2) ? 'none' : 'auto';
      });
      drawLines();
    } else {
      cards.forEach((c, i) => {
        const p = P[i % P.length];
        c.style.display = (af === 'all' || p.cat === af) ? '' : 'none';
      });
    }
    tk++;
    requestAnimationFrame(loop);
  })();

  scene.addEventListener('mousedown', e => { drag = true; wd = false; lmx = e.clientX; lmy = e.clientY; lvX = 0; lvY = 0; vX = 0; vY = 0; sh.style.opacity = '0'; e.preventDefault(); });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    const dx = e.clientX - lmx, dy = e.clientY - lmy;
    if (Math.abs(dx) + Math.abs(dy) > 3) wd = true;
    rY += dx * .44; rX += dy * .44; lvY = dx * .44; lvX = dy * .44; lmx = e.clientX; lmy = e.clientY;
  });
  window.addEventListener('mouseup', () => { if (!drag) return; drag = false; vY = lvY * .87; vX = lvX * .87; setTimeout(() => sh.style.opacity = '1', 900); });
  scene.addEventListener('touchstart', e => { drag = true; wd = false; lmx = e.touches[0].clientX; lmy = e.touches[0].clientY; lvX = 0; lvY = 0; vX = 0; vY = 0; e.preventDefault(); }, { passive: false });
  window.addEventListener('touchmove', e => {
    if (!drag) return;
    const dx = e.touches[0].clientX - lmx, dy = e.touches[0].clientY - lmy;
    if (Math.abs(dx) + Math.abs(dy) > 3) wd = true;
    rY += dx * .44; rX += dy * .44; lvY = dx * .44; lvX = dy * .44; lmx = e.touches[0].clientX; lmy = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', () => { if (!drag) return; drag = false; vY = lvY * .87; vX = lvX * .87; setTimeout(() => sh.style.opacity = '1', 900); });
}
