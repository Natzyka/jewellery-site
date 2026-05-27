"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollingImages() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingStateRef = useRef(false);
  const SCROLL_SPEED = 520;

  const images = [
    "/sculpture5.png",
    "/1.webp",
    "/19.webp",
    "/20.webp",
    "/21.webp",
    "/devil4.webp",
    "/22.webp",
    "/23.webp",
    "/26.webp",
    "/image31.webp",
    "/devil2.webp",
    "/2.webp",
    "/image2.webp",
    "/3.webp",
    "/image36.webp",
    "/devil5.webp",
    "/image51.webp",
    "/image45.webp",
    "/4.webp",
    "/6.webp",
    "/devil6.webp",
    "/image22.webp",
    "/image3.webp",
    "/image37.webp",
    "/7.webp",
    "/devil4.webp",
    "/8.webp",
    "/27.webp",
    "/image38.webp",
    "/11.webp",
    "/devil2.webp",
    "/12.webp",
    "/13.webp",
    "/image33.webp",
    "/image40.webp",
    "/37.webp",
    "/28.webp",
    "/29.webp",
    "/30.webp",
    "/31.webp",
    "/33.webp",
    "/34.webp",
    "/41.webp",
    "/41.webp",
    "/39.webp",
    "/40.webp",
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
      `}</style>

      <div
        className={`relative z-0 scroll-images ${
          isScrolling ? "scrolling" : ""
        }`}
      >
        <div className="scroll-track">
          {[0, 1].map((groupIndex) => (
            <div
              key={groupIndex}
              className="flex flex-col items-center gap-[30px] py-[22px] sm:gap-[42px] sm:py-[30px] lg:gap-[56px] lg:py-[40px]"
            >
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
