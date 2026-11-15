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

  uiDrawTowerIcons();
}

// Zeichnet den ersten (statischen) Frame jedes Turm-Spritesheets in das
// Icon-Canvas des jeweiligen Kauf-Buttons.
function uiDrawTowerIcons() {
  ['normal','splash','slow'].forEach(function (type) {
    var canvas = towerBtns[type].querySelector('.tower-icon');
    if (!canvas) return;
    var sprite = TOWER_SPRITES[type];

    function render() {
      // Interne Auflösung an das CSS-Maß koppeln (scharf auf allen Displays)
      var cssW = canvas.clientWidth  || 26;
      var cssH = canvas.clientHeight || 48;
      var dpr  = window.devicePixelRatio || 1;
      canvas.width  = cssW * dpr;
      canvas.height = cssH * dpr;

      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Nur den ersten Frame (statisch) aus dem Spritesheet zeichnen
      ctx.drawImage(
        sprite.img,
        0, 0, TOWER_FRAME_W, TOWER_FRAME_H,   // Quelle: Frame 0
        0, 0, canvas.width, canvas.height     // Ziel: ganzes Canvas
      );
    }

    if (sprite.loaded) {
      render();
    } else {
      // Bild evtl. noch nicht fertig geladen → nachträglich zeichnen
      sprite.img.addEventListener('load', render);
    }
  });
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
