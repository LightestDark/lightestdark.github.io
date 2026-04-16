"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { projects } from "@/data/projects";

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
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "devlog", label: "Devlog" },
  { id: "contact", label: "Contact" },
];

const BMOS_LAUNCH_DATE = new Date("2026-01-05T00:00:00Z");
const GITHUB_OWNER = "LightestDark";
const GITHUB_REPO = "lightestdark.github.io";
const skillTerminalLines = [
  "./stack --profile abdul",
  "booting capability scan...",
  "hardware.fusion360.............ok",
  "hardware.3d_printing...........ok",
  "hardware.rapid_prototyping.....ok",
  "hardware.mechanical_assembly...ok",
  "embedded.arduino...............ok",
  "embedded.raspberry_pi..........ok",
  "embedded.pwm_motor_control.....ok",
  "embedded.wireless_comms........ok",
  "software.cpp...................ok",
  "software.python................ok",
  "software.linux.................ok",
  "workflow.git_vscode............ok",
  "education.kcl_london...........ok",
  "education.beng_electrical_eng..ok",
  "education.first_year...........ok",
  "education.kcl_27...............ok",
  "status: active builder",
];

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
  const [repoCommitCount, setRepoCommitCount] = useState<number | null>(null);
  const [lastBuildDate, setLastBuildDate] = useState<string>("SYNCING");
  const [bmosUptimeDays, setBmosUptimeDays] = useState(0);
  const [typedSkillLines, setTypedSkillLines] = useState<string[]>([]);
  const [activeDevlogTag, setActiveDevlogTag] = useState("ALL");
  const [skillsTypingStarted, setSkillsTypingStarted] = useState(false);
  const [isDesktopCursor, setIsDesktopCursor] = useState(false);
  const trailRefs = useRef<Array<HTMLDivElement | null>>([]);

  const hero = useMemo(() => "ABDUL".split(""), []);
  const devlogTags = useMemo(
    () => ["ALL", ...Array.from(new Set(devlog.map((item) => item.tag)))],
    []
  );
  const filteredDevlog = useMemo(
    () => devlog.filter((post) => activeDevlogTag === "ALL" || post.tag === activeDevlogTag),
    [activeDevlogTag]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsDesktopCursor(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    const updateUptime = () => {
      const days = Math.max(
        1,
        Math.floor((Date.now() - BMOS_LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24))
      );
      setBmosUptimeDays(days);
    };

    updateUptime();
    const timer = window.setInterval(updateUptime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const parseCommitCount = (linkHeader: string | null) => {
      if (!linkHeader) {
        return null;
      }

      const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
      return lastPageMatch ? Number(lastPageMatch[1]) : null;
    };

    async function loadRepoStats() {
      try {
        const [commitCountResponse, latestCommitResponse] = await Promise.all([
          fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=1`
          ),
          fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=1`
          ),
        ]);

        if (!commitCountResponse.ok || !latestCommitResponse.ok) {
          throw new Error("GitHub stats unavailable");
        }

        const commitCountLink = commitCountResponse.headers.get("link");
        const latestCommitData = await latestCommitResponse.json();

        if (cancelled) {
          return;
        }

        const parsedCount = parseCommitCount(commitCountLink);
        setRepoCommitCount(parsedCount ?? latestCommitData?.length ?? null);
        const commitDate = latestCommitData?.[0]?.commit?.committer?.date;
        if (commitDate) {
          setLastBuildDate(
            new Date(commitDate).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          );
        } else {
          setLastBuildDate("UNKNOWN");
        }
      } catch {
        if (!cancelled) {
          setLastBuildDate("UNKNOWN");
        }
      }
    }

    loadRepoStats();
    const refreshTimer = window.setInterval(loadRepoStats, 120_000);
    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    const skillsSection = document.getElementById("skills");
    if (!skillsSection) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setSkillsTypingStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(skillsSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!skillsTypingStarted || typedSkillLines.length > 0) {
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;
    let currentLine = "";

    const interval = window.setInterval(() => {
      const fullLine = skillTerminalLines[lineIndex];
      currentLine = fullLine.slice(0, charIndex + 1);

      setTypedSkillLines((prev) => {
        const next = [...prev];
        next[lineIndex] = currentLine;
        return next;
      });

      charIndex += 1;
      if (charIndex >= fullLine.length) {
        lineIndex += 1;
        charIndex = 0;
        currentLine = "";
      }

      if (lineIndex >= skillTerminalLines.length) {
        window.clearInterval(interval);
      }
    }, 34);

    return () => window.clearInterval(interval);
  }, [skillsTypingStarted, typedSkillLines.length]);

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
    const trailX = trailRefs.current.map((node, index) =>
      node
        ? gsap.quickTo(node, "x", { duration: 0.16 + index * 0.06, ease: "power3.out" })
        : null
    );
    const trailY = trailRefs.current.map((node, index) =>
      node
        ? gsap.quickTo(node, "y", { duration: 0.16 + index * 0.06, ease: "power3.out" })
        : null
    );

    const onMove = (event: MouseEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      trailX.forEach((moveX) => moveX?.(event.clientX));
      trailY.forEach((moveY) => moveY?.(event.clientY));
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
      const text = "Engineer & Maker - KCL '27";

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
      {isDesktopCursor &&
        [0, 1, 2, 3].map((index) => (
          <div
            key={index}
            ref={(el) => {
              trailRefs.current[index] = el;
            }}
            className={`cursor-ghost cursor-ghost-${index + 1} hidden md:block`}
            aria-hidden="true"
          />
        ))}

      <nav className="fixed right-5 top-5 z-50 mix-blend-difference md:right-10 md:top-8">
        <ul className="flex items-center gap-3 rounded-full border border-[#222] bg-[#080808]/35 px-4 py-2 backdrop-blur-sm">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`nav-link magnetic font-mono uppercase tracking-[0.15em] text-[10px] md:text-[11px] ${
                  activeSection === item.id ? "text-[#ff4500]" : "text-[#e8e6df]"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="relative min-h-[82vh] px-4 pb-10 pt-24 md:px-10" id="hero">
        <div className="mx-auto flex h-[calc(100vh-8.5rem)] min-h-[540px] w-full max-w-[1280px] flex-col justify-between">
          <div className="relative mt-10">
            <svg
              className="hero-waveform pointer-events-none absolute -left-3 top-1/2 h-[58%] w-[105%] -translate-y-1/2"
              viewBox="0 0 1000 220"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className="wave-path wave-path-a" d="M0 110 Q 45 26 90 110 T 180 110 T 270 110 T 360 110 T 450 110 T 540 110 T 630 110 T 720 110 T 810 110 T 900 110 T 1000 110" />
              <path className="wave-path wave-path-b" d="M0 110 Q 36 188 72 110 T 144 110 T 216 110 T 288 110 T 360 110 T 432 110 T 504 110 T 576 110 T 648 110 T 720 110 T 792 110 T 864 110 T 936 110 T 1000 110" />
            </svg>
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

            <p
              ref={typeLineRef}
              className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-[#444] opacity-0 md:text-sm"
            >
              {typedLine}
              <span className="type-caret">|</span>
            </p>
            <div className="hero-ticker mt-5 inline-flex flex-wrap items-center gap-4 rounded border border-[#1d1d1d] bg-[#0a0a0a]/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#7a776f] md:text-[11px]">
              <span className="ticker-dot" aria-hidden="true" />
              <span>
                Commits:{" "}
                <strong className="text-[#e8e6df]">
                  {repoCommitCount !== null ? repoCommitCount : "..."}
                </strong>
              </span>
              <span className="text-[#303030]">/</span>
              <span>
                BMOS Uptime: <strong className="text-[#e8e6df]">{bmosUptimeDays}d</strong>
              </span>
              <span className="text-[#303030]">/</span>
              <span>
                Last Build: <strong className="text-[#ffb800]">{lastBuildDate}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between pb-3 text-[10px] uppercase tracking-[0.15em] text-[#444] md:text-xs">
            <p data-fade-intro>51.5degN 0.1degW / LONDON</p>
            <a data-fade-intro href="#about" className="group magnetic flex items-center gap-2 text-[#e8e6df]">
              <span>Scroll</span>
              <span className="h-px w-10 bg-[#ff4500] transition-all duration-500 group-hover:w-16" />
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="relative mx-auto max-w-[1280px] px-4 pb-24 pt-12 md:px-10 md:pt-14">
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
              className="group relative overflow-hidden rounded-2xl border border-[#222] bg-[#111] p-6 transition-all duration-500 hover:border-[#ff4500] hover:shadow-[0_0_40px_rgba(255,69,0,0.18)] md:p-8"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(255,69,0,0.15),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(255,184,0,0.12),transparent_40%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.02)_0%,transparent_35%,rgba(255,255,255,0.04)_100%)] opacity-60 transition-opacity duration-500 group-hover:opacity-25" />

              <div className="relative grid gap-8 md:grid-cols-[1.3fr_1fr]">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#444]">[{project.index}]</p>
                  <h3 className="mt-4 font-display text-[14vw] font-extrabold leading-[0.9] md:text-[6vw]">
                    {project.name}
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#323232] bg-[#0f0f0f] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#c5c2b8]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="max-w-xl text-sm leading-relaxed text-[#cecbbf] md:text-base">
                    {project.summary}
                  </p>
                  <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-[#ffb800] magnetic">
                    View Build <span className="text-[#ff4500]">-&gt;</span>
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

        <div data-reveal className="terminal-shell mt-10 overflow-hidden rounded-xl border border-[#222] bg-[#0c0c0c]">
          <div className="terminal-header flex items-center justify-between border-b border-[#1f1f1f] px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="terminal-led bg-[#ff6158]" />
              <span className="terminal-led bg-[#ffbd2e]" />
              <span className="terminal-led bg-[#28c840]" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5a5852]">
              abdul@portfolio: ~/skills
            </p>
          </div>
          <div className="space-y-1 px-4 py-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#a9a596] md:text-xs">
            {skillTerminalLines.map((line, index) => (
              <p key={line} className="terminal-line">
                <span className="text-[#ff4500]">$</span>{" "}
                {typedSkillLines[index] ?? ""}
                {skillsTypingStarted &&
                (typedSkillLines[index]?.length ?? 0) < line.length &&
                index <= typedSkillLines.length ? (
                  <span className="type-caret">|</span>
                ) : null}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section id="devlog" className="relative mx-auto max-w-[1280px] px-4 py-20 md:px-10">
        <h2 data-reveal className="font-mono text-xs uppercase tracking-[0.15em] text-[#444] md:text-sm">
          // 04 - DEVLOG
        </h2>
        <div data-reveal className="mt-6 flex flex-wrap gap-2">
          {devlogTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveDevlogTag(tag)}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-all md:text-[11px] ${
                activeDevlogTag === tag
                  ? "border-[#ff4500] bg-[#ff4500]/10 text-[#ffb800]"
                  : "border-[#2a2a2a] bg-[#0f0f0f] text-[#807c70] hover:border-[#525252] hover:text-[#d8d4c7]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div ref={devlogWrapRef} className="mt-8 overflow-x-auto pb-4">
          <div ref={devlogTrackRef} className="inline-flex min-w-full gap-4 pr-8 md:gap-5">
            {filteredDevlog.map((post) => (
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
          {["BUILD", "WITH", "ME"].map((word) => (
            <div key={word} className="block text-[20vw] md:text-[13vw]">{word}</div>
          ))}
        </h3>

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

        <p className="mt-14 font-mono text-[10px] uppercase tracking-[0.15em] text-[#444] md:text-xs">
          MADE BY ABDUL - KCL EE - 2026
        </p>
      </section>
    </motion.main>
  );
}
