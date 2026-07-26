"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type PhotoStackProps = {
  images: string[];
  alt: string;
};

// Fixed per-card tilt/offset so the pile looks hand-tossed but never
// shifts between renders (no client/server mismatch from Math.random()).
const TILT = [-6, 4, -3, 5, -4, 3, -5, 4];
const OFFSET_X = [0, 3, -3, 4, -4, 2, -2, 3];

export default function PhotoStack({ images, alt }: PhotoStackProps) {
  const [order, setOrder] = useState<number[]>(() => images.map((_, i) => i));
  const [flippingIdx, setFlippingIdx] = useState<number | null>(null);

  if (!images.length) return null;

  const MAX_VISIBLE = 5;
  const visible = order.slice(0, MAX_VISIBLE);

  const handleFlip = () => {
    if (flippingIdx !== null || order.length < 2) return;
    const top = order[0];
    setFlippingIdx(top);
    window.setTimeout(() => {
      setOrder((prev) => [...prev.slice(1), prev[0]]);
      setFlippingIdx(null);
    }, 420);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-xs select-none"
      style={{ aspectRatio: "4 / 5", perspective: "1600px" }}
    >
      {visible
        .map((imgIdx, stackPos) => {
          const isTop = stackPos === 0;
          const isFlipping = flippingIdx === imgIdx;
          const tilt = TILT[imgIdx % TILT.length];
          const dx = OFFSET_X[imgIdx % OFFSET_X.length] + stackPos * 1.5;
          const dy = stackPos * 7;

          return (
            <motion.div
              key={imgIdx}
              className="absolute inset-0"
              style={{ zIndex: MAX_VISIBLE - stackPos, transformStyle: "preserve-3d" }}
              initial={false}
              animate={{
                rotateZ: isFlipping ? 0 : tilt,
                rotateY: isFlipping ? -170 : 0,
                x: dx,
                y: dy,
                scale: 1 - stackPos * 0.025,
              }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            >
              <div
                className="flex h-full w-full flex-col gap-3 rounded-[2px] border border-black/10 bg-[#f4f2ea] p-3 pb-5 shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="relative flex-1 overflow-hidden bg-[#111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[imgIdx]}
                    alt={`${alt} — photo ${imgIdx + 1} of ${images.length}`}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[#080808]">
                  {String(imgIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </p>
              </div>

              {isTop ? (
                <button
                  type="button"
                  onClick={handleFlip}
                  aria-label="Flip to next photo"
                  className="magnetic absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#2e2e2e] bg-[#080808] font-mono text-sm text-[#ffb800] shadow-[0_6px_18px_rgba(0,0,0,0.5)] transition-transform hover:scale-110 active:scale-95"
                >
                  ↻
                </button>
              ) : null}
            </motion.div>
          );
        })
        .reverse() /* paint back-of-pile first so z-index stacking is correct */}
    </div>
  );
}
