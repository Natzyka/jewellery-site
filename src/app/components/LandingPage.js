"use client";

import { useState } from "react";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function LandingPage() {

  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#f5f4f0] text-black">

      {/* LEFT LOGO */}
      <div className="fixed left-[20px] top-1/2 z-20 -translate-y-1/2">

        <h1
          className={`${cinzel.className} uppercase leading-[0.88] tracking-[-0.04em]`}
          style={{
            fontSize: "clamp(52px, 7vw, 120px)",
            fontWeight: 500,
          }}
        >
          Studio
          <br />
          Iron
        </h1>

      </div>

      {/* RIGHT INFO */}
      <div className="fixed right-[20px] top-1/2 z-20 -translate-y-1/2 text-right">

        <h2
          style={{
            fontSize: "22px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          Cannes Lions 2026
        </h2>

        <div
          style={{
            marginTop: "28px",
            fontSize: "10px",
            letterSpacing: "0.18em",
            lineHeight: "1.9",
            textTransform: "uppercase",
          }}
        >
          1st May — 7th June
          <br />
          14 Bury Street
          <br />
          St. James's
          <br />
          London SW1Y 6AL
        </div>

      </div>

      {/* CENTER VISUAL */}
      <div className="absolute inset-0 flex items-center justify-center">

        <div className="relative h-[72vh] w-[58vw] overflow-hidden">

          <img
            src="/public/earring10.png"
            alt="Artwork"
            className="h-full w-full object-cover"
          />

        </div>

      </div>

      {/* BOTTOM LEFT */}
      <button
        onClick={() => setPanelOpen(true)}
        className="fixed bottom-[20px] left-[20px] z-30 border border-black bg-black px-4 py-2 text-[10px] tracking-[0.25em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
      >
        SIGN UP
      </button>

      {/* BOTTOM RIGHT */}
      <button
        className="fixed bottom-[20px] right-[20px] z-30 border border-black bg-black px-4 py-2 text-[10px] tracking-[0.25em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
      >
        ARTISTS
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
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col bg-white px-8 py-10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-12 ${
          panelOpen
            ? "translate-x-0"
            : "translate-x-full"
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

    </main>
  );
}