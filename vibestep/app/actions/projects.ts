"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateBuildSteps, serializeMeta } from "@/lib/generate-build-steps";

export type CreateProjectState = { error: string | null };

export async function createProject(
  _prev: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const raw_idea = String(formData.get("idea") ?? "").trim();

  if (!raw_idea) {
    return { error: "Describe your idea — even a rough sentence is enough." };
  }
  if (raw_idea.length < 20) {
    return { error: "Give us a bit more detail — at least 20 characters so Claude can do its job." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save a project." };
  }

  let plan;
  try {
    plan = await generateBuildSteps(raw_idea);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate steps.";
    return { error: msg };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      title: plan.title,
      raw_idea,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return { error: projectError?.message ?? "Failed to save project." };
  }

  // Serialize stack + warnings into ai_output of step 0
  const meta = serializeMeta(plan);

  const steps = plan.steps.map((s, i) => ({
    project_id: project.id,
    step_index: i,
    phase: s.phase,
    title: s.title,
    objective: s.objective,
    guidance: s.guidance,
    // Store the full blueprint meta (stack + warnings) on step 0 so project page can read it
    ai_output: i === 0 ? meta : s.guidance,
  }));

  const { error: stepsError } = await supabase.from("build_steps").insert(steps);

  if (stepsError) {
    return { error: stepsError.message };
  }

  revalidatePath("/dashboard");
  // Send user straight to their blueprint — don't make them navigate back
  redirect(`/project/${project.id}`);
}
