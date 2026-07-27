"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { projects } from "@/data/projects";
import { ProjectIcon } from "@/components/project-icons";

gsap.registerPlugin(ScrollTrigger, Draggable, useGSAP);

const devlog = [
  {
    date: "APR 08, 2026",
    title: "SHOTTA MK2 Velocity Tuning Website",
    excerpt: "Logged flywheel RPM curves and tuned PWM ramps for cleaner launches.",
    tag: "TESTING",
  },
  {
    date: "MAR 30, 2026",
    title: "BMOS Thermal Rework",
    excerpt: "Re-routed vent channels and dropped sustained handheld temps by 7C.",
    tag: "HARDWARE",
  },
  {
    date: "MAR 18, 2026",
    title: "RC Boat Thrust Mixing",
    excerpt: "Refined differential steering math for tighter corner response.",
    tag: "CONTROL",
  },
  {
    date: "MAR 07, 2026",
    title: "Bench Toolchain Update",
    excerpt: "Unified PCB and firmware workflow to reduce iteration overhead.",
    tag: "WORKFLOW",
  },
];

const navItems = [
  { id: "about", label: "About", index: "01" },
  { id: "projects", label: "Projects", index: "02" },
  { id: "skills", label: "Skills", index: "03" },
  { id: "devlog", label: "Devlog", index: "04" },
  { id: "contact", label: "Contact", index: "05" },
];

// Edit this to update the live status shown next to the hero tagline.
const SITE_STATUS = {
  label: "Open to opportunities",
  active: true,
};

// The three stacked words in the closing CTA. Edit freely, keep it to three
// short words to preserve the layout rhythm.
const CTA_WORDS = ["BUILD", "WITH", "ME"];

const TAGLINE = "Engineer & Maker - KCL '27";
const GITHUB_REPO = "lightestdark/lightestdark.github.io";

// Skills matrix: each row lists the tag strings (from projects.ts) that count
// as evidence of that skill, so the table below is computed from real project
// data instead of being a hand-typed, unverifiable list.
const SKILL_MATRIX = [
  { category: "Hardware & Fabrication", skill: "3D Printing", match: ["3D Printing"] },
  { category: "Hardware & Fabrication", skill: "Fusion 360 / CAD", match: ["Fusion 360"] },
  { category: "Hardware & Fabrication", skill: "PCB Design", match: ["PCB Design"] },
  { category: "Embedded Systems", skill: "Arduino", match: ["Arduino", "Arduino Nano 33 IoT"] },
  { category: "Embedded Systems", skill: "Raspberry Pi", match: ["Raspberry Pi"] },
  { category: "Embedded Systems", skill: "Motor Control", match: ["DC Motors", "Motor Control", "PWM Control"] },
  { category: "Embedded Systems", skill: "Wireless Comms", match: ["WiFi UDP", "Bluetooth"] },
  { category: "Software & Tools", skill: "C++", match: ["C++"] },
  { category: "Software & Tools", skill: "Python", match: ["Python", "RetroPie"] },
  { category: "Software & Tools", skill: "Linux", match: ["Linux", "Embedded Systems"] },
];

function projectHasSkill(tags: string[], match: string[]) {
  return match.some((m) => tags.some((tag) => tag.toLowerCase() === m.toLowerCase()));
}

function formatRelativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}M AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}

