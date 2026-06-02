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
            fontSize: "clamp(28px, 8vw, 90px)",
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
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] right-[16px] z-30 border border-black bg-black px-5 py-3 text-[10px] tracking-[0.25em] text-white transition-all duration-300 hover:bg-white hover:text-black sm:bottom-[20px] sm:right-[20px] sm:py-2"
        >
          CLOSE
        </button>

        <div
          ref={viewportRef}
          className="absolute inset-0 overflow-hidden cursor-grab select-none touch-pan-y"
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
  const [isScrolling, setIsScrolling] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({
    type: "",
    text: "",
  });

  const handleSubscribe = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setFormMessage({
        type: "error",
        text: "Please enter your email address.",
      });
      return;
    }

    if (!consent) {
      setFormMessage({
        type: "error",
        text: "Please agree to receive marketing emails before subscribing.",
      });
      return;
    }

    setIsSubmitting(true);
    setFormMessage({
      type: "",
      text: "",
    });

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          consent: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setFormMessage({
        type: "success",
        text: "You're subscribed. Keep an eye on your inbox.",
      });
      setEmail("");
      setConsent(false);
    } catch (error) {
      setFormMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <>
  <SmoothScroll />
    
    <main
      className={`relative min-h-screen w-screen overflow-x-hidden transition-colors duration-300 ${
        isScrolling ? "bg-black text-white" : "bg-[#f5f4f0] text-black"
      }`}
    >

      {/* LEFT LOGO */}
<div
  className="
  fixed
  z-20
  left-[20px]
  top-1/2
  -translate-y-1/2
  max-[720px]:left-1/2
  max-[720px]:top-[18px]
  max-[720px]:-translate-x-1/2
  max-[720px]:translate-y-0
 "
>
  <img
    src={isScrolling ? "/logo-white.png" : "/logo-black.png"}
    alt="Studio Somniferia"
    className="
      w-[220px]
      sm:w-[260px]
      max-[720px]:w-[132px]
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
  ${isScrolling ? "text-white" : "text-black"}
  max-[720px]:right-[16px]
  max-[720px]:top-1/2
  max-[720px]:w-[150px]
  max-[720px]:translate-y-[-50%]
  max-[720px]:text-right
  max-[720px]:landscape:right-[18px]
  max-[720px]:landscape:w-[170px]
`}
>

        <h2
className="
text-[22px]
font-black
uppercase
tracking-[0.02em]

max-[720px]:text-[14px]
max-[720px]:landscape:text-[15px]
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

max-[720px]:text-[8px]
max-[720px]:leading-[1.65]
max-[720px]:landscape:text-[8.5px]
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
<ScrollingImages onScrollStateChange={setIsScrolling} />

      {/* BOTTOM LEFT */}
      <button
        onClick={() => setPanelOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] left-[16px] z-30 border border-black bg-black px-4 py-3 text-[10px] tracking-[0.25em] text-white transition-colors duration-300 hover:bg-white hover:text-black sm:bottom-[20px] sm:left-[20px] sm:py-2"
      >
        SIGN UP
      </button>

      {/* BOTTOM RIGHT */}
      <button
  onClick={() => setArtistsOpen(true)}
  className="
  fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] right-[16px]
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
  sm:bottom-[20px]
  sm:right-[20px]
  max-[720px]:py-3
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
        className={`fixed left-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col overflow-y-auto bg-white px-6 py-8 text-black transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-12 sm:py-10 ${
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
            className={`${cinzel.className} text-center text-[30px] leading-[0.95] tracking-[-0.04em] sm:text-[42px]`}
          >
            BE THE FIRST TO HEAR ABOUT NEW PIECES AND{" "}
            <span className="italic">STUDIO</span> NEWS.
          </h2>

          <form className="mt-10 flex flex-col sm:mt-14" onSubmit={handleSubscribe}>

            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-b border-black bg-transparent pb-4 text-center text-[15px] outline-none placeholder:text-[#888] sm:text-[16px]"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 bg-black py-4 text-[11px] tracking-[0.24em] text-white transition-colors duration-300 hover:bg-white hover:text-black border border-black"
            >
              {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </button>

            <label className="mt-6 flex items-start gap-3 text-[12px] leading-6 text-black sm:gap-4 sm:text-[14px] sm:leading-7">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4 appearance-none rounded-[2px] border border-black bg-white checked:bg-black sm:h-5 sm:w-5"
              />
              <span>
                I agree to receive marketing emails from Studio Somniferia.
                You can unsubscribe at any time. View our{" "}
                <a href="#" className="underline underline-offset-2">
                  Privacy Policy.
                </a>
              </span>
            </label>

            {formMessage.text ? (
              <p
                className={`mt-4 text-center text-[12px] leading-5 sm:text-[13px] ${
                  formMessage.type === "error" ? "text-[#b42318]" : "text-[#155724]"
                }`}
              >
                {formMessage.text}
              </p>
            ) : null}

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
