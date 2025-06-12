import React, { useRef, useEffect, useState } from "react";
import DvdLogo from "./DvdLogo";

const AnimatedBubble = ({ index }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [size, setSize] = useState(40);
  const [opacity, setOpacity] = useState(0);

  const getRandomPosition = () => ({
    top: Math.random() * 80 + 10, // 10% to 90%
    left: Math.random() * 80 + 10, // 10% to 90%
  });

  const getRandomSize = () => Math.random() * 60 + 30; // 30px to 90px

  useEffect(() => {
    // Initial random position and size
    setPosition(getRandomPosition());
    setSize(getRandomSize());

    const animationCycle = () => {
      // Fade in
      setOpacity(0.3);
      
      setTimeout(() => {
        // Fade out
        setOpacity(0);
        
        setTimeout(() => {
          // Move to new random position with new size while invisible
          setPosition(getRandomPosition());
          setSize(getRandomSize());
          // Start next cycle after a brief delay to ensure position change is complete
          setTimeout(() => {
            animationCycle();
          }, 100);
        }, 1000); // Wait for fade out to complete
      }, 2000 + Math.random() * 2000); // Stay visible for 2-4 seconds
    };

    // Start the animation cycle with staggered timing
    const timeout = setTimeout(animationCycle, index * 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [index]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${position.top}%`,
        left: `${position.left}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
        opacity: opacity,
        transition: "opacity 1s ease-in-out",
        pointerEvents: "none",
      }}
    />
  );
};

const CenterLogo = ({ containerRef, scale = 0.2 }) => {
  const [logoSize, setLogoSize] = useState(100);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const minDimension = Math.min(containerWidth, containerHeight);
      setLogoSize(minDimension * scale);
    }
  }, [containerRef, scale]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate distance from center
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If mouse is close to logo, move it away
    const maxDistance = logoSize * 1.5; // Detection radius
    if (distance < maxDistance && distance > 0) {
      const pushStrength = (maxDistance - distance) / maxDistance;
      const pushDistance = 50 * pushStrength; // Max push distance
      
      // Normalize direction and apply push
      const pushX = -(deltaX / distance) * pushDistance;
      const pushY = -(deltaY / distance) * pushDistance;
      
      setOffset({ x: pushX, y: pushY });
      setIsHovered(true);
    } else {
      setOffset({ x: 0, y: 0 });
      setIsHovered(false);
    }
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [logoSize, containerRef]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        transition: "transform 0.3s ease-out",
      }}
    >
      {/* Pulsing circle background */}
      <div
        style={{
          position: "absolute",
          width: `${logoSize * 1.4}px`,
          height: `${logoSize * 1.4}px`,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          animation: isHovered ? "logoPulse 1s ease-in-out infinite" : "logoPulse 3s ease-in-out infinite",
          transform: isHovered ? "scale(1.2)" : "scale(1)",
          transition: "transform 0.3s ease-out",
        }}
      />
      
      {/* Logo */}
      <img
        src="/mist.svg"
        alt="Mist Logo"
        style={{
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          position: "relative",
          zIndex: 1,
          filter: isHovered 
            ? "drop-shadow(0 6px 12px rgba(0,0,0,0.4)) brightness(1.1)" 
            : "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          transition: "all 0.3s ease-out",
          cursor: "pointer",
        }}
      />
    </div>
  );
};

const LoadingScreen = ({ message = "Waiting for source..." }) => {
  const containerRef = useRef(null);

  // Inject CSS animations
  useEffect(() => {
    const styleId = 'loading-screen-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.2;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "300px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      {/* Animated background bubbles */}
      {[0, 1, 2, 3, 4].map((index) => (
        <AnimatedBubble key={index} index={index} />
      ))}

      {/* Center Logo with pulsing background */}
      <CenterLogo containerRef={containerRef} scale={0.15} />

      {/* Bouncing DVD Logo */}
      <DvdLogo parentRef={containerRef} scale={0.08} />

      {/* Loading text */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "18px",
          fontWeight: "500",
          textAlign: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          animation: "fadeInOut 2s ease-in-out infinite",
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default LoadingScreen; 