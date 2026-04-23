// ══ ENTRY POINT ══
import { syncHomeGithubContent, loadExploreGithub } from './github.js';
import { initSphere, setFilter, renderExplore }     from './sphere.js';
import { initUI, copyCode }                          from './ui.js';

let _ghExploreLoaded = false;

function onExploreSection() {
  renderExplore();
  if (!_ghExploreLoaded) {
    loadExploreGithub();
    _ghExploreLoaded = true;
  }
}

initUI({ onExploreSection, setFilter });
initSphere();
syncHomeGithubContent();

// Esponi copyCode globalmente per i project detail pages che lo usano inline
window.copyCode = copyCode;
