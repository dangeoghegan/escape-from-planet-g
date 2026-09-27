import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../logic/Storage.js';

// Mock localStorage for test
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe('Level Unlocks & LocalStorage Persistence', () => {
  let mockStorage;
  let storageManager;

  beforeEach(() => {
    mockStorage = new MockStorage();
    storageManager = new StorageManager(mockStorage);
  });

  it('starts with only level 1 unlocked', () => {
    expect(storageManager.getUnlockedLevel()).toBe(1);
  });

  it('progresses level unlocks in sequential order', () => {
    storageManager.unlockLevel(2);
    expect(storageManager.getUnlockedLevel()).toBe(2);

    storageManager.unlockLevel(3);
    expect(storageManager.getUnlockedLevel()).toBe(3);

    storageManager.unlockLevel(4);
    expect(storageManager.getUnlockedLevel()).toBe(4);

    storageManager.unlockLevel(5);
    expect(storageManager.getUnlockedLevel()).toBe(5);
  });

  it('does not allow unlocking levels higher than 5 or lower than current', () => {
    storageManager.unlockLevel(2);
    storageManager.unlockLevel(10); // Out of bounds
    expect(storageManager.getUnlockedLevel()).toBe(2);

    storageManager.unlockLevel(1); // Regressing
    expect(storageManager.getUnlockedLevel()).toBe(2);
  });

  it('persists unlocked level across storage reload', () => {
    storageManager.unlockLevel(3);
    expect(storageManager.getUnlockedLevel()).toBe(3);

    // Create a new manager with the same underlying mock storage
    const reloadedManager = new StorageManager(mockStorage);
    expect(reloadedManager.getUnlockedLevel()).toBe(3);
  });

  it('resets saved progress properly', () => {
    storageManager.unlockLevel(4);
    expect(storageManager.getUnlockedLevel()).toBe(4);

    storageManager.resetProgress();
    expect(storageManager.getUnlockedLevel()).toBe(1);

    const reloaded = new StorageManager(mockStorage);
    expect(reloaded.getUnlockedLevel()).toBe(1);
  });
});
