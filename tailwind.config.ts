import type { Config } from "tailwindcss";

// Màu lấy từ biến CSS: --c-x = "r g b", --a-x = độ đậm (0–1) do BTC đặt; nhân với độ mờ của lớp Tailwind (bg-navy/95)
const c = (name: string) => `rgb(var(--c-${name}) / calc(<alpha-value> * var(--a-${name}, 1)))`;
// Màu từng phần: --p-x / --pa-x, để trống thì theo màu chung (fallback null = trắng)
const p = (name: string, base: string | null) =>
  base
    ? `rgb(var(--p-${name}, var(--c-${base})) / calc(<alpha-value> * var(--pa-${name}, var(--a-${base}, 1))))`
    : `rgb(var(--p-${name}, 255 255 255) / calc(<alpha-value> * var(--pa-${name}, 1)))`;

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
        // Giá trị thật nằm ở biến CSS (globals.css) để BTC đổi màu ở /admin/content
        navy: { DEFAULT: c("navy"), 600: c("navy-600"), 900: c("navy-900") },
        mech: { red: c("red"), gold: c("gold") },
        fmes: c("fmes"),
        ice: c("ice"),
        team: { red: c("team-red"), blue: c("team-blue") },
        // Màu nền riêng từng phần (BTC đặt ở /admin/content → Màu sắc giao diện); để trống thì theo màu chung
        part: {
          header: p("header", "navy"),
          hero: p("hero", "navy"),
          page: p("page", "navy"),
          admin: p("admin", "navy"),
          intro: p("intro", null),
          rules: p("rules", "ice"),
          arena: p("arena", "navy"),
          prizes: p("prizes", "ice"),
          timeline: p("timeline", null),
          cta: p("cta", "red"),
          footer: p("footer", "navy-900"),
          stage: p("stage", "navy"),
        },
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
