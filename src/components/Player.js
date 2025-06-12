import React, { useState, useEffect, useRef } from "react";
import MistPlayer from "./MistPlayer";
import CanvasPlayer from "./CanvasPlayer";
import LoadingScreen from "./LoadingScreen";
import useLoadBalancer from "../hooks/useLoadBalancer";

const Player = ({ streamName, playerType = "mist", developmentMode = false }) => {
  // Get edge node to play from
  const [getNode] = useLoadBalancer({
    streamName,
  });
  const [bestHost, setHost] = useState("");
  const [status, setStatus] = useState("loading");
  const intervalRef = useRef(null);

  useEffect(() => {
    const getHost = async () => {
      const result = await getNode();
      
      if (result.host === "") {
        setStatus(result.status);
        // Only set interval if we don't already have one running
        if (!intervalRef.current && result.status !== "no_stream") {
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
      
      if (result.host !== bestHost) {
        console.log("Found edge node " + result.host);
        setHost(result.host);
        setStatus("ready");
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
    let message = "Finding best streaming server...";
    if (status === "no_stream") {
      message = "Stream is currently offline";
    } else if (status === "error") {
      message = "Connection error, retrying...";
    }
    
    return <LoadingScreen message={message} />;
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