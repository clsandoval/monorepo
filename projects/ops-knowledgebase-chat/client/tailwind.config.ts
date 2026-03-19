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
          0: "#ffffff",
          1: "#fdf6ee",
          2: "#f5ede3",
          3: "#ebe3d9",
          4: "#d9d0c5",
        },
        accent: {
          red: {
            DEFAULT: "#a83227",
            hover: "#c23b2f",
            subtle: "rgba(168, 50, 39, 0.08)",
          },
          gold: {
            DEFAULT: "#faac54",
            hover: "#ffbc6e",
            subtle: "rgba(250, 172, 84, 0.08)",
          },
        },
        status: {
          success: "#3d8c5c",
          warning: "#d4942e",
          error: "#a83227",
          info: "#3d7a8c",
        },
        text: {
          primary: "#2c2420",
          secondary: "#6b5e52",
          muted: "#a09488",
          inverse: "#ffffff",
        },
        code: {
          bg: "#faf5ef",
          text: "#4a3f35",
        },
        tool: {
          bg: "#faf5ef",
          border: "#ebe3d9",
          "border-active": "#faac54",
        },
      },
      borderColor: {
        default: "rgba(107, 94, 82, 0.15)",
        strong: "rgba(107, 94, 82, 0.30)",
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
        sm: "0 1px 2px rgba(0,0,0,0.06)",
        md: "0 4px 12px rgba(0,0,0,0.08)",
        input: "0 0 0 1px rgba(107, 94, 82, 0.15)",
        focus: "0 0 0 2px #a83227",
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
