import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      display: ['"Bebas Neue"', "system-ui", "sans-serif"],
      body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
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
          1: "#f9f8f6",
          2: "#f0eeeb",
          3: "#e3e0db",
          4: "#d1cec8",
        },
        accent: {
          primary: {
            DEFAULT: "#d67e4b",
            hover: "#c06a3a",
            subtle: "rgba(214, 126, 75, 0.08)",
          },
          secondary: {
            DEFAULT: "#e8a87c",
            hover: "#d99568",
            subtle: "rgba(232, 168, 124, 0.08)",
          },
        },
        status: {
          success: "#4a9a5b",
          warning: "#d6964b",
          error: "#c44a3a",
          info: "#5a8ab4",
        },
        text: {
          primary: "#282d27",
          secondary: "#5a5e58",
          muted: "#8b8e88",
          inverse: "#ffffff",
        },
        code: {
          bg: "#f5f4f2",
          text: "#374131",
        },
        tool: {
          bg: "#f5f4f2",
          border: "#e3e0db",
          "border-active": "#d67e4b",
        },
      },
      borderColor: {
        default: "rgba(40, 45, 39, 0.12)",
        strong: "rgba(40, 45, 39, 0.25)",
      },
      borderRadius: {
        sm: "3px",
        md: "5px",
        lg: "8px",
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
        sm: "0 1px 2px rgba(40,45,39,0.06)",
        md: "0 4px 12px rgba(40,45,39,0.08)",
        input: "0 0 0 1px rgba(40, 45, 39, 0.12)",
        focus: "0 0 0 2px #d67e4b",
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
