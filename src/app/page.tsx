import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          History Before Us
        </h1>
        <p className="max-w-2xl text-lg text-black/70">
          We&apos;re a student history club exploring the land we live on and
          the stories that shaped the wider world. Talks, trivia, field trips,
          and good conversation — no prior knowledge required.
        </p>
        <div className="flex gap-4">
          <Link
            href="/events"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            See upcoming events
          </Link>
          <Link
            href="/execs"
            className="rounded-md border border-black/15 px-5 py-2.5 text-sm font-medium hover:bg-black/5"
          >
            Meet the team
          </Link>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-3">
        <Feature
          title="The land we live on"
          body="Local and Indigenous history of the place our campus sits on."
        />
        <Feature
          title="World history"
          body="From ancient empires to the modern era, told through events and discussion."
        />
        <Feature
          title="Open to all"
          body="Come as you are. Membership is free and everyone is welcome."
        />
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-accent">{title}</h2>
      <p className="text-sm text-black/70">{body}</p>
    </div>
  );
}
