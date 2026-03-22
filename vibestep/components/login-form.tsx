"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm({ urlError }: { urlError: string | null }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  const error = state.error ?? urlError;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {error ? (
        <div
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-start gap-2"
          role="alert"
        >
          <span className="mt-0.5 flex-shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-white/60"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="input-dark"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-white/60"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="input-dark"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary text-sm py-3 mt-1 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in…
          </span>
        ) : (
          "Sign in →"
        )}
      </button>
    </form>
  );
}
