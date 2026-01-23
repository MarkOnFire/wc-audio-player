/**
 * Core Player Logic
 *
 * Extracted from Wonder Cabinet episode-player.js
 * Wraps Wavesurfer.js with additional features and accessibility.
 */

import WaveSurfer from 'wavesurfer.js';
import type {
  WCAudioPlayerOptions,
  PlayerState,
  PlayerColors,
  PlayerFeatures,
  PeaksData,
  WCAudioPlayerInstance,
  WCAudioPlayerPlugin,
} from '../types';
import { announceToScreenReader, cleanupAnnouncer } from './accessibility';
import {
  normalizeSpeedConfig,
  normalizeSkipConfig,
  queryPlayerElements,
  bindPlayButton,
  bindSpeedButton,
  bindSkipButtons,
  bindTimeDisplay,
} from './controls';
import { setupKeyboardShortcuts, isMobile } from './keyboard';

/** Default player colors */
export const DEFAULT_COLORS: PlayerColors = {
  waveColor: 'rgba(0, 0, 38, 0.25)',
  progressColor: '#FFFAEB',
  cursorColor: '#000026',
  background: 'linear-gradient(135deg, #0d8a38 0%, #10A544 100%)',
  textColor: '#FFFAEB',
  buttonBackground: '#FFFAEB',
  buttonIconColor: '#10A544',
};

/** Default features */
export const DEFAULT_FEATURES: PlayerFeatures = {
  keyboard: true,
  analytics: false,
  speed: true,
  skip: true,
  autoCreateUI: false,
};

/**
 * Create initial player state
 */
function createInitialState(): PlayerState {
  return {
    isReady: false,
    isPlaying: false,
    isMuted: false,
    currentSpeed: 1,
    previousVolume: 1,
    currentTime: 0,
    duration: 0,
    hasTrackedView: false,
    hasTrackedPlay: false,
    hasTrackedComplete: false,
  };
}

/**
 * Resolve container from selector or element
 */
function resolveContainer(
  container: HTMLElement | string
): HTMLElement | null {
  if (typeof container === 'string') {
    return document.querySelector(container);
  }
  return container;
}

/**
 * Load peaks data from URL
 */
