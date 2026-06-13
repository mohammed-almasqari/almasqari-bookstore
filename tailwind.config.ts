import type { Config } from "tailwindcss";

// لون مبني على متغيّر CSS مع دعم شفافية Tailwind (<alpha-value>)
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // هوية "الدرع الحارس" — الألوان الدلالية تُقرأ من متغيّرات CSS لتدعم الوضع الليلي
        // (قيمها في الوضع الفاتح مطابقة تمامًا للأصل، فلا يتغيّر شيء في الوضع الفاتح)
        ink: {
          DEFAULT: v("--c-ink"),
          soft: v("--c-ink-soft"),
          muted: v("--c-ink-muted"),
        },
        // أسطح البطاقات (كانت bg-white) — تتحوّل داكنة في الوضع الليلي
        surface: {
          DEFAULT: v("--c-surface"),
          soft: v("--c-surface-soft"),
        },
        // لون داكن ثابت في الوضعين (للتذييل والشريط الجانبي والتدرّجات الداكنة)
        night: {
          DEFAULT: "#1E1B2E",
          soft: "#2A2640",
        },
        sand: {
          50: v("--c-sand-50"),
          100: v("--c-sand-100"),
          200: v("--c-sand-200"),
        },
        // ألوان العلامة الثابتة (تظهر جيدًا على الفاتح والداكن)
        guard: {
          DEFAULT: "#7C2D12",
          light: "#9A3A18",
        },
        shield: {
          DEFAULT: "#D97706",
          light: "#F59E0B",
        },
        safe: {
          DEFAULT: "#059669",
          light: "#10B981",
        },
        steel: {
          DEFAULT: "#0369A1",
          light: "#0284C7",
        },
        alert: {
          DEFAULT: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "Tajawal", "system-ui", "sans-serif"],
        display: ["var(--font-cairo)", "Cairo", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(30,27,46,0.08), 0 8px 24px -8px rgba(30,27,46,0.12)",
        "card-hover": "0 4px 12px rgba(30,27,46,0.10), 0 18px 40px -12px rgba(30,27,46,0.22)",
        glow: "0 10px 40px -10px rgba(217,119,6,0.45)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
