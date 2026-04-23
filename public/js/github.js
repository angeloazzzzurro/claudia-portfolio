// ══ GITHUB DATA ══
import { GH_USER, GH_COLORS } from './data.js';

export function _esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function _fmtDate(iso) {
  if (!iso) return 'n/a';
  return new Date(iso).toLocaleDateString('it-IT', { month:'short', day:'numeric', year:'numeric' });
}

function formatCompactNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000)    return `${(value / 1000).toFixed(1)}k`;
  return String(value || 0);
}

let _ghCache = null;

export async function _ghData() {
  if (_ghCache) return _ghCache;
  try {
    const [profRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/users/' + GH_USER),
      fetch('https://api.github.com/users/' + GH_USER + '/repos?per_page=100&sort=pushed'),
    ]);
    if (profRes.ok && reposRes.ok) {
      const profile = await profRes.json();
      const repos   = await reposRes.json();
      _ghCache = { profile, repos };
      return _ghCache;
    }
  } catch (_) {}
  for (const p of ['./github-data.json', 'github-data.json']) {
    try {
      const r = await fetch(p);
      if (r.ok) { _ghCache = await r.json(); return _ghCache; }
    } catch (_) {}
  }
  return null;
}

export async function syncHomeGithubContent() {
  try {
    const data = await _ghData();
    if (!data) return;
    const { profile, repos } = data;
    if (!profile || !Array.isArray(repos)) return;

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const metrics = [
      { n: formatCompactNumber(repos.length),        l: 'Repo pubblici' },
      { n: formatCompactNumber(profile.followers || 0), l: 'Follower' },
      { n: formatCompactNumber(totalStars),           l: 'Stelle totali' },
      { n: 'MI',                                      l: 'Milano based' },
    ];
    metrics.forEach((metric, index) => {
      const slot = index + 1;
      const nEl = document.getElementById(`hero-stat-${slot}n`);
      const lEl = document.getElementById(`hero-stat-${slot}l`);
      if (nEl && metric.n) nEl.textContent = metric.n;
      if (lEl && metric.l) lEl.textContent = metric.l;
    });
  } catch (error) {
    console.warn('GitHub sync non disponibile:', error);
  }
}

export async function loadExploreGithub() {
  const grid   = document.getElementById('explore-gh-grid');
  const header = document.querySelector('.exp-gh-header');
  if (!grid) return;

  grid.innerHTML = '<div style="padding:24px 40px;font-family:\'DM Mono\',monospace;font-size:11px;color:rgba(28,16,23,.4);letter-spacing:.06em;">caricamento GitHub\u2026</div>';

  let data = null;
  try { data = await _ghData(); } catch (e) { console.error('_ghData:', e); }

  if (!data || !Array.isArray(data.repos) || data.repos.length === 0) {
    grid.innerHTML = '<div style="padding:24px 40px;font-family:\'DM Mono\',monospace;font-size:11px;color:#EF4444;">impossibile caricare i repository GitHub.</div>';
    return;
  }

  grid.innerHTML = '';
  if (header) header.style.display = 'flex';

  const repos = [...data.repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  // Barra linguaggi aggregata
  const lc = new Map();
  repos.forEach(r => { if (r.language) lc.set(r.language, (lc.get(r.language) || 0) + 1); });
  const topLangs = [...lc.entries()].sort((a, b) => b[1] - a[1]);

  if (topLangs.length) {
    const wrap   = document.createElement('div');
    wrap.style.cssText = 'padding:0 40px 24px;';
    const bar    = document.createElement('div');
    bar.style.cssText  = 'display:flex;height:6px;border-radius:100px;overflow:hidden;gap:2px;margin-bottom:10px;';
    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;';
    const total  = repos.length;

    topLangs.forEach(([lang, count], i) => {
      const pct = (count / total * 100).toFixed(0);
      const col = GH_COLORS[i % GH_COLORS.length];
      const seg = document.createElement('div');
      seg.style.cssText = `flex:${count};background:${col};border-radius:100px;`;
      bar.appendChild(seg);
      const li = document.createElement('div');
      li.style.cssText = 'display:flex;align-items:center;gap:5px;font-family:\'DM Mono\',monospace;font-size:10px;color:rgba(28,16,23,.6);';
      li.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${col};display:inline-block"></span>${_esc(lang)} <strong>${pct}%</strong>`;
      legend.appendChild(li);
    });
    wrap.appendChild(bar);
    wrap.appendChild(legend);
    grid.before(wrap);
  }

  // Cards repo
  repos.forEach(r => {
    const col  = GH_COLORS[(topLangs.findIndex(([l]) => l === r.language) + 1 || 0) % GH_COLORS.length];
    const card = document.createElement('a');
    card.className = 'exp-gh-card';
    card.href      = r.html_url || '#';
    card.target    = '_blank';
    card.rel       = 'noopener';
    const badge    = r.language ? `<span class="gh-lang-badge" style="background:${col}22;color:${col};border:1px solid ${col}44">${_esc(r.language)}</span>` : '';
    const stars    = r.stargazers_count || 0;
    const forks    = r.forks_count || 0;
    card.innerHTML =
      `<div class="exp-gh-card-name">${_esc(r.name)}</div>` +
      `<div class="exp-gh-card-desc">${_esc(r.description || 'Nessuna descrizione.')}</div>` +
      `<div class="exp-gh-card-foot">${badge}` +
      (stars ? `<span>\u2605 ${stars}</span>` : '') +
      (forks ? `<span>\u2442 ${forks}</span>` : '') +
      `<span>${_fmtDate(r.pushed_at)}</span></div>`;
    grid.appendChild(card);
  });
}