async function loadPeaks(peaksUrl: string): Promise<PeaksData | null> {
  try {
    const response = await fetch(peaksUrl);
    if (!response.ok) {
      throw new Error(`Failed to load peaks: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to load peaks data:', error);
    return null;
  }
}

/**
 * Create a new WC Audio Player instance
 *
 * This is the main factory function that creates and initializes the player.
 */
export function createPlayer(
  options: WCAudioPlayerOptions
): WCAudioPlayerInstance {
  const resolvedContainer = resolveContainer(options.container);

  if (!resolvedContainer) {
    throw new Error('WCAudioPlayer: Container element not found');
  }

  // Now TypeScript knows container is non-null
  const container: HTMLElement = resolvedContainer;

  // Initialize state
  const state = createInitialState();

  // Merge options with defaults
  const colors = { ...DEFAULT_COLORS, ...options.colors };
  const features = { ...DEFAULT_FEATURES, ...options.features };

  // Normalize feature configs
  const speedConfig = normalizeSpeedConfig(features.speed);
  const skipConfig = normalizeSkipConfig(features.skip);

  // Set initial speed
  state.currentSpeed = speedConfig.defaultSpeed;

  // Plugins registry
  const plugins: WCAudioPlayerPlugin[] = [];

  // Cleanup functions
  const cleanupFns: (() => void)[] = [];

  // Wavesurfer instance (initialized later)
  let wavesurfer: WaveSurfer | null = null;

  // Player instance (created early for reference)
  const player: WCAudioPlayerInstance = {
    get wavesurfer() {
      return wavesurfer;
    },
    state,
    options,

    play() {
      wavesurfer?.play();
    },

    pause() {
      wavesurfer?.pause();
    },

    playPause() {
      wavesurfer?.playPause();
    },

    seekTo(progress: number) {
      wavesurfer?.seekTo(Math.max(0, Math.min(1, progress)));
    },

    seekToTime(seconds: number) {
      const duration = wavesurfer?.getDuration() || 0;
      if (duration > 0) {
        this.seekTo(seconds / duration);
      }
    },

    skipForward(seconds?: number) {
      const skipAmount = seconds ?? skipConfig.seconds;
      const current = wavesurfer?.getCurrentTime() || 0;
      const duration = wavesurfer?.getDuration() || 0;
      const newTime = Math.min(duration, current + skipAmount);
      if (duration > 0) {
        this.seekTo(newTime / duration);
      }
    },

    skipBack(seconds?: number) {
      const skipAmount = seconds ?? skipConfig.seconds;
      const current = wavesurfer?.getCurrentTime() || 0;
      const duration = wavesurfer?.getDuration() || 0;
      const newTime = Math.max(0, current - skipAmount);
      if (duration > 0) {
        this.seekTo(newTime / duration);
      }
    },

    setSpeed(speed: number) {
      state.currentSpeed = speed;
      wavesurfer?.setPlaybackRate(speed);
    },

    cycleSpeed() {
      const options = speedConfig.options;
      const currentIndex = options.indexOf(state.currentSpeed);
      const nextIndex = (currentIndex + 1) % options.length;
      this.setSpeed(options[nextIndex]);
    },

    setVolume(volume: number) {
      const clamped = Math.max(0, Math.min(1, volume));
      wavesurfer?.setVolume(clamped);
      if (clamped > 0) {
        state.previousVolume = clamped;
        state.isMuted = false;
      }
    },

    toggleMute() {
      if (state.isMuted) {
        wavesurfer?.setVolume(state.previousVolume);
        state.isMuted = false;
        announceToScreenReader('Unmuted');
      } else {
        state.previousVolume = wavesurfer?.getVolume() || 1;
        wavesurfer?.setVolume(0);
        state.isMuted = true;
        announceToScreenReader('Muted');
      }
    },

    getCurrentTime() {
      return wavesurfer?.getCurrentTime() || 0;
    },

    getDuration() {
      return wavesurfer?.getDuration() || 0;
    },

    destroy() {
      // Run cleanup functions
      cleanupFns.forEach((fn) => fn());

      // Destroy plugins
      plugins.forEach((plugin) => plugin.destroy?.());

      // Destroy wavesurfer
      wavesurfer?.destroy();
      wavesurfer = null;

      // Cleanup announcer if no other players
      cleanupAnnouncer();

      // Remove container class
      container.classList.remove('wc-audio-player--initialized');

      // Call destroy callback
      options.onError?.(new Error('Player destroyed'));
    },

    announce(message: string) {
      announceToScreenReader(message);
    },

    use(plugin: WCAudioPlayerPlugin) {
      plugins.push(plugin);
      plugin.init(player);
    },
  };

  // Initialize the player
  initializePlayer();

  async function initializePlayer() {
    // Query existing elements
    const elements = queryPlayerElements(container);

    // Find or create waveform container
    let waveformContainer = elements.waveform;
    if (!waveformContainer) {
      waveformContainer = document.createElement('div');
      waveformContainer.className = 'wc-player-waveform';
      waveformContainer.id = 'waveform';
      container.appendChild(waveformContainer);
    }

    // Wavesurfer configuration
    const wsConfig: Parameters<typeof WaveSurfer.create>[0] = {
      container: waveformContainer,
      waveColor: colors.waveColor,
      progressColor: colors.progressColor,
      cursorColor: colors.cursorColor,
      cursorWidth: 2,
      barWidth: 4,
      barGap: 2,
      barRadius: 3,
      height: isMobile() ? 48 : 64,
      normalize: true,
    };

    // Load peaks if provided (CORS workaround)
    if (options.peaksUrl) {
      const peaksData = await loadPeaks(options.peaksUrl);

      if (peaksData) {
        wavesurfer = WaveSurfer.create({
          ...wsConfig,
          peaks: [peaksData.data],
          duration: peaksData.length / peaksData.sample_rate,
          url: options.audioUrl,
        });
      } else {
        // Fallback to direct audio loading
        wavesurfer = WaveSurfer.create({
          ...wsConfig,
          url: options.audioUrl,
        });
      }
    } else {
      // No peaks, load audio directly
      wavesurfer = WaveSurfer.create({
        ...wsConfig,
        url: options.audioUrl,
      });
    }

    // Set up event handlers
    setupWavesurferEvents(wavesurfer, state, options);

    // Bind existing UI elements
    bindExistingElements(elements, player, speedConfig, skipConfig);

    // Set up keyboard shortcuts
    if (features.keyboard) {
      const cleanup = setupKeyboardShortcuts(player, features.keyboard);
      cleanupFns.push(cleanup);
    }

    // Mark container as initialized
    container.classList.add('wc-audio-player--initialized');
  }

  return player;
}

/**
 * Set up Wavesurfer event handlers
 */
function setupWavesurferEvents(
  ws: WaveSurfer,
  state: PlayerState,
  options: WCAudioPlayerOptions
): void {
  ws.on('ready', () => {
    state.isReady = true;
    state.duration = ws.getDuration();
    options.onReady?.();
  });

  ws.on('play', () => {
    state.isPlaying = true;
    options.onPlay?.();
  });

  ws.on('pause', () => {
    state.isPlaying = false;
    state.currentTime = ws.getCurrentTime();
    options.onPause?.(state.currentTime);
  });

  ws.on('finish', () => {
    state.isPlaying = false;
    options.onFinish?.();
  });

  ws.on('seeking', () => {
    state.currentTime = ws.getCurrentTime();
    options.onSeek?.(state.currentTime);
  });

  ws.on('audioprocess', () => {
    state.currentTime = ws.getCurrentTime();
  });

  ws.on('error', (error) => {
    console.error('WCAudioPlayer error:', error);
    options.onError?.(new Error(String(error)));
  });
}

/**
 * Bind existing DOM elements to the player
 */
function bindExistingElements(
  elements: ReturnType<typeof queryPlayerElements>,
  player: WCAudioPlayerInstance,
  speedConfig: ReturnType<typeof normalizeSpeedConfig>,
  skipConfig: ReturnType<typeof normalizeSkipConfig>
): void {
  // Bind play button
  if (elements.playButton) {
    bindPlayButton(elements.playButton, player);
  }

  // Bind time display
  if (elements.timeDisplay) {
    bindTimeDisplay(elements.timeDisplay, player);
  }

  // Bind speed button
  if (elements.speedButton && speedConfig.enabled) {
    bindSpeedButton(elements.speedButton, player, speedConfig);
  }

  // Bind skip buttons
  if (
    elements.skipBackButton &&
    elements.skipForwardButton &&
    skipConfig.enabled
  ) {
    bindSkipButtons(
      elements.skipBackButton,
      elements.skipForwardButton,
      player,
      skipConfig.seconds
    );
  }
}

/**
 * Find audio URL from page content (Ghost-specific patterns)
 *
 * This function searches for audio URLs in common locations:
 * - data-audio-url attributes
 * - Ghost audio cards (.kg-audio-card)
 * - Standard HTML5 audio elements
 *
 * @param container - Container to search within, or document
 * @returns Audio URL or null
 */
export function findAudioUrl(container?: HTMLElement | Document): string | null {
  const searchRoot = container || document;

  // Check for data-audio-url attribute
  const dataAudioEl = searchRoot.querySelector<HTMLElement>('[data-audio-url]');
  if (dataAudioEl?.dataset.audioUrl) {
    return dataAudioEl.dataset.audioUrl;
  }

  // Check for Ghost audio card
  const audioCard = searchRoot.querySelector<HTMLAudioElement>(
    '.kg-audio-card audio source, .kg-audio-card audio'
  );
  if (audioCard) {
    return audioCard.src || audioCard.querySelector('source')?.src || null;
  }

  // Check for standard HTML5 audio element
  const audioEl = searchRoot.querySelector<HTMLAudioElement>(
    'audio[src], audio source'
  );
  if (audioEl) {
    return audioEl.src || audioEl.querySelector('source')?.src || null;
  }

  return null;
}

/**
 * Auto-initialize all players on the page
 *
 * Finds all elements with [data-audio-url] and initializes players.
 *
 * @returns Array of player instances
 */
export function autoInit(): WCAudioPlayerInstance[] {
  const players: WCAudioPlayerInstance[] = [];
  const elements = document.querySelectorAll<HTMLElement>('[data-audio-url]');

  elements.forEach((el) => {
    const audioUrl = el.dataset.audioUrl;
    if (!audioUrl) return;

    try {
      const player = createPlayer({
        container: el,
        audioUrl,
        peaksUrl: el.dataset.peaksUrl,
        metadata: {
          title: el.dataset.title || el.dataset.episodeTitle,
          artwork: el.dataset.artwork || el.dataset.episodeArtwork,
        },
      });
      players.push(player);
    } catch (error) {
      console.error('Failed to initialize player:', error);
    }
  });

  return players;
}
