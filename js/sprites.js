/**
 * sprites.js — lädt die Orc-Spritesheets und stellt Animations-Metadaten bereit.
 *
 * Jedes Spritesheet ist eine horizontale Reihe von 100x100-Frames.
 */
var SPRITE_FRAME = 100; // Breite & Höhe eines einzelnen Frames in px

var ORC_SPRITES = {
  walk:  { img: new Image(), frames: 8, loaded: false, src: 'images/enemies/Orc with shadows/Orc_Walk.png'  },
  death: { img: new Image(), frames: 4, loaded: false, src: 'images/enemies/Orc with shadows/Orc_Death.png' }
};

// Turm-Spritesheets: Frame = 70x130, horizontale Reihe
var TOWER_FRAME_W = 70;
var TOWER_FRAME_H = 130;

var TOWER_SPRITES = {
  normal: { img: new Image(), frames: 6, loaded: false, src: 'images/towers/standard.png' },
  splash: { img: new Image(), frames: 6, loaded: false, src: 'images/towers/splash.png'   },
  slow:   { img: new Image(), frames: 4, loaded: false, src: 'images/towers/slow.png'      }
};

(function loadAllSprites() {
  function load(entry) {
    entry.img.onload = function () { entry.loaded = true; };
    entry.img.src = entry.src;
  }
  for (var k in ORC_SPRITES)   load(ORC_SPRITES[k]);
  for (var t in TOWER_SPRITES) load(TOWER_SPRITES[t]);
})();
