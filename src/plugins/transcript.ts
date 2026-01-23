/**
 * Transcript Toggle Plugin
 *
 * Extracted from Wonder Cabinet episode-player.js
 * Provides collapsible transcript sections for episode show notes.
 */

import type { WCAudioPlayerPlugin, WCAudioPlayerInstance } from '../types';
import { announceToScreenReader } from '../core/accessibility';

/** Configuration for the transcript plugin */
export interface TranscriptPluginConfig {
  /** CSS selector for the content container to search */
  contentSelector?: string;

  /** Keywords to identify transcript headings */
  transcriptKeywords?: string[];

  /** Heading levels to search (e.g., ['h2', 'h3', 'h4']) */
  headingLevels?: string[];

  /** Initial state: collapsed or expanded */
  initialState?: 'collapsed' | 'expanded';

  /** Label for show button */
  showLabel?: string;

  /** Label for hide button */
  hideLabel?: string;
}

/** Default configuration */
const DEFAULT_CONFIG: Required<TranscriptPluginConfig> = {
  contentSelector: '.wc-episode-notes-content, .gh-content, article',
  transcriptKeywords: ['transcript', 'full transcript', 'episode transcript'],
  headingLevels: ['h2', 'h3', 'h4'],
  initialState: 'collapsed',
  showLabel: 'Show Transcript',
  hideLabel: 'Hide Transcript',
};

/**
 * Find a heading that indicates the start of a transcript
 */
function findTranscriptHeading(
  container: Element,
  config: Required<TranscriptPluginConfig>
): HTMLHeadingElement | null {
  const headingSelector = config.headingLevels.join(', ');
  const headings = container.querySelectorAll<HTMLHeadingElement>(headingSelector);

  for (const heading of headings) {
    const text = heading.textContent?.toLowerCase() || '';
    if (config.transcriptKeywords.some((keyword) => text.includes(keyword))) {
      return heading;
    }
  }

  return null;
}

/**
 * Collect all sibling elements until the next major heading
 */
function collectTranscriptContent(
  transcriptHeading: HTMLHeadingElement
): Element[] {
  const content: Element[] = [];
  let sibling = transcriptHeading.nextElementSibling;

  while (sibling) {
    // Stop at next H2 (major section break)
    if (sibling.tagName === 'H2') break;
    content.push(sibling);
    sibling = sibling.nextElementSibling;
  }

  return content;
}

/**
 * Create the toggle button element
 */
function createToggleButton(config: Required<TranscriptPluginConfig>): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'wc-transcript-toggle';
  button.setAttribute('aria-expanded', config.initialState === 'expanded' ? 'true' : 'false');
  button.innerHTML = `
    <span class="wc-transcript-toggle-text">${config.initialState === 'expanded' ? config.hideLabel : config.showLabel}</span>
    <svg class="wc-transcript-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  return button;
}

/**
 * Wrap transcript content in a collapsible section
 */
function wrapTranscriptSection(
  transcriptHeading: HTMLHeadingElement,
  config: Required<TranscriptPluginConfig>
): { section: HTMLElement; toggle: HTMLButtonElement } | null {
  const transcriptContent = collectTranscriptContent(transcriptHeading);

  if (transcriptContent.length === 0) {
    return null;
  }

  // Create section wrapper
  const section = document.createElement('div');
  section.className = 'wc-transcript-section';

  // Create toggle button
  const toggle = createToggleButton(config);

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'wc-transcript-content';
  contentWrapper.id = 'wc-transcript-content-' + Math.random().toString(36).slice(2, 9);

  // Set initial state
  if (config.initialState === 'collapsed') {
    contentWrapper.classList.remove('is-open');
  } else {
    contentWrapper.classList.add('is-open');
    toggle.classList.add('is-open');
  }

  // Create inner wrapper for smooth animation
  const contentInner = document.createElement('div');
  contentInner.className = 'wc-transcript-inner';

  // Move transcript content into wrapper
  transcriptContent.forEach((el) => {
    contentInner.appendChild(el);
  });

  contentWrapper.appendChild(contentInner);

  // Assemble section
  section.appendChild(toggle);
  section.appendChild(contentWrapper);

  // Insert section and remove original heading
  transcriptHeading.parentNode?.insertBefore(section, transcriptHeading);
  transcriptHeading.remove();

  // Set up ARIA relationship
  toggle.setAttribute('aria-controls', contentWrapper.id);

  return { section, toggle };
}

/**
 * Set up toggle behavior
 */
function setupToggleBehavior(
  toggle: HTMLButtonElement,
  config: Required<TranscriptPluginConfig>
): () => void {
  const contentWrapper = toggle.nextElementSibling as HTMLElement;
  const textSpan = toggle.querySelector('.wc-transcript-toggle-text');

  const handleClick = () => {
    const isOpen = toggle.classList.toggle('is-open');
    contentWrapper?.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));

    if (textSpan) {
      textSpan.textContent = isOpen ? config.hideLabel : config.showLabel;
    }

    // Announce state change
    announceToScreenReader(isOpen ? 'Transcript expanded' : 'Transcript collapsed');
  };

  toggle.addEventListener('click', handleClick);

  // Return cleanup function
  return () => {
    toggle.removeEventListener('click', handleClick);
  };
}

/**
 * Create the transcript toggle plugin
 *
 * This plugin automatically detects transcript sections in page content
 * and wraps them in a collapsible toggle.
 *
 * @param config - Plugin configuration (optional)
 * @returns Plugin instance
 *
 * @example
 * import { WCAudioPlayer, transcriptPlugin } from '@wondercabinet/audio-player';
 *
 * const player = new WCAudioPlayer({
 *   container: '#player',
 *   audioUrl: '/audio.mp3',
 * });
 *
 * // Auto-detect and wrap transcript sections
 * player.use(transcriptPlugin());
 *
 * // Or with custom configuration
 * player.use(transcriptPlugin({
 *   contentSelector: '.my-content',
 *   initialState: 'expanded',
 * }));
 */
export function transcriptPlugin(
  config?: TranscriptPluginConfig
): WCAudioPlayerPlugin {
  const normalizedConfig: Required<TranscriptPluginConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  let cleanup: (() => void) | null = null;

  return {
    name: 'transcript',

    init(_player: WCAudioPlayerInstance) {
      // Find content container
      const contentContainer = document.querySelector(normalizedConfig.contentSelector);
      if (!contentContainer) {
        return;
      }

      // Find transcript heading
      const transcriptHeading = findTranscriptHeading(contentContainer, normalizedConfig);
      if (!transcriptHeading) {
        return;
      }

      // Wrap in collapsible section
      const result = wrapTranscriptSection(transcriptHeading, normalizedConfig);
      if (!result) {
        return;
      }

      // Set up toggle behavior
      cleanup = setupToggleBehavior(result.toggle, normalizedConfig);

      console.log('[WCAudioPlayer] Transcript toggle initialized');
    },

    destroy() {
      cleanup?.();
      cleanup = null;
    },
  };
}

export default transcriptPlugin;
