import { describe, it, expect, beforeEach } from 'vitest';
import { MenuManager } from '../ui/MenuManager.js';
import { HUD } from '../ui/HUD.js';
import { LevelManager, GAME_STATES } from '../logic/LevelManager.js';
import { storage } from '../logic/Storage.js';

describe('UI & Menu Interactions', () => {
  let container;
  let menu;
  let hud;
  let lm;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);

    lm = new LevelManager();
    menu = new MenuManager(container, {
      onStartGame: (lvl) => lm.loadLevel(lvl),
      onResume: () => lm.setState(GAME_STATES.PLAYING),
      onRestartLevel: () => lm.restartLevel(),
      onRetryCheckpoint: () => lm.retryFromCheckpoint(),
    });
    hud = new HUD(container);
  });

  it('renders title screen buttons and branding', () => {
    const titleScreen = container.querySelector('#screen-title');
    expect(titleScreen).not.toBeNull();
    expect(titleScreen.classList.contains('active')).toBe(true);

    const startBtn = container.querySelector('#btn-start');
    const levelSelectBtn = container.querySelector('#btn-level-select');
    const controlsBtn = container.querySelector('#btn-controls');
    const settingsBtn = container.querySelector('#btn-settings');

    expect(startBtn).not.toBeNull();
    expect(levelSelectBtn).not.toBeNull();
    expect(controlsBtn).not.toBeNull();
    expect(settingsBtn).not.toBeNull();
  });

  it('navigates to Level Select and back', () => {
    const levelSelectBtn = container.querySelector('#btn-level-select');
    levelSelectBtn.click();

    expect(menu.activeScreen).toBe('level_select');
    const screen = container.querySelector('#screen-level-select');
    expect(screen.classList.contains('active')).toBe(true);

    const backBtn = container.querySelector('#btn-level-back');
    backBtn.click();
    expect(menu.activeScreen).toBe('title');
  });

  it('navigates to Controls guide and returns', () => {
    const controlsBtn = container.querySelector('#btn-controls');
    controlsBtn.click();

    expect(menu.activeScreen).toBe('controls');
    const table = container.querySelector('.controls-table');
    expect(table).not.toBeNull();
    expect(table.textContent).toContain('Pitch Up / Down');
    expect(table.textContent).toContain('Steer Left / Right');

    const backBtn = container.querySelector('#btn-controls-back');
    backBtn.click();
    expect(menu.activeScreen).toBe('title');
  });

  it('updates audio and accessibility settings properly', () => {
    const settingsBtn = container.querySelector('#btn-settings');
    settingsBtn.click();

    expect(menu.activeScreen).toBe('settings');

    // Test reduced flash checkbox
    const flashCb = container.querySelector('#set-reduced-flash');
    flashCb.checked = true;
    flashCb.dispatchEvent(new Event('change'));
    expect(storage.getSettings().reducedFlash).toBe(true);

    // Test reduced shake checkbox
    const shakeCb = container.querySelector('#set-reduced-shake');
    shakeCb.checked = true;
    shakeCb.dispatchEvent(new Event('change'));
    expect(storage.getSettings().reducedShake).toBe(true);

    // Test invert pitch
    const pitchCb = container.querySelector('#set-invert-pitch');
    pitchCb.checked = true;
    pitchCb.dispatchEvent(new Event('change'));
    expect(storage.getSettings().invertPitch).toBe(true);

    // Test mute checkbox
    const muteCb = container.querySelector('#set-mute');
    muteCb.checked = true;
    muteCb.dispatchEvent(new Event('change'));
    expect(storage.getSettings().muted).toBe(true);
  });

  it('updates HUD display according to level and ship state', () => {
    lm.loadLevel(3);
    lm.ship.speed = 52.4;
    lm.ship.hull = 80;
    lm.ship.boostCharge = 45;

    hud.update(lm);

    const speedVal = container.querySelector('#hud-speed-val');
    const hullVal = container.querySelector('#hud-hull-text');
    const boostVal = container.querySelector('#hud-boost-text');
    const levelBadge = container.querySelector('#hud-level-badge');
    const objectiveText = container.querySelector('#hud-objective');
    const camBadge = container.querySelector('#hud-camera-badge');

    expect(speedVal.textContent).toBe('52');
    expect(hullVal.textContent).toBe('80%');
    expect(boostVal.textContent).toBe('45%');
    expect(levelBadge.textContent).toContain('LEVEL 3');
    expect(objectiveText.textContent).toContain(lm.levelConfig.objective);
    expect(camBadge.textContent).toContain('CHASE');

    // Switch camera
    lm.ship.toggleCamera();
    hud.update(lm);
    expect(camBadge.textContent).toContain('COCKPIT');
  });

  it('displays radio comms transmission with portraits', () => {
    hud.showComms('flynn', 'Corridor is clear!');
    const commsBox = container.querySelector('#hud-comms-box');
    const speaker = container.querySelector('#hud-comms-speaker');
    const msg = container.querySelector('#hud-comms-msg');

    expect(commsBox.style.display).toBe('flex');
    expect(speaker.textContent).toBe('CAPTAIN FLYNN');
    expect(msg.textContent).toBe('Corridor is clear!');

    // Show Odette comms
    hud.showComms('odette', 'Thank you Flynn!');
    expect(speaker.textContent).toBe('PRINCESS ODETTE');
    expect(msg.textContent).toBe('Thank you Flynn!');
  });
});
