/**
 * Enemy — bewegt sich entlang des BFS-Pfades.
 */
function Enemy(path, hp, speed, gold, color) {
  this.path         = path.slice();
  this.maxHp        = hp;
  this.hp           = hp;
  this.baseSpeed    = speed;
  this.gold         = gold;
  this.color        = color || '#ff4444';
  this.pathIndex    = 0;
  this.pathProgress = 0;
  this.dead         = false;
  this.reachedEnd   = false;
  this.slowFactor   = 1;
  this.slowTimer    = 0;
  this.deathTimer   = 0;
  this.deathFlash   = false;
  this._counted     = false;
  this._goldCounted = false;
  this.x = path[0].col * CELL + CELL/2;
  this.y = path[0].row * CELL + CELL/2;

  // Animation
  this.animTime   = Math.random() * 1;  // leicht versetzt starten, damit nicht alle synchron laufen
  this.walkFps    = 10;                  // Frames pro Sekunde fürs Laufen
  this.deathFps   = 8;                   // Frames pro Sekunde fürs Sterben
  this.deathAnimTime = 0;                // läuft erst beim Tod los
}

Enemy.prototype.getSpeed = function () {
  return this.baseSpeed * this.slowFactor;
};

Enemy.prototype.applySlow = function (factor, duration) {
  if (factor < this.slowFactor || this.slowTimer <= 0) {
    this.slowFactor = factor;
    this.slowTimer  = duration;
  }
};

Enemy.prototype.takeDamage = function (dmg) {
  if (this.dead) return;
  this.hp -= dmg;
  if (this.hp <= 0) {
    this.hp = 0;
    this.dead = true;
    this.deathFlash = true;        // "deathFlash" = Death-Animation läuft noch
    // Dauer = Anzahl Death-Frames / FPS
    this.deathTimer = ORC_SPRITES.death.frames / this.deathFps;
    this.deathAnimTime = 0;
  }
};

Enemy.prototype.updatePath = function (newPath) {
  if (!newPath || newPath.length === 0) return;
  this.path = newPath.slice();
  var bestIdx = 0, bestDist = Infinity;
  for (var i = 0; i < newPath.length; i++) {
    var nx = newPath[i].col * CELL + CELL/2;
    var ny = newPath[i].row * CELL + CELL/2;
    var d = Math.abs(nx - this.x) + Math.abs(ny - this.y);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  this.pathIndex    = Math.min(bestIdx, newPath.length - 1);
  this.pathProgress = 0;
};

Enemy.prototype.update = function (dt) {
  if (this.dead) {
    if (this.deathFlash) {
      this.deathTimer    -= dt;
      this.deathAnimTime += dt;
      if (this.deathTimer <= 0) this.deathFlash = false;
    }
    return;
  }
  // Laufanimation weiterzählen
  this.animTime += dt;
  if (this.slowTimer > 0) {
    this.slowTimer -= dt;
    if (this.slowTimer <= 0) { this.slowTimer = 0; this.slowFactor = 1; }
  }
  if (this.pathIndex >= this.path.length - 1) {
    this.reachedEnd = true;
    this.dead = true;
    return;
  }
  var spd = this.getSpeed();
  this.pathProgress += spd * dt;
  while (this.pathProgress >= 1) {
    this.pathProgress -= 1;
    this.pathIndex++;
    if (this.pathIndex >= this.path.length - 1) {
      this.reachedEnd = true;
      this.dead = true;
      this.x = this.path[this.path.length-1].col * CELL + CELL/2;
      this.y = this.path[this.path.length-1].row * CELL + CELL/2;
      return;
    }
  }
  var c2 = this.path[this.pathIndex];
  var n2 = this.path[this.pathIndex + 1];
  if (!n2) return;
  this.x = (c2.col*CELL+CELL/2)*(1-this.pathProgress) + (n2.col*CELL+CELL/2)*this.pathProgress;
  this.y = (c2.row*CELL+CELL/2)*(1-this.pathProgress) + (n2.row*CELL+CELL/2)*this.pathProgress;
};

// Zeichengröße des Sprites auf dem Spielfeld (etwas größer als eine Kachel,
// da die Figur im 100px-Frame mittig und mit Rand liegt)
var ENEMY_DRAW_SIZE = CELL * 4.1;

Enemy.prototype._drawSprite = function (ctx, sheet, frameIndex) {
  var sx = frameIndex * SPRITE_FRAME;
  var d  = ENEMY_DRAW_SIZE;
  ctx.drawImage(
    sheet.img,
    sx, 0, SPRITE_FRAME, SPRITE_FRAME,   // Quelle: ein Frame
    this.x - d/2, this.y - d/2, d, d     // Ziel: zentriert auf Gegnerposition
  );
};

Enemy.prototype.draw = function (ctx) {
  if (this.dead && !this.deathFlash) return;

  var walk  = ORC_SPRITES.walk;
  var death = ORC_SPRITES.death;

  // ─── Death-Animation ───
  if (this.deathFlash) {
    if (death.loaded) {
      var df = Math.floor(this.deathAnimTime * this.deathFps);
      if (df >= death.frames) df = death.frames - 1;
      this._drawSprite(ctx, death, df);
    } else {
      // Fallback: weißer Flash wie vorher
      var r = CELL * 0.3;
      var alpha = this.deathTimer > 0 ? (this.deathTimer / (death.frames / this.deathFps)) : 0;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r*1.6, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,200,' + alpha + ')';
      ctx.fill();
    }
    return;
  }

  var isSlowed = this.slowFactor < 1;

  // ─── Lauf-Animation ───
  if (walk.loaded) {
    var wf = Math.floor(this.animTime * this.walkFps) % walk.frames;
    this._drawSprite(ctx, walk, wf);

    // Slow-Effekt: blauer Ring unter der Figur als Marker
    // (eine echte Sprite-Einfärbung ist mit Canvas nur umständlich und würde
    //  das restliche Bild beeinflussen, daher ein dezenter Ring)
    if (isSlowed) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y + ENEMY_DRAW_SIZE * 0.18, CELL * 0.32, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(80, 180, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
  } else {
    // Fallback: Kreis wie vorher, falls Sprite noch nicht geladen
    var r = CELL * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI*2);
    ctx.fillStyle = isSlowed ? '#44aaff' : this.color;
    ctx.fill();
    ctx.strokeStyle = isSlowed ? '#aaddff' : '#ff9999';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ─── HP-Balken (immer über dem Sprite) ───
  var barW = CELL-8, barH = 4;
  var barX = this.x - barW/2, barY = this.y - ENEMY_DRAW_SIZE/2 + 4;
  var pct = this.hp / this.maxHp;
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = pct > 0.6 ? '#3f3' : pct > 0.3 ? '#ff0' : '#f33';
  ctx.fillRect(barX, barY, barW*pct, barH);
};
