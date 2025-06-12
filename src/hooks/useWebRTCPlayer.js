import { useState, useEffect, useRef, useCallback } from "react";
import useSignaling from "./useWebRTCSignaling";

/*
  WebRTC Canvas Player

  @param props (object)
  - uri (string):               WSS URL
  - streamBitrate (function):   desired bitrate of shown video track
  - canvas (object):            reference to a canvas object we can render the preview in
 */
const useWebRTCPlayer = (props) => {
  // Ready for the WebRTC connection for as long as we are connected to the signaling WebSocket
  const [isReady, setReady] = useState(false);
  // Reference to the WebRTC connection
  const peerConnRef = useRef(null);

  // Callback functions to interact with the WebRTC signalling hook

  function onSignalingConnected() {
    setReady(true);
  }

  function onSignalingDisconnected() {
    setReady(false);
  }

  function onSignalingSdp(ev) {
    var answer = { type: "answer", sdp: ev.answer_sdp };
    peerConnRef.current
      .setRemoteDescription(answer)
      .then(null, onSignalingAnswerError);
  }

  function onSignalingAnswerError(error) {
    console.error(error);
  }

  function onSignalingError(ev) {
    console.error(ev.message);
  }

  // Memoize the onEvent callback to prevent infinite loops
  const onEvent = useCallback((ev) => {
    switch (ev.type) {
      case "on_connected": {
        onSignalingConnected();
        break;
      }
      case "on_disconnected": {
        onSignalingDisconnected();
        break;
      }
      case "on_answer_sdp": {
        onSignalingSdp(ev);
        break;
      }
      case "on_video_bitrate": {
        break;
      }
      case "on_error": {
        onSignalingError(ev);
        break;
      }
      case "on_media_receive": {
        break;
      }
      case "on_message": {
        break;
      }
      case "on_time": {
        break;
      }
      default: {
        console.warn("Unhandled event:", ev.type, ev);
        break;
      }
    }
  }, []);

  // Open websocket for signaling (moved after onEvent definition)
  const [sendVideoBitrate, sendOfferSDP, sendStop, sendSeek] = useSignaling({
    uri: props.uri,
    onEvent: onEvent,
  });

  // Connect to WebRTC after signalling is connected
  useEffect(() => {
    if (!isReady) {
      return;
    }

    var onOfferError = (err) => {
      console.error(err);
    };

    var onCreateOffer = (offer) => {
      peerConnRef.current.setLocalDescription(offer).then(() => {
        sendOfferSDP(offer.sdp);
        sendVideoBitrate(props.streamBitrate);
      }, onOfferError);
    };

    // Go go gadget autoplay
    var onVideoLoaded = () => {
      props.canvasRef.current.play();
    };
    props.canvasRef.current.autoplay = true;
    props.canvasRef.current.addEventListener("loadeddata", onVideoLoaded);

    // Set up WebRTC connection
    peerConnRef.current = new RTCPeerConnection();
    peerConnRef.current.ontrack = (ev) => {
      // Load the first available track onto the passed canvas element
      props.canvasRef.current.srcObject = ev.streams[0];
    };
    var opt = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };
    peerConnRef.current.createOffer(opt).then(onCreateOffer, onOfferError);
  }, [isReady, sendOfferSDP, sendVideoBitrate, props.streamBitrate, props.canvasRef]);
};

export default useWebRTCPlayer;