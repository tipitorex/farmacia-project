function BaseIcon({ children, className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CartIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M2 3h3l2.5 12h11.5l2-8h-14" />
    </BaseIcon>
  );
}

export function UserIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </BaseIcon>
  );
}

export function MapPinIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </BaseIcon>
  );
}

export function SearchIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </BaseIcon>
  );
}

export function TruckIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M3 6h10v9H3z" />
      <path d="M13 9h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </BaseIcon>
  );
}

export function StoreIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M3 10h18" />
      <path d="M5 10V6l2-2h10l2 2v4" />
      <path d="M6 10v10h12V10" />
    </BaseIcon>
  );
}

export function HeadsetIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M4 12a8 8 0 1 1 16 0" />
      <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2z" />
      <path d="M20 12v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" />
    </BaseIcon>
  );
}

export function SparkIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="m12 2 2.2 4.8L19 9l-4.8 2.2L12 16l-2.2-4.8L5 9l4.8-2.2z" />
    </BaseIcon>
  );
}
