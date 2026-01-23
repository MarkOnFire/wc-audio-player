/**
 * WC Audio Player - Type Definitions
 *
 * Framework-agnostic audio player with waveform visualization.
 * Originally extracted from Wonder Cabinet Ghost theme.
 */

import type WaveSurfer from 'wavesurfer.js';

// ============================================
// Configuration Types
// ============================================

/**
 * Main player configuration options
 */
export interface WCAudioPlayerOptions {
  /** Container element or CSS selector */
  container: HTMLElement | string;

  /** Audio file URL */
  audioUrl: string;

  /** Pre-generated peaks JSON URL (for CORS workaround) */
  peaksUrl?: string;

  /** Theme name or 'custom' for CSS-only theming */
  theme?: 'default' | 'minimal' | 'custom';

  /** Custom color overrides */
  colors?: Partial<PlayerColors>;

  /** Feature toggles */
  features?: Partial<PlayerFeatures>;

  /** Episode metadata for display and analytics */
  metadata?: PlayerMetadata;

  /** Callback when player is ready */
  onReady?: () => void;

  /** Callback when playback starts */
  onPlay?: () => void;

  /** Callback when playback pauses */
  onPause?: (position: number) => void;

  /** Callback when playback ends */
  onFinish?: () => void;

  /** Callback on seek */
  onSeek?: (position: number) => void;

  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Color configuration for the player
 */
export interface PlayerColors {
  /** Waveform color (unfilled portion) */
  waveColor: string;

  /** Progress color (filled portion) */
  progressColor: string;

  /** Cursor color */
  cursorColor: string;

  /** Background color/gradient */
  background: string;

  /** Text color */
  textColor: string;

  /** Button background */
  buttonBackground: string;

  /** Button icon color */
  buttonIconColor: string;
}

/**
 * Feature toggles for optional functionality
 */
export interface PlayerFeatures {
  /** Enable keyboard shortcuts */
  keyboard: boolean | KeyboardConfig;

  /** Enable analytics tracking */
  analytics: boolean | AnalyticsConfig;

  /** Enable playback speed control */
  speed: boolean | SpeedConfig;

  /** Enable skip buttons (+/- seconds) */
  skip: boolean | SkipConfig;

  /** Auto-create player UI elements */
  autoCreateUI: boolean;
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardConfig {
  /** Enable keyboard shortcuts */
  enabled: boolean;

  /** Play/pause key (default: Space, K) */
  playPause?: string[];

  /** Skip back key (default: J, ArrowLeft) */
  skipBack?: string[];

  /** Skip forward key (default: L, ArrowRight) */
  skipForward?: string[];

  /** Speed up key (default: ArrowUp) */
  speedUp?: string[];

  /** Speed down key (default: ArrowDown) */
  speedDown?: string[];

  /** Mute toggle key (default: M) */
  mute?: string[];

  /** Jump to start key (default: 0, Home) */
  jumpStart?: string[];

  /** Jump to end key (default: End) */
  jumpEnd?: string[];

  /** Show keyboard hints in UI */
  showHints?: boolean;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  /** Enable analytics */
  enabled: boolean;

  /** Custom tracker function (overrides auto-detection) */
  tracker?: AnalyticsTracker;

  /** Track episode view on load */
  trackView?: boolean;

  /** Track play events */
  trackPlay?: boolean;

  /** Track pause events (with position) */
  trackPause?: boolean;

  /** Track completion */
  trackComplete?: boolean;

  /** Track speed changes */
  trackSpeedChange?: boolean;

  /** Track skip events */
  trackSkip?: boolean;
}

/**
 * Analytics tracker function signature
 */
export type AnalyticsTracker = (
  eventName: string,
  eventData: Record<string, unknown>
) => void;

/**
 * Speed control configuration
 */
export interface SpeedConfig {
  /** Enable speed control */
  enabled: boolean;

  /** Available speed options */
  options?: number[];

  /** Default speed */
  defaultSpeed?: number;
}

/**
 * Skip button configuration
 */
export interface SkipConfig {
  /** Enable skip buttons */
  enabled: boolean;

  /** Seconds to skip (default: 15) */
  seconds?: number;
}

/**
 * Episode metadata for display and analytics
 */
export interface PlayerMetadata {
  /** Episode title */
  title?: string;

  /** Episode artwork URL */
  artwork?: string;

  /** Episode date */
  date?: string;

