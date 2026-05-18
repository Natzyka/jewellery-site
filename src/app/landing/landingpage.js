"use client";

import { useEffect, useRef, useState } from "react";
import { Cinzel } from "next/font/google";
import SmoothScroll from "../../components/SmoothScroll";
import ScrollingImages from "../../components/ScrollingImages";


const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ARTISTS_PANEL_LINES = [
  "Studio Somniferia",
  "Small independent",
  "Jewellery studio",
  "Creating handcrafted pieces",
  "Shaped by texture",
  "Form and individuality",
  "Working between jewellery",
  "And object-making",
  "Personalised works",
  "Artist collaborations",
  "Workshops in Paris",
  "Experimentation",
  "And self-expression",
];

function ArtistsOverlay({ isOpen, onClose, items }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const motionRef = useRef({
    y: 0,
    velocity: 0,
    dragging: false,
    lastY: 0,
    historyY: [],
    historyT: [],
    totalHeight: 0,
  });

  useEffect(() => {
    if (!isOpen) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track || items.length === 0) return;

    const isMobile = window.innerWidth <= 720;
    const friction = isMobile ? 0.9 : 0.92;
    const autoSpeed = isMobile ? 0.45 : 0.7;
    const wheelGain = isMobile ? 0.26 : 0.38;
    const state = motionRef.current;
    let animationFrame = null;

    const updateTrackMetrics = () => {
      state.totalHeight = track.scrollHeight / 2;
    };

    const updateTransforms = () => {
      if (!state.totalHeight) return;

      const wrappedY =
        ((state.y % state.totalHeight) + state.totalHeight) % state.totalHeight;

      track.style.transform = `translateY(${-wrappedY}px)`;

      const viewportHeight = viewport.clientHeight;
      const viewportCenter = viewportHeight / 2;

      track.querySelectorAll("[data-artist-card]").forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const normalizedDistance = (centerY - viewportCenter) / (viewportHeight / 2);
        const clamped = Math.max(-1, Math.min(1, normalizedDistance));
        const rotation = clamped * 90;
        const focus = 1 - Math.min(1, Math.abs(clamped));
        const opacity = 0.24 + focus * 0.76;
        const scale = 0.92 + focus * 0.08;

        element.style.transform = `rotateY(${rotation}deg) scale(${scale})`;
        element.style.opacity = `${opacity}`;
      });
    };

    const startDrag = (clientY) => {
      state.dragging = true;
      state.lastY = clientY;
      state.velocity = 0;
      state.historyY = [];
      state.historyT = [];
      viewport.style.cursor = "grabbing";
    };

    const moveDrag = (clientY) => {
      if (!state.dragging) return;

      const now = performance.now();
      state.y += clientY - state.lastY;
      state.lastY = clientY;
      state.historyY.push(clientY);
      state.historyT.push(now);

      while (state.historyT.length && now - state.historyT[0] > 100) {
        state.historyY.shift();
        state.historyT.shift();
      }
    };

    const endDrag = () => {
      if (!state.dragging) return;

      state.dragging = false;
      viewport.style.cursor = "grab";

      const { historyY, historyT } = state;
      if (historyT.length > 1) {
        const firstIndex = 0;
        const lastIndex = historyT.length - 1;
        const deltaTime = historyT[lastIndex] - historyT[firstIndex];

        if (deltaTime > 0) {
          state.velocity = ((historyY[lastIndex] - historyY[firstIndex]) / deltaTime) * 10.5;
        }
      }
    };

    const handleWheel = (event) => {
      event.preventDefault();
      state.velocity -= event.deltaY * 0.05 * wheelGain;
    };

    const handleMouseDown = (event) => startDrag(event.clientY);
    const handleMouseMove = (event) => moveDrag(event.clientY);
    const handleTouchStart = (event) => startDrag(event.touches[0].clientY);
    const handleTouchMove = (event) => {
      if (event.cancelable) event.preventDefault();
      moveDrag(event.touches[0].clientY);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const tick = () => {
      if (!state.dragging) {
        state.velocity *= friction;
        state.y -= autoSpeed;
        state.y += state.velocity;
      }

      updateTransforms();
      animationFrame = requestAnimationFrame(tick);
    };

    updateTrackMetrics();
    state.y = Math.max(0, (viewport.clientHeight - state.totalHeight / items.length) / 2);
    updateTransforms();

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", endDrag);
    viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
    viewport.addEventListener("touchend", endDrag);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateTrackMetrics);

    animationFrame = requestAnimationFrame(tick);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", endDrag);
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchmove", handleTouchMove);
      viewport.removeEventListener("touchend", endDrag);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateTrackMetrics);
    };
  }, [isOpen, items, onClose]);

  const renderArtistCard = (item, key) => {
    const label = item.toUpperCase();
    const splitIndex = label.indexOf(" ");
    const firstWord = splitIndex === -1 ? label : label.slice(0, splitIndex);
    const remainingText = splitIndex === -1 ? "" : label.slice(splitIndex);

    return (
      <div
        key={key}
        className="flex items-center justify-center pointer-events-none"
      >
        <span
          data-artist-card
          className={cinzel.className}
          style={{
            background: "#fff",
            color: "#000",
            padding: "10px 10px 15px",
            fontWeight: 400,
            letterSpacing: "-0.25vw",
            fontSize: "clamp(46px, 6.2vw, 90px)",
            lineHeight: 0.8,
            whiteSpace: "pre-wrap",
            textAlign: "center",
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            display: "inline-block",
          }}
        >
          <span style={{ fontStyle: "italic" }}>{firstWord}</span>
          {remainingText}
        </span>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-white/55 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={onClose}
          className="fixed bottom-[20px] right-[20px] z-30 border border-black bg-black px-5 py-2 text-[10px] tracking-[0.25em] text-white transition-all duration-300 hover:bg-white hover:text-black"
        >
          CLOSE
        </button>

        <div
          ref={viewportRef}
          className="absolute inset-0 overflow-hidden cursor-grab select-none"
          style={{ perspective: "1200px" }}
        >
          <div
            ref={trackRef}
            className="flex flex-col will-change-transform"
            style={{ opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease" }}
          >
            {items.map((item, index) => renderArtistCard(item, index))}
            {items.map((item, index) => renderArtistCard(item, `duplicate-${index}`))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function LandingPage() {

  const [panelOpen, setPanelOpen] = useState(false);
  const [artistsOpen, setArtistsOpen] = useState(false);
  

  return (
    <>
  <SmoothScroll />
    
    <main className="relative min-h-screen w-screen bg-[#f5f4f0] text-black">

      {/* LEFT LOGO */}
<div
  className="
  fixed
  z-20

  left-[20px]
  top-1/2
  -translate-y-1/2

  max-[720px]:left-1/2
  max-[720px]:top-[20px]
  max-[720px]:-translate-x-1/2
  max-[720px]:translate-y-0
 "
>
  <img
    src="/logo-black.png"
    alt="Studio Somniferia"
    className="
      w-[220px]
      sm:w-[260px]
      max-[720px]:w-[160px]
    "
  />
</div>

      {/* RIGHT INFO */}
      <div
  className={`
  fixed
  right-[20px]
  top-1/2
  z-20
  -translate-y-1/2
  text-right

  max-[720px]:top-auto
  max-[720px]:bottom-[90px]
  max-[720px]:translate-y-0
  max-[720px]:w-[170px]

  text-black
`}
>

        <h2
className="
text-[22px]
font-black
uppercase
tracking-[0.02em]

max-[720px]:text-[18px]
"
>
          Cannes Lions
        </h2>

        <div
className="
mt-7
text-[10px]
tracking-[0.18em]
leading-[1.9]
uppercase

max-[720px]:text-[9px]
"
>
          Pinterest
          <br />
          Carlton Beach Club
          <br />
          22-26th June 2026
          <br />
          
        </div>

      </div>

      {/* CENTER VISUAL */}
     {/* SCROLLING IMAGE COLUMN */}
<ScrollingImages />

      {/* BOTTOM LEFT */}
      <button
        onClick={() => setPanelOpen(true)}
        className="fixed bottom-[20px] left-[20px] z-30 border border-black bg-black px-4 py-2 text-[10px] tracking-[0.25em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
      >
        SIGN UP
      </button>

      {/* BOTTOM RIGHT */}
      <button
  onClick={() => setArtistsOpen(true)}
  className="
  fixed bottom-[20px] right-[20px]
  z-30
  border border-black
  bg-black
  px-4 py-2
  text-[10px]
  tracking-[0.25em]
  text-white
  transition-all
  duration-300
  hover:bg-white
  hover:text-black
"
>
  STUDIO
</button>

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-500 ${
          panelOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setPanelOpen(false)}
      />

      {/* NEWSLETTER PANEL */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col bg-white text-black px-8 py-10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-12 ${
          panelOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* CLOSE */}
        <div className="flex justify-end">

          <button
            onClick={() => setPanelOpen(false)}
            className="text-[11px] tracking-[0.2em]"
          >
            CLOSE
          </button>

        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col justify-center">

          <h2
            className={`${cinzel.className} text-center text-[42px] leading-[0.95] tracking-[-0.04em]`}
          >
            BE THE FIRST TO HEAR ABOUT NEW PIECES AND{" "}
            <span className="italic">STUDIO</span> NEWS.
          </h2>

          <form className="mt-14 flex flex-col">

            <input
              type="email"
              placeholder="Your email address"
              className="border-b border-black bg-transparent pb-4 text-center text-[16px] outline-none placeholder:text-[#888]"
            />

            <button
              type="submit"
              className="mt-6 bg-black py-4 text-[11px] tracking-[0.24em] text-white transition-colors duration-300 hover:bg-white hover:text-black border border-black"
            >
              SUBSCRIBE
            </button>

          </form>

        </div>

      </aside>

      <ArtistsOverlay
        isOpen={artistsOpen}
        onClose={() => setArtistsOpen(false)}
        items={ARTISTS_PANEL_LINES}
      />

    </main>
    </>
  );
}
