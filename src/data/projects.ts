export type ProjectSpec = [string, string];

export type Project = {
  index: string;
  slug: string;
  name: string;
  nameSub?: string;
  model: string;
  summary: string;
  description: string;
  specs: ProjectSpec[];
  tags: string[];
};

export const projects: Project[] = [
  {
    index: "01",
    slug: "shotta-mk2",
    name: "SHOTTA MK2",
    model: "/models/shotta-mk2.glb",
    summary:
      "Dual flywheel ball launcher turret. Shoots 15mm PLA balls at maximum velocity.",
    description:
      "SHOTTA MK2 is a dual-flywheel launcher turret designed as a high-energy desktop kinetic study. The build combines 3D-printed structural components, precise motor control, and a compact Arduino-based control stack to accelerate 15mm PLA spheres with repeatable velocity. The project explores mechanical stability, feed reliability, and rapid tuning of PWM motor response in a small but aggressive form factor.",
    specs: [
      ["Type", "Dual Flywheel Turret"],
      ["Ammo", "15mm PLA Balls"],
      ["Control", "Arduino Nano 33 IoT"],
      ["Interface", "WiFi / Bluetooth"],
      ["CAD", "Fusion 360"],
      ["Status", "Complete"],
    ],
    tags: [
      "Arduino Nano 33 IoT",
      "Fusion 360",
      "3D Printing",
      "DC Motors",
      "PWM Control",
    ],
  },
  {
    index: "02",
    slug: "bmos",
    name: "BMOS",
    nameSub: "BMO COMPUTER",
    model: "/models/bmos.glb",
    summary:
      "Raspberry Pi handheld running custom Linux OS themed after Adventure Time's BMO.",
    description:
      "BMOS is a handheld Raspberry Pi computer built as a character-driven homage to Adventure Time's BMO. It pairs a custom shell with an embedded Linux stack, portable controls, and an interface tuned for playful retro computing. The build focuses on enclosure design, thermal management, and software presentation to make the device feel like a real consumer product rather than a proof-of-concept shell.",
    specs: [
      ["Type", "Handheld Computer"],
      ["SBC", "Raspberry Pi"],
      ["OS", "Custom RetroPie Linux"],
      ["Theme", "Adventure Time BMO"],
      ["CAD", "Fusion 360"],
      ["Status", "Complete"],
    ],
    tags: [
      "Raspberry Pi",
      "RetroPie",
      "Python",
      "Linux",
      "3D Printing",
      "Embedded Systems",
    ],
  },
  {
    index: "03",
    slug: "rc-boat",
    name: "RC BOAT",
    model: "/models/rc-boat.glb",
    summary:
      "WiFi UDP-controlled Arduino boat with differential steering and thrust mixing.",
    description:
      "RC BOAT is a differential-thrust watercraft controlled over WiFi UDP. The system blends Arduino motor control, custom PCB work, and a control loop tuned for responsive steering on water. It is a compact testbed for thrust mixing, wireless latency tolerance, and enclosure design that survives a real environment instead of a desktop bench.",
    specs: [
      ["Type", "RC Watercraft"],
      ["Protocol", "WiFi UDP"],
      ["MCU", "Arduino"],
      ["Steering", "Differential Thrust"],
      ["PCB", "Custom Layout"],
      ["Status", "Complete"],
    ],
    tags: ["Arduino", "WiFi UDP", "C++", "Motor Control", "PCB Design"],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
