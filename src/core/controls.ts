/**
 * Player Controls Factory
 *
 * Extracted from Wonder Cabinet episode-player.js
 * Creates and manages player control elements (play/pause, skip, speed).
 */

import type {
  PlayerElements,
  SpeedConfig,
  SkipConfig,
  WCAudioPlayerInstance,
} from '../types';
import { formatTimeDisplay } from './time';
import { announceToScreenReader, updatePlayButtonAria } from './accessibility';

/** Default speed options */
export const DEFAULT_SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** Default skip duration in seconds */
export const DEFAULT_SKIP_SECONDS = 15;

/**
 * SVG icons for player controls
 */
export const ICONS = {
  play: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z"/>
  </svg>`,

  pause: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>`,

  skipBack: (seconds: number) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
    <text x="12" y="14" font-size="6" text-anchor="middle" fill="currentColor" stroke="none">${seconds}</text>
  </svg>`,

  skipForward: (seconds: number) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
    <text x="12" y="14" font-size="6" text-anchor="middle" fill="currentColor" stroke="none">${seconds}</text>
  </svg>`,
};

/**
 * Normalize speed config from boolean or partial object
 */
export function normalizeSpeedConfig(
  config: boolean | SpeedConfig | undefined
): Required<SpeedConfig> {
  if (config === false) {
    return { enabled: false, options: DEFAULT_SPEED_OPTIONS, defaultSpeed: 1 };
  }

  if (config === true || config === undefined) {
    return { enabled: true, options: DEFAULT_SPEED_OPTIONS, defaultSpeed: 1 };
  }

  return {
    enabled: config.enabled !== false,
    options: config.options || DEFAULT_SPEED_OPTIONS,
    defaultSpeed: config.defaultSpeed || 1,
  };
}

/**
 * Normalize skip config from boolean or partial object
 */
export function normalizeSkipConfig(
  config: boolean | SkipConfig | undefined
): Required<SkipConfig> {
  if (config === false) {
    return { enabled: false, seconds: DEFAULT_SKIP_SECONDS };
  }

  if (config === true || config === undefined) {
    return { enabled: true, seconds: DEFAULT_SKIP_SECONDS };
  }

  return {
    enabled: config.enabled !== false,
    seconds: config.seconds || DEFAULT_SKIP_SECONDS,
  };
}

/**
 * Create the play/pause button element
 */
export function createPlayButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'wc-player-play-btn';
  button.setAttribute('aria-label', 'Play');
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `
    <span class="wc-player-icon-play">${ICONS.play}</span>
    <span class="wc-player-icon-pause" style="display:none">${ICONS.pause}</span>
  `;
  return button;
}

/**
 * Create the speed control button element
 */
export function createSpeedButton(currentSpeed: number): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'wc-player-speed-btn';
  button.setAttribute('aria-label', `Playback speed: ${currentSpeed}x`);
  button.innerHTML = `<span class="wc-player-speed-display">${currentSpeed}x</span>`;
  return button;
}

/**
 * Create skip buttons (back and forward)
 */
export function createSkipButtons(seconds: number): {
  back: HTMLButtonElement;
  forward: HTMLButtonElement;
} {
  const backButton = document.createElement('button');
  backButton.className = 'wc-player-skip-btn wc-player-skip-back';
  backButton.setAttribute('aria-label', `Skip back ${seconds} seconds`);
  backButton.innerHTML = ICONS.skipBack(seconds);

  const forwardButton = document.createElement('button');
  forwardButton.className = 'wc-player-skip-btn wc-player-skip-forward';
  forwardButton.setAttribute('aria-label', `Skip forward ${seconds} seconds`);
  forwardButton.innerHTML = ICONS.skipForward(seconds);

  return { back: backButton, forward: forwardButton };
}

/**
 * Create time display element
 */
export function createTimeDisplay(): HTMLElement {
  const display = document.createElement('div');
  display.className = 'wc-player-time';
  display.textContent = '0:00 / 0:00';
  display.setAttribute('aria-label', 'Audio time');
  display.setAttribute('role', 'timer');
  return display;
}

/**
 * Create waveform container element
 */
export function createWaveformContainer(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'wc-player-waveform';
  container.setAttribute('role', 'slider');
  container.setAttribute('aria-label', 'Audio progress');
  container.setAttribute('aria-valuemin', '0');
  container.setAttribute('aria-valuemax', '100');
  container.setAttribute('aria-valuenow', '0');
  container.tabIndex = 0;
  return container;
}

/**
 * Create the full controls container with all elements
 */
