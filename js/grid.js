/**
 * Grid — Spielfeld-Array und Canvas-Rendering.
 * Nutzt globale Konstanten aus constants.js und findPath aus pathfinder.js.
 */
var gridCells;   // 2D Array: 0 = frei, 1 = blockiert
var currentPath; // aktueller BFS-Pfad

// Hintergrundbild laden
var bgImage = new Image();
var bgImageLoaded = false;
bgImage.onload = function () { bgImageLoaded = true; };
bgImage.src = 'images/hintergrund.png';

function gridInit() {
  gridCells = [];
  for (var r = 0; r < ROWS; r++) {
    gridCells.push(new Array(COLS).fill(0));
  }
  currentPath = findPath(gridCells, START, END, COLS, ROWS);
}

function gridTryBlock(col, row) {
  if ((col === START.col && row === START.row) ||
      (col === END.col   && row === END.row)) return false;
  if (gridCells[row][col] === 1) return false;
  gridCells[row][col] = 1;
  var newPath = findPath(gridCells, START, END, COLS, ROWS);
  if (!newPath) {
    gridCells[row][col] = 0;
    return false;
  }
  currentPath = newPath;
  return true;
}

function gridUnblock(col, row) {
  gridCells[row][col] = 0;
  currentPath = findPath(gridCells, START, END, COLS, ROWS) || [];
}

function gridDraw(ctx) {
  var w = COLS * CELL, h = ROWS * CELL;

  // 1. Hintergrundbild (unterste Ebene). Fallback-Farbe falls noch nicht geladen.
  //    Das Bild ist im Querformat (z.B. 800x600). Fürs hochkante Spielfeld
  //    wird es um 90° gedreht gezeichnet, damit es ohne Verzerrung passt.
  if (bgImageLoaded) {
    ctx.save();
    // Kontext in die Mitte verschieben, um 90° im Uhrzeigersinn drehen,
    // dann das Bild zentriert zeichnen. Nach der Drehung entsprechen
    // Bild-Breite -> Feldhöhe und Bild-Höhe -> Feldbreite.
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI / 2); // 90° im Uhrzeigersinn
    // Im gedrehten Koordinatensystem ist die Zeichenbreite = h, die Höhe = w.
    ctx.drawImage(bgImage, -h / 2, -w / 2, h, w);
    ctx.restore();
  } else {
    ctx.fillStyle = '#1e1e32';
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Leichte Abdunklung, damit Türme/Gegner lesbar bleiben
  ctx.fillStyle = 'rgba(20, 20, 40, 0.35)';
  ctx.fillRect(0, 0, w, h);

  var pathSet = {};
  for (var i = 0; i < currentPath.length; i++) {
    pathSet[currentPath[i].col + ',' + currentPath[i].row] = true;
  }

  // 3. Pfad- und Start/Ziel-Kacheln halbtransparent, damit das Bild durchscheint
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var x = c * CELL, y = r * CELL;
      if (c === START.col && r === START.row) {
        ctx.fillStyle = 'rgba(46, 204, 64, 0.65)';
        ctx.fillRect(x+1, y+1, CELL-2, CELL-2);
      } else if (c === END.col && r === END.row) {
        ctx.fillStyle = 'rgba(255, 65, 54, 0.65)';
        ctx.fillRect(x+1, y+1, CELL-2, CELL-2);
      } else if (pathSet[c + ',' + r]) {
        ctx.fillStyle = 'rgba(58, 58, 92, 0.45)';
        ctx.fillRect(x+1, y+1, CELL-2, CELL-2);
      }
    }
  }

  // 4. Rasterlinien (etwas heller, damit sie über dem Bild sichtbar bleiben)
  ctx.strokeStyle = 'rgba(200, 200, 230, 0.25)';
  ctx.lineWidth = 0.5;
  for (var c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,ROWS*CELL); ctx.stroke();
  }
  for (var r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0,r*CELL); ctx.lineTo(COLS*CELL,r*CELL); ctx.stroke();
  }

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', START.col*CELL+CELL/2, START.row*CELL+CELL/2);
  ctx.fillText('Z', END.col*CELL+CELL/2,   END.row*CELL+CELL/2);
}
