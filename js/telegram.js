/**
 * telegram.js — Integration mit der Telegram Mini App Plattform.
 *
 * Das SDK (telegram-web-app.js) stellt das globale Objekt window.Telegram.WebApp bereit.
 * Läuft das Spiel außerhalb von Telegram (normaler Browser), ist dieses Objekt
 * nicht vorhanden — dann macht diese Datei nichts und das Spiel läuft normal weiter.
 */
var TG = null;              // Referenz auf Telegram.WebApp (oder null)
var IS_TELEGRAM = false;    // true, wenn in Telegram geöffnet

(function initTelegram() {
  if (!window.Telegram || !window.Telegram.WebApp) {
    // Nicht in Telegram geöffnet — normaler Browser-Betrieb.
    return;
  }

  TG = window.Telegram.WebApp;
  IS_TELEGRAM = true;

  // 1. Telegram mitteilen, dass die App geladen ist (blendet den Ladebalken aus)
  TG.ready();

  // 2. App auf volle Höhe ausdehnen
  if (typeof TG.expand === 'function') {
    TG.expand();
  }

  // 3. Fullscreen anfordern (neuere Bot-API-Versionen). Vorsichtig aufrufen,
  //    da ältere Clients die Methode nicht kennen.
  try {
    if (typeof TG.requestFullscreen === 'function') {
      TG.requestFullscreen();
    }
  } catch (e) { /* von altem Client ignoriert */ }

  // 4. Theme-Farben von Telegram übernehmen (Hintergrund der App an das
  //    Telegram-Theme anpassen, damit die Ränder zum Client passen).
  applyTelegramTheme();
  TG.onEvent('themeChanged', applyTelegramTheme);

  // 5. Bestätigungsdialog beim versehentlichen Schließen aktivieren,
  //    damit ein laufendes Spiel nicht aus Versehen beendet wird.
  if (typeof TG.enableClosingConfirmation === 'function') {
    TG.enableClosingConfirmation();
  }
})();

function applyTelegramTheme() {
  if (!TG) return;
  var p = TG.themeParams || {};
  // Nur den Seitenhintergrund (außerhalb des Spielfelds) anpassen.
  if (p.bg_color) {
    document.body.style.background = p.bg_color;
  }
}

/**
 * Löst eine kurze Vibration / haptisches Feedback aus (falls verfügbar).
 * type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
 */
function tgHaptic(type) {
  if (!TG || !TG.HapticFeedback) return;
  try {
    if (type === 'success' || type === 'warning' || type === 'error') {
      TG.HapticFeedback.notificationOccurred(type);
    } else {
      TG.HapticFeedback.impactOccurred(type || 'light');
    }
  } catch (e) { /* ignorieren */ }
}
