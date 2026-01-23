/**
 * Accessibility Helpers
 *
 * Extracted from Wonder Cabinet episode-player.js
 * Provides screen reader announcements and ARIA support.
 */

/** ID for the screen reader announcer element */
const ANNOUNCER_ID = 'wc-player-announcer';

/** Cached reference to the announcer element */
let announcerElement: HTMLElement | null = null;

/**
 * Get or create the screen reader announcer element
 *
 * Creates an ARIA live region that screen readers will announce
 * when content changes. The element is visually hidden but
 * accessible to assistive technology.
 *
 * @returns The announcer element
 */
export function getAnnouncer(): HTMLElement {
  if (announcerElement && document.body.contains(announcerElement)) {
    return announcerElement;
  }

  // Check if element already exists in DOM
  let announcer = document.getElementById(ANNOUNCER_ID);

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = ANNOUNCER_ID;
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';

    // Visually hidden but accessible to screen readers
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;

    document.body.appendChild(announcer);
  }

  announcerElement = announcer;
  return announcer;
}

/**
 * Announce a message to screen readers
 *
 * Uses ARIA live regions to communicate status changes
 * to users of assistive technology. The message is briefly
 * cleared then set to trigger the announcement.
 *
 * @param message - Message to announce
 *
 * @example
 * announceToScreenReader('Playback speed: 1.5x')
 * announceToScreenReader('Skipped forward 15 seconds')
 */
export function announceToScreenReader(message: string): void {
  const announcer = getAnnouncer();

  // Clear and set message with a small delay to trigger announcement
  announcer.textContent = '';

  // Use requestAnimationFrame for smoother timing
  requestAnimationFrame(() => {
    // Small delay ensures screen readers pick up the change
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  });
}

/**
 * Update button ARIA state for play/pause toggle
 *
 * @param button - The button element
 * @param isPlaying - Whether audio is currently playing
 * @param playLabel - Label when paused (default: "Play")
 * @param pauseLabel - Label when playing (default: "Pause")
 */
export function updatePlayButtonAria(
  button: HTMLButtonElement | null,
  isPlaying: boolean,
  playLabel = 'Play',
  pauseLabel = 'Pause'
): void {
  if (!button) return;

  button.setAttribute('aria-label', isPlaying ? pauseLabel : playLabel);
  button.setAttribute('aria-pressed', String(isPlaying));
}

/**
 * Update ARIA label with current value
 *
 * Useful for controls like speed buttons that display current state.
 *
 * @param element - The element to update
 * @param label - The label template (use {value} for interpolation)
 * @param value - The current value
 *
 * @example
 * updateAriaLabel(speedBtn, 'Playback speed: {value}', '1.5x')
 */
export function updateAriaLabel(
  element: HTMLElement | null,
  label: string,
  value: string
): void {
  if (!element) return;
  element.setAttribute('aria-label', label.replace('{value}', value));
}

/**
 * Set up keyboard focus trap for modal-like player controls
 *
 * Useful when player has focus mode or expanded state.
 *
 * @param container - Container element to trap focus within
 * @returns Cleanup function to remove the trap
 */
export function setupFocusTrap(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab: going backward
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: going forward
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Check if reduced motion is preferred
 *
 * Respects user's system preference for reduced motion.
 *
 * @returns true if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Clean up the announcer element
 *
 * Call this when the player is destroyed to remove the announcer
 * if no other players are using it.
 */
export function cleanupAnnouncer(): void {
  if (announcerElement && document.body.contains(announcerElement)) {
    // Only remove if no other players might be using it
    const otherPlayers = document.querySelectorAll('.wc-audio-player');
    if (otherPlayers.length === 0) {
      announcerElement.remove();
      announcerElement = null;
    }
  }
}
