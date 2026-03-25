"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/login/actions";
import { useTranslations } from "next-intl";

const initialState: LoginState = { error: null };

function Field({
  id, name, type, label, placeholder, autoComplete,
}: {
  id: string; name: string; type: string;
  label: string; placeholder: string; autoComplete: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label htmlFor={id} style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: focused ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? 'rgba(139,92,246,0.65)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10,
          padding: '12px 14px',
          fontSize: '0.9rem',
          color: 'white',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.14), 0 0 20px rgba(139,92,246,0.08)' : 'none',
          transition: 'all 0.2s ease',
          caretColor: '#a78bfa',
        }}
      />
    </div>
  );
}

export function LoginForm({ urlError }: { urlError: string | null }) {
  const t = useTranslations('auth');
  const [state, formAction, pending] = useActionState(login, initialState);
  const [btnHover, setBtnHover] = useState(false);
  const error = state.error ?? urlError;

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error ? (
        <div role="alert" style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, padding: '12px 14px',
          fontSize: '0.85rem', color: 'rgba(252,165,165,0.9)',
        }}>
          <span style={{ fontSize: '1rem', lineHeight: 1.2, flexShrink: 0 }}>⚠</span>
          <span>{error}</span>
        </div>
      ) : null}

      <Field id="email" name="email" type="email" label={t('email')} placeholder="you@example.com" autoComplete="email" />
      <Field id="password" name="password" type="password" label={t('password')} placeholder="••••••••" autoComplete="current-password" />

      <button
        type="submit"
        disabled={pending}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          width: '100%',
          background: pending ? 'rgba(109,40,217,0.5)' : btnHover ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
          border: '1px solid rgba(139,92,246,0.45)',
          color: 'white', padding: '13px 20px', borderRadius: 11,
          fontSize: '0.9rem', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: btnHover && !pending ? '0 0 28px rgba(139,92,246,0.55)' : '0 0 16px rgba(139,92,246,0.25)',
          transform: btnHover && !pending ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'all 0.22s ease',
          opacity: pending ? 0.7 : 1,
          marginTop: 4,
          letterSpacing: '0.01em',
        }}
      >
        {pending ? (
          <>
            <span style={{
              width: 16, height: 16,
              border: '2px solid rgba(255,255,255,0.25)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }} />
            {t('signIn')}…
          </>
        ) : `${t('signIn')} →`}
      </button>
    </form>
  );
}
