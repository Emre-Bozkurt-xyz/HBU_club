/** Circular "seal" mark used in the header and footer. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="23" fill="var(--accent)" />
      <circle
        cx="24"
        cy="24"
        r="19.5"
        fill="none"
        stroke="var(--paper)"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="1.5 2.2"
      />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="var(--font-display), Georgia, serif"
        fontSize="21"
        fill="var(--paper)"
      >
        H
      </text>
    </svg>
  );
}

/** Large decorative seal for the home page hero. */
export function HeroSeal({ className = "" }: { className?: string }) {
  const ring = "HISTORY BEFORE US · LOCAL & WORLD HISTORY · ";
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden>
      <defs>
        <path
          id="seal-ring"
          d="M160,160 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0"
        />
      </defs>
      <circle
        cx="160"
        cy="160"
        r="156"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.35"
      />
      <circle
        cx="160"
        cy="160"
        r="146"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.2"
        strokeDasharray="2 5"
      />
      <circle
        cx="160"
        cy="160"
        r="100"
        fill="var(--card)"
        stroke="var(--accent)"
        strokeOpacity="0.35"
      />
      <g className="origin-center animate-[spin_80s_linear_infinite] motion-reduce:animate-none">
        <text
          fontSize="15"
          fill="var(--accent)"
          fontFamily="var(--font-body), sans-serif"
          fontWeight="600"
        >
          <textPath href="#seal-ring" textLength="738" lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </g>
      {/* compass star */}
      <g transform="translate(160 160)" fill="var(--accent)">
        <path d="M0,-62 L9,-9 L0,0 Z" />
        <path d="M0,-62 L-9,-9 L0,0 Z" fillOpacity="0.55" />
        <path d="M0,62 L-9,9 L0,0 Z" />
        <path d="M0,62 L9,9 L0,0 Z" fillOpacity="0.55" />
        <path d="M62,0 L9,9 L0,0 Z" />
        <path d="M62,0 L9,-9 L0,0 Z" fillOpacity="0.55" />
        <path d="M-62,0 L-9,-9 L0,0 Z" />
        <path d="M-62,0 L-9,9 L0,0 Z" fillOpacity="0.55" />
        <g fill="var(--gold)" transform="rotate(45)">
          <path d="M0,-38 L5,-5 L0,0 L-5,-5 Z" />
          <path d="M0,38 L5,5 L0,0 L-5,5 Z" />
          <path d="M38,0 L5,5 L0,0 L5,-5 Z" />
          <path d="M-38,0 L-5,5 L0,0 L-5,-5 Z" />
        </g>
        <circle
          r="5"
          fill="var(--card)"
          stroke="var(--accent)"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
