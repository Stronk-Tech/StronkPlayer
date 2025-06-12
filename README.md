# MistPlayer React

A React component library for MistServer streaming with support for both MistPlayer and Canvas WebRTC players. Automatically contacts the load balancer to find the best streaming host.

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

The `Player` component provides a clean interface that renders either MistPlayer or CanvasPlayer based on the `playerType` prop:

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

### MistPlayer Component

Use MistPlayer directly for the default MistServer player experience:

```jsx
import React from 'react';
import { MistPlayer } from '@stronk-tech/mistplayer-react';

function App() {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <MistPlayer 
        streamName="your-stream-name" 
        developmentMode={true} // optional: uses 'dev' skin
      />
    </div>
  );
}
```

### CanvasPlayer Component

Use CanvasPlayer for WebRTC streaming with HTML5 video element:

```jsx
import React from 'react';
import { CanvasPlayer } from '@stronk-tech/mistplayer-react';

function App() {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <CanvasPlayer streamName="your-stream-name" />
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

### Player

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `streamName` | string | Yes | Name of the stream to display |
| `playerType` | 'mist' \| 'canvas' | No | Player type to use (defaults to 'mist') |
| `developmentMode` | boolean | No | Whether to use development mode (affects MistPlayer skin, defaults to false) |

### MistPlayer

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `streamName` | string | Yes | Name of the stream to display |
| `developmentMode` | boolean | No | Whether to use development mode ('dev' skin, defaults to false) |

### CanvasPlayer

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `streamName` | string | Yes | Name of the stream to display |

## How It Works

This package automatically contacts the load balancer to find the best streaming host for your stream:

- **MistPlayer**: Loads from `https://best-host/view/player.js` and plays `https://best-host/view/streamName.html`
- **CanvasPlayer**: Connects to `wss://best-host/view/webrtc/streamName` for WebRTC streaming

The components show loading states while contacting the load balancer and error states if no suitable host is found.
