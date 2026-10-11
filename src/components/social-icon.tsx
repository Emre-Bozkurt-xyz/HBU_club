import { Globe, Mail } from "lucide-react";

type Props = { platform: string; className?: string };

/** Simple line icons for social platforms (lucide no longer ships brand marks). */
export function SocialIcon({ platform, className = "size-4" }: Props) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (platform) {
    case "email":
      return <Mail className={className} aria-hidden />;
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 10.5V16M8 7.5v.01M12 16v-5.5M12 13a2.5 2.5 0 0 1 5 0v3" />
        </svg>
      );
    case "discord":
      return (
        <svg {...common}>
          <path d="M8.5 5.5c-1.6.3-3 .9-4 1.6C3 10 2.6 13 3 16c1.3 1 2.8 1.8 4.5 2.2l1-1.7M15.5 5.5c1.6.3 3 .9 4 1.6 1.5 2.9 1.9 5.9 1.5 8.9-1.3 1-2.8 1.8-4.5 2.2l-1-1.7" />
          <path d="M7 16c3.2 1.4 6.8 1.4 10 0M7.5 7.5c2.9-1 6.1-1 9 0" />
          <circle cx="9.5" cy="12" r="1" />
          <circle cx="14.5" cy="12" r="1" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 3c.5 2.6 2.2 4.3 5 4.6" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor" />
        </svg>
      );
    default:
      return <Globe className={className} aria-hidden />;
  }
}
