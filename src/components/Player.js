import React from "react";
import MistPlayer from "./MistPlayer";
import CanvasPlayer from "./CanvasPlayer";
import useLoadBalancer from "../hooks/useLoadBalancer";

const Player = ({ streamName, playerType = "mist", developmentMode = false }) => {
  const { bestHost, isLoading, error } = useLoadBalancer(streamName);

  // Show loading state while contacting load balancer
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <p>Finding best streaming server...</p>
      </div>
    );
  }

  // Show error if load balancer failed
  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  // Show error if no host found
  if (!bestHost) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <p>Stream not available</p>
      </div>
    );
  }

  // Construct URIs for the child components
  const baseUri = `https://${bestHost}/view/`;
  const webrtcUri = `wss://${bestHost}/view/webrtc/${streamName}`;

  if (playerType === "canvas") {
    return <CanvasPlayer webrtcUri={webrtcUri} streamName={streamName} />;
  }
  
  return (
    <MistPlayer
      baseUri={baseUri}
      streamName={streamName} 
      developmentMode={developmentMode} 
    />
  );
};

export default Player; 