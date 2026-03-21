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
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="title"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          autoComplete="off"
          placeholder="e.g. Morning focus playlist app"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-violet-500 placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="raw_idea"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Your idea
        </label>
        <textarea
          id="raw_idea"
          name="raw_idea"
          required
          rows={8}
          placeholder="What are you building? Who is it for? What problem does it solve?"
          className="resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-violet-500 placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          {pending ? "Saving…" : "Save project"}
        </button>
      </div>
    </form>
  );
}
