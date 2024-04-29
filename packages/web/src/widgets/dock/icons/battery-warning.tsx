export const BatteryWarningIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    className={className}
  >
    <path d="M14 7h2a2 2 0 0 1 2 2v6c0 1-1 2-2 2h-2" />
    <path d="M6 7H4a2 2 0 0 0-2 2v6c0 1 1 2 2 2h2" />
    {/* <line x1="22" x2="22" y1="11" y2="13" /> */}
    <line x1="10" x2="10" y1="7" y2="13" />
    <line x1="10" x2="10" y1="17" y2="17.01" />
  </svg>
);
