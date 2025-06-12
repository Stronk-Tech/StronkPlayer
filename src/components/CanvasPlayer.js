import React, { useRef } from 'react';
import useWebRTCPlayer from '../hooks/useWebRTCPlayer';

/**
 * CanvasPlayer Component
 * 
 * A React component that uses WebRTC to stream video content to an HTML5 video element.
 * Accepts pre-resolved WebRTC URI from the parent Player component.
 */
const CanvasPlayer = ({ webrtcUri }) => {
  const canvasRef = useRef(null);
  useWebRTCPlayer({
    canvasRef,
    streamBitrate: 1000000,
    uri: webrtcUri,
  });

  return (
    <video
      style={{ 
        width: '100%', 
        maxWidth: '100%', 
        height: '100%' 
      }}
      autoPlay
      muted
      controls
      playsInline
      ref={canvasRef}
    />
  );
};

export default CanvasPlayer;