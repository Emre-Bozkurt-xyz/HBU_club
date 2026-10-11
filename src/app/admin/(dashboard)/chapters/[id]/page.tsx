import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { chapters } from "@/db/schema";
import { DeleteButton } from "../../../_components/delete-button";
import { AdminPageHeader, buttonClass } from "../../../_components/ui";
import { deleteChapter, updateChapter } from "../actions";
import { ChapterForm } from "../chapter-form";

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
  if (!chapter) notFound();

  return (
    <>
      <AdminPageHeader
        title={chapter.name}
        back={{ href: "/admin/chapters", label: "Chapters" }}
        actions={
          <>
            {chapter.published && (
              <Link
                href={`/chapters/${chapter.slug}`}
                target="_blank"
                className={buttonClass.secondary}
              >
                <ExternalLink className="size-4" /> View
              </Link>
            )}
            <form action={deleteChapter}>
              <input type="hidden" name="id" value={chapter.id} />
              <DeleteButton
                confirmText={`Delete the ${chapter.name} chapter? Its execs and events will be kept but become organization-wide.`}
              />
            </form>
          </>
        }
      />
      <ChapterForm action={updateChapter} chapter={chapter} />
    </>
  );
}
