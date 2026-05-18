"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollingImages({ onScrollStateChange }) {
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingStateRef = useRef(false);
  const scrollStateCallbackRef = useRef(onScrollStateChange);
  const SCROLL_SPEED = 666;

  const images = [
    "/sculpture5.png",
    "/image45.jpeg",
    "/image1.png",
    "/1.jpeg",
    "/image31.png",
    "/2.jpeg",
     "/image2.png",
    "/3.jpeg",
     "/image36.png",
    "/image51.png",
    "/devil4.png",
    "/4.jpeg",
    "/5.jpeg",
    "/6.jpeg",
    "/devil4.png",
    "/image44.jpeg",
    "/image22.png",
    "/image3.png",
    "/image37.png",
    "/7.jpeg",
    "/8.jpeg",
    "/9.jpeg",
    "/devil2.png",
    "/image32.png",
    "/image38.png",
    "/10.jpeg",
    "/11.jpeg",
    "/12.jpeg",
    "/13.jpeg",
    "/image4.png",
    "/image33.png",
    "/image5.png",
    "/image42.jpeg",
    "/image43.jpeg",
    "/14.jpeg",
    "/15.jpeg",
    "/16.jpeg",
     "/devil5.png",
    "/image40.png",
    "/image34.png",
    "/17.jpeg",
    "/18.jpeg",
    "/devil6.png",
    "/image41.png",
    "/19.jpeg",
    "/20.jpeg",
    "/21.jpeg",
    "/22.jpeg",
    "/23.jpeg",
    "/24.jpeg",
    
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
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -50%, 0);
          }
        }
        .scroll-images {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .scroll-images img {
          transition: filter 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: filter;
          backface-visibility: hidden;
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
