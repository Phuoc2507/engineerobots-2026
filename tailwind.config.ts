import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nhận diện Khoa Cơ khí (FME) – lấy từ logo khoa và CLB FMES
        // navy-600 = xanh chữ/viền logo FME; mech.red = ngọn đuốc; fmes = xanh CLB FMES
        navy: { DEFAULT: "#06305E", 600: "#0070B8", 900: "#031D3A" },
        mech: { red: "#D7262F", gold: "#FFC20E" },
        fmes: "#20A8E0",
        ice: "#F2F7FC",
        team: { red: "#E53935", blue: "#1E88E5" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "tech-grid":
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-40": "40px 40px",
      },
    },
  },
  plugins: [],
};
export default config;
