"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollingImages({ onScrollStateChange }) {
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingStateRef = useRef(false);
  const scrollStateCallbackRef = useRef(onScrollStateChange);
  const SCROLL_SPEED = 666;

  const images = [
    "/devillogo.png",
   "/image1.png",
   "/size4.png",
  "/image2.png",
   "/image28.png",
    "/teeth21.png",
     "/image44.jpeg",
    "/image35.png",
    "/teeth24.png",
    "/image45.jpeg",
   
  "/devil.png",
  "/image31.png",
   "/image36.png",
    
    
  "/razor.png",
  "/image3.png",
  "/image37.png",
  "/teeth1.png",
  "/image32.png",
  "/devil2.png",
  "/image38.png",
  "/image4.png",
  "/pinterest2.png",
  "/image33.png",
"/devil4.png",
  "/image5.png",
  "/snake1.png",

  "/image6.png",
  "/size.png",
   "/image26.png",
    "/teeth20.png",
 "/image42.jpeg",
    "/image27.png",
   "/image43.jpeg",
   "/image30.png",
"/devil5.png",
  "/image7.png",
  "/teeth15.png",
"/image39.png",
    "/image40.png",
    "/image41.png",
  "/image8.png",
  "/size3.png",
  "/image34.png",
"/devil6.png",
  "/image9.png",
   "/image46.png",
    "/image47.jpeg",
    "/image48.jpeg",
    "/image49.jpeg",
    "/pinterest5.png",
    "/image50.jpeg",
    "/image51.png",
    "/image52.png",
  "/sculpture5.png",
  "/image10.png",
  "/teeth23.png",
 "/image53.jpeg",
    "/image54.jpeg",
    "/image55.jpeg",
    "/image25.png",
    "/pinterest3.png",
    "/image56.jpeg",
  "/image11.png",
  "/devil4.png",
  "/image12.png",
  "/size2.png",
  "/image13.png",
  "/teeth22.png",
 "/image24.png",
    "/sculpture6.png",
  "/image17.png",
  "/pinterest6.png",
  "/image18.png",
  "/size1.png",
  "/image22.png",
   
  ];

  useEffect(() => {
    scrollStateCallbackRef.current = onScrollStateChange;
  }, [onScrollStateChange]);

  useEffect(() => {
    let animationFrame = null;
    let previousY = window.scrollY;
    let lastMovementAt = performance.now();

    const setScrollingState = (nextState) => {
      if (scrollingStateRef.current === nextState) return;
      scrollingStateRef.current = nextState;
      setIsScrolling(nextState);
      scrollStateCallbackRef.current?.(nextState);
    };

    const monitorScrollMotion = () => {
      const currentY = window.scrollY;
      const now = performance.now();
      const delta = Math.abs(currentY - previousY);

      if (delta > 0.08) {
        lastMovementAt = now;
        setScrollingState(true);
      } else if (scrollingStateRef.current && now - lastMovementAt > 180) {
        setScrollingState(false);
      }

      previousY = currentY;
      animationFrame = window.requestAnimationFrame(monitorScrollMotion);
    };

    animationFrame = window.requestAnimationFrame(monitorScrollMotion);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .scroll-images {
          transition: background 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scroll-images.scrolling {
          background: black;
        }
        .scroll-images img {
          transition: filter 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: filter;
        }
        .scroll-images.scrolling img {
          filter: invert(1);
        }
        .scroll-images{
          animation: scroll ${SCROLL_SPEED}s linear infinite;
          }
      `}</style>

      <div
        ref={containerRef}
        className={`relative z-0 flex flex-col items-center gap-[56px] py-[40px] scroll-images ${
          isScrolling ? "scrolling" : ""
        }`}
      >
        {[...images, ...images].map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            className="w-[88vw] sm:w-[58vw] lg:w-[48vw] object-cover select-none"
          />
        ))}
      </div>
    </>
  );
}
