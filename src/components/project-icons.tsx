import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// Minimal single-stroke line icons, one per project. Kept deliberately plain
// (no fills, consistent stroke weight) so they read as marks, not clip art.

function TurretIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="24" r="3.2" />
      <path d="M24 4v8M24 36v8M4 24h8M36 24h8" strokeLinecap="round" />
    </svg>
  );
}

function HandheldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="10" y="7" width="28" height="34" rx="3" />
      <rect x="15" y="12" width="18" height="14" rx="1.5" />
      <circle cx="18" cy="33" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="30" cy="33" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BoatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M6 28h36l-4 10H10z" strokeLinejoin="round" />
      <path d="M24 28V8" strokeLinecap="round" />
      <path d="M24 10l10 8H24z" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="24" cy="24" r="17" />
      <path d="M24 14v10l7 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  "shotta-mk2": TurretIcon,
  bmos: HandheldIcon,
  "rc-boat": BoatIcon,
  "fma-clock": ClockIcon,
};

export function ProjectIcon({ slug, ...props }: { slug: string } & IconProps) {
  const Icon = ICONS[slug];
  if (!Icon) return null;
  return <Icon {...props} />;
}
