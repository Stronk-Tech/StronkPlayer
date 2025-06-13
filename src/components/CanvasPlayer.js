import React, { useRef, useEffect } from 'react';
import useWebRTCPlayer from '../hooks/useWebRTCPlayer';

/**
 * CanvasPlayer Component
 * 
 * A React component that uses WebRTC to stream video content to an HTML5 video element.
 * Accepts pre-resolved WebRTC URI from the parent Player component.
 */
const CanvasPlayer = ({ webrtcUri, muted = true }) => {
  const canvasRef = useRef(null);
  useWebRTCPlayer({
    canvasRef,
    streamBitrate: 1000000,
    uri: webrtcUri,
  });

  // Update video muted state when prop changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <video
      style={{ 
        width: '100%', 
        maxWidth: '100%', 
        height: '100%' 
      }}
      autoPlay
      muted={muted}
      controls
      playsInline
      ref={canvasRef}
    />
  );
};

export default CanvasPlayer;