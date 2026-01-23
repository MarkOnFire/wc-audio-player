# Ghost Theme Integration Example

This example shows how to integrate the WC Audio Player into a Ghost theme.

## Installation

### Option 1: NPM (Recommended for themes with build process)

```bash
npm install @wondercabinet/audio-player wavesurfer.js
```

### Option 2: CDN (For themes without build process)

Add to your `default.hbs`:

```handlebars
{{!-- Before </head> --}}
<link rel="stylesheet" href="https://unpkg.com/@wondercabinet/audio-player/dist/themes/default.css">

{{!-- Before </body> --}}
<script src="https://unpkg.com/wavesurfer.js@7"></script>
<script src="https://unpkg.com/@wondercabinet/audio-player/dist/wc-audio-player.umd.js"></script>
```

## Usage in Templates

### Basic Episode Player (post.hbs)

```handlebars
{{#post}}
  {{#if primary_tag.name "=" "Episode"}}
    <div class="wc-audio-player"
         data-audio-url="{{audio}}"
         data-title="{{title}}"
         data-artwork="{{feature_image}}">

      {{!-- Player Controls --}}
      <div class="wc-player-hero">
        <div class="wc-player-hero-content">
          {{#if feature_image}}
            <div class="wc-player-hero-artwork">
              <img src="{{feature_image}}" alt="{{title}}" loading="eager">
            </div>
          {{/if}}

          <div class="wc-player-hero-info">
            <span class="wc-player-hero-date">{{date format="MMMM D, YYYY"}}</span>
            <h1 class="wc-player-hero-title">{{title}}</h1>
            {{#if custom_excerpt}}
              <p class="wc-player-hero-desc">{{custom_excerpt}}</p>
            {{/if}}
          </div>
        </div>

        <div class="wc-player-hero-actions">
          <button id="player-play-btn" class="wc-player-play-btn" aria-label="Play episode">
            <span class="wc-player-icon-play">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </span>
            <span class="wc-player-icon-pause" style="display:none">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </span>
          </button>

          {{!-- Subscribe Links --}}
          <div class="wc-player-subscribe">
            {{#if @custom.apple_podcasts_link}}
              <a href="{{@custom.apple_podcasts_link}}" class="wc-app-icon" title="Apple Podcasts">
                <svg>...</svg>
              </a>
            {{/if}}
            {{#if @custom.spotify_link}}
              <a href="{{@custom.spotify_link}}" class="wc-app-icon" title="Spotify">
                <svg>...</svg>
              </a>
            {{/if}}
          </div>
        </div>

        {{!-- Waveform --}}
        <div class="wc-player-hero-waveform">
          <div id="waveform" class="wc-player-waveform"></div>
          <div id="player-time" class="wc-player-time">0:00 / 0:00</div>
        </div>
      </div>
    </div>

    <script type="module">
      import { createPlayer, analyticsPlugin, transcriptPlugin } from '@wondercabinet/audio-player';

      const player = createPlayer({
        container: '.wc-audio-player',
        audioUrl: '{{audio}}',
        metadata: {
          title: '{{title}}',
          artwork: '{{feature_image}}',
        },
        features: {
          keyboard: true,
          speed: true,
          skip: { seconds: 15 },
        },
      });

      // Add analytics (auto-detects Plausible, Simple Analytics, or GA4)
      player.use(analyticsPlugin());

      // Auto-wrap transcript sections
      player.use(transcriptPlugin());
    </script>
  {{/if}}
{{/post}}
```

### With Pre-Generated Peaks (CORS Workaround)

For audio hosted on external CDNs (like PRX/Podtrac), pre-generate peaks:

```handlebars
<div class="wc-audio-player"
     data-audio-url="{{audio}}"
     data-peaks-url="/peaks/{{slug}}.json"
     data-title="{{title}}">
  {{!-- ... --}}
</div>
```

### Dynamic Audio Detection

If audio comes from a Ghost Audio Card:

```javascript
import { createPlayer, findAudioUrl } from '@wondercabinet/audio-player';

const audioUrl = findAudioUrl(); // Auto-detects from .kg-audio-card

if (audioUrl) {
  const player = createPlayer({
    container: '.wc-audio-player',
    audioUrl,
  });
}
```

## Custom Styling

Override CSS variables in your theme:

```css
/* In your theme's CSS */
.wc-audio-player {
  --wc-player-bg: var(--your-theme-gradient);
  --wc-player-play-btn-bg: var(--your-accent-color);
  --wc-player-progress-color: var(--your-accent-color);
}
```

## Migration from Legacy Player

If migrating from the original Wonder Cabinet `episode-player.js`:

1. Remove the old `episode-player.js` and `waveform-player.js` files
2. Install the new package
3. Update your `default.hbs` to load the new scripts
4. Update `post.hbs` to use the new initialization method
5. The player will automatically find audio from `data-audio-url` or Ghost audio cards
6. Keyboard shortcuts are enabled by default

The new player is fully backward-compatible with the existing HTML structure.
