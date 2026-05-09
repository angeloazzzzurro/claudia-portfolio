// ══ ENTRY POINT ══
import { syncHomeGithubContent, loadExploreGithub } from './github.js';
import { initSphere, setFilter, renderExplore }     from './sphere.js';
import { initUI, copyCode }                          from './ui.js';
import { initAiSection }                             from './instagram.js';

let _ghExploreLoaded = false;
let _aiLoaded = false;

function onExploreSection() {
  renderExplore();
  if (!_ghExploreLoaded) {
    loadExploreGithub();
    _ghExploreLoaded = true;
  }
}

function onAiSection() {
  if (!_aiLoaded) {
    initAiSection();
    _aiLoaded = true;
  }
}

initUI({ onExploreSection, onAiSection, setFilter });
initSphere();
syncHomeGithubContent();

// Esponi copyCode globalmente per i project detail pages che lo usano inline
window.copyCode = copyCode;
