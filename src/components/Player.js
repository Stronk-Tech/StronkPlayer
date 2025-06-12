import React, { useState, useEffect, useRef } from "react";
import MistPlayer from "./MistPlayer";
import CanvasPlayer from "./CanvasPlayer";
import useLoadBalancer from "../hooks/useLoadBalancer";

const Player = ({ streamName, playerType = "mist", developmentMode = false }) => {
  // Get edge node to play from
  const [getNode] = useLoadBalancer({
    streamName,
  });
  const [bestHost, setHost] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    const getHost = async () => {
      const newHost = await getNode();
      
      if (newHost === "") {
        // Only set interval if we don't already have one running
        if (!intervalRef.current) {
          console.log("Finding new edge node in 5 seconds...");
          intervalRef.current = setInterval(getHost, 5000);
        }
        return;
      }
      
      // We found a host - clear any retry interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (newHost !== bestHost) {
        console.log("Found edge node " + newHost);
        setHost(newHost);
      }
    };
    
    getHost();
    
    // Cleanup interval on unmount or streamName change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [streamName, getNode]);

  // Show loading state while contacting load balancer
  if (bestHost === "") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <p>Waiting for source...</p>
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