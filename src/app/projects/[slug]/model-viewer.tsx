"use client";

import { useEffect } from "react";
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
      };
    }
  }
}

type ProjectModelViewerProps = {
  src: string;
  alt: string;
};

export default function ProjectModelViewer({ src, alt }: ProjectModelViewerProps) {
  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  return (
    <model-viewer
      src={src}
      alt={alt}
      auto-rotate
      auto-rotate-delay="1000"
      rotation-per-second="20deg"
      camera-controls
      touch-action="pan-y"
      shadow-intensity="1"
      environment-image="neutral"
      style={{ width: "100%", height: "100%", background: "transparent" }}
    />
  );
}
