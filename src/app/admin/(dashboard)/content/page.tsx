import { getSiteContent, SITE_CONTENT_FIELDS } from "@/lib/site-content";
import { updateSiteContent } from "./actions";

export const dynamic = "force-dynamic";

const inputClass = "w-full rounded-md border border-black/15 px-3 py-2 text-sm";

export default async function AdminContentPage() {
  const content = await getSiteContent();

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold tracking-tight">Site content</h1>
      <p className="text-sm text-black/60">
        Edit the intro paragraph and contact info shown on the home page.
      </p>

      <section className="rounded-lg border border-black/10 bg-white/50 p-5">
        <form action={updateSiteContent} className="space-y-4">
          {SITE_CONTENT_FIELDS.map((field) => (
            <label key={field.key} className="block space-y-1">
              <span className="text-sm font-medium">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  name={field.key}
                  rows={4}
                  defaultValue={content[field.key]}
                  className={inputClass}
                />
              ) : (
                <input
                  name={field.key}
                  type={field.type === "email" ? "email" : "text"}
                  defaultValue={content[field.key]}
                  className={inputClass}
                />
              )}
            </label>
          ))}
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Save changes
          </button>
        </form>
      </section>
    </div>
  );
}
