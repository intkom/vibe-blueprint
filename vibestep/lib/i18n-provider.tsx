"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";

import en from "@/messages/en.json";
import ka from "@/messages/ka.json";
import ru from "@/messages/ru.json";
import az from "@/messages/az.json";

export type Locale = "en" | "ka" | "ru" | "az";

const ALL_MESSAGES: Record<Locale, typeof en> = { en, ka, ru, az };

export const LANGUAGES: { code: Locale; label: string; flag: string; native: string }[] = [
  { code: "en", label: "English",     flag: "🇬🇧", native: "English"     },
  { code: "ka", label: "Georgian",    flag: "🇬🇪", native: "ქართული"    },
  { code: "ru", label: "Russian",     flag: "🇷🇺", native: "Русский"     },
  { code: "az", label: "Azerbaijani", flag: "🇦🇿", native: "Azərbaycan" },
];

const STORAGE_KEY = "axiom-locale";

/* ── Locale context (for switching from anywhere) ─────── */
interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
});

export function useLocale() {
  return useContext(I18nContext);
}

/* ── Provider ──────────────────────────────────────────── */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) ?? "en") as Locale;
    if (saved in ALL_MESSAGES) setLocaleState(saved);
    setMounted(true);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    // Persist to profile async (fire and forget)
    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: l }),
    }).catch(() => {});
  }

  // Avoid hydration mismatch: render with 'en' until mounted
  const activeLocale = mounted ? locale : "en";

  return (
    <I18nContext.Provider value={{ locale: activeLocale, setLocale }}>
      <NextIntlClientProvider locale={activeLocale} messages={ALL_MESSAGES[activeLocale]}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}
