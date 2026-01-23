/**
 * Time Formatting Utilities
 *
 * Extracted from Wonder Cabinet episode-player.js
 * Provides consistent time display formatting for audio players.
 */

/**
 * Format seconds to MM:SS or HH:MM:SS display
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string
 *
 * @example
 * formatTime(65)    // "1:05"
 * formatTime(3665)  // "1:01:05"
 * formatTime(NaN)   // "0:00"
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedMins = hrs > 0 && mins < 10 ? '0' + mins : String(mins);
  const paddedSecs = secs < 10 ? '0' + secs : String(secs);

  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${mins}:${paddedSecs}`;
}

/**
 * Parse a time string (MM:SS or HH:MM:SS) to seconds
 *
 * @param timeString - Time string to parse
 * @returns Time in seconds, or 0 if invalid
 *
 * @example
 * parseTime("1:05")     // 65
 * parseTime("1:01:05")  // 3665
 * parseTime("invalid")  // 0
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number);

  if (parts.some(isNaN)) {
    return 0;
  }

  if (parts.length === 3) {
    const [hrs, mins, secs] = parts;
    return hrs * 3600 + mins * 60 + secs;
  }

  if (parts.length === 2) {
    const [mins, secs] = parts;
    return mins * 60 + secs;
  }

  return 0;
}

/**
 * Calculate progress percentage (0-100)
 *
 * @param currentTime - Current time in seconds
 * @param duration - Total duration in seconds
 * @returns Progress percentage
 */
export function calculateProgress(
  currentTime: number,
  duration: number
): number {
  if (!duration || duration <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
}

/**
 * Calculate remaining time in seconds
 *
 * @param currentTime - Current time in seconds
 * @param duration - Total duration in seconds
 * @returns Remaining time in seconds
 */
export function calculateRemaining(
  currentTime: number,
  duration: number
): number {
  if (!duration || duration <= 0) {
    return 0;
  }
  return Math.max(0, duration - currentTime);
}

/**
 * Format a time display string with current and total time
 *
 * @param currentTime - Current time in seconds
 * @param duration - Total duration in seconds
 * @returns Formatted display string (e.g., "1:23 / 5:00")
 */
export function formatTimeDisplay(
  currentTime: number,
  duration: number
): string {
  return `${formatTime(currentTime)} / ${formatTime(duration)}`;
}