export default function Home() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroLettersRef = useRef<HTMLSpanElement[]>([]);
  const typeLineRef = useRef<HTMLParagraphElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const gridFlashRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const devlogTrackRef = useRef<HTMLDivElement | null>(null);
  const devlogWrapRef = useRef<HTMLDivElement | null>(null);
  const [typedLine, setTypedLine] = useState("");
  const [activeSection, setActiveSection] = useState("about");
  const [lastShipped, setLastShipped] = useState<string | null>(null);

  const hero = useMemo(() => "ABDUL".split(""), []);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: true,
    });

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const sectionEls = Array.from(document.querySelectorAll("section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.45 }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!cursorRef.current || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.09, ease: "power4.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.09, ease: "power4.out" });

    const onMove = (event: MouseEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };

    const onOver = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest("a, button, .magnetic")) {
        cursor.classList.add("cursor-active");
      }
    };

    const onOut = () => {
      cursor.classList.remove("cursor-active");
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  // ── Live "last shipped" stat, pulled from GitHub, falls back silently ────
  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (cancelled) return;
        const date = data?.[0]?.commit?.author?.date;
        if (date) setLastShipped(formatRelativeTime(date));
      })
      .catch(() => {
        // Keep the static fallback text below if the API call fails or rate-limits.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Glitch-reveal for ABDUL ──────────────────────────────────────────────
  useEffect(() => {
    const GLITCH_MS  = 210;
    const YELLOW_MS  = 160;
    const letters    = heroLettersRef.current.filter(Boolean);
    const shuffled   = [...letters].sort(() => Math.random() - 0.5);
    const total      = shuffled.length;
    const totalSpread = 460;

    shuffled.forEach((el, i) => {
      const delay = (i / total) * totalSpread + Math.random() * 80;
      setTimeout(() => {
        el.classList.remove("hero-letter-hidden");
        el.classList.add("hero-letter-glitch");
        setTimeout(() => {
          el.classList.remove("hero-letter-glitch");
          el.classList.add("hero-letter-yellow");
          setTimeout(() => {
            el.classList.remove("hero-letter-yellow");
            el.classList.add("hero-letter-final");
          }, YELLOW_MS);
        }, GLITCH_MS);
      }, delay);
    });
  }, []);

  useGSAP(
    () => {
      const text = TAGLINE;

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .fromTo(gridFlashRef.current, { opacity: 0.38 }, { opacity: 0, duration: 0.7 })
        .fromTo(
          "[data-fade-intro]",
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.05 },
          "<+0.15"
        );

      const typeObj = { count: 0 };
      gsap.to(typeObj, {
        count: text.length,
        duration: 2,
        ease: "none",
        delay: 0.9,
        onUpdate: () => {
          setTypedLine(text.slice(0, Math.floor(typeObj.count)));
        },
      });

      if (typeLineRef.current) {
        gsap.to(typeLineRef.current, {
          opacity: 1,
          duration: 0.4,
          delay: 0.8,
        });
      }

      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((item) => {
        gsap.fromTo(
          item,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 84%",
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-project-card]").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
            },
          }
        );
      });

      gsap.fromTo(
        ".capability-card",
        { opacity: 0, scale: 0.95, y: 18 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.11,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#skills",
            start: "top 75%",
          },
        }
      );

      gsap.fromTo(
        ".contact-cta",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#contact",
            start: "top 78%",
          },
        }
      );

      if (devlogTrackRef.current && devlogWrapRef.current) {
        Draggable.create(devlogTrackRef.current, {
          type: "x",
          inertia: true,
          allowNativeTouchScrolling: true,
          bounds: devlogWrapRef.current,
          cursor: "grab",
          activeCursor: "grabbing",
        });
      }

      const magneticElements = gsap.utils.toArray<HTMLElement>(".magnetic");
      const cleanups: Array<() => void> = [];

      magneticElements.forEach((el) => {
        const move = (event: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const relX = event.clientX - rect.left - rect.width / 2;
          const relY = event.clientY - rect.top - rect.height / 2;
          gsap.to(el, {
            x: relX * 0.2,
            y: relY * 0.2,
            duration: 0.35,
            ease: "power3.out",
          });
        };

        const leave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
        };

        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        });
      });

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    { scope: rootRef }
  );

  return (
    <motion.main
      ref={rootRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex-1 overflow-hidden"
    >
      <div className="scroll-progress" ref={progressRef} />
      <div className="blueprint-grid" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="grid-flash" aria-hidden="true" ref={gridFlashRef} />

      <div
        ref={cursorRef}
        className="cursor-ring hidden md:block"
        aria-hidden="true"
      >
        <span className="cursor-line-x" />
        <span className="cursor-line-y" />
      </div>

      <nav className="fixed right-5 top-5 z-50 mix-blend-difference md:right-10 md:top-8">
        <ul className="flex items-center gap-4 md:gap-6">
          {navItems.map((item, i) => (
            <li key={item.id} className="flex items-center gap-4 md:gap-6">
              <a
                href={`#${item.id}`}
                className={`nav-link magnetic inline-flex items-center font-mono uppercase tracking-[0.15em] text-[10px] md:text-[11px] ${
                  activeSection === item.id ? "text-[#ff4500]" : "text-[#e8e6df]"
                }`}
              >
                <span className="mr-1.5 text-[#4a4a4a]">{item.index}</span>
                {item.label}
              </a>
              {i < navItems.length - 1 ? (
                <span className="text-[#333] select-none" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>

      <section className="relative min-h-screen px-4 pb-20 pt-28 md:px-10" id="hero">
        <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-[1280px] flex-col justify-between">
          <div className="relative mt-14">
            <span className="blueprint-corner blueprint-corner-tl hidden md:block" aria-hidden="true" />
            <span className="blueprint-corner blueprint-corner-br hidden md:block" aria-hidden="true" />
            <span className="dim-line-v hidden md:block" aria-hidden="true" />
            <span className="dim-label-v hidden md:block" aria-hidden="true">
              5-Char / Display Bold / Tracking -0.06em
            </span>

            <h1 className="font-display whitespace-nowrap text-[clamp(4rem,12.5vw,13rem)] font-extrabold leading-none tracking-[-0.06em] md:text-[clamp(5rem,15vw,14rem)]" aria-label="ABDUL">
              {hero.map((char, index) => (
                <span
                  key={`${char}-${index}`}
                  ref={(el) => {
                    if (el) {
                      heroLettersRef.current[index] = el;
                    }
                  }}
                  className="inline-block hero-letter-hidden"
                >
                  {char}
                </span>
              ))}
            </h1>

            <div className="tick-ruler mt-4 hidden md:flex" aria-hidden="true">
              {Array.from({ length: 34 }).map((_, i) => (
                <span key={i} className={i % 5 === 0 ? "tick-major" : undefined} />
              ))}
            </div>

            <p
              ref={typeLineRef}
              className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-[0.15em] text-[#444] opacity-0 md:text-sm"
            >
              <span>{typedLine}</span>
              {typedLine.length >= TAGLINE.length ? (
                <span className="status-indicator inline-flex items-center gap-2 text-[#e8e6df]">
                  <span
                    className={`status-dot ${SITE_STATUS.active ? "status-dot-active" : ""}`}
                    aria-hidden="true"
                  />
                  {SITE_STATUS.label}
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex items-end justify-between pb-3 text-[10px] uppercase tracking-[0.15em] text-[#444] md:text-xs">
            <p data-fade-intro>
              {lastShipped ? `Last shipped ${lastShipped}` : "51.5degN 0.1degW / LONDON"}
            </p>
            <a data-fade-intro href="#about" className="group magnetic flex items-center gap-2 text-[#e8e6df]" aria-label="Scroll to content">
              <span className="h-px w-10 bg-[#ff4500] transition-all duration-500 group-hover:w-16" />
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="relative mx-auto max-w-[1280px] px-4 py-24 md:px-10">
        <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-12">
          <div data-reveal className="font-mono text-3xl uppercase tracking-[0.15em] text-[#444] md:text-4xl">
            // 01
          </div>
          <div data-reveal className="grid gap-8 md:grid-cols-2 md:gap-10">
            <p className="text-base leading-relaxed text-[#e8e6df] md:text-lg">
              I&apos;m Abdul, a mechanical engineer at King&apos;s College London specialising in Fusion 360 CAD, PCB manufacturing, and backend software development in C++ and Python.
            </p>
            <div className="rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 font-mono text-xs uppercase tracking-[0.15em] text-[#e8e6df]">
              {[
                ["Institution", "King's College London"],
                ["Degree", "MEng General Engineering"],
                ["Year", "First Year"],
                ["Location", "London, UK"],
                ["Status", "Open to opportunities"],
              ].map(([label, value]) => (
                <div key={label} className="mb-3 flex items-center gap-2 last:mb-0">
                  <span className="text-[#444]">{label}</span>
                  <span className="flex-1 border-b border-dotted border-[#303030]" />
                  <span className="text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="relative mx-auto max-w-[1280px] px-4 py-20 md:px-10">
        <h2 data-reveal className="font-mono text-xs uppercase tracking-[0.15em] text-[#444] md:text-sm">
          // 02 - PROJECTS
        </h2>
        <div className="mt-10 flex flex-col gap-7">
          {projects.map((project) => (
            <article
              key={project.index}
              data-project-card
              style={{ "--project-accent": project.accent } as CSSProperties}
              className="group relative overflow-hidden rounded-2xl border border-[#222] bg-[#111] p-6 transition-all duration-500 hover:border-[var(--project-accent)] hover:shadow-[0_0_40px_-8px_var(--project-accent)] md:p-8"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 15% 30%, color-mix(in srgb, var(--project-accent) 16%, transparent), transparent 40%)` }} />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.02)_0%,transparent_35%,rgba(255,255,255,0.04)_100%)] opacity-60 transition-opacity duration-500 group-hover:opacity-25" />

              <div className="relative grid gap-8 md:grid-cols-[1.3fr_1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2c2c2c] text-[var(--project-accent)] transition-colors duration-500 group-hover:border-[var(--project-accent)]">
                      <ProjectIcon slug={project.slug} className="h-5 w-5" />
                    </span>
                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#444]">[{project.index}]</p>
                  </div>
                  <h3 className="mt-4 font-display text-[14vw] font-extrabold leading-[0.9] md:text-[6vw]">
                    {project.name}
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="rounded-lg border border-[#242424] bg-[#0c0c0c] p-4 font-mono text-[11px] leading-relaxed">
                    <p className="mb-2 text-[#3d3d3d]">cat ./{project.slug}/specs.txt</p>
                    {project.specs.map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <span className="text-[#4a4a4a]">{label.toLowerCase()}:</span>
                        <span className="text-[#c5c2b8]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="max-w-xl text-sm leading-relaxed text-[#cecbbf] md:text-base">
                    {project.summary}
                  </p>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="magnetic inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-[var(--project-accent)]"
                  >
                    View Build <span>-&gt;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="skills" className="relative mx-auto max-w-[1280px] px-4 py-24 md:px-10">
        <h2 data-reveal className="font-mono text-xs uppercase tracking-[0.15em] text-[#444] md:text-sm">
          // 03 - CAPABILITIES
        </h2>
        <p data-reveal className="mt-3 max-w-xl font-mono text-[11px] uppercase tracking-[0.15em] text-[#5a564c]">
          Cross-referenced against the builds above, not a self-rated list.
        </p>

        <div data-reveal className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse font-mono text-[11px] tracking-[0.08em]">
            <thead>
              <tr>
                <th className="border-b border-[#242424] p-3 text-left font-normal text-[#444]"> </th>
                {projects.map((project) => (
                  <th
                    key={project.slug}
                    className="border-b border-[#242424] p-3 text-center font-normal uppercase"
                    style={{ color: project.accent }}
                  >
                    {project.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SKILL_MATRIX.map((row, i) => {
                const prevCategory = i > 0 ? SKILL_MATRIX[i - 1].category : null;
                return (
                  <Fragment key={row.skill}>
                    {row.category !== prevCategory ? (
                      <tr aria-hidden="true">
                        <td colSpan={projects.length + 1} className="pt-6 pb-1 text-[10px] uppercase tracking-[0.15em] text-[#ff4500]">
                          {row.category}
                        </td>
                      </tr>
                    ) : null}
                    <tr className="border-b border-[#1a1a1a]">
                      <td className="p-3 text-[13px] normal-case tracking-normal text-[#c5c2b8]">{row.skill}</td>
                      {projects.map((project) => (
                        <td key={project.slug} className="p-3 text-center">
                          {projectHasSkill(project.tags, row.match) ? (
                            <span style={{ color: project.accent }} aria-label="Used">
                              ●
                            </span>
                          ) : (
                            <span className="text-[#2a2a2a]" aria-hidden="true">
                              ·
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-[#1a1a1a] pt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-[#7a776c]">
          <span className="text-[#ff4500]">Education</span>
          <span>King&apos;s College London</span>
          <span>BEng Electrical Engineering</span>
          <span>First Year</span>
          <span>KCL &apos;27</span>
        </div>
      </section>

      <section id="devlog" className="relative mx-auto max-w-[1280px] px-4 py-20 md:px-10">
        <h2 data-reveal className="font-mono text-xs uppercase tracking-[0.15em] text-[#444] md:text-sm">
          // 04 - DEVLOG
        </h2>

        <div ref={devlogWrapRef} className="mt-8 overflow-x-auto pb-4">
          <div ref={devlogTrackRef} className="inline-flex min-w-full gap-4 pr-8 md:gap-5">
            {devlog.map((post) => (
              <article
                key={post.title}
                data-reveal
                className="w-[82vw] shrink-0 rounded-xl border border-[#252525] bg-[#111] p-5 md:w-[360px]"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#444]">{post.date}</p>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm text-[#bdb9ad]">{post.excerpt}</p>
                <span className="mt-4 inline-block rounded-full border border-[#2e2e2e] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#ffb800]">
                  {post.tag}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative mx-auto max-w-[1280px] px-4 pb-20 pt-24 md:px-10">
        <h2 data-reveal className="font-mono text-xs uppercase tracking-[0.15em] text-[#444] md:text-sm">
          // 05 - CONTACT
        </h2>
        <h3 className="contact-cta mt-5 font-display font-extrabold leading-[0.88]">
          <span className="block font-mono text-[6vw] font-normal leading-none tracking-[0.1em] text-[#ff4500] md:text-3xl">
            &gt;
          </span>
          {CTA_WORDS.map((word) => (
            <div key={word} className="block text-[20vw] md:text-[13vw]">{word}</div>
          ))}
        </h3>

        <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-[#e8e6df] md:text-sm">
          <span className={`status-dot ${SITE_STATUS.active ? "status-dot-active" : ""}`} aria-hidden="true" />
          {SITE_STATUS.label}
        </div>

        <div className="mt-10 flex flex-col gap-4 font-mono text-lg uppercase tracking-[0.12em] md:text-2xl">
          {[
            ["Email", "mailto:wase.khawar@hotmail.com", "wase.khawar@hotmail.com"],
            ["GitHub", "https://github.com/lightestdark", "github.com/lightestdark"],
            ["LinkedIn", "https://linkedin.com/in/abdul", "linkedin.com/in/abdul"],
          ].map(([label, href, value]) => (
            <a key={label} className="contact-link magnetic inline-flex w-fit items-center gap-3" href={href}>
              <span className="text-[#444]">{label}</span>
              <span>{value}</span>
            </a>
          ))}
        </div>

        <div className="title-block mt-16 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-[#242424] pt-6 font-mono text-[10px] uppercase tracking-[0.15em] md:grid-cols-4 md:text-xs">
          <div>
            <p className="text-[#3d3d3d]">Drawn By</p>
            <p className="mt-1 text-[#8a867a]">Abdul</p>
          </div>
          <div>
            <p className="text-[#3d3d3d]">Rev</p>
            <p className="mt-1 text-[#8a867a]">2026.01</p>
          </div>
          <div>
            <p className="text-[#3d3d3d]">Sheet</p>
            <p className="mt-1 text-[#8a867a]">01 of 01</p>
          </div>
          <div>
            <p className="text-[#3d3d3d]">Scale</p>
            <p className="mt-1 text-[#8a867a]">N.T.S.</p>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

