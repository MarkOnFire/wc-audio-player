# WC Audio Player

A framework-agnostic audio player with waveform visualization, built on [Wavesurfer.js](https://wavesurfer.xyz/).

**Originally extracted from the [Wonder Cabinet](https://www.wondercabinet.org/) Ghost theme's episode player.**

## Features

- **Waveform Visualization** - Powered by Wavesurfer.js v7
- **Keyboard Shortcuts** - Space/K (play/pause), J/L (skip), M (mute), arrows (speed), and more
- **Playback Speed Control** - 0.5x to 2x
- **Skip Controls** - Configurable skip duration (default: 15 seconds)
- **Accessibility** - ARIA live regions, keyboard navigation, screen reader announcements
- **Pre-Generated Peaks** - CORS workaround for external audio hosting
- **Plugin System** - Analytics, transcript toggle, and extensible
- **Themeable** - CSS custom properties for full customization
- **Framework Agnostic** - Works with vanilla JS, React, Vue, or any framework
- **TypeScript** - Full type definitions included

## Origin Story

This player was originally developed for the **Wonder Cabinet** podcast website, a Ghost-powered site featuring interviews with scientists, historians, and storytellers. The original implementation lived in:

- `assets/js/episode-player.js` (839 lines) - Main player logic
- `assets/js/waveform-player.js` (200 lines) - Pre-generated peaks support
- `assets/css/components/player.css` (537 lines) - Sprint 7 "s7-player" design
- `assets/css/base/variables.css` (149 lines) - Design tokens

The player was battle-tested across multiple sprints of development, including:
- Sprint 4: Post-launch refinement and CSS modularization
- Sprint 6: Privacy-friendly analytics integration
- Sprint 7: Consolidated "s7-player" design system

This extraction into a standalone package allows the player to be reused across other projects and themes.

## Installation

```bash
# npm
npm install @wondercabinet/audio-player wavesurfer.js

# yarn
yarn add @wondercabinet/audio-player wavesurfer.js

# pnpm
pnpm add @wondercabinet/audio-player wavesurfer.js
```

Or use via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@wondercabinet/audio-player/dist/themes/default.css">
<script src="https://unpkg.com/wavesurfer.js@7"></script>
<script src="https://unpkg.com/@wondercabinet/audio-player/dist/wc-audio-player.umd.js"></script>
```

## Quick Start

### Basic Usage (Data Attributes)

```html
<div class="wc-audio-player"
     data-audio-url="https://example.com/episode.mp3"
     data-title="Episode Title">
  <!-- Player UI -->
  <div class="wc-player-controls">
    <button id="player-play-btn" class="wc-player-play-btn" aria-label="Play">
      <!-- Play/Pause icons -->
    </button>
    <div id="player-time" class="wc-player-time">0:00 / 0:00</div>
  </div>
  <div id="waveform" class="wc-player-waveform"></div>
</div>

<script type="module">
  import { autoInit } from '@wondercabinet/audio-player';
  import '@wondercabinet/audio-player/themes/default.css';

  // Auto-initialize all [data-audio-url] elements
  const players = autoInit();
</script>
```

### Programmatic API

```javascript
import { WCAudioPlayer, analyticsPlugin } from '@wondercabinet/audio-player';
import '@wondercabinet/audio-player/themes/default.css';

const player = new WCAudioPlayer({
  container: '#player',
  audioUrl: 'https://example.com/episode.mp3',

  // Optional: pre-generated peaks for CORS workaround
  peaksUrl: 'https://example.com/peaks/episode.json',

  // Optional: features
  features: {
    keyboard: true,
    speed: true,
    skip: { seconds: 15 },
  },

  // Optional: episode metadata
  metadata: {
    title: 'Episode Title',
    artwork: '/images/cover.jpg',
  },

  // Callbacks
  onReady: () => console.log('Player ready!'),
  onPlay: () => console.log('Playing'),
  onPause: (position) => console.log('Paused at', position),
});

// Add analytics (auto-detects Plausible, Simple Analytics, GA4)
player.use(analyticsPlugin());

// Control programmatically
player.play();
player.skipForward(30);
player.setSpeed(1.5);
player.toggleMute();
```

### Functional API

```javascript
import { createPlayer } from '@wondercabinet/audio-player';

const player = createPlayer({
  container: '#player',
  audioUrl: 'https://example.com/episode.mp3',
});

// Access methods
player.play();
player.pause();
player.seekTo(0.5); // Seek to 50%
player.getCurrentTime();
player.getDuration();
player.destroy();
```

## Configuration

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `string \| HTMLElement` | required | Container element or CSS selector |
| `audioUrl` | `string` | required | Audio file URL |
| `peaksUrl` | `string` | - | Pre-generated peaks JSON URL |
| `theme` | `'default' \| 'minimal' \| 'custom'` | `'default'` | Theme name |
| `colors` | `PlayerColors` | - | Color overrides |
| `features` | `PlayerFeatures` | - | Feature toggles |
| `metadata` | `PlayerMetadata` | - | Episode metadata |
| `onReady` | `() => void` | - | Called when player is ready |
| `onPlay` | `() => void` | - | Called on play |
| `onPause` | `(position: number) => void` | - | Called on pause |
| `onFinish` | `() => void` | - | Called when playback ends |
| `onError` | `(error: Error) => void` | - | Called on error |

### Features

```javascript
features: {
  // Keyboard shortcuts
  keyboard: true, // or KeyboardConfig object

  // Playback speed control
  speed: true, // or { options: [0.5, 1, 1.5, 2], defaultSpeed: 1 }

  // Skip buttons
  skip: true, // or { seconds: 15 }

  // Analytics tracking
  analytics: false, // Use analyticsPlugin() instead for full control
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `J` / `←` | Skip back 15s |
| `L` / `→` | Skip forward 15s |
| `↑` | Increase speed |
| `↓` | Decrease speed |
| `M` | Toggle mute |
| `0` / `Home` | Jump to start |
| `End` | Jump to end |

## Plugins

### Analytics Plugin

Auto-detects Plausible, Simple Analytics, or Google Analytics 4:

```javascript
import { analyticsPlugin } from '@wondercabinet/audio-player';

player.use(analyticsPlugin());

// Or with configuration
player.use(analyticsPlugin({
  trackView: true,
  trackPlay: true,
  trackPause: true,
  trackComplete: true,
  trackSpeedChange: true,
  trackSkip: true,
}));

// Or with custom tracker
player.use(analyticsPlugin({
  tracker: (eventName, data) => {
    myAnalytics.track(eventName, data);
  },
}));
```

### Transcript Plugin

Auto-wraps transcript sections in collapsible toggles:

```javascript
import { transcriptPlugin } from '@wondercabinet/audio-player';

player.use(transcriptPlugin());

// Or with configuration
player.use(transcriptPlugin({
  contentSelector: '.episode-notes',
  transcriptKeywords: ['transcript', 'full transcript'],
  initialState: 'collapsed',
}));
```

## Theming

### CSS Custom Properties

Override CSS variables to customize the player:

```css
.my-player {
  --wc-player-bg: linear-gradient(135deg, #1a1a2e, #16213e);
  --wc-player-play-btn-bg: #e94560;
  --wc-player-progress-color: #e94560;
  --wc-player-wave-color: rgba(255, 255, 255, 0.2);
  --wc-player-text-color: #ffffff;
}
```

See `src/themes/variables.css` for all available variables.

### Themes

```javascript
// Default theme (Wonder Cabinet green)
import '@wondercabinet/audio-player/themes/default.css';

// Minimal theme (barebones)
import '@wondercabinet/audio-player/themes/minimal.css';

// Variables only (build your own)
import '@wondercabinet/audio-player/themes/variables.css';
```

## Pre-Generated Peaks

For audio hosted on external CDNs with CORS restrictions (like PRX/Podtrac), pre-generate peaks:

```javascript
const player = createPlayer({
  container: '#player',
  audioUrl: 'https://cdn.example.com/episode.mp3',
  peaksUrl: '/peaks/episode.json', // Your server
});
```

Peaks JSON format:

```json
{
  "sample_rate": 8000,
  "length": 352800,
  "data": [0.1, 0.2, 0.3, ...]
}
```

Generate peaks using audiowaveform or similar tools.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

## License

MIT

## Credits

- Original player by the [Wonder Cabinet](https://www.wondercabinet.org/) team
- Built on [Wavesurfer.js](https://wavesurfer.xyz/) by katspaugh
- Accessibility patterns from [W3C WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/)
