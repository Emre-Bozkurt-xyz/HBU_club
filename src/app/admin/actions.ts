"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export async function login(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    // Slow down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "Incorrect password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
