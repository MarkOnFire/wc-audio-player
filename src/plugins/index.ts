/**
 * Plugin Exports
 *
 * All optional plugins for the WC Audio Player.
 */

export { analyticsPlugin } from './analytics';
export { transcriptPlugin } from './transcript';

// Re-export types for plugin authors
export type { WCAudioPlayerPlugin, AnalyticsConfig } from '../types';
export type { TranscriptPluginConfig } from './transcript';
