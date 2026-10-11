import { linkHref } from "@/lib/links";
import { Markdown } from "./markdown";
import { Portrait } from "./portrait";
import { SocialIcon } from "./social-icon";

export type ExecCardData = {
  name: string;
  pronouns: string | null;
  role: string;
  program: string | null;
  year: string | null;
  school: string | null;
  bio: string | null;
  email: string | null;
  instagram: string | null;
  linkedin: string | null;
  photoUrl: string | null;
  chapterName?: string | null;
};

export function ExecCard({ exec }: { exec: ExecCardData }) {
  const meta = [exec.program, exec.year, exec.school].filter(Boolean);
  const socials = (
    [
      ["email", exec.email],
      ["instagram", exec.instagram],
      ["linkedin", exec.linkedin],
    ] as const
  ).filter(([, v]) => v);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Portrait
          name={exec.name || "New exec"}
          photoUrl={exec.photoUrl}
          className="size-full transition duration-500 group-hover:scale-[1.02]"
          textClassName="text-6xl"
        />
        {exec.chapterName && (
          <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">
            {exec.chapterName}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="eyebrow text-accent">{exec.role || "Role"}</p>
          <h3 className="mt-1 font-serif text-2xl leading-tight">
            {exec.name || "Name"}
            {exec.pronouns && (
              <span className="ml-2 inline-block translate-y-[-3px] rounded-full border border-line px-2 py-0.5 align-middle font-sans text-[11px] font-medium text-muted">
                {exec.pronouns}
              </span>
            )}
          </h3>
          {meta.length > 0 && (
            <p className="mt-1.5 text-sm text-muted">{meta.join(" · ")}</p>
          )}
        </div>
        <Markdown className="text-[15px] leading-relaxed text-ink/80">
          {exec.bio}
        </Markdown>
        {socials.length > 0 && (
          <div className="mt-auto flex gap-2 pt-1">
            {socials.map(([platform, value]) => (
              <a
                key={platform}
                href={linkHref(platform, value!)}
                target={platform === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={`${exec.name} on ${platform}`}
                className="rounded-full border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              >
                <SocialIcon platform={platform} />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
