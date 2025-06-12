import React, { useEffect } from 'react';

/**
 * MistPlayer Component
 * 
 * A React component that embeds the MistServer player for streaming video content.
 * Accepts pre-resolved URIs from the parent Player component.
 */
const MistPlayer = ({ baseUri, streamName, developmentMode = false }) => {
  // Embed as an iframe on localhost/HTTP
  const useIFrame = window.location.protocol === 'http:';
  const htmlUri = baseUri + encodeURIComponent(streamName) + ".html";
  const playerUri = baseUri + "player.js";


  useEffect(() => {
    if (useIFrame || !playerUri) {
      return;
    }

    function playStream() {
      if (!window.mistplayers) return;
      
      // Try to start it on the non-transcoded track and using WebRTC
      window.mistPlay?.(streamName, {
        target: document.getElementById('mistplayer'),
        poster: '/android-chrome-512x512.png',
        autoplay: true,
        ABR_resize: false,
        forcePriority: {
          source: [
            [
              'type',
              [
                'webrtc',
                'whep',
                'html5/video/webm',
                'ws/video/mp4',
                'html5/application/vnd.apple.mpegurl',
              ],
            ],
          ],
        },
        loop: false,
        controls: true,
        fillSpace: true,
        muted: true,
        skin: developmentMode ? 'dev' : undefined,
      });
    }

    // Load meta player code from chosen edge node
    if (!window.mistplayers) {
      const script = document.createElement('script');
      console.log('Loading new MistServer player from', playerUri);
      script.src = playerUri;
      document.head.appendChild(script);
      script.onload = playStream;
    } else {
      playStream();
    }
  }, [streamName, playerUri, useIFrame, developmentMode]);

  if (useIFrame) {
    const iframeElement = (
      <iframe
        style={{
          width: '100%',
          maxWidth: '100%',
          height: '100%',
          border: 'none',
        }}
        src={htmlUri}
        title={`MistPlayer - ${streamName}`}
      />
    );
    return iframeElement;
  }

  const divElement = (
    <div
      id="mistplayer"
      style={{
        width: '100%',
        maxWidth: '100%',
        height: '100%',
      }}
    >
      <noscript>
        <a href={htmlUri} target="_blank" rel="noopener noreferrer">
          Click here to play this video
        </a>
      </noscript>
    </div>
  );
  return divElement;
};

export default MistPlayer;