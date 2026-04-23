// ══ UI INTERACTIONS ══
// dark mode, nav, cursor, contact form, scroll reveal, mappa CV

export function copyCode(btn) {
  const code = btn.previousElementSibling.textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '✓ copiato'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => { btn.textContent = 'errore'; setTimeout(() => { btn.textContent = 'copy'; }, 1500); });
}

export function initUI({ onExploreSection, setFilter }) {

  // ── Dark mode ─────────────────────────────────────────────────────────────
  const darkToggle = document.getElementById('darkmode-toggle');
  const root = document.documentElement;
  if (localStorage.getItem('theme') === 'dark') root.classList.add('dark');
  const updateDarkBtn = () => {
    const isDark = root.classList.contains('dark');
    darkToggle.textContent = isDark ? '☀️' : '🌙';
    darkToggle.title = isDark ? 'Light mode' : 'Dark mode';
  };
  updateDarkBtn();
  darkToggle.addEventListener('click', () => {
    root.classList.toggle('dark');
    const isDark = root.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateDarkBtn();
  });

  // ── Nav ───────────────────────────────────────────────────────────────────
  const flbl = document.getElementById('flbl');
  let flblTimer = null;
  function scheduleFlblFade() {
    flbl.style.opacity = '1';
    clearTimeout(flblTimer);
    flblTimer = setTimeout(() => { flbl.style.opacity = '0'; }, 4000);
  }
  scheduleFlblFade();

  document.querySelectorAll('.nb').forEach(b => {
    b.addEventListener('click', () => {
      const next    = document.getElementById('s-' + b.dataset.s);
      if (!next) return;
      const current = document.querySelector('.sec.on');
      if (current === next) return;

      document.querySelectorAll('.nb').forEach(x => x.classList.remove('on'));
      b.classList.add('on');

      if (current) {
        current.classList.add('leaving');
        setTimeout(() => {
          current.classList.remove('on', 'leaving');
          next.classList.add('on');
          window.scrollTo({ top: 0, behavior: 'instant' });
          if (b.dataset.s === 'explore') onExploreSection();
          if (b.dataset.s === 'home')    scheduleFlblFade();
        }, 150);
      } else {
        next.classList.add('on');
      }
    });
  });

  // CTA button → contact section
  document.querySelector('.cta-btn')?.addEventListener('click', () => {
    document.querySelector('.nb[data-s=contact]')?.click();
  });

  // ── Filter buttons + chips ────────────────────────────────────────────────
  document.querySelectorAll('.fb').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));
  document.querySelectorAll('.chip[data-f]').forEach(chip => chip.addEventListener('click', () => {
    const next = chip.classList.contains('active') ? 'all' : chip.dataset.f;
    setFilter(next);
  }));

  // ── Analysis modal — focus trap + close ──────────────────────────────────
  const overlay = document.getElementById('analysis-overlay');
  const modal   = document.getElementById('analysis-modal');

  function getFocusable() {
    return [...modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.disabled && el.offsetParent !== null);
  }

  function closeAnalysisModal() {
    overlay.classList.remove('on');
    overlay._returnFocus?.focus();
  }

  document.getElementById('am-close').addEventListener('click', closeAnalysisModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeAnalysisModal(); });

  // Chiudi con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('on')) closeAnalysisModal();
  });

  // Tab trap: mantiene il focus dentro la modale
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ── Contact form ──────────────────────────────────────────────────────────
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cfName  = document.getElementById('cf-name');
  const cfEmail = document.getElementById('cf-email');
  const cfErr   = document.getElementById('cf-error');

  function showFormError(msg, field) {
    cfErr.textContent = msg;
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }

  function clearFormError() {
    cfErr.textContent = '';
    cfName.removeAttribute('aria-invalid');
    cfEmail.removeAttribute('aria-invalid');
  }

  document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name  = cfName.value.trim();
    const email = cfEmail.value.trim();
    const type  = document.getElementById('cf-type').value;
    const msg   = document.getElementById('cf-msg').value.trim();

    if (!name)  { showFormError('Inserisci il tuo nome.', cfName); return; }
    if (!email || !EMAIL_RE.test(email)) { showFormError("Inserisci un'email valida.", cfEmail); return; }
    clearFormError();

    const subject = encodeURIComponent(`Contatto dal portfolio${type ? ' — ' + type : ''}`);
    const body    = encodeURIComponent(`Ciao Claudia,\n\nSono ${name} (${email}).\n\n${type ? 'Tipo di progetto: ' + type + '\n\n' : ''}${msg || ''}\n\nA presto!`);
    window.location.href = `mailto:xjiexin97@gmail.com?subject=${subject}&body=${body}`;
    document.getElementById('contact-form').style.display = 'none';
    document.getElementById('c-form-sent').style.display  = 'block';
  });
  document.getElementById('c-sent-reset')?.addEventListener('click', () => {
    document.getElementById('contact-form').reset();
    document.getElementById('contact-form').style.display = 'flex';
    document.getElementById('c-form-sent').style.display  = 'none';
  });

  // ── Custom cursor ─────────────────────────────────────────────────────────
  const cur = document.getElementById('cur');
  const crng = document.getElementById('crng');
  const cursorToggle = document.getElementById('cursor-toggle');
  let cmx = 0, cmy = 0, rx = 0, ry = 0, customCursor = true;

  function setCursorMode(on) {
    customCursor = on;
    cur.style.display  = on ? 'block' : 'none';
    crng.style.display = on ? 'block' : 'none';
    document.body.style.cursor = on ? 'none' : 'auto';
    cursorToggle.textContent = on ? '✦' : '◎';
    cursorToggle.title = on ? 'Cursore personalizzato attivo' : 'Cursore standard attivo';
  }

  cursorToggle.addEventListener('click', () => setCursorMode(!customCursor));
  setCursorMode(window.matchMedia('(pointer:fine)').matches);

  document.addEventListener('mousemove', e => {
    if (!customCursor) return;
    cmx = e.clientX; cmy = e.clientY;
    cur.style.left = cmx + 'px'; cur.style.top = cmy + 'px';
    const h = e.target.closest('button,.c-row,.chip,.fb,.stack-row');
    cur.classList.toggle('h', !!h); crng.classList.toggle('h', !!h);
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.nb,.fb,.chip,.spb');
    if (!btn) return;
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const sz   = Math.max(rect.width, rect.height) * 1.4;
    r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz / 2}px;top:${e.clientY - rect.top - sz / 2}px`;
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });

  ;(function ar() {
    if (customCursor) {
      rx += (cmx - rx) * .1; ry += (cmy - ry) * .1;
      crng.style.left = Math.round(rx) + 'px'; crng.style.top = Math.round(ry) + 'px';
    }
    requestAnimationFrame(ar);
  })();

  // ── Scroll reveal ─────────────────────────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.exp-card, .cv-block, .contact-block, .sec-badge, .stat-pill, .exp-gh-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // ── Mappa CV interattiva ──────────────────────────────────────────────────
  const wrap = document.getElementById('cv-map-wrap');
  const tt   = document.getElementById('cv-map-tooltip');
  if (wrap && tt) {
    const PDATA = {
      'pin-milano':   { city: 'Milano, Italia 🇮🇹', info: 'Base operativa · open to work · iOS & web developer' },
      'pin-cagliari': { city: 'Cagliari, Sardegna 🇮🇹', info: 'Luogo di nascita · 1997 · cresciuta a Milano' },
      'pin-shanghai': { city: 'Cina 🇨🇳', info: 'Heritage italo-cinese · design e cultura orientale' },
    };
    wrap.querySelectorAll('.map-pin').forEach(pin => {
      const data = PDATA[pin.id];
      if (!data) return;
      pin.addEventListener('mouseenter', () => {
        document.getElementById('cv-tt-city').textContent = data.city;
        document.getElementById('cv-tt-info').textContent = data.info;
        tt.classList.add('show');
      });
      pin.addEventListener('mousemove', e => {
        const rect   = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const onRight = x > rect.width / 2;
        tt.style.left  = onRight ? 'auto' : (x + 18) + 'px';
        tt.style.right = onRight ? (rect.width - x + 18) + 'px' : 'auto';
        tt.style.top   = Math.max(8, y - 44) + 'px';
      });
      pin.addEventListener('mouseleave', () => tt.classList.remove('show'));
    });
  }
}
