import React, { useState, useEffect, useRef } from "react";
import MistPlayer from "./MistPlayer";
import CanvasPlayer from "./CanvasPlayer";
import WHEPPlayer from "./WHEPPlayer";
import LoadingScreen from "./LoadingScreen";
import ThumbnailOverlay from "./ThumbnailOverlay";
import useLoadBalancer from "../hooks/useLoadBalancer";

const Player = ({
  streamName,
  playerType = "mist", // "mist", "canvas", "whep"
  developmentMode = false,
  // Thumbnail options
  thumbnailUrl = null, // URL to thumbnail image
  autoplayMuted = false, // If true, starts playing muted with "click to unmute" overlay
  clickToPlay = false, // If true, shows thumbnail until user clicks to play
}) => {
  // Get edge node to play from and check stream status
  const [getNode, getSource] = useLoadBalancer({
    streamName
  });
  const [bestHost, setHost] = useState("");
  const [status, setStatus] = useState("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Always start muted to allow autoplay
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const intervalRef = useRef(null);

  // Only show thumbnail overlay for Canvas and WHEP players (not MistPlayer)
  const supportsOverlay = playerType === "canvas" || playerType === "whep";
  
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
        
        // Auto-start playing if autoplayMuted is enabled or neither special mode is enabled
        if (autoplayMuted || (!clickToPlay && !autoplayMuted)) {
          setIsPlaying(true);
          
          // For no thumbnail mode, unmute after a short delay to allow video to start
          if (!clickToPlay && !autoplayMuted) {
            setTimeout(() => {
              setIsMuted(false);
            }, 1000);
          }
        }
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
  }, [streamName, getNode, getSource, autoplayMuted, clickToPlay]);

  const handlePlay = () => {
    setUserHasInteracted(true);
    
    if (clickToPlay && !isPlaying) {
      // For click-to-play, start unmuted
      setIsPlaying(true);
      setIsMuted(false);
    } else if (autoplayMuted && isMuted) {
      // For autoplay muted, just unmute
      setIsMuted(false);
    }
  };

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

  console.log("Player state:", { thumbnailUrl, supportsOverlay, clickToPlay, autoplayMuted, isPlaying, isMuted, playerType, userHasInteracted });

  // Render the appropriate player
  let playerComponent;
  if (playerType === "canvas") {
    playerComponent = <CanvasPlayer key={`${streamName}-${bestHost}-canvas`} webrtcUri={webrtcUri} muted={isMuted} />;
  } else if (playerType === "whep") {
    playerComponent = <WHEPPlayer key={`${streamName}-${bestHost}-whep`} whepUrl={whepUri} muted={isMuted} />;
  } else {
    // MistPlayer handles its own muting/controls, so we don't pass muted prop
    // Pass thumbnailUrl as poster prop to override default poster image
    playerComponent = (
      <MistPlayer
        key={`${streamName}-${bestHost}-mist`}
        baseUri={baseUri}
        streamName={streamName}
        developmentMode={developmentMode}
        poster={thumbnailUrl}
      />
    );
  }

  // Determine what overlay to show
  let overlayComponent = null;
  
  // Click-to-play mode: show thumbnail overlay when not playing
  if (thumbnailUrl && supportsOverlay && clickToPlay && !isPlaying) {
    overlayComponent = (
      <ThumbnailOverlay
        thumbnailUrl={thumbnailUrl}
        streamName={streamName}
        onPlay={handlePlay}
        showUnmuteMessage={false}
        isPlaying={isPlaying}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10
        }}
      />
    );
  }
  // Autoplay muted mode: show simple overlay when muted
  else if (supportsOverlay && autoplayMuted && isMuted && isPlaying) {
    overlayComponent = (
      <ThumbnailOverlay
        thumbnailUrl={null} // No thumbnail image for autoplay muted
        streamName={streamName}
        onPlay={handlePlay}
        showUnmuteMessage={true}
        isPlaying={isPlaying}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10
        }}
      />
    );
  }

  // Always render player, conditionally render overlay on top
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {playerComponent}
      {overlayComponent}
    </div>
  );
};

export default Player; 