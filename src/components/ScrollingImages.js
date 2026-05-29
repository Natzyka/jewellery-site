"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollingImages() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingStateRef = useRef(false);
  const settleTimeoutRef = useRef(null);
  const SCROLL_SPEED = 340;

  const images = [
    "/sculpture5.webp",
    "/19.webp",
    "/20.webp",
    "/21.webp",
    "/devil4.webp",
    "/22.webp",
    "/23.webp",
    "/26.webp",
    "/devil2.webp",
    "/scroll/4037.webp",
    "/scroll/406.webp",
    "/3.webp",
    "/12.webp",
    "/devil5.webp",
    "/scroll/403.webp",
    "/scroll/4018.webp",
    "/scroll/4011.webp",
    "/scroll/4015.webp",
    "/devil6.webp",
    "/image22.webp",
    "/scroll/4019.webp",
    "/scroll/4032.webp",
    "/scroll/4040.webp",
    "/devil4.webp",
    "/scroll/401.webp",
    "/scroll/4026.webp",
    "/image33.webp",
    "/image40.webp",
    "/devil2.webp",
    "/scroll/408.webp",
    "/scroll/4025.webp",
    "/scroll/4039.webp",
    "/scroll/4012.webp",
    "/devil6.webp",
    "/scroll/4020.webp",
  ];

  useEffect(() => {
    const setScrollingState = (nextState) => {
      if (scrollingStateRef.current === nextState) return;
      scrollingStateRef.current = nextState;
      setIsScrolling(nextState);
    };

    const handleScroll = () => {
      setScrollingState(true);

      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current);
      }

      settleTimeoutRef.current = window.setTimeout(() => {
        setScrollingState(false);
        settleTimeoutRef.current = null;
      }, 140);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current);
        settleTimeoutRef.current = null;
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
