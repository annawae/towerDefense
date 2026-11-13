/**
 * game.js — Haupt-Game-Loop und Zustandsverwaltung.
 * Muss als letztes Script geladen werden.
 */
var canvas, ctx;
var towers, enemies, projectiles, waveManager;
var gold, lives, gameState, hoveredCell;

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx    = canvas.getContext('2d');
  canvas.width  = COLS * CELL;
  canvas.height = ROWS * CELL;

  gridInit();
  towers       = [];
  enemies      = [];
  projectiles  = [];
  waveManager  = new WaveManager();
  gold         = 150;
  lives        = 20;
  gameState    = 'playing';
  hoveredCell  = null;
  selectedTowerType = null;

  uiInit(
    function (type) { selectedTowerType = type; },
    function () { startWave(); },
    function () { restart(); }
  );
  uiUpdate(lives, gold, 0);
  uiSetWaveState('ready', 0);
  uiHideOverlay();
}

// Canvas-Eingaben nur einmal registrieren (nicht bei jedem Restart).
function registerCanvasInput() {
  // Maus / Desktop
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('contextmenu', onCanvasRightClick);
  canvas.addEventListener('mousemove', onCanvasMouseMove);
  canvas.addEventListener('mouseleave', function () { hoveredCell = null; });

  // Touch / Mobile ({ passive: false } erlaubt preventDefault gegen Scrollen/Zoom)
  canvas.addEventListener('touchstart', onCanvasTouchStart, { passive: false });
  canvas.addEventListener('touchmove',  onCanvasTouchMove,  { passive: false });
  canvas.addEventListener('touchend',   onCanvasTouchEnd,   { passive: false });
}

function restart() {
  init();
}

function startWave() {
  if (gameState !== 'playing') return;
  if (waveManager.waveActive) return;
  if (!waveManager.startNextWave()) return;
  uiSetWaveState('running', waveManager.currentWave);
}

function placeTower(col, row) {
  if (!selectedTowerType) return;
  var def = TOWER_DEFS[selectedTowerType];
  if ((col===START.col && row===START.row) || (col===END.col && row===END.row)) return;
  for (var i = 0; i < towers.length; i++) {
    if (towers[i].col === col && towers[i].row === row) return;
  }
  if (gold < def.cost) return;
  if (!gridTryBlock(col, row)) return;

  gold -= def.cost;
  towers.push(new Tower(col, row, selectedTowerType));
  for (var i = 0; i < enemies.length; i++) {
    if (!enemies[i].dead) enemies[i].updatePath(currentPath);
  }
  tgHaptic('light');
  uiUpdate(lives, gold, waveManager.currentWave);
}

function sellTower(col, row) {
  var idx = -1;
  for (var i = 0; i < towers.length; i++) {
    if (towers[i].col === col && towers[i].row === row) { idx = i; break; }
  }
  if (idx === -1) return;
  // Voller Kaufpreis als Rückerstattung
  var refund = TOWER_DEFS[towers[idx].type].cost;
  gold += refund;
  towers.splice(idx, 1);
  gridUnblock(col, row);
  for (var i = 0; i < enemies.length; i++) {
    if (!enemies[i].dead) enemies[i].updatePath(currentPath);
  }
  uiUpdate(lives, gold, waveManager.currentWave);
}

/**
 * Rechnet Bildschirm-Koordinaten (clientX/Y) in Grid-Koordinaten um.
 * Berücksichtigt die CSS-Skalierung des Canvas (Canvas-interne Pixel vs.
 * tatsächliche Darstellungsgröße), damit Taps auf skaliertem Canvas treffen.
 */
function clientToCell(clientX, clientY) {
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width  / rect.width;
  var scaleY = canvas.height / rect.height;
  var px = (clientX - rect.left) * scaleX;
  var py = (clientY - rect.top)  * scaleY;
  var col = Math.floor(px / CELL);
  var row = Math.floor(py / CELL);
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
  return { col: col, row: row };
}

function onCanvasClick(e) {
  if (gameState !== 'playing') return;
  var cell = clientToCell(e.clientX, e.clientY);
  if (!cell) return;
  if (selectedTowerType) placeTower(cell.col, cell.row);
}

function onCanvasRightClick(e) {
  e.preventDefault();
  if (gameState !== 'playing') return;
  var cell = clientToCell(e.clientX, e.clientY);
  if (!cell) return;
  sellTower(cell.col, cell.row);
}

function onCanvasMouseMove(e) {
  var cell = clientToCell(e.clientX, e.clientY);
  hoveredCell = cell;
}

// ─── Touch-Steuerung ──────────────────────────────────────
// Tap: Turm platzieren (wenn Typ ausgewählt).
// Long-Press (500ms) auf einem Turm: verkaufen (Ersatz für Rechtsklick).
var touchTimer = null;
var touchStartCell = null;
var touchMoved = false;
var LONG_PRESS_MS = 500;

