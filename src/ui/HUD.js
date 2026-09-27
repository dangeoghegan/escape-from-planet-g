/**
 * HUD.js - Heads-up display showing speed, hull, boost, objective, comms, and warnings.
 */
import { PORTRAITS } from './Portraits.js';
import { storage } from '../logic/Storage.js';

export class HUD {
  constructor(container) {
    this.container = container;
    this.element = null;

    // Elements
    this.speedVal = null;
    this.hullFill = null;
    this.hullText = null;
    this.boostFill = null;
    this.boostText = null;
    this.objectiveText = null;
    this.levelBadge = null;
    this.cameraBadge = null;
    this.extractionBox = null;
    this.extractionFill = null;
    this.commsBox = null;
    this.commsPortrait = null;
    this.commsSpeaker = null;
    this.commsMessage = null;
    this.damageVignette = null;

    this.commsTimeout = null;

    this.init();
  }

  init() {
    this.element = document.createElement('div');
    this.element.id = 'hud-container';
    this.element.innerHTML = `
      <!-- Red Damage Screen Vignette -->
      <div id="damage-vignette" class="damage-vignette"></div>

      <!-- Top Bar: Level, Objective, Mute/Pause Controls -->
      <div class="hud-top-bar">
        <div class="hud-panel hud-level-panel">
          <span id="hud-level-badge" class="badge">LEVEL 1</span>
          <span id="hud-objective" class="objective-text">Fly through Storm Canyon and enter Cavern Maw</span>
        </div>
        <div class="hud-top-right">
          <div id="hud-camera-badge" class="badge badge-interactive">CAM: CHASE [V]</div>
          <button id="hud-btn-mute" class="hud-icon-btn" title="Toggle Mute [M]">🔊</button>
          <button id="hud-btn-pause" class="hud-icon-btn" title="Pause Game [Esc]">⏸</button>
        </div>
      </div>

      <!-- Extraction Progress (shown in Level 5) -->
      <div id="hud-extraction-box" class="hud-extraction-box" style="display: none;">
        <div class="extraction-header">PRINCESS ODETTE EXTRACTION BEAM</div>
        <div class="extraction-bar-container">
          <div id="hud-extraction-fill" class="extraction-bar-fill" style="width: 0%;"></div>
        </div>
        <div class="extraction-hint">HOLD BRAKE [SPACE] TO HOVER IN EXTRACTION ZONE</div>
      </div>

      <!-- Radio Communications Transmission Popup -->
      <div id="hud-comms-box" class="hud-comms-box" style="display: none;">
        <div id="hud-comms-portrait" class="comms-portrait"></div>
        <div class="comms-content">
          <div id="hud-comms-speaker" class="comms-speaker">CAPTAIN FLYNN</div>
          <div id="hud-comms-msg" class="comms-message">All systems green. Approaching the descent corridor!</div>
        </div>
      </div>

      <!-- Bottom Instruments: Hull, Boost, Speedometer -->
      <div class="hud-bottom-bar">
        <!-- Hull Integrity Gauge -->
        <div class="hud-instrument-panel">
          <div class="inst-label">HULL INTEGRITY</div>
          <div class="meter-bar-track">
            <div id="hud-hull-fill" class="meter-bar-fill hull-fill" style="width: 100%;"></div>
          </div>
          <div id="hud-hull-text" class="inst-val">100%</div>
        </div>

        <!-- Center Crosshair / Flight Corridor Reticle -->
        <div class="hud-flight-reticle">
          <div class="reticle-ring"></div>
          <div class="reticle-dot"></div>
        </div>

        <!-- Boost Gauge -->
        <div class="hud-instrument-panel">
          <div class="inst-label">BOOST CHARGE</div>
          <div class="meter-bar-track">
            <div id="hud-boost-fill" class="meter-bar-fill boost-fill" style="width: 100%;"></div>
          </div>
          <div id="hud-boost-text" class="inst-val">100%</div>
        </div>

        <!-- Speedometer -->
        <div class="hud-instrument-panel speed-panel">
          <div class="inst-label">VELOCITY</div>
          <div class="speed-readout">
            <span id="hud-speed-val" class="speed-num">38</span>
            <span class="speed-unit">M/S</span>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    // Cache elements
    this.speedVal = this.element.querySelector('#hud-speed-val');
    this.hullFill = this.element.querySelector('#hud-hull-fill');
    this.hullText = this.element.querySelector('#hud-hull-text');
    this.boostFill = this.element.querySelector('#hud-boost-fill');
    this.boostText = this.element.querySelector('#hud-boost-text');
    this.objectiveText = this.element.querySelector('#hud-objective');
    this.levelBadge = this.element.querySelector('#hud-level-badge');
    this.cameraBadge = this.element.querySelector('#hud-camera-badge');
    this.extractionBox = this.element.querySelector('#hud-extraction-box');
    this.extractionFill = this.element.querySelector('#hud-extraction-fill');
    this.commsBox = this.element.querySelector('#hud-comms-box');
    this.commsPortrait = this.element.querySelector('#hud-comms-portrait');
    this.commsSpeaker = this.element.querySelector('#hud-comms-speaker');
    this.commsMessage = this.element.querySelector('#hud-comms-msg');
    this.damageVignette = this.element.querySelector('#damage-vignette');
  }

  show() {
    if (this.element) this.element.style.display = 'block';
  }

  hide() {
    if (this.element) this.element.style.display = 'none';
  }

  triggerDamageFlash() {
    if (!this.damageVignette) return;
    const settings = storage.getSettings();
    if (settings.reducedFlash) {
      this.damageVignette.classList.add('vignette-gentle');
      setTimeout(() => this.damageVignette.classList.remove('vignette-gentle'), 300);
    } else {
      this.damageVignette.classList.add('vignette-flash');
      setTimeout(() => this.damageVignette.classList.remove('vignette-flash'), 300);
    }
  }

  showComms(speaker, message, duration = 4.0) {
    if (!this.commsBox) return;

    if (speaker === 'odette') {
      this.commsPortrait.innerHTML = PORTRAITS.odette;
      this.commsSpeaker.innerText = 'PRINCESS ODETTE';
      this.commsSpeaker.style.color = '#ffb703';
    } else if (speaker === 'tallow') {
      this.commsPortrait.innerHTML = PORTRAITS.tallow;
      this.commsSpeaker.innerText = 'TALLOW SCOUT';
      this.commsSpeaker.style.color = '#ff5722';
    } else {
      this.commsPortrait.innerHTML = PORTRAITS.flynn;
      this.commsSpeaker.innerText = 'CAPTAIN FLYNN';
      this.commsSpeaker.style.color = '#00e5ff';
    }

    this.commsMessage.innerText = message;
    this.commsBox.style.display = 'flex';
    this.commsBox.classList.add('comms-slide-in');

    if (this.commsTimeout) clearTimeout(this.commsTimeout);
    this.commsTimeout = setTimeout(() => {
      this.commsBox.style.display = 'none';
    }, duration * 1000);
  }

  update(levelManager) {
    if (!levelManager || !this.element) return;

    const ship = levelManager.ship;
    const levelCfg = levelManager.levelConfig;

    // 1. Velocity
    this.speedVal.textContent = String(Math.round(ship.speed));

    // 2. Hull Integrity
    const hullPct = Math.max(0, Math.round((ship.hull / ship.maxHull) * 100));
    this.hullFill.style.width = `${hullPct}%`;
    this.hullText.textContent = `${hullPct}%`;
    if (hullPct < 30) {
      this.hullFill.style.background = '#ff2244';
      this.hullText.style.color = '#ff2244';
    } else if (hullPct < 60) {
      this.hullFill.style.background = '#ffaa00';
      this.hullText.style.color = '#ffaa00';
    } else {
      this.hullFill.style.background = '#00ff88';
      this.hullText.style.color = '#00ff88';
    }

    // 3. Boost Charge
    const boostPct = Math.max(0, Math.round((ship.boostCharge / ship.maxBoost) * 100));
    this.boostFill.style.width = `${boostPct}%`;
    this.boostText.textContent = `${boostPct}%`;
    if (ship.isBoosting) {
      this.boostFill.style.background = '#ff5500';
    } else {
      this.boostFill.style.background = '#00ccff';
    }

    // 4. Level & Objective
    this.levelBadge.textContent = `LEVEL ${levelCfg.id}: ${levelCfg.name.toUpperCase()}`;
    this.objectiveText.textContent = String(levelManager.getCurrentObjective());

    // 5. Camera mode indicator
    const camUpper = ship.cameraMode.toUpperCase();
    this.cameraBadge.textContent = `CAM: ${camUpper} [V]`;

    // 6. Extraction Progress (Level 5)
    if (levelCfg.id === 5 && !levelManager.isExtracted && levelManager.extractionInRange) {
      this.extractionBox.style.display = 'block';
      const pct = Math.min(100, Math.round((levelManager.extractionProgress / levelManager.extractionDuration) * 100));
      this.extractionFill.style.width = `${pct}%`;
    } else {
      this.extractionBox.style.display = 'none';
    }
  }
}
