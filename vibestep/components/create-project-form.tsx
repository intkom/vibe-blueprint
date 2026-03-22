"use client";

import { useActionState } from "react";
import {
  createProject,
  type CreateProjectState,
} from "@/app/actions/projects";

const initialState: CreateProjectState = { error: null };

export function CreateProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-start gap-2"
          role="alert"
        >
          <span className="mt-0.5 flex-shrink-0">⚠</span>
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="idea"
          className="text-sm font-medium text-white/60 flex items-center gap-2"
        >
          Your idea
          <span className="text-xs text-white/25 font-normal">· be as descriptive as you like</span>
        </label>
        <textarea
          id="idea"
          name="idea"
          required
          rows={8}
          placeholder="What are you building? Who is it for? What problem does it solve? What tech stack do you want to use?"
          className="input-dark resize-y leading-relaxed"
          style={{ minHeight: '180px' }}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary text-sm py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating 10 steps with Claude…
          </span>
        ) : (
          "Generate build steps →"
        )}
      </button>
    </form>
  );
}
