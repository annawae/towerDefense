/**
 * Tower & Projectile — alle drei Turmtypen und ihre Geschosse.
 */
function Projectile(x, y, target, def) {
  this.x      = x;
  this.y      = y;
  this.target = target;
  this.def    = def;
  this.speed  = def.projSpeed;
  this.dead   = false;
  this.color  = def.projColor;
}

Projectile.prototype.update = function (dt, enemies) {
  if (this.dead) return;
  var tx = this.target.x, ty = this.target.y;
  var dx = tx - this.x, dy = ty - this.y;
  var dist = Math.sqrt(dx*dx + dy*dy);

  if (dist < this.speed * dt + 2) {
    this.dead = true;
    if (this.def.splashR > 0) {
      var splashPx = this.def.splashR * CELL;
      for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].dead) continue;
        var ex = enemies[i].x - tx, ey = enemies[i].y - ty;
        if (Math.sqrt(ex*ex+ey*ey) <= splashPx) {
          enemies[i].takeDamage(this.def.damage);
        }
      }
    } else {
      if (!this.target.dead) {
        this.target.takeDamage(this.def.damage);
        if (this.def.slowFactor < 1) {
          this.target.applySlow(this.def.slowFactor, this.def.slowDur);
        }
      }
    }
    return;
  }
  var nx = dx/dist, ny = dy/dist;
  this.x += nx * this.speed * dt;
  this.y += ny * this.speed * dt;
};

Projectile.prototype.draw = function (ctx) {
  if (this.dead) return;
  ctx.beginPath();
  ctx.arc(this.x, this.y, 4, 0, Math.PI*2);
  ctx.fillStyle = this.color;
  ctx.fill();
};

function Tower(col, row, type) {
  this.col  = col;
  this.row  = row;
  this.type = type;
  this.def  = TOWER_DEFS[type];
  this.x    = col * CELL + CELL/2;
  this.y    = row * CELL + CELL/2;
  this.cooldown = 0;

  // Animation
  this.animTime = Math.random() * 1; // versetzter Start
  this.animFps  = 6;
}

Tower.prototype.update = function (dt, enemies, projectiles) {
  this.animTime += dt;
  this.cooldown -= dt;
  if (this.cooldown > 0) return;

  var target = null;
  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    if (e.dead) continue;
    var dx = e.x - this.x, dy = e.y - this.y;
    if (Math.sqrt(dx*dx+dy*dy) <= this.def.range * CELL) {
      if (!target ||
          e.pathIndex > target.pathIndex ||
          (e.pathIndex === target.pathIndex && e.pathProgress > target.pathProgress)) {
        target = e;
      }
    }
  }
  if (!target) return;

  this.cooldown = 1 / this.def.fireRate;
  projectiles.push(new Projectile(this.x, this.y, target, this.def));
};

Tower.prototype.draw = function (ctx, showRange) {
  if (showRange) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.def.range * CELL, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  var sheet = TOWER_SPRITES[this.type];

  if (sheet && sheet.loaded) {
    // Frame auswählen
    var fi = Math.floor(this.animTime * this.animFps) % sheet.frames;
    var sx = fi * TOWER_FRAME_W;

    // Zielgröße: Breite ~ eine Kachel, Höhe proportional (130/70).
    var drawW = CELL * 1.3;
    var drawH = drawW * (TOWER_FRAME_H / TOWER_FRAME_W);

    // Horizontal zentriert; vertikal so, dass die Basis knapp unter der
    // Kachelmitte sitzt und der Turm nach oben herausragt.
    var dx = this.x - drawW / 2;
    var dy = (this.row * CELL + CELL) - drawH + 4;

    ctx.drawImage(
      sheet.img,
      sx, 0, TOWER_FRAME_W, TOWER_FRAME_H,
      dx, dy, drawW, drawH
    );
  } else {
    // Fallback: farbiges Quadrat mit Symbol, falls Sprite noch nicht geladen
    var x = this.col*CELL, y = this.row*CELL, s = CELL-6;
    ctx.fillStyle = this.def.color;
    ctx.fillRect(x+3, y+3, s, s);

    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    if (this.type === 'normal') {
      ctx.beginPath(); ctx.arc(this.x, this.y, 6, 0, Math.PI*2); ctx.fill();
    } else if (this.type === 'splash') {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y-8); ctx.lineTo(this.x+8, this.y);
      ctx.lineTo(this.x, this.y+8); ctx.lineTo(this.x-8, this.y);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y-8); ctx.lineTo(this.x+7, this.y+5);
      ctx.lineTo(this.x-7, this.y+5); ctx.closePath(); ctx.fill();
    }
  }
};
