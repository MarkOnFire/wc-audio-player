/**
 * Analytics Plugin
 *
 * Extracted from Wonder Cabinet episode-player.js
 * Provides privacy-friendly analytics tracking for audio playback.
 *
 * Supports:
 * - Plausible Analytics
 * - Simple Analytics
 * - Google Analytics 4
 * - Custom tracker function
 */

import type {
  WCAudioPlayerPlugin,
  WCAudioPlayerInstance,
  AnalyticsConfig,
  AnalyticsTracker,
} from '../types';

/** Default analytics configuration */
const DEFAULT_ANALYTICS_CONFIG: Required<AnalyticsConfig> = {
  enabled: true,
  tracker: undefined as unknown as AnalyticsTracker,
  trackView: true,
  trackPlay: true,
  trackPause: true,
  trackComplete: true,
  trackSpeedChange: true,
  trackSkip: true,
};

/**
 * Normalize analytics config from boolean or partial object
 */
function normalizeAnalyticsConfig(
  config: boolean | AnalyticsConfig | undefined
): Required<AnalyticsConfig> {
  if (config === false) {
    return { ...DEFAULT_ANALYTICS_CONFIG, enabled: false };
  }

  if (config === true || config === undefined) {
    return DEFAULT_ANALYTICS_CONFIG;
  }

  return {
    ...DEFAULT_ANALYTICS_CONFIG,
    ...config,
    enabled: config.enabled !== false,
  };
}

/**
 * Auto-detect and return analytics tracker
 *
 * Checks for common analytics platforms in order of preference:
 * 1. Plausible (privacy-first)
 * 2. Simple Analytics (privacy-first)
 * 3. Google Analytics 4
 */
function detectTracker(): AnalyticsTracker | null {
  // Plausible Analytics
  if (typeof (window as any).plausible !== 'undefined') {
    return (eventName, eventData) => {
      (window as any).plausible(eventName, { props: eventData });
    };
  }

  // Simple Analytics
  if (typeof (window as any).sa_event !== 'undefined') {
    return (eventName, eventData) => {
      (window as any).sa_event(eventName, eventData);
    };
  }

  // Google Analytics 4
  if (typeof (window as any).gtag !== 'undefined') {
    return (eventName, eventData) => {
      (window as any).gtag('event', eventName, eventData);
    };
  }

  return null;
}

/**
 * Development logger (only logs on localhost)
 */
function devLog(eventName: string, eventData: Record<string, unknown>): void {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    console.debug('[WCAudioPlayer Analytics]', eventName, eventData);
  }
}

/**
 * Get episode title from player metadata or DOM
 */
function getEpisodeTitle(player: WCAudioPlayerInstance): string {
  // Try metadata first
  if (player.options.metadata?.title) {
    return player.options.metadata.title;
  }

  // Try common DOM selectors
  const titleEl = document.querySelector(
    '.wc-episode-hero-title, .wc-player-title, h1'
  );
  if (titleEl?.textContent) {
    return titleEl.textContent.trim();
  }

  // Fallback to document title
  return document.title;
}

/**
 * Create the analytics plugin
 *
 * @param config - Analytics configuration (optional)
 * @returns Plugin instance
 *
 * @example
 * import { WCAudioPlayer, analyticsPlugin } from '@wondercabinet/audio-player';
 *
 * const player = new WCAudioPlayer({
 *   container: '#player',
 *   audioUrl: '/audio.mp3',
 * });
 *
 * // Use with auto-detection
 * player.use(analyticsPlugin());
 *
 * // Use with custom tracker
 * player.use(analyticsPlugin({
 *   tracker: (event, data) => myAnalytics.track(event, data),
 * }));
 */
export function analyticsPlugin(
  config?: boolean | AnalyticsConfig
): WCAudioPlayerPlugin {
  const normalizedConfig = normalizeAnalyticsConfig(config);

  // Tracking state (scoped to this plugin instance)
  let hasTrackedView = false;
  let hasTrackedPlay = false;
  let hasTrackedComplete = false;

  // Event handler references for cleanup
  let onPlay: (() => void) | null = null;
  let onPause: (() => void) | null = null;
  let onFinish: (() => void) | null = null;

  // The active tracker function
  let tracker: AnalyticsTracker | null = null;

  return {
    name: 'analytics',

    init(player: WCAudioPlayerInstance) {
      if (!normalizedConfig.enabled) return;

      // Determine tracker
      tracker = normalizedConfig.tracker || detectTracker();

      // Track function with fallback to dev logger
      const track = (eventName: string, eventData: Record<string, unknown>) => {
        if (tracker) {
          tracker(eventName, eventData);
        } else {
          devLog(eventName, eventData);
        }
      };

      // Track page view (once per page load)
      if (normalizedConfig.trackView && !hasTrackedView) {
        hasTrackedView = true;
        track('episode_view', {
          title: getEpisodeTitle(player),
          url: window.location.pathname,
        });
      }

      // Track play events
      if (normalizedConfig.trackPlay && player.wavesurfer) {
        onPlay = () => {
          if (!hasTrackedPlay) {
            hasTrackedPlay = true;
            track('play', {
              episode: getEpisodeTitle(player),
            });
          }
        };
        player.wavesurfer.on('play', onPlay);
      }

      // Track pause events
      if (normalizedConfig.trackPause && player.wavesurfer) {
        onPause = () => {
          track('pause', {
            episode: getEpisodeTitle(player),
            position: Math.round(player.getCurrentTime()),
          });
        };
        player.wavesurfer.on('pause', onPause);
      }

      // Track completion
      if (normalizedConfig.trackComplete && player.wavesurfer) {
        onFinish = () => {
          if (!hasTrackedComplete) {
            hasTrackedComplete = true;
            track('complete', {
              episode: getEpisodeTitle(player),
            });
          }
        };
        player.wavesurfer.on('finish', onFinish);
      }

      // Extend player with tracking methods for speed/skip
      if (normalizedConfig.trackSpeedChange) {
        const originalSetSpeed = player.setSpeed.bind(player);
        player.setSpeed = (speed: number) => {
          originalSetSpeed(speed);
          track('speed_change', { speed });
        };
      }

      if (normalizedConfig.trackSkip) {
        const originalSkipForward = player.skipForward.bind(player);
        const originalSkipBack = player.skipBack.bind(player);

        player.skipForward = (seconds?: number) => {
          originalSkipForward(seconds);
          track('skip_forward', { seconds: seconds || 15 });
        };

        player.skipBack = (seconds?: number) => {
          originalSkipBack(seconds);
          track('skip_back', { seconds: seconds || 15 });
        };
      }
    },

    destroy() {
      // Remove event listeners
      // Note: Wavesurfer doesn't provide an off() method in the same way,
      // but the player's destroy() will clean up the wavesurfer instance
      onPlay = null;
      onPause = null;
      onFinish = null;
      tracker = null;
    },
  };
}

export default analyticsPlugin;
