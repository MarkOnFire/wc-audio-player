/**
 * Core Module Exports
 *
 * Re-exports all core functionality for internal use.
 */

export { createPlayer, autoInit, findAudioUrl, DEFAULT_COLORS, DEFAULT_FEATURES } from './player';
export { formatTime, parseTime, formatTimeDisplay, calculateProgress, calculateRemaining } from './time';
export { announceToScreenReader, getAnnouncer, updatePlayButtonAria, updateAriaLabel, prefersReducedMotion, cleanupAnnouncer } from './accessibility';
export { setupKeyboardShortcuts, normalizeKeyboardConfig, createKeyboardHints, isMobile, DEFAULT_KEYBOARD_CONFIG } from './keyboard';
export {
  createPlayButton,
  createSpeedButton,
  createSkipButtons,
  createTimeDisplay,
  createWaveformContainer,
  createControlsContainer,
  bindPlayButton,
  bindSpeedButton,
  bindSkipButtons,
  bindTimeDisplay,
  queryPlayerElements,
  normalizeSpeedConfig,
  normalizeSkipConfig,
  ICONS,
  DEFAULT_SPEED_OPTIONS,
  DEFAULT_SKIP_SECONDS,
} from './controls';