  /** Episode description */
  description?: string;

  /** Podcast name */
  podcastName?: string;

  /** Episode number */
  episodeNumber?: string | number;
}

// ============================================
// Internal State Types
// ============================================

/**
 * Internal player state
 */
export interface PlayerState {
  /** Is audio loaded and ready */
  isReady: boolean;

  /** Is currently playing */
  isPlaying: boolean;

  /** Is muted */
  isMuted: boolean;

  /** Current playback speed */
  currentSpeed: number;

  /** Previous volume (before mute) */
  previousVolume: number;

  /** Current time in seconds */
  currentTime: number;

  /** Total duration in seconds */
  duration: number;

  /** Has tracked view analytics */
  hasTrackedView: boolean;

  /** Has tracked first play analytics */
  hasTrackedPlay: boolean;

  /** Has tracked completion analytics */
  hasTrackedComplete: boolean;
}

// ============================================
// Plugin Types
// ============================================

/**
 * Plugin interface for extending player functionality
 */
export interface WCAudioPlayerPlugin {
  /** Plugin name */
  name: string;

  /** Initialize plugin with player instance */
  init: (player: WCAudioPlayerInstance) => void;

  /** Cleanup when player is destroyed */
  destroy?: () => void;
}

/**
 * Player instance interface (public API)
 */
export interface WCAudioPlayerInstance {
  /** Underlying Wavesurfer instance */
  wavesurfer: WaveSurfer | null;

  /** Current player state */
  state: PlayerState;

  /** Player options */
  options: WCAudioPlayerOptions;

  /** Play audio */
  play: () => void;

  /** Pause audio */
  pause: () => void;

  /** Toggle play/pause */
  playPause: () => void;

  /** Seek to position (0-1) */
  seekTo: (progress: number) => void;

  /** Seek to time in seconds */
  seekToTime: (seconds: number) => void;

  /** Skip forward by seconds */
  skipForward: (seconds?: number) => void;

  /** Skip backward by seconds */
  skipBack: (seconds?: number) => void;

  /** Set playback speed */
  setSpeed: (speed: number) => void;

  /** Cycle to next speed option */
  cycleSpeed: () => void;

  /** Set volume (0-1) */
  setVolume: (volume: number) => void;

  /** Toggle mute */
  toggleMute: () => void;

  /** Get current time in seconds */
  getCurrentTime: () => number;

  /** Get duration in seconds */
  getDuration: () => number;

  /** Destroy player and cleanup */
  destroy: () => void;

  /** Announce message to screen readers */
  announce: (message: string) => void;

  /** Register a plugin */
  use: (plugin: WCAudioPlayerPlugin) => void;
}

// ============================================
// DOM Element Types
// ============================================

/**
 * Player DOM element references
 */
export interface PlayerElements {
  container: HTMLElement;
  waveform: HTMLElement | null;
  playButton: HTMLButtonElement | null;
  timeDisplay: HTMLElement | null;
  speedButton: HTMLButtonElement | null;
  speedDisplay: HTMLElement | null;
  skipBackButton: HTMLButtonElement | null;
  skipForwardButton: HTMLButtonElement | null;
  announcer: HTMLElement | null;
}

// ============================================
// Event Types
// ============================================

/**
 * Player event names
 */
export type PlayerEventName =
  | 'ready'
  | 'play'
  | 'pause'
  | 'finish'
  | 'seek'
  | 'timeupdate'
  | 'speedchange'
  | 'volumechange'
  | 'mute'
  | 'unmute'
  | 'error'
  | 'destroy';

/**
 * Player event data
 */
export interface PlayerEventData {
  ready: { duration: number };
  play: { time: number };
  pause: { time: number };
  finish: Record<string, never>;
  seek: { time: number; progress: number };
  timeupdate: { time: number; duration: number };
  speedchange: { speed: number };
  volumechange: { volume: number };
  mute: Record<string, never>;
  unmute: { volume: number };
  error: { error: Error };
  destroy: Record<string, never>;
}

// ============================================
// Peaks Data Types
// ============================================

/**
 * Pre-generated peaks data format
 */
export interface PeaksData {
  /** Sample rate used for generation */
  sample_rate: number;

  /** Number of samples */
  length: number;

  /** Peak data array */
  data: number[];

  /** Optional metadata */
  metadata?: {
    duration?: number;
    channels?: number;
    generated_at?: string;
  };
}
