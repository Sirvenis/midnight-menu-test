// Murder on the Midnight Menu
// Static browser game: HTML + CSS + vanilla JS + JSON data. No backend/game engine.
// Expand later by editing data/case-midnight-menu.json: add suspects, clues, locations, dialogue, and real ComfyUI asset paths.

const state = {
  caseData: null,
  screen: 'title',
  foundClues: new Set(),
  visitedLocations: new Set(),
  interviewedSuspects: new Set(),
  activeNotebookTab: 'clues',
  result: null
};

const app = document.getElementById('app');
const STORAGE_KEY = 'midnight-menu-progress-v4';

function saveProgress() {
  if (!state.caseData) return;
  const payload = {
    foundClues: [...state.foundClues],
    visitedLocations: [...state.visitedLocations],
    interviewedSuspects: [...state.interviewedSuspects],
    activeNotebookTab: state.activeNotebookTab,
    result: state.result
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.foundClues = new Set(saved.foundClues || []);
    state.visitedLocations = new Set(saved.visitedLocations || []);
    state.interviewedSuspects = new Set(saved.interviewedSuspects || []);
    state.activeNotebookTab = saved.activeNotebookTab || 'clues';
    state.result = saved.result || null;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function hasProgress() {
  return state.foundClues.size || state.visitedLocations.size || state.interviewedSuspects.size || state.result;
}

async function init() {
  try {
    const response = await fetch('data/case-midnight-menu.json');
    state.caseData = await response.json();
    restoreProgress();
    renderTitle();
  } catch (error) {
    app.innerHTML = `<section class="card panel"><h1>Could not load case data</h1><p>${escapeHtml(error.message)}</p></section>`;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function byId(list, id) { return list.find(item => item.id === id); }
function imagePath(key) { return state.caseData.imagePlaceholders[key] || ''; }
function clueById(id) { return byId(state.caseData.clues, id); }
function suspectById(id) { return byId(state.caseData.suspects, id); }
function locationById(id) { return byId(state.caseData.locations, id); }

function collectClue(id) {
  if (id) {
    state.foundClues.add(id);
    saveProgress();
  }
}

function collectClues(ids = []) {
  ids.forEach(collectClue);
}

function placeholderFrame(key, label, type = 'scene', loading = 'lazy') {
  const path = imagePath(key);
  const fallback = `<div class="asset-fallback"><div class="placeholder-icon">◈</div><strong>${escapeHtml(label)}</strong><div class="placeholder-path">${escapeHtml(path || 'No image path set yet')}</div></div>`;
  if (!path) return `<div class="scene-box ${type}" role="img" aria-label="Placeholder image for ${escapeHtml(label)}">${fallback}</div>`;
  return `<figure class="asset-frame ${type}">
    <img src="${escapeHtml(path)}" alt="${escapeHtml(label)}" loading="${escapeHtml(loading)}" onerror="this.closest('figure').classList.add('missing-asset'); this.remove();">
    <figcaption>${escapeHtml(label)}</figcaption>
    <div class="missing-message">${fallback}</div>
  </figure>`;
}

function page(main, includeNotebook = true) {
  app.innerHTML = includeNotebook
    ? `<div class="layout"><section class="card panel">${main}</section>${notebookHtml()}</div>`
    : main;
}

function renderTitle() {
  const c = state.caseData;
  const resume = hasProgress() ? '<button class="btn secondary" onclick="renderHub()">Resume investigation</button>' : '';
  app.innerHTML = `<section class="card hero">
    <div class="hero-inner">
      <div class="eyebrow">Nocturne presents</div>
      <h1>${escapeHtml(c.title)}</h1>
      <p>${escapeHtml(c.tagline)}</p>
      ${placeholderFrame('title', 'Nocturne restaurant on opening night', 'scene', 'eager')}
      <div class="actions"><button class="btn" onclick="renderOpening()">Begin opening night</button>${resume}<button class="btn secondary" onclick="renderHowToPlay()">How to play</button></div>
    </div>
  </section>`;
}

function renderHowToPlay() {
  page(`<div class="meta">How to play</div>
    <h2>Find the killer at Nocturne</h2>
    <p>This is a short detective game. Search each room, question every suspect, and use the notebook to track what you learn.</p>
    <ol class="timeline">
      <li>Search the six locations to collect evidence.</li>
      <li>Interview all eight suspects. Some follow-up questions unlock after you find clues.</li>
      <li>Open the notebook if you get lost.</li>
      <li>When ready, make your final accusation: killer, motive, opportunity, and three clues.</li>
    </ol>
    <p>Your progress is saved on this device, so you can close the page and continue later.</p>
    <div class="actions"><button class="btn" onclick="renderOpening()">Start the mystery</button><button class="btn secondary" onclick="renderTitle()">Back</button></div>`, false);
}

function renderOpening() {
  page(`<div class="meta">Opening Narration</div>
    <h2>The final course</h2>
    ${state.caseData.openingNarration.map(line => `<p>${escapeHtml(line)}</p>`).join('')}
    <div class="actions"><button class="btn" onclick="renderHub()">Start investigation</button></div>`, false);
}

function renderHub() {
  const c = state.caseData;
  page(`<div class="meta">Investigation Hub</div>
    <h2>Nocturne is locked down</h2>
    <p>Search locations, interview suspects, review the notebook, then make your final accusation.</p>
    <div class="tabs">
      <button class="btn secondary" onclick="renderNotebookFull('suspects')">Open notebook</button>
      <button class="btn secondary" onclick="renderHowToPlay()">How to play</button>
      <button class="btn danger" onclick="renderAccusation()">Make final accusation</button>
    </div>
    <h3>Locations</h3>
    <div class="grid">${c.locations.map(loc => `<button class="click-card" aria-label="Search ${escapeHtml(loc.name)}" onclick="renderLocation('${loc.id}')">
      <span class="meta">${state.visitedLocations.has(loc.id) ? 'Searched' : 'Search'}</span>
      <h3>${escapeHtml(loc.name)}</h3><p>${escapeHtml(loc.purpose)}</p>
    </button>`).join('')}</div>
    <h3 style="margin-top:22px">Suspects</h3>
    <div class="grid">${c.suspects.map(s => `<button class="click-card" aria-label="Interview ${escapeHtml(s.name)}" onclick="renderSuspect('${s.id}')">
      <span class="meta">${state.interviewedSuspects.has(s.id) ? 'Interviewed' : 'Interview'}</span>
      <h3>${escapeHtml(s.name)}</h3><p><strong>${escapeHtml(s.role)}</strong></p><p>${escapeHtml(s.short)}</p>
    </button>`).join('')}</div>`);
}

function renderLocation(id) {
  const loc = locationById(id);
  state.visitedLocations.add(id);
  collectClues(loc.clues);
  saveProgress();
  page(`<div class="meta">Location Search</div>
    <h2>${escapeHtml(loc.name)}</h2>
    ${placeholderFrame(loc.id, loc.name)}
    <p>${escapeHtml(loc.description)}</p>
    <p><strong>Purpose:</strong> ${escapeHtml(loc.purpose)}</p>
    <h3>Clues found here</h3>
    <div class="clue-list">${loc.clues.map(cid => clueCard(clueById(cid), true)).join('')}</div>
    <div class="actions"><button class="btn" onclick="renderHub()">Back to hub</button></div>`);
}

function renderSuspect(id) {
  const s = suspectById(id);
  state.interviewedSuspects.add(id);
  saveProgress();
  page(`<div class="meta">Suspect Interview</div>
    <h2>${escapeHtml(s.name)}</h2>
    ${placeholderFrame(s.id, s.name, 'portrait')}
    <p><strong>${escapeHtml(s.role)}</strong> — ${escapeHtml(s.short)}</p>
    <p class="empty">Use the questions below to test their story. Some follow-ups unlock after you find the right evidence.</p>
    <h3>Questions</h3>
    ${s.interview.map((item, idx) => questionButton(s, item, idx)).join('')}
    <div id="answerBox"></div>
    <div class="actions"><button class="btn" onclick="renderHub()">Back to hub</button></div>`);
}

function questionButton(suspect, item, idx) {
  const locked = item.requires && !state.foundClues.has(item.requires);
  const label = locked ? `${item.q} — locked` : item.q;
  return `<button class="btn secondary question" ${locked ? 'disabled' : ''} onclick="askQuestion('${suspect.id}', ${idx})">${escapeHtml(label)}</button>`;
}

function askQuestion(suspectId, index) {
  const item = suspectById(suspectId).interview[index];
  collectClues(item.reveals);
  document.getElementById('answerBox').innerHTML = `<div class="answer"><strong>Answer</strong><p>${escapeHtml(item.a)}</p>${item.reveals.length ? '<p class="score-good">New clue added to notebook.</p>' : ''}</div>`;
  document.querySelector('.notebook').outerHTML = notebookHtml();
}

function clueCard(clue, showPath = false) {
  if (!clue) return '';
  const path = imagePath(clue.id);
  const image = showPath && path ? `<img class="clue-image" src="${escapeHtml(path)}" alt="${escapeHtml(clue.title)}" loading="lazy">` : '';
  return `<article class="clue">${image}<strong>${escapeHtml(clue.title)}</strong><p>${escapeHtml(clue.text)}</p>${showPath ? `<div class="placeholder-path">Image: ${escapeHtml(path)}</div>` : ''}</article>`;
}

function notebookHtml() {
  return `<aside class="card panel notebook">
    <div class="meta">Evidence Notebook</div>
    ${notebookTabs(false)}
    <div class="notebook-body">${notebookSection(state.activeNotebookTab)}</div>
  </aside>`;
}

function notebookTabs(full = true) {
  const tabs = ['suspects', 'clues', 'locations', 'timeline', 'motives', 'theory'];
  const label = tab => tab === 'theory' ? 'Theory' : titleCase(tab);
  return `<div class="tabs notebook-tabs">${tabs.map(tab => `<button class="btn ${state.activeNotebookTab === tab ? '' : 'secondary'} small" onclick="setNotebookTab('${tab}', ${full})">${label(tab)}</button>`).join('')}</div>`;
}

function setNotebookTab(tab, full) {
  state.activeNotebookTab = tab;
  saveProgress();
  if (full) renderNotebookFull(tab);
  else document.querySelector('.notebook').outerHTML = notebookHtml();
}

function titleCase(text) { return text.replace(/\b\w/g, c => c.toUpperCase()); }

function notebookSection(tab) {
  const c = state.caseData;
  if (tab === 'suspects') {
    return `<div class="clue-list">${c.suspects.map(s => `<article class="clue"><strong>${escapeHtml(s.name)}</strong><p>${escapeHtml(s.role)} — ${escapeHtml(s.short)}</p><p><strong>Status:</strong> ${state.interviewedSuspects.has(s.id) ? 'Interviewed' : 'Not interviewed yet'}</p></article>`).join('')}</div>`;
  }
  if (tab === 'clues') {
    const clues = [...state.foundClues].map(clueById).filter(Boolean);
    return clues.length ? `<div class="clue-list">${clues.map(clue => clueCard(clue)).join('')}</div>` : '<p class="empty">No clues yet. Search locations and question suspects.</p>';
  }
  if (tab === 'locations') {
    return `<div class="clue-list">${c.locations.map(loc => `<article class="clue"><strong>${escapeHtml(loc.name)}</strong><p>${escapeHtml(loc.purpose)}</p><p><strong>Status:</strong> ${state.visitedLocations.has(loc.id) ? 'Searched' : 'Unsearched'}</p></article>`).join('')}</div>`;
  }
  if (tab === 'timeline') {
    return `<ol class="timeline">${c.timeline.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
  }
  if (tab === 'motives') {
    return `<div class="clue-list">${c.suspects.map(s => `<article class="clue"><strong>${escapeHtml(s.name)}</strong><p>${state.interviewedSuspects.has(s.id) ? escapeHtml(s.motive) : 'Unknown — interview this suspect to assess motive.'}</p></article>`).join('')}</div>`;
  }
  return `<p>Build your theory from the notebook, then make the final accusation.</p>
    <ul>
      <li>Murderer</li><li>Motive</li><li>Opportunity</li><li>Three supporting clues</li>
    </ul>`;
}

function renderNotebookFull(tab = state.activeNotebookTab) {
  state.activeNotebookTab = tab;
  page(`<div class="meta">Evidence Notebook</div>
    <h2>Case notes</h2>
    ${notebookTabs(true)}
    <div class="notebook-full">${notebookSection(state.activeNotebookTab)}</div>
    <div class="actions"><button class="btn" onclick="renderHub()">Back to hub</button></div>`, false);
}

function renderAccusation() {
  const opts = state.caseData.accusationOptions;
  const select = (key, label, sourceKey = key) => `<label>${label}<select id="${key}"><option value="">Choose...</option>${opts[sourceKey].map(o => `<option value="${o.id}">${escapeHtml(o.label)}</option>`).join('')}</select></label>`;
  page(`<div class="meta">Final Accusation</div>
    <h2>Name the killer</h2>
    <p>Choose the murderer, motive, opportunity, and three supporting clues.</p>
    <div class="form-grid">
      ${select('killer', 'Murderer')}
      ${select('motive', 'Motive')}
      ${select('opportunity', 'Opportunity')}
      ${select('clue1', 'Supporting clue 1', 'supportingClues')}
      ${select('clue2', 'Supporting clue 2', 'supportingClues')}
      ${select('clue3', 'Supporting clue 3', 'supportingClues')}
    </div>
    <div class="actions"><button class="btn danger" onclick="submitAccusation()">Submit accusation</button><button class="btn secondary" onclick="renderHub()">Keep investigating</button></div>`);
}

function submitAccusation() {
  const sol = state.caseData.solution;
  const picked = {
    killer: document.getElementById('killer').value,
    motive: document.getElementById('motive').value,
    opportunity: document.getElementById('opportunity').value,
    clues: ['clue1', 'clue2', 'clue3'].map(id => document.getElementById(id).value).filter(Boolean)
  };
  const uniqueClues = [...new Set(picked.clues)];
  const correctSupport = uniqueClues.filter(id => sol.supportingClues.includes(id)).length;
  const score = (picked.killer === sol.killer ? 2 : 0)
    + (picked.motive === sol.motive ? 1 : 0)
    + (picked.opportunity === sol.opportunity ? 1 : 0)
    + Math.min(2, correctSupport);
  state.result = { picked, score, correctSupport };
  saveProgress();
  renderResult();
}

function renderResult() {
  const r = state.result;
  const ending = r.score >= 5 ? 'Master detective ending' : r.score >= 3 ? 'Partial solve ending' : 'Wrong accusation ending';
  const endingClass = r.score >= 5 ? 'score-good' : r.score >= 3 ? 'score-mid' : 'score-bad';
  page(`<div class="meta">Result</div>
    <h2 class="${endingClass}">${ending}</h2>
    <p>You scored ${r.score}/6.</p>
    <div class="clue-list">
      <div class="clue"><strong>Murderer</strong>: ${r.picked.killer === state.caseData.solution.killer ? 'Correct +2' : 'Incorrect'}</div>
      <div class="clue"><strong>Motive</strong>: ${r.picked.motive === state.caseData.solution.motive ? 'Correct +1' : 'Incorrect'}</div>
      <div class="clue"><strong>Opportunity</strong>: ${r.picked.opportunity === state.caseData.solution.opportunity ? 'Correct +1' : 'Incorrect'}</div>
      <div class="clue"><strong>Supporting clues</strong>: ${Math.min(2, r.correctSupport)}/2 points</div>
    </div>
    <h3>Case complete: solution</h3>
    <p>${escapeHtml(state.caseData.solutionExplanation)}</p>
    <div class="actions"><button class="btn" onclick="restart()">Play again</button></div>`);
}

function restart() {
  state.foundClues = new Set();
  state.visitedLocations = new Set();
  state.interviewedSuspects = new Set();
  state.result = null;
  state.activeNotebookTab = 'clues';
  localStorage.removeItem(STORAGE_KEY);
  renderTitle();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Service worker registration failed', error));
    });
  }
}

registerServiceWorker();
init();
