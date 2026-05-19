"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollingImages() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingStateRef = useRef(false);
  const SCROLL_SPEED = 520;

  const images = [
    "/sculpture5.png",
    "/image45.webp",
    "/1.webp",
    "/image31.webp",
    "/2.webp",
     "/image2.webp",
    "/3.webp",
     "/image36.webp",
    "/image51.webp",
    "/devil4.webp",
    "/4.webp",
    "/5.webp",
    "/6.webp",
    "/devil4.webp",
    "/image44.webp",
    "/image22.webp",
    "/image3.webp",
    "/image37.webp",
    "/7.webp",
    "/8.webp",
    "/9.webp",
    "/devil2.webp",
    "/image32.webp",
    "/image38.webp",
    "/10.webp",
    "/11.webp",
    "/12.webp",
    "/13.webp",
    "/image33.webp",
    "/image5.webp",
    "/image42.webp",
    "/image43.webp",
    "/14.webp",
    "/15.webp",
    "/16.webp",
     "/devil5.webp",
    "/image40.webp",
    "/image34.webp",
    "/17.webp",
    "/18.webp",
    "/devil6.webp",
    "/image41.webp",
    "/19.webp",
    "/20.webp",
    "/21.webp",
    "/22.webp",
    "/23.webp",
    
  ];

  useEffect(() => {
    let animationFrame = null;
    let previousY = window.scrollY;
    let lastMovementAt = performance.now();

    const setScrollingState = (nextState) => {
      if (scrollingStateRef.current === nextState) return;
      scrollingStateRef.current = nextState;
      setIsScrolling(nextState);
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
          overflow: hidden;
        }
        .scroll-track {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          animation: scroll ${SCROLL_SPEED}s linear infinite;
        }
        .scroll-images img {
          transition: filter 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: filter;
          backface-visibility: hidden;
        }
        .scroll-images.scrolling img {
          filter: invert(1);
        }
        .scroll-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          padding: 22px 0;
        }
        @media (min-width: 640px) {
          .scroll-group {
            gap: 42px;
            padding: 30px 0;
          }
        }
        @media (min-width: 1024px) {
          .scroll-group {
            gap: 56px;
            padding: 40px 0;
          }
        }
      `}</style>

      <div
        className={`relative z-0 scroll-images ${
          isScrolling ? "scrolling" : ""
        }`}
      >
        <div className="scroll-track">
          {[0, 1].map((groupIndex) => (
            <div key={groupIndex} className="scroll-group">
              {images.map((src, index) => (
                <img
                  key={`${groupIndex}-${src}-${index}`}
                  src={src}
                  alt=""
                  className="w-[72vw] max-w-[460px] sm:w-[54vw] sm:max-w-[620px] lg:w-[44vw] lg:max-w-[760px] object-cover select-none"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
