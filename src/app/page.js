"use client";

import { useEffect, useRef, useState } from "react";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const IMAGE_LIST = [
  "/size4.png",
  "/razor.png",
  "/teeth1.png",
  "/size2.png",
  "/snake1.png",
  "/earring14.png",
  "/teeth15.png",
  "/size3.png",
  "/earring17.png",
  "/teeth23.png",
  "/earring9.png",
  "/sculpture5.png",
  "/size.png",
  "/devil4.png",
  "/pinterest2.png",
  "/teeth22.png",
  "/earring12.png",
  "/earring3.png",
  "/pinterest6.png",
  "/size1.png",
  "/sculpture3.png",
  "/pinterest5.png",
  "/earring8.png",
  "/earring10.png",
  "/sculpture6.png",
  "/pinterest3.png",
  "/earring16.png",
  "/earring1.png",
  "/teeth20.png",
  "/sculpture4.png",
  "/teeth24.png",
  "/earring7.png",
  "/teeth21.png",
  "/gemrings.png",
  "/teeth18.png"
];

const TOTAL_ROWS = 11;
const TOTAL_COLUMNS = 11;
const STEP_X = 408;
const STEP_Y = 296;
const ROW_STAGGER = 0;
const BASE_SIZE = 112;
const DRIFT_X = 0.018;
const DRIFT_Y = 0.012;
const DEFAULT_VIEWPORT_LAYOUT = {
  stageClass:
    "absolute left-1/2 top-1/2 h-[98vh] w-[98vw] max-w-[1720px] -translate-x-1/2 -translate-y-1/2",
  stepX: STEP_X,
  stepY: STEP_Y,
  rowStagger: ROW_STAGGER,
  logoClass: "w-[min(58vw,520px)]",
  signupButtonClass:
    "fixed bottom-12 left-1/2 z-30 -translate-x-1/2 border border-black bg-white px-4 py-1.5 text-[10px] tracking-[0.32em] text-black mix-blend-difference",
};

function wrap(value, min, max) {
  const range = max - min;
  if (range === 0) return min;
  return ((((value - min) % range) + range) % range) + min;
}

function getCenterFocus(x, y, width, height) {
  const nx = x / (width / 2);
  const ny = y / (height / 2);
  const distance = Math.sqrt(nx * nx + ny * ny);
  const normalized = Math.min(distance, 1.02) / 1.02;
  const falloff = Math.pow(Math.max(0, 1 - normalized), 0.42);
  const isDesktopViewport =
    typeof window !== "undefined" ? window.innerWidth > 900 : true;
  const baseScale = isDesktopViewport ? 0.72 : 0.74;
  const bulgeStrength = isDesktopViewport ? 1.34 : 1.08;

  return {
    scale: baseScale + falloff * bulgeStrength,
    opacity: 0.36 + falloff * 0.64,
  };
}

function getItemSize(src, row, column) {
  const isFramedAsset =
    src.includes("image") ||
    src.includes("pinterest") ||
    src.includes("illustration");
  const isWideVisual =
    src.includes("gemrings") || src.includes("sculpture") || src.includes("snake");
  const variance = ((row + column) % 2) * 8;

  if (isFramedAsset) {
    return BASE_SIZE - 2 + variance;
  }

  if (isWideVisual) {
    return BASE_SIZE + 10 + variance;
  }

  return BASE_SIZE + 2 + variance;
}

function getResponsiveScale() {
  if (typeof window === "undefined") return 1;

  const viewportWidth = window.innerWidth;

  if (viewportWidth <= 640) return 0.78;
  if (viewportWidth <= 900) return 0.88;

  return 1;
}

function getViewportLayout() {
  if (typeof window === "undefined") return DEFAULT_VIEWPORT_LAYOUT;

  const viewportWidth = window.innerWidth;

  if (viewportWidth <= 640) {
    return {
      stageClass:
        "absolute left-1/2 top-[52%] h-[104svh] w-[112vw] max-w-none -translate-x-1/2 -translate-y-1/2",
      stepX: 336,
      stepY: 258,
      rowStagger: 0,
      logoClass: "w-[min(72vw,360px)]",
      signupButtonClass:
        "fixed bottom-8 left-1/2 z-30 -translate-x-1/2 border border-black bg-white px-5 py-2 text-[11px] tracking-[0.28em] text-black mix-blend-difference",
    };
  }

  if (viewportWidth <= 900) {
    return {
      stageClass:
        "absolute left-1/2 top-1/2 h-[102vh] w-[104vw] max-w-none -translate-x-1/2 -translate-y-1/2",
      stepX: 364,
      stepY: 280,
      rowStagger: 0,
      logoClass: "w-[min(64vw,440px)]",
      signupButtonClass:
        "fixed bottom-10 left-1/2 z-30 -translate-x-1/2 border border-black bg-white px-4 py-1.5 text-[10px] tracking-[0.3em] text-black mix-blend-difference",
    };
  }

  return DEFAULT_VIEWPORT_LAYOUT;
}

