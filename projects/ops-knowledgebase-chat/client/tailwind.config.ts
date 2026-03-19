import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      display: ['"Instrument Sans"', "system-ui", "sans-serif"],
      body: ['"Nunito Sans"', "system-ui", "sans-serif"],
      mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
    },
    fontSize: {
      xs: ["11px", { lineHeight: "1.45", letterSpacing: "0.02em" }],
      sm: ["13px", { lineHeight: "1.5", letterSpacing: "0.01em" }],
      base: ["15px", { lineHeight: "1.6", letterSpacing: "0" }],
      lg: ["17px", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
      xl: ["21px", { lineHeight: "1.35", letterSpacing: "-0.02em" }],
      "2xl": ["28px", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
    },
    extend: {
      colors: {
        surface: {
          0: "#1a1916",
          1: "#23211e",
          2: "#2e2b27",
          3: "#3a3632",
          4: "#4a4540",
        },
        accent: {
          red: {
            DEFAULT: "#c4443a",
            hover: "#d65349",
            subtle: "rgba(196, 68, 58, 0.12)",
          },
          gold: {
            DEFAULT: "#c4983a",
            hover: "#d6aa4c",
            subtle: "rgba(196, 152, 58, 0.12)",
          },
        },
        status: {
          success: "#5a9a6b",
          warning: "#c4983a",
          error: "#c4443a",
          info: "#5a8a9a",
        },
        text: {
          primary: "#e8e4de",
          secondary: "#a39e96",
          muted: "#6b6660",
          inverse: "#1a1916",
        },
        code: {
          bg: "#1e1c19",
          text: "#d4cfca",
        },
        tool: {
          bg: "#1e1c19",
          border: "#3a3632",
          "border-active": "#c4983a",
        },
      },
      borderColor: {
        default: "rgba(163, 158, 150, 0.12)",
        strong: "rgba(163, 158, 150, 0.24)",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
      },
      maxWidth: {
        chat: "768px",
        prose: "72ch",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.3)",
        md: "0 4px 12px rgba(0,0,0,0.4)",
        input: "0 0 0 1px rgba(163, 158, 150, 0.12)",
        focus: "0 0 0 2px #c4443a",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 200ms ease-out",
        streaming: "pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