export function createControlsContainer(
  speedConfig: Required<SpeedConfig>,
  skipConfig: Required<SkipConfig>
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'wc-player-controls';

  // Play button
  const playBtn = createPlayButton();
  container.appendChild(playBtn);

  // Skip buttons (if enabled)
  if (skipConfig.enabled) {
    const skipContainer = document.createElement('div');
    skipContainer.className = 'wc-player-skip';
    const { back, forward } = createSkipButtons(skipConfig.seconds);
    skipContainer.appendChild(back);
    skipContainer.appendChild(forward);
    container.appendChild(skipContainer);
  }

  // Time display
  const timeDisplay = createTimeDisplay();
  container.appendChild(timeDisplay);

  // Speed control (if enabled)
  if (speedConfig.enabled) {
    const speedContainer = document.createElement('div');
    speedContainer.className = 'wc-player-speed';
    const speedBtn = createSpeedButton(speedConfig.defaultSpeed);
    speedContainer.appendChild(speedBtn);
    container.appendChild(speedContainer);
  }

  return container;
}

/**
 * Bind play/pause button to player
 */
export function bindPlayButton(
  button: HTMLButtonElement,
  player: WCAudioPlayerInstance
): void {
  const playIcon = button.querySelector('.wc-player-icon-play') as HTMLElement;
  const pauseIcon = button.querySelector(
    '.wc-player-icon-pause'
  ) as HTMLElement;

  button.addEventListener('click', () => {
    player.playPause();
  });

  // Update visual state on play
  const onPlay = () => {
    button.classList.add('is-playing');
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    updatePlayButtonAria(button, true, 'Play episode', 'Pause episode');
  };

  // Update visual state on pause
  const onPause = () => {
    button.classList.remove('is-playing');
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    updatePlayButtonAria(button, false, 'Play episode', 'Pause episode');
  };

  if (player.wavesurfer) {
    player.wavesurfer.on('play', onPlay);
    player.wavesurfer.on('pause', onPause);
  }
}

/**
 * Bind speed button to player
 */
export function bindSpeedButton(
  button: HTMLButtonElement,
  player: WCAudioPlayerInstance,
  speedConfig: Required<SpeedConfig>
): void {
  const display = button.querySelector('.wc-player-speed-display');

  button.addEventListener('click', () => {
    const currentIndex = speedConfig.options.indexOf(player.state.currentSpeed);
    const nextIndex = (currentIndex + 1) % speedConfig.options.length;
    const newSpeed = speedConfig.options[nextIndex];

    player.setSpeed(newSpeed);

    // Update display
    if (display) {
      display.textContent = `${newSpeed}x`;
    }
    button.setAttribute('aria-label', `Playback speed: ${newSpeed}x`);

    // Announce to screen readers
    announceToScreenReader(`Playback speed: ${newSpeed}x`);
  });
}

/**
 * Bind skip buttons to player
 */
export function bindSkipButtons(
  backButton: HTMLButtonElement,
  forwardButton: HTMLButtonElement,
  player: WCAudioPlayerInstance,
  skipSeconds: number
): void {
  backButton.addEventListener('click', () => {
    player.skipBack(skipSeconds);
    announceToScreenReader(`Skipped back ${skipSeconds} seconds`);
  });

  forwardButton.addEventListener('click', () => {
    player.skipForward(skipSeconds);
    announceToScreenReader(`Skipped forward ${skipSeconds} seconds`);
  });
}

/**
 * Bind time display to player
 */
export function bindTimeDisplay(
  display: HTMLElement,
  player: WCAudioPlayerInstance
): void {
  if (!player.wavesurfer) return;

  // Update on time change
  player.wavesurfer.on('audioprocess', () => {
    const current = player.getCurrentTime();
    const duration = player.getDuration();
    display.textContent = formatTimeDisplay(current, duration);
  });

  // Update on ready
  player.wavesurfer.on('ready', () => {
    const duration = player.getDuration();
    display.textContent = formatTimeDisplay(0, duration);
  });

  // Update on seek
  player.wavesurfer.on('seeking', () => {
    const current = player.getCurrentTime();
    const duration = player.getDuration();
    display.textContent = formatTimeDisplay(current, duration);
  });
}

/**
 * Query existing player elements from the DOM
 */
export function queryPlayerElements(container: HTMLElement): PlayerElements {
  return {
    container,
    waveform:
      container.querySelector('#waveform') ||
      container.querySelector('.wc-player-waveform'),
    playButton: container.querySelector(
      '#player-play-btn, .wc-player-play-btn'
    ),
    timeDisplay: container.querySelector(
      '#player-time, .wc-player-time'
    ) as HTMLElement | null,
    speedButton: container.querySelector(
      '#player-speed-btn, .wc-player-speed-btn'
    ),
    speedDisplay: container.querySelector(
      '#player-speed-display, .wc-player-speed-display'
    ) as HTMLElement | null,
    skipBackButton: container.querySelector(
      '#player-skip-back, .wc-player-skip-back'
    ),
    skipForwardButton: container.querySelector(
      '#player-skip-forward, .wc-player-skip-forward'
    ),
    announcer: document.getElementById('wc-player-announcer'),
  };
}
