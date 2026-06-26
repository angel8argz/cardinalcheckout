import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cardinal: "#8C1515",
        ink: "#191C18",
        canvas: "#F7F5F1",
        line: "#E7E3DC",
        line2: "#F1EEE8",
        muted: "#6B6F68",
        faint: "#9a9e92",
        sidebar: "#11150F",
        "sidebar-active": "#1C231A",
        "sidebar-text": "#cfd3c9",
        ok: "#1A8A53",
        "ok-bg": "#E7F4EC",
        warn: "#C77700",
        "warn-bg": "#FBF1DF",
        danger: "#E03131",
        "danger-bg": "#FBEAEA",
        neutral2: "#4A5568",
        "neutral2-bg": "#EDEFF1",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,25,18,.04), 0 6px 16px rgba(20,25,18,.05)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
