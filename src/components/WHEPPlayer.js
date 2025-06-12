import React, { useRef, useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

const WHEPPlayer = ({
  whepUrl,
  autoPlay = true,
  onError = null,
  onConnected = null,
  onDisconnected = null
}) => {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleError = (err) => {
    console.error("WHEP Player error:", err);
    setError(err.message || "Connection failed");
    setIsLoading(false);
    if (onError) onError(err);
  };

  const cleanup = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setIsConnected(false);
    setIsLoading(false);
  };

  const startWHEPPlayback = async (url) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ]
      });
      pcRef.current = pc;

      // Handle incoming streams
      pc.ontrack = (event) => {
        console.log("Received track:", event.track.kind);
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsLoading(false);
          setIsConnected(true);
          if (onConnected) onConnected();
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
          handleError(new Error("Connection lost"));
          if (onDisconnected) onDisconnected();
        }
      };

      // Create offer for WHEP (receive only)
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to WHEP endpoint
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        throw new Error(`WHEP request failed: ${response.status} ${response.statusText}`);
      }

      const answerSdp = await response.text();
      const answer = new RTCSessionDescription({
        type: "answer",
        sdp: answerSdp,
      });

      await pc.setRemoteDescription(answer);

      // Store session URL for cleanup
      const sessionUrl = response.headers.get("Location");
      if (sessionUrl) {
        pc._whepSessionUrl = sessionUrl;
      }

    } catch (err) {
      handleError(err);
    }
  };

  useEffect(() => {
    if (!whepUrl) {
      setError("No WHEP URL provided");
      return;
    }

    startWHEPPlayback(whepUrl);

    return () => {
      // Cleanup session
      if (pcRef.current && pcRef.current._whepSessionUrl) {
        fetch(pcRef.current._whepSessionUrl, { method: "DELETE" }).catch(console.warn);
      }
      cleanup();
    };
  }, [whepUrl]);

  if (error) {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        borderRadius: "8px",
        color: "#d32f2f",
        fontSize: "16px",
        textAlign: "center",
        padding: "20px"
      }}>
        <div>
          <div style={{ marginBottom: "10px", fontSize: "18px", fontWeight: "bold" }}>
            Connection Error
          </div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
          <LoadingScreen message="Connecting to stream..." />
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay={autoPlay}
        playsInline
        controls
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
          borderRadius: "8px",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease"
        }}
      />

      {isConnected && (
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(76, 175, 80, 0.9)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold"
        }}>
          LIVE
        </div>
      )}
    </div>
  );
};

export default WHEPPlayer; 