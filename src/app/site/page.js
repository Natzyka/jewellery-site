"use client";

import { useEffect, useRef, useState } from "react";
import { Cinzel } from "next/font/google";
import Link from "next/link";
import SmoothScroll from "../../components/SmoothScroll";

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
  "Workshops in London",
  "Experimentation",
  "And self-expression",
];

const CUSTOM_OPTIONS = [
  {
    name: "Custom Ring",
    artist: "From about £120",
    image: "/19.webp",
  },
  {
    name: "Custom Grill / Teeth",
    artist: "From about £180",
    image: "/somniteeth.webp",
  },
  {
    name: "Earrings / Charms",
    artist: "From about £80",
    image: "/doublering.webp",
  },
  {
    name: "Personal Object",
    artist: "From about £150",
    image: "/earring7.webp",
  },
  {
    name: "Workshop Session",
    artist: "From about £65 pp",
    image: "/devil4.webp",
  },
  {
    name: "Group Workshop",
    artist: "Quoted by request",
    image: "/pill.webp",
  },
];

const PROCESS_STEPS = [
  {
    name: "Tell us the idea",
    artist: "References, size, material",
    image: "/teeth1.webp",
  },
  {
    name: "Receive a rough quote",
    artist: "No pressure to commit",
    image: "/pic/23.webp",
  },
  {
    name: "Make it together",
    artist: "Commission or workshop",
    image: "/earring12.webp",
  },
  {
    name: "Finish the piece",
    artist: "Personal, wearable, yours",
    image: "/ring.webp",
  },
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
      <div key={key} className="flex items-center justify-center pointer-events-none">
        <span
          data-artist-card
          className={cinzel.className}
          style={{
            background: "#fff",
            color: "#000",
            padding: "10px 10px 15px",
            fontWeight: 400,
            letterSpacing: "0",
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

function ProductCard({ item, tall = false, dark = false }) {
  return (
    <article className="group">
      <div
        className={`flex w-full items-center justify-center overflow-hidden bg-[#e7e5df] ${
          tall ? "aspect-[3/4]" : "aspect-[4/5]"
        }`}
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div
        className={`mt-3 flex items-start justify-between gap-4 text-[11px] uppercase tracking-[0.16em] ${
          dark ? "text-white" : "text-black"
        }`}
      >
        <h3 className="font-semibold">{item.name}</h3>
        <p className={`text-right ${dark ? "text-white/55" : "text-black/55"}`}>
          {item.artist}
        </p>
      </div>
    </article>
  );
}

export default function LandingPage() {
  const [artistsOpen, setArtistsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [brief, setBrief] = useState("");
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

    if (!brief.trim()) {
      setFormMessage({
        type: "error",
        text: "Please tell us a little about what you would like.",
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
        text: "You're on the list. Your enquiry details are ready to send when the studio inbox is connected.",
      });
      setName("");
      setEmail("");
      setProjectType("");
      setBudget("");
      setBrief("");
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

  const scrollToNewsletter = () => {
    document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SmoothScroll />

      <main className="min-h-screen bg-[#f4f3ef] text-black">
        <header className="sticky top-0 z-30 flex h-24 items-center justify-between border-b border-black/15 bg-[#f4f3ef]/90 px-4 backdrop-blur sm:h-28 sm:px-6 lg:px-8">
          <nav className="relative z-10 hidden items-center gap-6 text-[11px] uppercase tracking-[0.18em] sm:flex">
            <a href="#objects" className="hover:opacity-55">
              Custom
            </a>
            <button type="button" onClick={() => setArtistsOpen(true)} className="hover:opacity-55">
              Studio
            </button>
            <a href="#edit" className="hover:opacity-55">
              Workshops
            </a>
          </nav>

          <Link
            href="/"
            aria-label="Studio Somniferia home"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            <img
              src="/logo-black.png"
              alt="Studio Somniferia"
              className="max-h-20 w-[270px] object-contain sm:max-h-24 sm:w-[430px]"
            />
          </Link>

          <div className="relative z-10 ml-auto flex items-center gap-4 text-[11px] uppercase tracking-[0.18em]">
            <button type="button" onClick={scrollToNewsletter} className="hover:opacity-55">
              Enquire
            </button>
          </div>
        </header>

        <section className="grid min-h-[calc(72svh-4rem)] grid-cols-1 border-b border-black/15 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-[760px]">
              <p className="mb-5 text-[11px] uppercase tracking-[0.22em] text-black/55">
                Custom jewellery, personal objects and workshops
              </p>
              <img
                src="/logo-black.png"
                alt="Studio Somniferia"
                className="w-[min(86vw,760px)]"
              />
            </div>

            <div className="mt-8 grid gap-5 text-[14px] leading-6 text-black/72 sm:grid-cols-2 lg:max-w-[780px]">
              <p>
                Jewellery with an artefact quality: raw edges, bodily forms, teeth,
                thorns and polished fragments made around your idea, size and story.
              </p>
              <p>
                Studio Somniferia is currently making custom pieces and intimate
                workshops, so the first step is an enquiry rather than a checkout.
              </p>
            </div>
          </div>

          <div className="relative min-h-[56svh] overflow-hidden border-t border-black/15 lg:min-h-0 lg:border-l lg:border-t-0">
            <img src="/pic/21.webp" alt="" className="h-full w-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-5 text-[11px] uppercase tracking-[0.18em] text-white mix-blend-difference">
              <span>New Objects</span>
              <span className="text-right">Custom / Made Slowly</span>
            </div>
          </div>
        </section>

        <section
          id="objects"
          className="scroll-mt-28 px-4 py-8 sm:scroll-mt-32 sm:px-6 lg:px-8 lg:py-10"
        >
          <div className="mb-5 flex items-end justify-between gap-6">
            <h2 className="text-[15px] font-semibold uppercase tracking-[0.2em]">
              Rough guide
            </h2>
            <a href="#newsletter" className="text-[11px] uppercase tracking-[0.18em] hover:opacity-55">
              Start an enquiry
            </a>
          </div>

          <p className="mb-6 max-w-[720px] text-[13px] leading-6 text-black/65">
            Prices vary depending on material, scale, finish and how much design work
            is involved. These ranges are only a starting point so you know roughly
            what to expect before getting in touch.
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {CUSTOM_OPTIONS.map((item) => (
              <ProductCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        <section
          id="edit"
          className="grid scroll-mt-28 border-y border-black/15 bg-black text-white sm:scroll-mt-32 lg:grid-cols-[0.92fr_1.08fr]"
        >
          <div className="flex min-h-[380px] flex-col justify-between px-4 py-7 sm:px-6 lg:px-8">
            <div>
              <p className="mb-5 text-[11px] uppercase tracking-[0.22em] text-white/55">
                How it works
              </p>
              <h2 className="max-w-[720px] text-[clamp(44px,8vw,112px)] font-black uppercase leading-[0.9] tracking-[0.02em]">
                Made personal
              </h2>
            </div>
            <p className="max-w-[520px] text-[14px] leading-6 text-white/72">
              Share what you are imagining, send references if you have them, and
              the studio will shape the piece or workshop around what feels personal
              to you.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/20 p-px">
            {PROCESS_STEPS.map((item) => (
              <div key={item.name} className="bg-black p-4">
                <ProductCard item={item} tall dark />
              </div>
            ))}
          </div>
        </section>

        <section className="grid border-b border-black/15 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="min-h-[380px] overflow-hidden">
            <img src="/scroll/4028.webp" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex min-h-[380px] flex-col justify-between px-4 py-7 sm:px-6 lg:px-8">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/55">
                Workshops
              </p>
              <h2 className="mt-4 text-[28px] font-black uppercase tracking-[0.02em] sm:text-[40px]">
                Learn / Create
              </h2>
              <p className="ml-auto mt-5 max-w-[360px] text-[13px] leading-6 text-black/65">
                Book a guided workshop to shape, texture and develop your own piece.
                Sessions can be one-to-one or small groups, with pricing depending
                on time, materials and the level of support needed.
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToNewsletter}
              className="ml-auto border border-black bg-black px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#f4f3ef] hover:text-black"
            >
              Ask about workshops
            </button>
          </div>
        </section>

        <section
          id="newsletter"
          className="grid scroll-mt-28 items-center gap-8 px-4 py-10 sm:scroll-mt-32 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8"
        >
          <h2
            className={`${cinzel.className} max-w-[620px] text-center text-[30px] leading-[0.95] tracking-[-0.04em] sm:text-left sm:text-[42px]`}
          >
            Tell us what you would like to make.
          </h2>

          <form className="w-full max-w-[620px] justify-self-end" onSubmit={handleSubscribe}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.18em]">
                Name
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="border-b border-black bg-transparent pb-3 text-[16px] normal-case tracking-normal outline-none placeholder:text-black/38"
                />
              </label>

              <label className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.18em]">
                Email
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border-b border-black bg-transparent pb-3 text-[16px] normal-case tracking-normal outline-none placeholder:text-black/38"
                />
              </label>

              <label className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.18em]">
                Enquiry type
                <select
                  value={projectType}
                  onChange={(event) => setProjectType(event.target.value)}
                  className="border-b border-black bg-transparent pb-3 text-[16px] normal-case tracking-normal outline-none"
                >
                  <option value="">Choose one</option>
                  <option value="custom-piece">Custom piece</option>
                  <option value="workshop">Workshop</option>
                  <option value="repair-alteration">Alteration / remake</option>
                  <option value="not-sure">Not sure yet</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.18em]">
                Rough budget
                <input
                  type="text"
                  placeholder="e.g. £100-£250"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="border-b border-black bg-transparent pb-3 text-[16px] normal-case tracking-normal outline-none placeholder:text-black/38"
                />
              </label>
            </div>

            <label htmlFor="enquiry-brief" className="sr-only">
              Tell us what you would like
            </label>
            <textarea
              id="enquiry-brief"
              placeholder="Tell us what you would like, your size if relevant, materials you like, dates for workshops, or any references you have."
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              className="mt-5 min-h-28 w-full resize-y border border-black bg-transparent p-4 text-[15px] leading-6 outline-none placeholder:text-black/38"
            />

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] leading-5 text-black/55">
                This is an enquiry, not a purchase. The studio will confirm rough
                costs, timing and next steps before anything is made.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12 shrink-0 border border-black bg-black px-6 text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#f4f3ef] hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending" : "Send enquiry"}
              </button>
            </div>

            <label className="mt-5 flex items-start gap-3 text-[12px] leading-6 text-black/70 sm:text-[14px]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4 appearance-none rounded-[2px] border border-black bg-transparent checked:bg-black"
              />
              <span>
                I agree to hear back from Studio Somniferia about my enquiry and
                receive studio updates. View our{" "}
                <a href="#" className="underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {formMessage.text ? (
              <p
                className={`mt-4 text-[12px] leading-5 sm:text-[13px] ${
                  formMessage.type === "error" ? "text-[#b42318]" : "text-[#155724]"
                }`}
              >
                {formMessage.text}
              </p>
            ) : null}
          </form>
        </section>

        <footer className="grid gap-10 border-t border-black/15 px-4 py-8 text-[11px] uppercase tracking-[0.18em] sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <img src="/logo-black.png" alt="Studio Somniferia" className="w-[190px]" />
          </div>
          <div className="space-y-3">
            <p className="text-black/45">Studio</p>
            <button type="button" onClick={() => setArtistsOpen(true)} className="block hover:opacity-55">
              About
            </button>
            <a href="#objects" className="block hover:opacity-55">
              Custom pieces
            </a>
          </div>
          <div className="space-y-3">
            <p className="text-black/45">Support</p>
            <a href="#newsletter" className="block hover:opacity-55">
              Enquiry form
            </a>
            <a href="#newsletter" className="block hover:opacity-55">
              Ask for a quote
            </a>
          </div>
          <div className="space-y-3 lg:text-right">
            <p className="text-black/45">Social</p>
            <a href="https://www.instagram.com/" className="block hover:opacity-55">
              Instagram
            </a>
            <p className="pt-6 text-black/45">© 2026 Studio Somniferia</p>
          </div>
        </footer>

        <ArtistsOverlay
          isOpen={artistsOpen}
          onClose={() => setArtistsOpen(false)}
          items={ARTISTS_PANEL_LINES}
        />
      </main>
    </>
  );
}
