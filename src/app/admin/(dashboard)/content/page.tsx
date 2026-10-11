import { getFaqs, getLinks, getPillars } from "@/lib/queries";
import { getSiteContent } from "@/lib/site-content";
import { AdminPageHeader } from "../../_components/ui";
import {
  FaqList,
  LinkList,
  PillarList,
  SiteContentForm,
} from "./content-forms";

const SECTIONS = [
  { id: "text", label: "Home page text" },
  { id: "links", label: "Contact & social links" },
  { id: "pillars", label: "What we do" },
  { id: "faq", label: "FAQ" },
];

function SectionTitle({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div id={id} className="mb-4 scroll-mt-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

export default async function AdminContentPage() {
  const [values, links, pillars, faqs] = await Promise.all([
    getSiteContent(),
    getLinks(),
    getPillars(),
    getFaqs(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Site content"
        description="The words on the home page, your contact links, and the FAQ."
      />
      <nav className="mb-10 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-ink/30"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="max-w-3xl space-y-16">
        <section>
          <SectionTitle
            id="text"
            title="Home page text"
            description="The heading, intro, sign-up link, and optional announcement banner."
          />
          <SiteContentForm values={values} />
        </section>

        <section>
          <SectionTitle
            id="links"
            title="Contact & social links"
            description="Shown in the “Get involved” section and the footer of every page. Chapter-specific contacts go on each chapter."
          />
          <LinkList items={links} />
        </section>

        <section>
          <SectionTitle
            id="pillars"
            title="What we do"
            description="The numbered cards on the home page. Three works best."
          />
          <PillarList items={pillars} />
        </section>

        <section>
          <SectionTitle
            id="faq"
            title="FAQ"
            description="Common questions from new members. The section is hidden when empty."
          />
          <FaqList items={faqs} />
        </section>
      </div>
    </>
  );
}
