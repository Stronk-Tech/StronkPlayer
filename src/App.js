import React, { useState } from 'react';
import { Player } from './library';

function App() {
  const [streamName, setStreamName] = useState('your-stream-name');
  const [playerType, setPlayerType] = useState('mist');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>MistPlayer React Examples</h1>

        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>Stream Configuration</h3>
          <input
            type="text"
            placeholder="Stream Name"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
            style={{ padding: '10px', margin: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <p>Uses the load balancer to find the best streaming server automatically!</p>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div>
          <h2>Raw Player Component</h2>
          <p>Clean player component without UI chrome - specify playerType prop:</p>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                value="mist"
                checked={playerType === 'mist'}
                onChange={(e) => setPlayerType(e.target.value)}
                style={{ marginRight: '5px' }}
              />
              MistPlayer
            </label>
            <label>
              <input
                type="radio"
                value="canvas"
                checked={playerType === 'canvas'}
                onChange={(e) => setPlayerType(e.target.value)}
                style={{ marginRight: '5px' }}
              />
              Canvas Player
            </label>
          </div>
          <div style={{ border: '1px solid #ccc', borderRadius: '5px', overflow: 'hidden' }}>
            <Player streamName={streamName} playerType={playerType} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 