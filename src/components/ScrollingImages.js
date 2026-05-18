"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/sculpture5.png",
  "/image45.webp",
  "/image1.webp",
  "/image31.webp",
  "/image2.webp",
  "/image36.webp",
  "/image51.webp",
  "/devil4.webp",
  "/image44.webp",
  "/image22.webp",
  "/image3.webp",
  "/image37.webp",
  "/devil2.webp",
  "/image32.webp",
  "/image38.webp",
  "/image33.webp",
  "/image5.webp",
  "/image42.webp",
  "/image43.webp",
  "/devil5.webp",
  "/image40.webp",
  "/image34.webp",
  "/devil6.webp",
  "/image41.webp",
];

export default function ScrollingImages() {
  const [isScrolling, setIsScrolling] = useState(false);
  const SCROLL_SPEED = 666;

  useEffect(() => {
    let settleTimeout = null;

    const markScrolling = () => {
      setIsScrolling(true);

      if (settleTimeout) {
        window.clearTimeout(settleTimeout);
      }

      settleTimeout = window.setTimeout(() => {
        setIsScrolling(false);
      }, 140);
    };

    const handleScroll = () => {
      markScrolling();
    };

    const handleWheel = () => {
      markScrolling();
    };

    const handleTouchMove = () => {
      markScrolling();
    };

    const handleKeyDown = (event) => {
      const scrollingKeys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " ",
      ];

      if (scrollingKeys.includes(event.key)) {
        markScrolling();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (settleTimeout) {
        window.clearTimeout(settleTimeout);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
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
        .scroll-track {
          animation: scroll ${SCROLL_SPEED}s linear infinite;
          transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scroll-track--inverted {
          filter: invert(1);
        }
        .scroll-images img {
          backface-visibility: hidden;
        }
        .scroll-track--normal {
          opacity: 0;
        }
        .scroll-track--inverted {
          opacity: 1;
        }
        .scroll-images.scrolling .scroll-track--normal {
          opacity: 1;
        }
        .scroll-images.scrolling .scroll-track--inverted {
          opacity: 0;
        }
      `}</style>

      <div
        className={`relative z-0 flex flex-col items-center gap-[56px] py-[40px] scroll-images ${
          isScrolling ? "scrolling" : ""
        }`}
      >
        <div className="absolute inset-0 z-0 flex flex-col items-center gap-[56px] py-[40px] scroll-track scroll-track--normal">
          {[...IMAGES, ...IMAGES].map((src, index) => (
            <img
              key={`${src}-normal-${index}`}
              src={src}
              alt=""
              className="w-[88vw] sm:w-[58vw] lg:w-[48vw] object-cover select-none"
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-[56px] py-[40px] scroll-track scroll-track--inverted">
          {[...IMAGES, ...IMAGES].map((src, index) => (
            <img
              key={`${src}-inverted-${index}`}
              src={src}
              alt=""
              className="w-[88vw] sm:w-[58vw] lg:w-[48vw] object-cover select-none"
            />
          ))}
        </div>
      </div>
    </>
  );
}
