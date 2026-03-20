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
          1: "#f8f9fb",
          2: "#f0f1f4",
          3: "#e4e5e9",
          4: "#d1d3d8",
        },
        accent: {
          primary: {
            DEFAULT: "#3b63f6",
            hover: "#2b4fd4",
            subtle: "rgba(59, 99, 246, 0.08)",
          },
          secondary: {
            DEFAULT: "#60a5fa",
            hover: "#7ab8ff",
            subtle: "rgba(96, 165, 250, 0.08)",
          },
        },
        status: {
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
        text: {
          primary: "#1a1d23",
          secondary: "#5a5f6b",
          muted: "#8b909c",
          inverse: "#ffffff",
        },
        code: {
          bg: "#f5f6f8",
          text: "#374151",
        },
        tool: {
          bg: "#f5f6f8",
          border: "#e4e5e9",
          "border-active": "#60a5fa",
        },
      },
      borderColor: {
        default: "rgba(90, 95, 107, 0.15)",
        strong: "rgba(90, 95, 107, 0.30)",
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
        input: "0 0 0 1px rgba(90, 95, 107, 0.15)",
        focus: "0 0 0 2px #3b63f6",
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
