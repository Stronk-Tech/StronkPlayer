import React, { useState, useEffect, useRef } from "react";
import MistPlayer from "./MistPlayer";
import CanvasPlayer from "./CanvasPlayer";
import WHEPPlayer from "./WHEPPlayer";
import LoadingScreen from "./LoadingScreen";
import useLoadBalancer from "../hooks/useLoadBalancer";

const Player = ({
  streamName,
  playerType = "mist", // "mist", "canvas", "whep"
  developmentMode = false
}) => {
  // Get edge node to play from and check stream status
  const [getNode, getSource] = useLoadBalancer({
    streamName
  });
  const [bestHost, setHost] = useState("");
  const [status, setStatus] = useState("loading");
  const intervalRef = useRef(null);

  useEffect(() => {
    const checkStream = async () => {
      // First check if stream exists
      const sourceResult = await getSource();

      if (sourceResult === "") {
        setStatus("no_stream");
        // Only set interval if we don't already have one running
        if (!intervalRef.current) {
          console.log("Stream not found, retrying in 2 seconds...");
          intervalRef.current = setInterval(checkStream, 2000);
        }
        return;
      }

      // Stream exists, now find best node to play from
      const nodeResult = await getNode();

      if (nodeResult.host === "") {
        setStatus(nodeResult.status);
        // Only set interval if we don't already have one running
        if (!intervalRef.current && nodeResult.status !== "no_stream") {
          console.log("Finding new edge node in 2 seconds...");
          intervalRef.current = setInterval(checkStream, 2000);
        }
        return;
      }

      // We found a host - clear any retry interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (nodeResult.host !== bestHost) {
        console.log("Found edge node " + nodeResult.host);
        setHost(nodeResult.host);
        setStatus("ready");
      }
    };

    checkStream();

    // Cleanup interval on unmount or streamName change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [streamName, getNode, getSource]);

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

  // Construct URIs for the child components using load balancer result
  const baseUri = `https://${bestHost}/view/`;
  const webrtcUri = `wss://${bestHost}/view/webrtc/${streamName}`;
  const whepUri = `https://${bestHost}/view/webrtc/${streamName}`;

  if (playerType === "canvas") {
    return <CanvasPlayer webrtcUri={webrtcUri} streamName={streamName} />;
  }

  if (playerType === "whep") {
    return <WHEPPlayer whepUrl={whepUri} />;
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