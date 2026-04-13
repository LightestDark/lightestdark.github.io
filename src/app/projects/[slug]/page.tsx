"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import { getProjectBySlug } from "@/data/projects";
import CustomCursor from "@/components/custom-cursor";
import ProjectModelViewer from "./model-viewer";

export default function ProjectPage() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = useMemo(() => {
    const value = params?.slug;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const project = slug ? getProjectBySlug(slug) : undefined;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<HTMLDivElement | null>(null);
  const [modelExists, setModelExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (!project) {
      return;
    }

    let cancelled = false;
    setModelExists(null);

    fetch(project.model, { method: "HEAD" })
      .then((response) => {
        if (!cancelled) {
          setModelExists(response.ok);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModelExists(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [project]);

  useGSAP(
    () => {
      if (!project) {
        return;
      }

      gsap.fromTo(
        "[data-reveal]",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
        }
      );
    },
    { scope: rootRef, dependencies: [project] }
  );

  useEffect(() => {
    if (modelExists && modelRef.current) {
      gsap.fromTo(
        modelRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }
      );
    }
  }, [modelExists]);

  if (!project) {
    return (
      <main className="relative min-h-screen bg-[#080808] px-6 py-24 text-[#e8e6df] md:px-10">
        <div className="blueprint-grid" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-sm uppercase tracking-[0.15em] text-[#444]">
            Project not found
          </p>
          <Link href="/#projects" className="mt-6 inline-flex font-display text-4xl text-[#ff4500]">
            Return home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <motion.main
      ref={rootRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-screen overflow-hidden bg-[#080808] text-[#e8e6df]"
    >
      <div className="scroll-progress" aria-hidden="true" style={{ transform: "scaleX(1)" }} />
      <div className="blueprint-grid" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <CustomCursor />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <section className="relative h-[50vh] overflow-hidden border-b border-[#141414] lg:h-screen lg:w-1/2 lg:border-b-0 lg:border-r lg:border-[#141414]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,69,0,0.1),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
          <div
            ref={modelRef}
            className={`project-model-shell relative h-full w-full ${
              modelExists === false ? "opacity-100" : "opacity-0"
            }`}
          >
            {modelExists === false ? (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden border-2 border-dashed border-[#262626] bg-[#0d0d0d]">
                <span className="pointer-events-none absolute -bottom-10 left-6 font-display text-[18vw] font-extrabold leading-none text-[#111] lg:text-[24vw]">
                  {project.index}
                </span>
                <div className="relative z-10 rounded-full border border-[#2e2e2e] bg-[#080808]/70 px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-[#e8e6df] backdrop-blur-sm">
                  MODEL COMING SOON
                </div>
              </div>
            ) : (
              <ProjectModelViewer src={project.model} alt={`${project.name} 3D model`} />
            )}
          </div>
        </section>

        <section className="h-auto min-h-[50vh] overflow-y-auto px-5 py-8 md:px-8 lg:h-screen lg:w-1/2 lg:px-10 lg:py-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <Link
              href="/#projects"
              className="magnetic inline-flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-[#ffb800]"
            >
              <span className="text-[#ff4500]">←</span>
              Back to projects
            </Link>

            <div className="space-y-4">
              <p data-reveal className="font-mono text-xs uppercase tracking-[0.15em] text-[#444]">
                [{project.index}]
              </p>
              <h1 data-reveal className="font-display text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.92]">
                {project.name}
              </h1>
              {project.nameSub ? (
                <p data-reveal className="font-mono text-sm uppercase tracking-[0.15em] text-[#444]">
                  {project.nameSub}
                </p>
              ) : null}
            </div>

            <div data-reveal className="space-y-4 text-base leading-relaxed text-[#d6d2c7] md:text-lg">
              <p>{project.description}</p>
            </div>

            <div data-reveal className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#b4b0a4]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div data-reveal className="grid gap-3 rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 font-mono text-xs uppercase tracking-[0.15em] text-[#e8e6df] md:p-6">
              {project.specs.map(([label, value]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[#444]">{label}</span>
                  <span className="flex-1 border-b border-dotted border-[#262626]" />
                  <span>{value}</span>
                </div>
              ))}
            </div>

            <div data-reveal className="rounded-2xl border border-[#171717] bg-[#090909] p-5 text-sm text-[#b4b0a4] md:text-base">
              <p>
                This project page pairs the model with the engineering context behind the build. The 3D view is interactive on desktop and mobile, and it is designed to stay visually intentional even before the GLB file is added.
              </p>
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}
