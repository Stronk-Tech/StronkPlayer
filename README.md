# MistPlayer React

A React component library for MistServer streaming with support for both MistPlayer and Canvas WebRTC players. The `Player` component automatically contacts the load balancer to find the best streaming host, while the raw components accept URIs directly.

## Installation

```bash
npm install --save @stronk-tech/mistplayer-react
```

## Usage

### Basic Usage

Import the components you need:

```jsx
import { Player, MistPlayer, CanvasPlayer } from '@stronk-tech/mistplayer-react';
```

### Player Component (Recommended)

The `Player` component provides a clean interface that handles load balancing and renders either MistPlayer or CanvasPlayer based on the `playerType` prop:

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
  playerType="canvas" // 'mist' (default) or 'canvas'
  developmentMode={true} // enables 'dev' skin for MistPlayer
/>
```

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

### Adding Your Own UI

Since the components are raw players without UI chrome, you can easily add your own controls:

```jsx
import React, { useState } from 'react';
import { Player } from '@stronk-tech/mistplayer-react';

function CustomPlayerWithControls() {
  const [playerType, setPlayerType] = useState('mist');
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <div style={{ padding: '10px', background: '#f0f0f0' }}>
        <button onClick={() => setPlayerType(playerType === 'mist' ? 'canvas' : 'mist')}>
          Switch to {playerType === 'mist' ? 'Canvas' : 'Mist'} Player
        </button>
        <span style={{ marginLeft: '10px' }}>
          Current: {playerType === 'mist' ? 'MistPlayer' : 'Canvas Player'}
        </span>
      </div>
      <Player 
        streamName="your-stream-name" 
        playerType={playerType}
      />
    </div>
  );
}
```

## Component Props

### Player (with Load Balancing)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `streamName` | string | Yes | Name of the stream to display |
| `playerType` | 'mist' \| 'canvas' | No | Player type to use (defaults to 'mist') |
| `developmentMode` | boolean | No | Whether to use development mode (affects MistPlayer skin, defaults to false) |

### MistPlayer (Raw Component)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `baseUri` | string | Yes | Base URI for MistServer (e.g., "https://server.com/view/") |
| `streamName` | string | Yes | Name of the stream to display |
| `developmentMode` | boolean | No | Whether to use development mode ('dev' skin, defaults to false) |

### CanvasPlayer (Raw Component)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `webrtcUri` | string | Yes | WebSocket URI for WebRTC signaling (e.g., "wss://server.com/view/webrtc/streamName") |

## How It Works

### Player Component (Load Balanced)
The `Player` component automatically contacts the load balancer to find the best streaming host for your stream:

- **MistPlayer**: Loads from `https://best-host/view/player.js` and plays `https://best-host/view/streamName.html`
- **CanvasPlayer**: Connects to `wss://best-host/view/webrtc/streamName` for WebRTC streaming

The component shows loading states while contacting the load balancer and error states if no suitable host is found.

### Raw Components (Direct URIs)
The raw `MistPlayer` and `CanvasPlayer` components accept URIs directly, giving you full control over which servers to use. This is useful when:

- You want to implement your own load balancing logic
- You're connecting to a specific known server
- You're building a custom player interface
- You need to bypass the default load balancer
