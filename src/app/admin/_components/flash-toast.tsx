"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  created: "Created",
  deleted: "Deleted",
  duplicated: "Duplicated — this copy is hidden until you publish it",
};

/** Shows a toast for ?flash=... after a redirect, then cleans up the URL. */
export function FlashToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const flash = params.get("flash");

  useEffect(() => {
    if (!flash) return;
    toast.success(MESSAGES[flash] ?? flash);
    const next = new URLSearchParams(params);
    next.delete("flash");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [flash, params, pathname, router]);

  return null;
}
