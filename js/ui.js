/**
 * UI — HUD, Turmauswahl, Wellen-Button, Overlay.
 */
var hudLives, hudGold, hudWave, waveInfoEl, btnWave;
var towerBtns = {};
var selectedTowerType = null;

function uiInit(onTowerSelect, onStartWave, onRestart) {
  hudLives   = document.getElementById('hud-lives');
  hudGold    = document.getElementById('hud-gold');
  hudWave    = document.getElementById('hud-wave');
  waveInfoEl = document.getElementById('wave-info');
  btnWave    = document.getElementById('btn-start-wave');

  towerBtns.normal = document.getElementById('btn-tower-normal');
  towerBtns.splash = document.getElementById('btn-tower-splash');
  towerBtns.slow   = document.getElementById('btn-tower-slow');

  ['normal','splash','slow'].forEach(function (type) {
    towerBtns[type].addEventListener('click', function () {
      if (towerBtns[type].classList.contains('cant-afford')) return;
      if (selectedTowerType === type) {
        selectedTowerType = null;
      } else {
        selectedTowerType = type;
      }
      onTowerSelect(selectedTowerType);
      uiUpdateBtnStyles();
    });
  });

  btnWave.addEventListener('click', onStartWave);
  document.getElementById('restart-btn').addEventListener('click', onRestart);
}

function uiUpdateBtnStyles() {
  ['normal','splash','slow'].forEach(function (type) {
    towerBtns[type].classList.toggle('selected', type === selectedTowerType);
  });
}

function uiUpdate(lives, gold, waveNum) {
  hudLives.textContent = lives;
  hudGold.textContent  = gold;
  hudWave.textContent  = waveNum + ' / ' + TOTAL_WAVES;

  ['normal','splash','slow'].forEach(function (type) {
    towerBtns[type].classList.toggle('cant-afford', gold < TOWER_DEFS[type].cost);
  });
}

function uiSetWaveState(state, waveNum) {
  if (state === 'ready') {
    btnWave.disabled = false;
    btnWave.textContent = waveNum < TOTAL_WAVES
      ? '▶ Welle ' + (waveNum+1) + ' starten'
      : '▶ Letzte Welle!';
    waveInfoEl.textContent = 'Platziere Türme, dann starte!';
  } else if (state === 'running') {
    btnWave.disabled = true;
    btnWave.textContent = '⌛ Welle läuft...';
    waveInfoEl.textContent = 'Gegner abwehren!';
  } else {
    btnWave.disabled = true;
    btnWave.textContent = '—';
    waveInfoEl.textContent = '';
  }
}

function uiShowOverlay(type, gold) {
  var overlay = document.getElementById('overlay');
  overlay.classList.add('active');
  var title = document.getElementById('overlay-title');
  var msg   = document.getElementById('overlay-msg');
  if (type === 'victory') {
    title.className = 'win';
    title.textContent = '🏆 Sieg!';
    msg.textContent = 'Alle Wellen überstanden! Gold übrig: ' + gold;
  } else {
    title.className = 'lose';
    title.textContent = '💀 Game Over';
    msg.textContent = 'Alle Leben verloren. Versuche es nochmal!';
  }
}

function uiHideOverlay() {
  document.getElementById('overlay').classList.remove('active');
}
