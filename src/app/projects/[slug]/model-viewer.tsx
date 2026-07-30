"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src: string;
        alt: string;
        "auto-rotate"?: boolean;
        "auto-rotate-delay"?: string;
        "rotation-per-second"?: string;
        "camera-controls"?: boolean;
        "touch-action"?: string;
        "shadow-intensity"?: string;
        "environment-image"?: string;
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "interaction" | "manual";
      };
    }
  }
}

type ProjectModelViewerProps = {
  src: string;
  alt: string;
};

export default function ProjectModelViewer({ src, alt }: ProjectModelViewerProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const loadedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ totalProgress: number }>).detail;
      setProgress(Math.round((detail?.totalProgress ?? 0) * 100));
    };
    const onLoad = () => {
      loadedRef.current = true;
      setLoaded(true);
    };

    el.addEventListener("progress", onProgress);
    el.addEventListener("load", onLoad);

    return () => {
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("load", onLoad);
    };
  }, []);

  // Only show the loading UI if it's still loading 200ms in — fast/cached
  // loads (the tiny placeholder models, or a warm cache) finish silently
  // with no flash at all; only a genuinely slow load ever shows anything.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!loadedRef.current) setShowOverlay(true);
    }, 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="relative h-full w-full">
      <model-viewer
        ref={elRef as React.RefObject<HTMLElement>}
        src={src}
        alt={alt}
        auto-rotate
        auto-rotate-delay="1000"
        rotation-per-second="20deg"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="0.7"
        environment-image="neutral"
        loading="lazy"
        reveal="auto"
        style={{ width: "100%", height: "100%", background: "transparent" }}
      />

      {/* Branded loading state — only appears if loading is still running
          past 200ms, so a fast load never shows anything at all. */}
      {showOverlay && !loaded ? (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080808]/40 font-mono text-[10px] uppercase tracking-[0.15em] text-[#7a776c] transition-opacity duration-300"
          aria-hidden="true"
        >
          <span>Loading model &middot; {progress}%</span>
          <span className="h-px w-24 overflow-hidden bg-[#242424]">
            <span
              className="block h-full bg-[#ff4500] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </span>
        </div>
      ) : null}
    </div>
  );
}
