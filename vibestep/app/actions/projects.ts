"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateProjectState = { error: string | null };

export async function createProject(
  _prev: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const title = String(formData.get("title") ?? "").trim();
  const raw_idea = String(formData.get("raw_idea") ?? "").trim();

  if (!title) return { error: "Add a title for your project." };
  if (!raw_idea) return { error: "Describe your idea." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save a project." };
  }

  const { error } = await supabase.from("projects").insert({
    title,
    raw_idea,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
