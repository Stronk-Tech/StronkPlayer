# MistPlayer React
[![NPM](https://img.shields.io/npm/v/@stronk-tech/mistplayer-react.svg)](https://www.npmjs.com/package/@stronk-tech/mistplayer-react)
[![NPM](https://img.shields.io/npm/last-update/@stronk-tech/mistplayer-react)](https://www.npmjs.com/package/@stronk-tech/mistplayer-react)
[![NPM](https://img.shields.io/npm/dy/@stronk-tech/mistplayer-react)](https://www.npmjs.com/package/@stronk-tech/mistplayer-react)
[![NPM](https://img.shields.io/bundlephobia/min/@stronk-tech/mistplayer-react)](https://www.npmjs.com/package/@stronk-tech/mistplayer-react)
[![GitHub License](https://img.shields.io/github/license/Stronk-Tech/StronkPlayer)](https://github.com/Stronk-Tech/StronkPlayer/blob/master/LICENSE)

A React component library for streaming on the **Stronk Tech CDN** with automatic load balancing. Supports multiple player types including MistPlayer, Canvas WebRTC, and WHEP (WebRTC-HTTP Egress Protocol) players.

The `Player` component automatically contacts the Stronk Tech load balancer to find the best streaming host, while the raw components accept URIs directly for custom implementations.

## Installation

```bash
npm install --save @stronk-tech/mistplayer-react
```

## Usage

### Basic Usage

Import the components you need:

```jsx
import { Player, MistPlayer, CanvasPlayer, WHEPPlayer } from '@stronk-tech/mistplayer-react';
```

### Player Component (Recommended)

The `Player` component provides a clean interface that handles Stronk Tech CDN load balancing and renders the appropriate player based on the `playerType` prop:

```jsx
import React from 'react';
import { Player } from '@stronk-tech/mistplayer-react';

function App() {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Player streamName="your-stream-name" />
    </div>
  );
}
```

You can specify which player to use and enable development mode:

```jsx
<Player 
  streamName="your-stream-name" 
  playerType="whep" // 'whep', 'mist', or 'canvas'
  developmentMode={true} // enables 'dev' skin for MistPlayer
/>
```

### Thumbnail Support

The `Player` component supports thumbnail images for all player types:

#### MistPlayer Poster Override
For MistPlayer, the `thumbnailUrl` overrides the default poster image:

```jsx
<Player 
  streamName="your-stream-name" 
  playerType="mist"
  thumbnailUrl="https://example.com/thumbnail.jpg"
/>
```

#### Canvas/WHEP Player Overlays
For Canvas and WHEP players, you can use interactive thumbnail overlays:

##### Click-to-Play Mode
Shows a thumbnail image with a play button until the user clicks to start:

```jsx
<Player 
  streamName="your-stream-name" 
  playerType="canvas" // or "whep"
  thumbnailUrl="https://example.com/thumbnail.jpg"
  clickToPlay={true}
/>
```

##### Autoplay Muted Mode
Starts playing muted with a "Click to unmute" overlay:

```jsx
<Player 
  streamName="your-stream-name" 
  playerType="canvas" // or "whep"
  thumbnailUrl="https://example.com/thumbnail.jpg"
  autoplayMuted={true}
/>
```

**Note:** MistPlayer uses `thumbnailUrl` as a poster image override, while Canvas and WHEP players support interactive thumbnail overlays with click-to-play and autoplay-muted functionality.

### Raw MistPlayer Component

Use MistPlayer directly when you want to provide your own URIs (bypassing load balancer):

```jsx
import React from 'react';
import { MistPlayer } from '@stronk-tech/mistplayer-react';

function App() {
  const baseUri = "https://your-mist-server.com/view/";
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <MistPlayer 
        baseUri={baseUri}
        streamName="your-stream-name" 
        developmentMode={true} // optional: uses 'dev' skin
      />
    </div>
  );
}
```

### Raw CanvasPlayer Component

Use CanvasPlayer directly when you want to provide your own WebRTC URI:

```jsx
import React from 'react';
import { CanvasPlayer } from '@stronk-tech/mistplayer-react';

function App() {
  const webrtcUri = "wss://your-mist-server.com/view/webrtc/your-stream-name";
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <CanvasPlayer webrtcUri={webrtcUri} />
    </div>
  );
}
```

### Raw WHEPPlayer Component

Use WHEPPlayer directly for WHEP (WebRTC-HTTP Egress Protocol) streaming:

```jsx
import React from 'react';
import { WHEPPlayer } from '@stronk-tech/mistplayer-react';

function App() {
  const whepUrl = "https://your-mist-server.com/view/webrtc/your-stream-name";
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <WHEPPlayer whepUrl={whepUrl} />
    </div>
  );
}
```

## Component Props

### Player (with Stronk Tech CDN Load Balancing)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `streamName` | string | Yes | Name of the stream to display |
| `playerType` | 'mist' \| 'canvas' \| 'whep' | No | Player type to use (defaults to 'mist') |
| `developmentMode` | boolean | No | Whether to use development mode (affects MistPlayer skin, defaults to false) |
| `thumbnailUrl` | string | No | URL to thumbnail image (all player types: MistPlayer uses as poster, Canvas/WHEP use for overlays) |
| `clickToPlay` | boolean | No | Show thumbnail until user clicks to play (Canvas/WHEP only) |
| `autoplayMuted` | boolean | No | Start playing muted with "click to unmute" overlay (Canvas/WHEP only) |

### MistPlayer (Raw Component)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `baseUri` | string | Yes | Base URI for MistServer (e.g., "https://server.com/view/") |
| `streamName` | string | Yes | Name of the stream to display |
| `developmentMode` | boolean | No | Whether to use development mode ('dev' skin, defaults to false) |
| `poster` | string | No | URL to poster/thumbnail image (overrides default poster) |

### CanvasPlayer (Raw Component)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `webrtcUri` | string | Yes | WebSocket URI for WebRTC signaling (e.g., "wss://server.com/view/webrtc/streamName") |
| `muted` | boolean | No | Whether to start muted (defaults to true) |

### WHEPPlayer (Raw Component)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `whepUrl` | string | Yes | WHEP endpoint URL (e.g., "https://server.com/view/webrtc/streamName") |
| `autoPlay` | boolean | No | Whether to auto-play the stream (defaults to true) |
| `muted` | boolean | No | Whether to start muted (defaults to true) |
| `onError` | function | No | Callback function for error events |
| `onConnected` | function | No | Callback function when connection is established |
| `onDisconnected` | function | No | Callback function when connection is lost |

## Player Types

### MistPlayer ⭐ **Recommended for Most Use Cases**
- **Technology**: Intelligent wrapper that automatically selects optimal protocol + player combo
- **Best for**: Universal compatibility with automatic optimization
- **Pros**: Chooses best protocol (WebRTC, HLS, DASH, etc.) per device, handles adaptive bitrate, maximum compatibility, automatic fallbacks
- **Cons**: Less direct control over specific playback technology

### WHEPPlayer ⭐ **Recommended for Low Latency**
- **Technology**: HTTP signaling + WebRTC (WHEP standard)
- **Best for**: Universal compatibility with guaranteed low latency
- **Pros**: Works on all devices, standardized protocol, no WebSocket needed, just HTTP requests, ultra-low latency
- **Cons**: WebRTC limitations (CPU intensive, battery drain, network sensitivity), no adaptive bitrate

### CanvasPlayer  
- **Technology**: WebSocket signaling + WebRTC
- **Best for**: Legacy low-latency streaming applications
- **Pros**: Ultra-low latency when it works
- **Cons**: Device compatibility issues, requires WebSocket connection, more complex signaling

## How It Works

### Player Component (Stronk Tech CDN Load Balanced)
The `Player` component automatically contacts the Stronk Tech load balancer to find the best streaming host for your stream:

- **MistPlayer**: Loads from `https://best-host/view/player.js` and plays `https://best-host/view/streamName.html`
- **CanvasPlayer**: Connects to `wss://best-host/view/webrtc/streamName` for WebRTC streaming
- **WHEPPlayer**: Connects to `https://best-host/view/webrtc/streamName` using WHEP protocol

The `/view` path is a reverse proxy endpoint that routes to the appropriate MistServer HTTP services.

The component shows loading states while contacting the load balancer and provides clear error messages:
- "Finding best streaming server..." - while contacting load balancer
- "Stream is currently offline" - when stream doesn't exist
- "Connection error, retrying..." - on network issues

### Raw Components (Direct URIs)
The raw `MistPlayer`, `CanvasPlayer`, and `WHEPPlayer` components accept URIs directly, giving you full control over which servers to use. This is useful when:

- You want to implement your own load balancing logic
- You're connecting to a specific known server
- You're building a custom player interface
- You need to bypass the Stronk Tech load balancer

## Stronk Tech CDN

This library is designed to work with the Stronk Tech Content Delivery Network, which provides:

- **Global Edge Nodes**: Automatically find the closest streaming server
- **Load Balancing**: Distribute viewers across multiple servers
- **Stream Health Monitoring**: Detect offline streams and retry automatically
- **Multiple Protocols**: Support for HLS, DASH, WebRTC, and WHEP
- **Low Latency**: WebRTC and WHEP options for sub-second latency

The load balancer automatically handles failover and finds the optimal streaming endpoint for each viewer's location and network conditions.