/**
 * Globale Konstanten und Definitionen.
 */
// Hochformat fürs Handy: mehr Zeilen als Spalten.
// Gegner laufen von unten (Start) nach oben (Ziel).
var COLS = 15;
var ROWS = 20;
var CELL = 40;
var START = { col: 7, row: 19 }; // unten-mitte
var END   = { col: 7, row: 0 };  // oben-mitte
var TOTAL_WAVES = 10;

var TOWER_DEFS = {
  normal: { name:'Normal', cost:50, damage:25, range:3.0, fireRate:1.2, projSpeed:220, color:'#4a90d9', projColor:'#ffe04b', splashR:0,   slowFactor:1,   slowDur:0   },
  splash: { name:'Splash', cost:80, damage:18, range:2.5, fireRate:0.6, projSpeed:180, color:'#e05c20', projColor:'#ff9955', splashR:1.5, slowFactor:1,   slowDur:0   },
  slow:   { name:'Slow',   cost:60, damage:10, range:3.5, fireRate:1.0, projSpeed:160, color:'#30b090', projColor:'#aaffee', splashR:0,   slowFactor:0.4, slowDur:2.5 }
};

var WAVE_DEFS = [
  { count:  8, hp:  60, speed:1.8, gold:  8, color:'#ff6666', spawnInterval:1.2 },
  { count: 10, hp:  80, speed:2.0, gold: 10, color:'#ff8844', spawnInterval:1.1 },
  { count: 12, hp: 110, speed:2.0, gold: 12, color:'#ffaa44', spawnInterval:1.0 },
  { count: 12, hp: 140, speed:2.3, gold: 14, color:'#dddd44', spawnInterval:1.0 },
  { count: 14, hp: 180, speed:2.4, gold: 16, color:'#aaff44', spawnInterval:0.9 },
  { count: 15, hp: 230, speed:2.5, gold: 18, color:'#44ffaa', spawnInterval:0.9 },
  { count: 16, hp: 300, speed:2.6, gold: 20, color:'#44aaff', spawnInterval:0.85},
  { count: 18, hp: 380, speed:2.7, gold: 22, color:'#8844ff', spawnInterval:0.8 },
  { count: 20, hp: 480, speed:2.9, gold: 25, color:'#ff44cc', spawnInterval:0.75},
  { count: 25, hp: 650, speed:3.1, gold: 30, color:'#ff2222', spawnInterval:0.7 }
];
