const LANG_COLORS = ['#1d4ed8', '#2563eb', '#0ea5e9', '#38bdf8', '#7c3aed', '#0f766e', '#60a5fa'];

function _esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let _dataCache = null;

async function _loadData() {
  if (_dataCache) return _dataCache;
  const res = await fetch('/github-data.json');
  if (!res.ok) throw new Error('github-data.json non trovato — esegui: npm run build');
  _dataCache = await res.json();
  return _dataCache;
}

function shortNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value || 0);
}

function formatDate(iso) {
  if (!iso) return 'n/a';
  return new Date(iso).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function getProfile() {
  const data = await _loadData();
  return data.profile;
}

async function getRepos() {
  const data = await _loadData();
  return data.repos;
}

function prioritizeRepos(repos, names = []) {
  if (!Array.isArray(names) || names.length === 0) return repos;

  const byName = new Map(repos.map((repo) => [String(repo.name || '').toLowerCase(), repo]));
  const priority = names
    .map((name) => byName.get(String(name).toLowerCase()))
    .filter(Boolean);
  const picked = new Set(priority.map((repo) => repo.id));
  const rest = repos.filter((repo) => !picked.has(repo.id));

  return [...priority, ...rest];
}

function mountStat(container, label, value) {
  const card = document.createElement('div');
  card.className = 'card stat';
  card.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>`;
  container.appendChild(card);
}

async function initAboutPage() {
  const statsRoot = document.getElementById('about-stats');
  const highlightsRoot = document.getElementById('about-highlights');
  const bioRoot = document.getElementById('about-bio');

  try {
    const [profile, repos] = await Promise.all([getProfile(), getRepos()]);
    const starred = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const topRepos = prioritizeRepos(
      [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)),
      ['Angel']
    ).slice(0, 4);

    bioRoot.textContent = profile.bio || 'Profilo GitHub senza bio pubblica.';
    mountStat(statsRoot, 'Repository pubblici', shortNumber(profile.public_repos));
    mountStat(statsRoot, 'Follower', shortNumber(profile.followers));
    mountStat(statsRoot, 'Stelle totali', shortNumber(starred));
    mountStat(statsRoot, 'Su GitHub dal', formatDate(profile.created_at));

    if (topRepos.length === 0) {
      highlightsRoot.innerHTML = '<div class="empty">Nessun repository pubblico trovato.</div>';
      return;
    }

    topRepos.forEach((repo) => {
      const row = document.createElement('article');
      row.className = 'repo-item';
      row.innerHTML = `
        <div class="repo-head">
          <a class="repo-name" href="${_esc(repo.html_url)}" target="_blank" rel="noopener">${_esc(repo.name)}</a>
          <div class="repo-meta">${repo.stargazers_count || 0} stars</div>
        </div>
        <p class="repo-desc">${_esc(repo.description || 'Nessuna descrizione.')}</p>
      `;
      highlightsRoot.appendChild(row);
    });
  } catch (error) {
    statsRoot.innerHTML = '<div class="empty">Non riesco a leggere i dati GitHub in questo momento.</div>';
    highlightsRoot.innerHTML = '<div class="empty">Controlla connessione o limiti API GitHub e riprova.</div>';
    console.error(error);
  }
}

async function initSkillsPage() {
  const bar = document.getElementById('skills-bar');
  const legend = document.getElementById('skills-legend');
  const sample = document.getElementById('skills-sample');

  try {
    const repos = await getRepos();
    const counters = new Map();
    repos.forEach((repo) => {
      const key = repo.language || 'Other';
      counters.set(key, (counters.get(key) || 0) + 1);
    });

    const total = [...counters.values()].reduce((sum, count) => sum + count, 0);
    const top = [...counters.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    if (top.length === 0 || total === 0) {
      legend.innerHTML = '<div class="empty">Nessun dato linguaggi disponibile.</div>';
      return;
    }

    top.forEach(([lang, count], index) => {
      const pct = (count / total) * 100;
      const color = LANG_COLORS[index % LANG_COLORS.length];

      const segment = document.createElement('div');
      segment.className = 'lang-segment';
      segment.style.width = `${pct}%`;
      segment.style.background = color;
      segment.title = `${lang}: ${pct.toFixed(1)}%`;
      bar.appendChild(segment);

      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span><span class="dot" style="background:${color}"></span> ${_esc(lang)}</span><strong>${pct.toFixed(1)}%</strong>`;
      legend.appendChild(item);
    });

    const examples = prioritizeRepos(
      [...repos]
        .filter((repo) => repo.language)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)),
      ['Angel']
    ).slice(0, 6);

    if (examples.length === 0) {
      sample.innerHTML = '<div class="empty">Nessun repository recente con linguaggio impostato.</div>';
      return;
    }

    examples.forEach((repo) => {
      const row = document.createElement('article');
      row.className = 'repo-item';
      row.innerHTML = `
        <div class="repo-head">
          <a class="repo-name" href="${_esc(repo.html_url)}" target="_blank" rel="noopener">${_esc(repo.name)}</a>
          <div class="repo-meta">${_esc(repo.language || 'n/a')}</div>
        </div>
        <p class="repo-desc">Aggiornato il ${_esc(formatDate(repo.pushed_at))}.</p>
      `;
      sample.appendChild(row);
    });
  } catch (error) {
    legend.innerHTML = '<div class="empty">Non riesco a leggere i linguaggi da GitHub.</div>';
    sample.innerHTML = '<div class="empty">Controlla connessione o limiti API GitHub e riprova.</div>';
    console.error(error);
  }
}

async function initExplorePage() {
  const root = document.getElementById('explore-list');

  try {
    const repos = await getRepos();
    const featured = prioritizeRepos(
      [...repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)),
      ['Angel']
    ).slice(0, 12);

    if (featured.length === 0) {
      root.innerHTML = '<div class="empty">Nessun repository pubblico trovato.</div>';
      return;
    }

    featured.forEach((repo) => {
      const row = document.createElement('article');
      row.className = 'repo-item';
      row.innerHTML = `
        <div class="repo-head">
          <a class="repo-name" href="${_esc(repo.html_url)}" target="_blank" rel="noopener">${_esc(repo.name)}</a>
          <div class="repo-meta">${_esc(repo.language || 'n/a')}</div>
        </div>
        <p class="repo-desc">${_esc(repo.description || 'Nessuna descrizione.')}</p>
        <div class="repo-meta">${repo.stargazers_count || 0} stars · ${repo.forks_count || 0} forks · aggiornato il ${_esc(formatDate(repo.pushed_at))}</div>
      `;
      root.appendChild(row);
    });
  } catch (error) {
    root.innerHTML = '<div class="empty">Non riesco a caricare i repository da GitHub.</div>';
    console.error(error);
  }
}
