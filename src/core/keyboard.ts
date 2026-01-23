/**
 * Keyboard Shortcuts Handler
 *
 * Extracted from Wonder Cabinet episode-player.js
 * Provides keyboard controls for audio playback.
 *
 * Default shortcuts match common media player conventions:
 * - Space/K: Play/Pause
 * - J/Left Arrow: Skip back
 * - L/Right Arrow: Skip forward
 * - Up Arrow: Increase speed
 * - Down Arrow: Decrease speed
 * - M: Toggle mute
 * - 0/Home: Jump to start
 * - End: Jump to end
 */

import type { KeyboardConfig, WCAudioPlayerInstance } from '../types';

/** Default keyboard configuration */
export const DEFAULT_KEYBOARD_CONFIG: Required<KeyboardConfig> = {
  enabled: true,
  playPause: [' ', 'k', 'K'],
  skipBack: ['j', 'J', 'ArrowLeft'],
  skipForward: ['l', 'L', 'ArrowRight'],
  speedUp: ['ArrowUp'],
  speedDown: ['ArrowDown'],
  mute: ['m', 'M'],
  jumpStart: ['0', 'Home'],
  jumpEnd: ['End'],
  showHints: true,
};

/**
 * Check if an input element is focused
 *
 * Prevents keyboard shortcuts from triggering while user is typing.
 */
function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];
  return (
    inputTags.includes(activeElement.tagName) ||
    (activeElement as HTMLElement).isContentEditable
  );
}

/**
 * Normalize keyboard config from boolean or partial object
 */
export function normalizeKeyboardConfig(
  config: boolean | KeyboardConfig | undefined
): Required<KeyboardConfig> {
  if (config === false) {
    return { ...DEFAULT_KEYBOARD_CONFIG, enabled: false };
  }

  if (config === true || config === undefined) {
    return DEFAULT_KEYBOARD_CONFIG;
  }

  return {
    ...DEFAULT_KEYBOARD_CONFIG,
    ...config,
  };
}

/**
 * Set up keyboard shortcuts for the player
 *
 * @param player - The player instance
 * @param config - Keyboard configuration
 * @returns Cleanup function to remove event listeners
 */
export function setupKeyboardShortcuts(
  player: WCAudioPlayerInstance,
  config: boolean | KeyboardConfig | undefined
): () => void {
  const normalizedConfig = normalizeKeyboardConfig(config);

  if (!normalizedConfig.enabled) {
    return () => {}; // No-op cleanup
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if user is typing
    if (isInputFocused()) return;

    // Don't trigger if player isn't ready
    if (!player.wavesurfer || !player.state.isReady) return;

    const key = e.key;

    // Play/Pause
    if (normalizedConfig.playPause.includes(key)) {
      e.preventDefault();
      player.playPause();
      return;
    }

    // Skip back
    if (normalizedConfig.skipBack.includes(key)) {
      e.preventDefault();
      player.skipBack();
      return;
    }

    // Skip forward
    if (normalizedConfig.skipForward.includes(key)) {
      e.preventDefault();
      player.skipForward();
      return;
    }

    // Speed up
    if (normalizedConfig.speedUp.includes(key)) {
      e.preventDefault();
      const currentIndex = getSpeedIndex(player);
      if (currentIndex < getSpeedOptions(player).length - 1) {
        player.setSpeed(getSpeedOptions(player)[currentIndex + 1]);
      }
      return;
    }

    // Speed down
    if (normalizedConfig.speedDown.includes(key)) {
      e.preventDefault();
      const currentIndex = getSpeedIndex(player);
      if (currentIndex > 0) {
        player.setSpeed(getSpeedOptions(player)[currentIndex - 1]);
      }
      return;
    }

    // Mute toggle
    if (normalizedConfig.mute.includes(key)) {
      e.preventDefault();
      player.toggleMute();
      return;
    }

    // Jump to start
    if (normalizedConfig.jumpStart.includes(key)) {
      e.preventDefault();
      player.seekTo(0);
      player.announce('Jumped to start');
      return;
    }

    // Jump to end
    if (normalizedConfig.jumpEnd.includes(key)) {
      e.preventDefault();
      player.seekTo(0.999);
      player.pause();
      player.announce('Jumped to end');
      return;
    }
  };

  // Add event listener
  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get current speed index in the options array
 */
function getSpeedIndex(player: WCAudioPlayerInstance): number {
  const options = getSpeedOptions(player);
  const current = player.state.currentSpeed;
  const index = options.indexOf(current);
  return index >= 0 ? index : options.indexOf(1); // Default to 1x if not found
}

/**
 * Get speed options from player config
 */
function getSpeedOptions(player: WCAudioPlayerInstance): number[] {
  const speedConfig = player.options.features?.speed;

  if (typeof speedConfig === 'object' && speedConfig.options) {
    return speedConfig.options;
  }

  return [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
}

/**
 * Create keyboard hints UI element
 *
 * @param config - Keyboard configuration
 * @returns HTML element with keyboard hints, or null if disabled
 */
export function createKeyboardHints(
  config: Required<KeyboardConfig>
): HTMLElement | null {
  if (!config.enabled || !config.showHints) {
    return null;
  }

  // Don't show on mobile
  if (window.innerWidth <= 767) {
    return null;
  }

  const hints = document.createElement('div');
  hints.className = 'wc-player-keyboard-hints';
  hints.setAttribute('aria-hidden', 'true');

  hints.innerHTML = `
    <span class="wc-player-hint"><kbd>Space</kbd> Play/Pause</span>
    <span class="wc-player-hint"><kbd>J</kbd>/<kbd>L</kbd> Skip</span>
    <span class="wc-player-hint"><kbd>M</kbd> Mute</span>
  `;

  return hints;
}

/**
 * Check if we're on mobile (for hiding keyboard hints)
 */
export function isMobile(): boolean {
  return window.innerWidth <= 767;
}
