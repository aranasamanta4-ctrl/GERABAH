type IconProps = { className?: string; strokeWidth?: number };

function Svg({ className = "h-6 w-6", strokeWidth = 1.6, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconHome(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-3.5v-6h-7v6H5A1.5 1.5 0 0 1 3.5 19z" />
    </Svg>
  );
}

export function IconWallet(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 9.5V7a1.5 1.5 0 0 1 1.2-1.47l10-2" />
      <circle cx="16.5" cy="13" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconChart(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 20v-6" />
      <path d="M12.5 20V8.5" />
      <path d="M17 20v-9" />
    </Svg>
  );
}

// An open pot — the app's own mark rather than a generic box. Kept to a rim and a
// belly so it still reads at 18px.
export function IconPot(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.6 7.3h14.8" />
      <path d="M6.4 7.3a6.6 6.6 0 1 0 11.2 0" />
    </Svg>
  );
}

export function IconOrders(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 4.5h8a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 16 20.5H8A1.5 1.5 0 0 1 6.5 19V6A1.5 1.5 0 0 1 8 4.5z" />
      <path d="M9.5 9.5h5" />
      <path d="M9.5 13h5" />
      <path d="M9.5 16.5h3" />
    </Svg>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="10" cy="8.5" r="3.2" />
      <path d="M4 19.5c0-3 2.7-4.8 6-4.8s6 1.8 6 4.8" />
      <path d="M16.5 6.2a3 3 0 0 1 0 5.6" />
      <path d="M18 15.2c1.5.7 2.5 2 2.5 3.8" />
    </Svg>
  );
}

export function IconSpark(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 11 10.1 9z" />
    </Svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </Svg>
  );
}

export function IconGrid(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </Svg>
  );
}

export function IconDownload(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4v10" />
      <path d="m8 10.5 4 4 4-4" />
      <path d="M4.5 17.5v1A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-1" />
    </Svg>
  );
}

export function IconShare(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 15V4" />
      <path d="m8 7.5 4-3.5 4 3.5" />
      <path d="M5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6" />
    </Svg>
  );
}

export function IconChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </Svg>
  );
}

export function IconArrowLeft(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M19 12H5" />
      <path d="m10.5 6-6 6 6 6" />
    </Svg>
  );
}

export function IconArrowUp(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 19V5" />
      <path d="m6 10.5 6-6 6 6" />
    </Svg>
  );
}

export function IconArrowDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5v14" />
      <path d="m6 13.5 6 6 6-6" />
    </Svg>
  );
}

export function IconSettings(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" />
    </Svg>
  );
}
