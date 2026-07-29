"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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

const TAGLINE = "Engineer & Maker - KCL '27";
const GITHUB_REPO = "lightestdark/lightestdark.github.io";

// Tags that describe a project's theme rather than an actual skill —
// excluded from the capabilities cloud below.
const NON_SKILL_TAGS = new Set(["fullmetal alchemist"]);

function formatRelativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}M AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}

const SCRAMBLE_CHARS = "!<>-_/\\[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// A skill label that scrambles through random characters on hover before
// resolving back to itself — same idea as the hero letter reveal, just
// triggered by interaction instead of on load. Keeps its own local state so
// unrelated re-renders elsewhere on the page can't reset it mid-animation.
function ScrambleSkill({
  tag,
  fontSize,
  opacity,
  accent,
  isActive,
  onHoverStart,
  onHoverEnd,
}: {
  tag: string;
  fontSize: string;
  opacity: number;
  accent?: string;
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const [display, setDisplay] = useState(tag);
  const rafRef = useRef<number | null>(null);

  const scramble = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const duration = 420;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const revealCount = Math.floor(progress * tag.length * 1.3);
      let out = "";
      for (let i = 0; i < tag.length; i++) {
        out +=
          tag[i] === " " || i < revealCount
            ? tag[i]
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setDisplay(out);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(tag);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      onMouseEnter={() => {
        scramble();
        onHoverStart();
      }}
      onFocus={() => {
        scramble();
        onHoverStart();
      }}
      onMouseLeave={onHoverEnd}
      onBlur={onHoverEnd}
      className="magnetic font-mono uppercase leading-none tracking-[0.04em] text-[#e8e6df] transition-[opacity] duration-200 hover:!opacity-100"
      style={{ fontSize, opacity, color: isActive ? accent : undefined }}
    >
      {display}
    </button>
  );
}

export default function Home() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const pcbRef = useRef<HTMLDivElement | null>(null);
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
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const hero = useMemo(() => "ABDUL".split(""), []);

  // Weighted skill cloud: computed purely from tag frequency across real
  // projects. No manual categories to invent or run out of room for as
  // more projects get added.
  const skillFrequency = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => {
      project.tags.forEach((tag) => {
        if (NON_SKILL_TAGS.has(tag.toLowerCase())) return;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, []);
  const maxSkillCount = skillFrequency[0]?.[1] ?? 1;

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

  // ── Hero-only cursor: tracks the mouse only while it's inside the hero, ──
  // ── leaves the system cursor alone everywhere else on the site.        ──
  useEffect(() => {
    const heroEl = heroRef.current;
    const cursor = cursorRef.current;
    if (!heroEl || !cursor || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.12, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.12, ease: "power3.out" });

    const onMove = (event: MouseEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      cursor.classList.add("hero-cursor-visible");
    };

    const onLeave = () => {
      cursor.classList.remove("hero-cursor-visible");
    };

    const onOver = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest("a, button, .magnetic")) {
        cursor.classList.add("hero-cursor-active");
      }
    };

    const onOut = () => {
      cursor.classList.remove("hero-cursor-active");
    };

    heroEl.addEventListener("mousemove", onMove);
    heroEl.addEventListener("mouseleave", onLeave);
    heroEl.addEventListener("mouseover", onOver);
    heroEl.addEventListener("mouseout", onOut);

    return () => {
      heroEl.removeEventListener("mousemove", onMove);
      heroEl.removeEventListener("mouseleave", onLeave);
      heroEl.removeEventListener("mouseover", onOver);
      heroEl.removeEventListener("mouseout", onOut);
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

  // ── PCB contact card: tilts toward the cursor, like light catching a   ──
  // ── real board's surface. Disabled on touch devices.                   ──
  useEffect(() => {
    const card = pcbRef.current;
    if (!card || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const rotateX = gsap.quickTo(card, "rotateX", { duration: 0.5, ease: "power3.out" });
    const rotateY = gsap.quickTo(card, "rotateY", { duration: 0.5, ease: "power3.out" });

    const onMove = (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY(px * 6);
      rotateX(py * -6);
    };

    const onLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);

    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("wase.khawar@hotmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      // Clipboard API unavailable — fail silently, the address is still
      // visible on the card for the person to copy manually.
    }
  };

  // ── Glitch-reveal for ABDUL ──────────────────────────────────────────────
  useEffect(() => {
    const GLITCH_MS  = 210;
    const YELLOW_MS  = 160;
    const letters    = heroLettersRef.current.filter(Boolean);
    const shuffled   = [...letters].sort(() => Math.random() - 0.5);
    const total      = shuffled.length;
    const totalSpread = 460;

    const timers: number[] = [];

    shuffled.forEach((el, i) => {
      const delay = (i / total) * totalSpread + Math.random() * 80;
      const finalChar = el.textContent ?? "";

      timers.push(
        window.setTimeout(() => {
          el.classList.remove("hero-letter-hidden");
          el.classList.add("hero-letter-glitch");

          // Cycle through a few random glyphs before settling on the real
          // letter, so the reveal reads as scrambling rather than just a
          // color fade.
          const scrambleTicks = 4;
          let tick = 0;
          const scrambleInterval = window.setInterval(() => {
            el.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            tick += 1;
            if (tick >= scrambleTicks) {
              window.clearInterval(scrambleInterval);
              el.textContent = finalChar;
            }
          }, GLITCH_MS / scrambleTicks);

          timers.push(
            window.setTimeout(() => {
              el.classList.remove("hero-letter-glitch");
              el.classList.add("hero-letter-yellow");
              timers.push(
                window.setTimeout(() => {
                  el.classList.remove("hero-letter-yellow");
                  el.classList.add("hero-letter-final");
                }, YELLOW_MS)
              );
            }, GLITCH_MS)
          );
        }, delay)
      );
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // ── Occasional idle flicker: after the reveal settles, briefly re-scramble ──
  // ── one random letter every few seconds — subtle, not the main event.    ──
  useEffect(() => {
    const letters = heroLettersRef.current.filter(Boolean);
    if (!letters.length) return;

    let cancelled = false;
    const timers: number[] = [];

    const triggerIdleGlitch = () => {
      const el = letters[Math.floor(Math.random() * letters.length)];
      const finalChar = el.textContent ?? "";
      el.classList.remove("hero-letter-final");
      el.classList.add("hero-letter-glitch");

      let tick = 0;
      const ticks = 3;
      const interval = window.setInterval(() => {
        el.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        tick += 1;
        if (tick >= ticks) {
          window.clearInterval(interval);
          el.textContent = finalChar;
          el.classList.remove("hero-letter-glitch");
          el.classList.add("hero-letter-final");
        }
      }, 60);
    };

    const scheduleNext = () => {
      const wait = 3500 + Math.random() * 3500;
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          triggerIdleGlitch();
          scheduleNext();
        }, wait)
      );
    };

    timers.push(window.setTimeout(scheduleNext, 1800));

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
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
        className="hero-cursor hidden md:block"
        aria-hidden="true"
      >
        <span className="tick-tl" />
        <span className="tick-tr" />
        <span className="tick-bl" />
        <span className="tick-br" />
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

      <section ref={heroRef} className="hero-cursor-zone relative min-h-screen px-4 pb-20 pt-28 md:px-10" id="hero">
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
          Sized by how many real builds actually used it — not a self-rated list.
        </p>

        <div data-reveal className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-4">
          {skillFrequency.map(([tag, count]) => {
            const weight = count / maxSkillCount;
            const usedIn = projects.filter((project) => project.tags.includes(tag));
            return (
              <ScrambleSkill
                key={tag}
                tag={tag}
                fontSize={`${0.95 + weight * 0.95}rem`}
                opacity={0.4 + weight * 0.6}
                accent={usedIn[0]?.accent}
                isActive={activeSkill === tag}
                onHoverStart={() => setActiveSkill(tag)}
                onHoverEnd={() => setActiveSkill((current) => (current === tag ? null : current))}
              />
            );
          })}
        </div>

        <div className="mt-8 min-h-[1.4rem] font-mono text-[11px] uppercase tracking-[0.15em] text-[#7a776c]">
          {activeSkill ? (
            <span>
              <span style={{ color: projects.find((p) => p.tags.includes(activeSkill))?.accent }}>
                {activeSkill}
              </span>{" "}
              → used in {projects.filter((p) => p.tags.includes(activeSkill)).map((p) => p.name).join(", ")}
            </span>
          ) : (
            "Hover or tab through a skill to see which build used it."
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-[#1a1a1a] pt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-[#7a776c]">
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

        <div data-reveal className="mt-10" style={{ perspective: "1400px" }}>
          <div
            ref={pcbRef}
            className="pcb-card relative overflow-hidden rounded-xl border border-[#2a2f28] bg-[#0b0f0b] p-6 md:p-12"
          >
            {/* Traces: a dim base line plus a brighter animated pulse riding
                the same path, so current visibly travels the copper instead
                of it being a static drawing. Pure horizontal/vertical lines
                stay geometrically correct even under non-uniform scaling,
                unlike circles, so these stay in the stretched SVG. */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 800 420"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {[
                "M40 40 H200 V110 H360",
                "M760 40 H600 V110 H440",
                "M40 380 H200 V300 H360",
                "M760 380 H600 V300 H440",
              ].map((d, i) => (
                <path key={d} d={d} stroke="#5c4a18" strokeWidth="1.4" fill="none" opacity={0.55} />
              ))}
              <rect x="360" y="190" width="80" height="40" fill="none" stroke="#5c4a18" strokeWidth="1.4" opacity={0.55} />
              <path d="M375 190 V178 M400 190 V178 M425 190 V178" stroke="#5c4a18" strokeWidth="1.4" opacity={0.55} />
              <path d="M375 230 V242 M400 230 V242 M425 230 V242" stroke="#5c4a18" strokeWidth="1.4" opacity={0.55} />

              {[
                "M40 40 H200 V110 H360",
                "M760 40 H600 V110 H440",
                "M40 380 H200 V300 H360",
                "M760 380 H600 V300 H440",
              ].map((d, i) => (
                <path
                  key={`pulse-${d}`}
                  d={d}
                  stroke="#f0c94a"
                  strokeWidth="1.6"
                  fill="none"
                  className={`pcb-pulse pcb-pulse-${i}`}
                />
              ))}
            </svg>

            {/* Vias + mounting holes: real circular elements, not SVG circles
                inside a non-uniformly scaled viewBox (which stretches them
                into ellipses — that was the actual bug before). */}
            {[
              [25, 9.52],
              [45, 26.19],
              [75, 9.52],
              [55, 26.19],
              [25, 90.48],
              [45, 71.43],
              [75, 90.48],
              [55, 71.43],
            ].map(([x, y], i) => (
              <span
                key={i}
                className="absolute h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9a227]"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-hidden="true"
              />
            ))}

            {[
              ["top-3", "left-3"],
              ["top-3", "right-3"],
              ["bottom-3", "left-3"],
              ["bottom-3", "right-3"],
            ].map(([tPos, lPos], i) => (
              <span
                key={i}
                className={`absolute ${tPos} ${lPos} h-3 w-3 rounded-full border border-[#3a4136] bg-[#0b0f0b]`}
                aria-hidden="true"
              >
                <span className="absolute inset-[3px] rounded-full bg-[#050705]" />
              </span>
            ))}

            <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-[#5f6a5c] md:text-xs">
              <span>BOARD: CONTACT-01</span>
              <span className="flex items-center gap-2 text-[#8a9686]">
                <svg width="20" height="9" viewBox="0 0 20 9" className="text-[#6b7a63]" aria-hidden="true">
                  <path d="M0 4.5 H3.5 M16.5 4.5 H20" stroke="currentColor" strokeWidth="1" />
                  <rect x="3.5" y="1" width="13" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
                <span className={`status-dot ${SITE_STATUS.active ? "status-dot-active" : ""}`} aria-hidden="true" />
                PWR &middot; {SITE_STATUS.label}
              </span>
            </div>

            <div className="relative mt-10 flex flex-col gap-5 font-mono text-base uppercase tracking-[0.08em] md:text-xl">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="magnetic group flex flex-wrap items-center gap-x-4 gap-y-1 text-left"
              >
                <span className="text-[10px] text-[#5f6a5c]">[J1]</span>
                <span className="text-[#5f6a5c]">EMAIL</span>
                <span className="text-[#e8e6df] transition-colors group-hover:text-[#ffb800]">
                  wase.khawar@hotmail.com
                </span>
                <span className="ml-auto font-mono text-[10px] normal-case tracking-[0.1em] text-[#5f6a5c]">
                  {copiedEmail ? "copied" : "click to copy"}
                </span>
              </button>

              <a
                href="https://github.com/lightestdark"
                className="magnetic group flex flex-wrap items-center gap-x-4 gap-y-1"
              >
                <span className="text-[10px] text-[#5f6a5c]">[J2]</span>
                <span className="text-[#5f6a5c]">GITHUB</span>
                <span className="text-[#e8e6df] transition-colors group-hover:text-[#ffb800]">
                  github.com/lightestdark
                </span>
              </a>

              <a
                href="https://linkedin.com/in/abdul"
                className="magnetic group flex flex-wrap items-center gap-x-4 gap-y-1"
              >
                <span className="text-[10px] text-[#5f6a5c]">[J3]</span>
                <span className="text-[#5f6a5c]">LINKEDIN</span>
                <span className="text-[#e8e6df] transition-colors group-hover:text-[#ffb800]">
                  linkedin.com/in/abdul
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