function onCanvasTouchStart(e) {
  e.preventDefault(); // verhindert nachgefeuertes Maus-click und Scrollen/Zoom
  if (gameState !== 'playing') return;
  if (e.touches.length !== 1) return;
  var t = e.touches[0];
  touchMoved = false;
  touchStartCell = clientToCell(t.clientX, t.clientY);
  hoveredCell = touchStartCell; // Reichweiten-Vorschau unter dem Finger

  // Long-Press startet den Verkauf
  if (touchTimer) clearTimeout(touchTimer);
  touchTimer = setTimeout(function () {
    touchTimer = null;
    if (touchMoved || !touchStartCell) return;
    // Nur verkaufen, wenn dort ein Turm steht
    for (var i = 0; i < towers.length; i++) {
      if (towers[i].col === touchStartCell.col && towers[i].row === touchStartCell.row) {
        sellTower(touchStartCell.col, touchStartCell.row);
        tgHaptic('medium');
        touchStartCell = null; // verhindert zusätzliches Platzieren bei touchend
        break;
      }
    }
  }, LONG_PRESS_MS);
}

function onCanvasTouchMove(e) {
  if (e.touches.length !== 1) return;
  var t = e.touches[0];
  var cell = clientToCell(t.clientX, t.clientY);
  hoveredCell = cell;
  // Bewegt sich der Finger auf eine andere Kachel, gilt es als "verschoben"
  if (!cell || !touchStartCell ||
      cell.col !== touchStartCell.col || cell.row !== touchStartCell.row) {
    touchMoved = true;
  }
}

function onCanvasTouchEnd(e) {
  e.preventDefault();
  if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
  if (gameState !== 'playing') { touchStartCell = null; return; }
  // Kurzer Tap (kein Long-Press ausgelöst, Finger nicht verschoben) → platzieren
  if (!touchMoved && touchStartCell && selectedTowerType) {
    placeTower(touchStartCell.col, touchStartCell.row);
  }
  touchStartCell = null;
  hoveredCell = null;
}

// ─── Game Loop ────────────────────────────────────────────
var lastTime = 0;

function gameLoop(timestamp) {
  var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  if (gameState === 'playing') update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  waveManager.update(dt, currentPath, enemies);

  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    e.update(dt);
    if (e.reachedEnd && !e._counted) {
      e._counted = true;
      lives--;
      tgHaptic('warning');
      uiUpdate(lives, gold, waveManager.currentWave);
      if (lives <= 0) { endGame('gameover'); return; }
    }
  }

  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    if (e.dead && !e.reachedEnd && !e._goldCounted) {
      e._goldCounted = true;
      gold += e.gold;
      uiUpdate(lives, gold, waveManager.currentWave);
    }
  }

  for (var i = 0; i < towers.length; i++) {
    towers[i].update(dt, enemies, projectiles);
  }

  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].update(dt, enemies);
  }

  var newEnemies = [];
  for (var i = 0; i < enemies.length; i++) {
    if (!enemies[i].dead || enemies[i].deathFlash) newEnemies.push(enemies[i]);
  }
  enemies = newEnemies;

  var newProj = [];
  for (var i = 0; i < projectiles.length; i++) {
    if (!projectiles[i].dead) newProj.push(projectiles[i]);
  }
  projectiles = newProj;

  if (waveManager.waveActive) {
    if (waveManager.checkWaveEnd(enemies)) {
      if (waveManager.currentWave >= TOTAL_WAVES) {
        endGame('victory');
      } else {
        uiSetWaveState('ready', waveManager.currentWave);
        uiUpdate(lives, gold, waveManager.currentWave);
      }
    }
  }
}

function endGame(result) {
  gameState = result;
  uiSetWaveState(result, waveManager.currentWave);
  uiShowOverlay(result, gold);
  tgHaptic(result === 'victory' ? 'success' : 'error');
}

function draw() {
  gridDraw(ctx);

  if (hoveredCell && selectedTowerType) {
    var col = hoveredCell.col, row = hoveredCell.row;
    var blocked = gridCells[row][col] === 1;
    var hasT = false;
    for (var i = 0; i < towers.length; i++) {
      if (towers[i].col === col && towers[i].row === row) { hasT = true; break; }
    }
    var isSpecial = (col===START.col&&row===START.row)||(col===END.col&&row===END.row);
    var canPlace = !blocked && !hasT && !isSpecial;
    ctx.fillStyle = canPlace ? 'rgba(255,255,255,0.12)' : 'rgba(255,80,80,0.18)';
    ctx.fillRect(col*CELL+1, row*CELL+1, CELL-2, CELL-2);

    var def = TOWER_DEFS[selectedTowerType];
    ctx.beginPath();
    ctx.arc(col*CELL+CELL/2, row*CELL+CELL/2, def.range*CELL, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(255,220,100,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Türme nach Zeile sortiert zeichnen, damit höher stehende Türme
  // hinter tiefer stehenden liegen (die Sprites ragen nach oben heraus).
  var sortedTowers = towers.slice().sort(function (a, b) { return a.row - b.row; });
  for (var i = 0; i < sortedTowers.length; i++) {
    var t = sortedTowers[i];
    var showRange = hoveredCell && !selectedTowerType &&
                    hoveredCell.col === t.col && hoveredCell.row === t.row;
    t.draw(ctx, showRange);
  }

  for (var i = 0; i < projectiles.length; i++) projectiles[i].draw(ctx);
  for (var i = 0; i < enemies.length; i++) enemies[i].draw(ctx);
}

// ─── Start ────────────────────────────────────────────────
init();
registerCanvasInput(); // Eingaben einmalig binden
requestAnimationFrame(gameLoop);