function buildBaseItems() {
  return Array.from({ length: TOTAL_ROWS * TOTAL_COLUMNS }, (_, i) => {
    const row = Math.floor(i / TOTAL_COLUMNS);
    const column = i % TOTAL_COLUMNS;
    const src = IMAGE_LIST[i % IMAGE_LIST.length];

    return {
      id: `${row}-${column}`,
      src,
      row,
      column,
      size: getItemSize(src, row, column),
    };
  });
}

export default function Home() {
  const stageRef = useRef(null);
  const dragRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const autoMotionResumeAtRef = useRef(0);
  const backgroundTimeoutRef = useRef(null);
  const [intro, setIntro] = useState(true);
  const [introFrame, setIntroFrame] = useState(0);
  const [darkBg, setDarkBg] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sizeScale, setSizeScale] = useState(1);
  const [viewportLayout, setViewportLayout] = useState(DEFAULT_VIEWPORT_LAYOUT);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    const updateScale = () => {
      setSizeScale(getResponsiveScale());
      setViewportLayout(getViewportLayout());
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const baseItems = buildBaseItems();
  const items = baseItems.map((item) => ({
    ...item,
    size: item.size * sizeScale,
  }));

  useEffect(() => {
    let count = 0;

    const interval = setInterval(() => {
      setIntroFrame((prev) => prev + 1);
      count += 1;

      if (count >= 8) {
        clearInterval(interval);
        setTimeout(() => setFadeOut(true), 400);
        setTimeout(() => setIntro(false), 1200);
      }
    }, 350);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (intro) return;

    autoMotionResumeAtRef.current = Date.now() + 5000;

    if (backgroundTimeoutRef.current) {
      clearTimeout(backgroundTimeoutRef.current);
    }

    backgroundTimeoutRef.current = setTimeout(() => {
      setDarkBg(true);
    }, 5000);
  }, [intro]);

  useEffect(() => {
    return () => {
      if (backgroundTimeoutRef.current) {
        clearTimeout(backgroundTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || items.length === 0) return;

    const bounds = {
      width: TOTAL_COLUMNS * viewportLayout.stepX + viewportLayout.rowStagger * 2,
      height: TOTAL_ROWS * viewportLayout.stepY + viewportLayout.stepY,
    };

    const animate = () => {
      const autoMotionPaused = Date.now() < autoMotionResumeAtRef.current;

      if (!dragRef.current && !autoMotionPaused) {
        velocityRef.current.x += DRIFT_X;
        velocityRef.current.y += DRIFT_Y;
      }

      offsetRef.current.x += velocityRef.current.x;
      offsetRef.current.y += velocityRef.current.y;

      const isMobileViewport =
        typeof window !== "undefined" && window.innerWidth <= 900;
      const dragDamping = isMobileViewport ? 0.94 : 0.9;
      const idleDamping = isMobileViewport ? 0.985 : 0.975;

      velocityRef.current.x *= dragRef.current ? dragDamping : idleDamping;
      velocityRef.current.y *= dragRef.current ? dragDamping : idleDamping;

      const scrollX = wrap(offsetRef.current.x, -bounds.width / 2, bounds.width / 2);
      const scrollY = wrap(offsetRef.current.y, -bounds.height / 2, bounds.height / 2);
      const nodes = stage.querySelectorAll("[data-grid-item]");

      nodes.forEach((node, index) => {
        const item = items[index];
        if (!item) return;

        const baseX =
          item.column * viewportLayout.stepX +
          (item.row % 2 === 0 ? -viewportLayout.rowStagger : viewportLayout.rowStagger);
        const baseY = item.row * viewportLayout.stepY;
        const centeredBaseX = baseX - bounds.width / 2;
        const centeredBaseY = baseY - bounds.height / 2;

        const wrappedX = wrap(
          centeredBaseX + scrollX,
          -bounds.width / 2,
          bounds.width / 2
        );
        const wrappedY = wrap(
          centeredBaseY + scrollY,
          -bounds.height / 2,
          bounds.height / 2
        );
        const focus = getCenterFocus(
          wrappedX,
          wrappedY,
          bounds.width * 0.62,
          bounds.height * 0.62
        );

        node.style.transform = `
          translate3d(${wrappedX}px, ${wrappedY}px, 0)
          scale(${focus.scale})
        `;
        node.style.opacity = `${focus.opacity}`;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [items, viewportLayout]);

  const beginDrag = (x, y) => {
    dragRef.current = true;
    autoMotionResumeAtRef.current = Date.now() + 5000;
    if (backgroundTimeoutRef.current) {
      clearTimeout(backgroundTimeoutRef.current);
    }
    setDarkBg(false);
    lastPointerRef.current = { x, y };
  };

  const moveDrag = (x, y) => {
    if (!dragRef.current) return;

    const dx = x - lastPointerRef.current.x;
    const dy = y - lastPointerRef.current.y;

    const dragStrength =
      typeof window !== "undefined" && window.innerWidth <= 900 ? 0.58 : 0.3;

    velocityRef.current = {
      x: dx * dragStrength,
      y: dy * dragStrength,
    };
    autoMotionResumeAtRef.current = Date.now() + 5000;

    lastPointerRef.current = { x, y };
  };

  const endDrag = () => {
    dragRef.current = false;
    autoMotionResumeAtRef.current = Date.now() + 5000;
    if (backgroundTimeoutRef.current) {
      clearTimeout(backgroundTimeoutRef.current);
    }
    backgroundTimeoutRef.current = setTimeout(() => {
      setDarkBg(true);
    }, 5000);
  };

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
    <div
      className={`relative h-screen w-screen overflow-hidden ${
        darkBg ? "bg-black" : "bg-[#f5f4f0]"
      }`}
    >
      {intro && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: introFrame % 2 === 0 ? "black" : "white",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={introFrame % 2 === 0 ? "/logo-white.png" : "/logo-black.png"}
              alt="Brand logo"
              className={viewportLayout.logoClass}
            />
          </div>

          {fadeOut && (
            <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-100" />
          )}
        </div>
      )}

      <div
        className={`absolute inset-0 z-10 touch-none ${
          panelOpen ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"
        }`}
        onMouseDown={(event) => beginDrag(event.clientX, event.clientY)}
        onMouseMove={(event) => moveDrag(event.clientX, event.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onClick={() => {
          autoMotionResumeAtRef.current = Date.now() + 5000;
          if (backgroundTimeoutRef.current) {
            clearTimeout(backgroundTimeoutRef.current);
          }
          setDarkBg(false);
          backgroundTimeoutRef.current = setTimeout(() => {
            setDarkBg(true);
          }, 5000);
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) beginDrag(touch.clientX, touch.clientY);
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) moveDrag(touch.clientX, touch.clientY);
        }}
        onTouchEnd={endDrag}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.6),_rgba(245,244,240,0)_52%)] dark:hidden" />

        <div
          ref={stageRef}
          className={viewportLayout.stageClass}
        >
          {items.map((item) => (
            <img
              key={item.id}
              data-grid-item
              src={item.src}
              alt=""
              draggable="false"
              className={`absolute left-1/2 top-1/2 select-none object-contain will-change-transform ${
                darkBg ? "invert" : ""
              }`}
              style={{
                width: `${item.size}px`,
                transform: "translate3d(0, 0, 0)",
                marginLeft: `${item.size / -2}px`,
                marginTop: `${item.size / -2}px`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center mix-blend-difference">
        <img
          src="/logo-white.png"
          alt="Brand logo"
          className={viewportLayout.logoClass}
        />
      </div>

      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className={viewportLayout.signupButtonClass}
      >
        SIGN UP
      </button>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${
          panelOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close sign up panel"
          className={`absolute inset-0 bg-black/12 transition-opacity duration-500 ${
            panelOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setPanelOpen(false)}
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-[720px] flex-col overflow-y-auto bg-white px-5 pb-8 pt-6 text-black shadow-[-28px_0_80px_rgba(0,0,0,0.08)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-12 sm:pb-12 sm:pt-11 ${
            panelOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-start justify-end">
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="text-[12px] tracking-[0.18em] sm:text-[14px]"
            >
              CLOSE
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-center py-6 sm:py-0">
            <div className="mx-auto flex w-full max-w-[540px] flex-col">
              <h2
                className={`${cinzel.className} text-center text-[27px] leading-[1.02] tracking-[-0.03em] sm:text-[52px]`}
              >
                BE THE FIRST TO HEAR ABOUT NEW PIECES AND{" "}
                <span className="italic">STUDIO</span> NEWS.
              </h2>

              <form className="mt-10 flex flex-col sm:mt-14" onSubmit={handleSubscribe}>
                <label htmlFor="signup-email" className="sr-only">
                  Your email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border-b border-black bg-transparent px-0 pb-3 text-center text-[15px] text-black placeholder:text-[#9b9b9b] focus:outline-none sm:text-[17px]"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 bg-black px-6 py-3.5 text-[12px] tracking-[0.24em] text-white disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-[14px]"
                >
                  {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
                </button>

                <label className="mt-6 flex items-start gap-3 text-[12px] leading-6 text-black sm:mt-7 sm:gap-4 sm:text-[14px] sm:leading-7">
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
          </div>
        </aside>
      </div>
    </div>
  );
}
