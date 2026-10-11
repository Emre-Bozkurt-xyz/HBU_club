import { AdminPageHeader } from "../../../_components/ui";
import { createChapter } from "../actions";
import { ChapterForm } from "../chapter-form";

export default function NewChapterPage() {
  return (
    <>
      <AdminPageHeader
        title="New chapter"
        back={{ href: "/admin/chapters", label: "Chapters" }}
      />
      <ChapterForm action={createChapter} />
    </>
  );
}
