/**
 * WC Audio Player
 *
 * A framework-agnostic audio player with waveform visualization,
 * built on Wavesurfer.js.
 *
 * Originally extracted from the Wonder Cabinet Ghost theme's episode player.
 *
 * @packageDocumentation
 */

// Core player
export {
  createPlayer,
  autoInit,
  findAudioUrl,
  DEFAULT_COLORS,
  DEFAULT_FEATURES,
} from './core/player';

// Utilities
export {
  formatTime,
  parseTime,
  formatTimeDisplay,
  calculateProgress,
  calculateRemaining,
} from './core/time';

// Accessibility
export {
  announceToScreenReader,
  getAnnouncer,
  updatePlayButtonAria,
  updateAriaLabel,
  prefersReducedMotion,
} from './core/accessibility';

// Keyboard
export {
  setupKeyboardShortcuts,
  normalizeKeyboardConfig,
  createKeyboardHints,
  isMobile,
  DEFAULT_KEYBOARD_CONFIG,
} from './core/keyboard';

// Controls (for custom UI building)
export {
  createPlayButton,
  createSpeedButton,
  createSkipButtons,
  createTimeDisplay,
  createWaveformContainer,
  createControlsContainer,
  queryPlayerElements,
  ICONS,
  DEFAULT_SPEED_OPTIONS,
  DEFAULT_SKIP_SECONDS,
} from './core/controls';

// Plugins
export { analyticsPlugin } from './plugins/analytics';
export { transcriptPlugin } from './plugins/transcript';

// Types
export type {
  WCAudioPlayerOptions,
  WCAudioPlayerInstance,
  WCAudioPlayerPlugin,
  PlayerState,
  PlayerColors,
  PlayerFeatures,
  PlayerMetadata,
  PlayerElements,
  KeyboardConfig,
  AnalyticsConfig,
  AnalyticsTracker,
  SpeedConfig,
  SkipConfig,
  PeaksData,
  PlayerEventName,
  PlayerEventData,
} from './types';

export type { TranscriptPluginConfig } from './plugins/transcript';

// Import CSS for bundlers that support it
import './themes/default.css';

/**
 * WCAudioPlayer class - convenience wrapper around createPlayer
 *
 * Provides a class-based API for those who prefer it over the
 * functional createPlayer() approach.
 *
 * @example
 * ```typescript
 * import { WCAudioPlayer, analyticsPlugin } from '@wondercabinet/audio-player';
 * import '@wondercabinet/audio-player/themes/default.css';
 *
 * const player = new WCAudioPlayer({
 *   container: '#player',
 *   audioUrl: 'https://example.com/episode.mp3',
 *   features: {
 *     keyboard: true,
 *     speed: true,
 *   },
 * });
 *
 * player.use(analyticsPlugin());
 * ```
 */
import { createPlayer } from './core/player';
import type { WCAudioPlayerOptions, WCAudioPlayerInstance } from './types';

export class WCAudioPlayer {
  private instance: WCAudioPlayerInstance;

  constructor(options: WCAudioPlayerOptions) {
    this.instance = createPlayer(options);
  }

  /** Play audio */
  play(): void {
    this.instance.play();
  }

  /** Pause audio */
  pause(): void {
    this.instance.pause();
  }

  /** Toggle play/pause */
  playPause(): void {
    this.instance.playPause();
  }

  /** Seek to position (0-1) */
  seekTo(progress: number): void {
    this.instance.seekTo(progress);
  }

  /** Seek to time in seconds */
  seekToTime(seconds: number): void {
    this.instance.seekToTime(seconds);
  }

  /** Skip forward by seconds */
  skipForward(seconds?: number): void {
    this.instance.skipForward(seconds);
  }

  /** Skip backward by seconds */
  skipBack(seconds?: number): void {
    this.instance.skipBack(seconds);
  }

  /** Set playback speed */
  setSpeed(speed: number): void {
    this.instance.setSpeed(speed);
  }

  /** Cycle to next speed option */
  cycleSpeed(): void {
    this.instance.cycleSpeed();
  }

  /** Set volume (0-1) */
  setVolume(volume: number): void {
    this.instance.setVolume(volume);
  }

  /** Toggle mute */
  toggleMute(): void {
    this.instance.toggleMute();
  }

  /** Get current time in seconds */
  getCurrentTime(): number {
    return this.instance.getCurrentTime();
  }

  /** Get duration in seconds */
  getDuration(): number {
    return this.instance.getDuration();
  }

  /** Destroy player and cleanup */
  destroy(): void {
    this.instance.destroy();
  }

  /** Announce message to screen readers */
  announce(message: string): void {
    this.instance.announce(message);
  }

  /** Register a plugin */
  use(plugin: import('./types').WCAudioPlayerPlugin): this {
    this.instance.use(plugin);
    return this;
  }

  /** Get the underlying player instance */
  get player(): WCAudioPlayerInstance {
    return this.instance;
  }

  /** Get the underlying Wavesurfer instance */
  get wavesurfer() {
    return this.instance.wavesurfer;
  }

  /** Get current player state */
  get state() {
    return this.instance.state;
  }

  /**
   * Auto-initialize all players on the page
   *
   * Finds all elements with [data-audio-url] and creates players.
   */
  static init(): WCAudioPlayerInstance[] {
    // Use the already imported autoInit
    return autoInit();
  }
}

// Re-import autoInit for the static method
import { autoInit } from './core/player';
