"use client";

import { useActionState, useState, useEffect } from "react";
import { createProject, type CreateProjectState } from "@/app/actions/projects";

const initialState: CreateProjectState = { error: null };

/* Cycle through status messages while pending */
const LOADING_MESSAGES = [
  "Reading your idea…",
  "Thinking like a senior engineer…",
  "Breaking it into atomic steps…",
  "Sequencing build order…",
  "Almost there — saving steps…",
];

function LoadingMessage({ pending }: { pending: boolean }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!pending) { setIdx(0); return; }
    const id = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, [pending]);

  return (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      {/* Spinner */}
      <span style={{
        width: 16, height: 16, flexShrink: 0,
        border: '2.5px solid rgba(255,255,255,0.2)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
        display: 'inline-block',
      }} />
      <span style={{
        animation: 'fadeInUp 0.35s ease both',
        // key forces re-mount on message change so animation replays
      }} key={idx}>
        {LOADING_MESSAGES[idx]}
      </span>
    </span>
  );
}

export function CreateProjectForm() {
  const [state, formAction, pending] = useActionState(createProject, initialState);
  const [focused, setFocused] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [charCount, setCharCount] = useState(0);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {state.error ? (
        <div role="alert" style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)',
          borderRadius: 10, padding: '12px 14px',
          fontSize: '0.85rem', color: 'rgba(252,165,165,0.85)',
        }}>
          <span style={{ flexShrink: 0, lineHeight: 1.3 }}>⚠</span>
          <span>{state.error}</span>
        </div>
      ) : null}

      {/* Textarea */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label htmlFor="idea" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>
            Describe your idea
          </label>
          <span style={{ fontSize: '0.72rem', color: charCount > 0 ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.2)' }}>
            {charCount > 0 ? `${charCount} chars` : 'min. 20 chars'}
          </span>
        </div>

        {/* Textarea wrapper with animated glow border */}
        <div style={{
          position: 'relative',
          borderRadius: 14,
          padding: 1,
          background: focused
            ? 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(236,72,153,0.4))'
            : 'rgba(255,255,255,0.08)',
          transition: 'background 0.25s ease',
          boxShadow: focused ? '0 0 30px rgba(139,92,246,0.2)' : 'none',
        }}>
          <textarea
            id="idea"
            name="idea"
            required
            rows={9}
            disabled={pending}
            placeholder={"What are you building?\nWho is it for?\nWhat problem does it solve?\nWhat tech stack do you prefer?"}
            onChange={e => setCharCount(e.target.value.length)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%', display: 'block',
              background: focused ? 'rgba(15,8,40,0.95)' : 'rgba(10,6,30,0.9)',
              borderRadius: 13,
              border: 'none', outline: 'none',
              padding: '16px 18px',
              fontSize: '0.9rem', color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.72,
              resize: 'vertical', minHeight: 200,
              caretColor: '#a78bfa',
              transition: 'background 0.25s ease',
              opacity: pending ? 0.55 : 1,
              fontFamily: 'inherit',
            }}
          />
          {/* Bottom-right shimmer dot when focused */}
          {focused && (
            <div aria-hidden="true" style={{
              position: 'absolute', bottom: 10, right: 12,
              width: 5, height: 5, borderRadius: '50%',
              background: '#a78bfa',
              boxShadow: '0 0 8px rgba(167,139,250,0.8)',
              animation: 'pulseGlow 1.5s ease-in-out infinite',
            }} />
          )}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.22)', margin: 0, lineHeight: 1.5 }}>
          The more detail you give, the better Claude tailors your 10 steps.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={pending}
        onMouseEnter={() => !pending && setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          width: '100%',
          background: pending
            ? 'rgba(109,40,217,0.4)'
            : btnHover
              ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)'
              : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
          border: '1px solid rgba(139,92,246,0.45)',
          color: 'white', padding: '14px 20px', borderRadius: 12,
          fontSize: '0.95rem', fontWeight: 600,
          cursor: pending ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: pending
            ? 'none'
            : btnHover
              ? '0 0 36px rgba(139,92,246,0.6), 0 8px 24px rgba(0,0,0,0.4)'
              : '0 0 22px rgba(139,92,246,0.3)',
          transform: btnHover && !pending ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.22s ease',
          opacity: pending ? 0.85 : 1,
          letterSpacing: '0.01em',
          minHeight: 50,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Shimmer on hover */}
        {btnHover && !pending && (
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            animation: 'shimmerSlide 1.2s ease infinite',
          }} />
        )}
        <span style={{ position: 'relative', zIndex: 1 }}>
          {pending ? <LoadingMessage pending={pending} /> : 'Generate build steps →'}
        </span>
      </button>

      {pending && (
        <div style={{
          textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)',
          padding: '4px 0',
          animation: 'fadeInUp 0.4s ease both',
        }}>
          This usually takes 10–20 seconds. Please don&apos;t close the tab.
        </div>
      )}
    </form>
  );
}
