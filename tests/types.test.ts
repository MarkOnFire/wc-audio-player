/**
 * Type Tests
 *
 * These tests verify that the TypeScript types are correct.
 * They don't run any code - they just ensure the types compile.
 */

import { describe, it, expectTypeOf } from 'vitest';
import {
  WCAudioPlayer,
  createPlayer,
  autoInit,
  formatTime,
  analyticsPlugin,
  transcriptPlugin,
} from '../src/index';
import type {
  WCAudioPlayerOptions,
  WCAudioPlayerInstance,
  WCAudioPlayerPlugin,
  PlayerState,
  PlayerColors,
  PlayerFeatures,
  KeyboardConfig,
  AnalyticsConfig,
  SpeedConfig,
  SkipConfig,
} from '../src/types';

describe('Type definitions', () => {
  it('WCAudioPlayerOptions has correct shape', () => {
    const options: WCAudioPlayerOptions = {
      container: '#player',
      audioUrl: 'https://example.com/audio.mp3',
    };

    expectTypeOf(options.container).toMatchTypeOf<string | HTMLElement>();
    expectTypeOf(options.audioUrl).toBeString();
    expectTypeOf(options.peaksUrl).toMatchTypeOf<string | undefined>();
    expectTypeOf(options.features).toMatchTypeOf<Partial<PlayerFeatures> | undefined>();
  });

  it('createPlayer returns WCAudioPlayerInstance', () => {
    expectTypeOf(createPlayer).toBeFunction();
    expectTypeOf(createPlayer).parameter(0).toMatchTypeOf<WCAudioPlayerOptions>();
  });

  it('WCAudioPlayer class has correct methods', () => {
    expectTypeOf<WCAudioPlayer>().toHaveProperty('play');
    expectTypeOf<WCAudioPlayer>().toHaveProperty('pause');
    expectTypeOf<WCAudioPlayer>().toHaveProperty('playPause');
    expectTypeOf<WCAudioPlayer>().toHaveProperty('seekTo');
    expectTypeOf<WCAudioPlayer>().toHaveProperty('setSpeed');
    expectTypeOf<WCAudioPlayer>().toHaveProperty('toggleMute');
    expectTypeOf<WCAudioPlayer>().toHaveProperty('destroy');
    expectTypeOf<WCAudioPlayer>().toHaveProperty('use');
  });

  it('formatTime returns string', () => {
    expectTypeOf(formatTime).toBeFunction();
    expectTypeOf(formatTime).parameter(0).toBeNumber();
    expectTypeOf(formatTime).returns.toBeString();
  });

  it('autoInit returns array of instances', () => {
    expectTypeOf(autoInit).toBeFunction();
    expectTypeOf(autoInit).returns.toMatchTypeOf<WCAudioPlayerInstance[]>();
  });

  it('plugins have correct shape', () => {
    expectTypeOf(analyticsPlugin).toBeFunction();
    expectTypeOf(analyticsPlugin).returns.toMatchTypeOf<WCAudioPlayerPlugin>();

    expectTypeOf(transcriptPlugin).toBeFunction();
    expectTypeOf(transcriptPlugin).returns.toMatchTypeOf<WCAudioPlayerPlugin>();
  });

  it('PlayerState has correct properties', () => {
    expectTypeOf<PlayerState>().toHaveProperty('isReady');
    expectTypeOf<PlayerState>().toHaveProperty('isPlaying');
    expectTypeOf<PlayerState>().toHaveProperty('isMuted');
    expectTypeOf<PlayerState>().toHaveProperty('currentSpeed');
    expectTypeOf<PlayerState>().toHaveProperty('currentTime');
    expectTypeOf<PlayerState>().toHaveProperty('duration');
  });

  it('PlayerColors has correct properties', () => {
    expectTypeOf<PlayerColors>().toHaveProperty('waveColor');
    expectTypeOf<PlayerColors>().toHaveProperty('progressColor');
    expectTypeOf<PlayerColors>().toHaveProperty('cursorColor');
    expectTypeOf<PlayerColors>().toHaveProperty('background');
  });

  it('KeyboardConfig has correct properties', () => {
    expectTypeOf<KeyboardConfig>().toHaveProperty('enabled');
    expectTypeOf<KeyboardConfig>().toHaveProperty('playPause');
    expectTypeOf<KeyboardConfig>().toHaveProperty('skipBack');
    expectTypeOf<KeyboardConfig>().toHaveProperty('skipForward');
  });

  it('SpeedConfig has correct properties', () => {
    expectTypeOf<SpeedConfig>().toHaveProperty('enabled');
    expectTypeOf<SpeedConfig>().toHaveProperty('options');
    expectTypeOf<SpeedConfig>().toHaveProperty('defaultSpeed');
  });

  it('SkipConfig has correct properties', () => {
    expectTypeOf<SkipConfig>().toHaveProperty('enabled');
    expectTypeOf<SkipConfig>().toHaveProperty('seconds');
  });

  it('AnalyticsConfig has correct properties', () => {
    expectTypeOf<AnalyticsConfig>().toHaveProperty('enabled');
    expectTypeOf<AnalyticsConfig>().toHaveProperty('tracker');
    expectTypeOf<AnalyticsConfig>().toHaveProperty('trackPlay');
    expectTypeOf<AnalyticsConfig>().toHaveProperty('trackPause');
  });
});
