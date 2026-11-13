/**
 * WaveManager — verwaltet Wellendefinitionen und Gegner-Spawning.
 */
function WaveManager() {
  this.currentWave = 0;
  this.spawnTimer  = 0;
  this.spawnQueue  = 0;
  this.waveActive  = false;
  this._def        = null;
}

WaveManager.prototype.startNextWave = function () {
  if (this.currentWave >= WAVE_DEFS.length) return false;
  this._def       = WAVE_DEFS[this.currentWave];
  this.currentWave++;
  this.spawnQueue = this._def.count;
  this.spawnTimer = 0;
  this.waveActive = true;
  return true;
};

WaveManager.prototype.update = function (dt, path, enemies) {
  if (!this.waveActive || this.spawnQueue <= 0) return;
  this.spawnTimer -= dt;
  if (this.spawnTimer <= 0) {
    this.spawnTimer = this._def.spawnInterval;
    enemies.push(new Enemy(path, this._def.hp, this._def.speed, this._def.gold, this._def.color));
    this.spawnQueue--;
  }
};

WaveManager.prototype.checkWaveEnd = function (enemies) {
  if (!this.waveActive) return false;
  if (this.spawnQueue > 0) return false;
  for (var i = 0; i < enemies.length; i++) {
    if (!enemies[i].dead) return false;
  }
  this.waveActive = false;
  return true;
};
