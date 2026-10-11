import { eq } from "drizzle-orm";
import { db } from "@/db";
import { images } from "@/db/schema";

/**
 * Serves uploaded images. An image is never modified after upload (replacing a
 * photo creates a new row), so responses can be cached forever.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return new Response("Not found", { status: 404 });
  const [image] = await db
    .select({ data: images.data, contentType: images.contentType })
    .from(images)
    .where(eq(images.id, id));
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
