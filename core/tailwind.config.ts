import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        nebula: {
          400: "#7f96ff",
          500: "#5770ff"
        },
        aurora: "#73f0c4",
        ember: "#ff9966",
        void: "#07111f"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 50px rgba(87, 112, 255, 0.35)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(115, 240, 196, 0.16), transparent 25%), linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
