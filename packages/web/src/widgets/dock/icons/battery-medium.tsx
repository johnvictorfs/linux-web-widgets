export const BatteryMediumIcon = ({ className }: { className?: string }) => (
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
    <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
    {/* <line x1="22" x2="22" y1="11" y2="13" /> */}
    <line x1="6" x2="6" y1="11" y2="13" />
    <line x1="10" x2="10" y1="11" y2="13" />
  </svg>
);
