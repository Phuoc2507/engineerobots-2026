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
        // Giá trị thật nằm ở biến CSS (globals.css) để BTC đổi màu ở /admin/content
        navy: { DEFAULT: "rgb(var(--c-navy) / <alpha-value>)", 600: "rgb(var(--c-navy-600) / <alpha-value>)", 900: "rgb(var(--c-navy-900) / <alpha-value>)" },
        mech: { red: "rgb(var(--c-red) / <alpha-value>)", gold: "rgb(var(--c-gold) / <alpha-value>)" },
        fmes: "rgb(var(--c-fmes) / <alpha-value>)",
        ice: "rgb(var(--c-ice) / <alpha-value>)",
        team: { red: "rgb(var(--c-team-red) / <alpha-value>)", blue: "rgb(var(--c-team-blue) / <alpha-value>)" },
        // Màu nền riêng từng phần (BTC đặt ở /admin/content → Màu sắc giao diện); để trống thì theo màu chung
        part: {
          header: "rgb(var(--p-header, var(--c-navy)) / <alpha-value>)",
          hero: "rgb(var(--p-hero, var(--c-navy)) / <alpha-value>)",
          page: "rgb(var(--p-page, var(--c-navy)) / <alpha-value>)",
          admin: "rgb(var(--p-admin, var(--c-navy)) / <alpha-value>)",
          intro: "rgb(var(--p-intro, 255 255 255) / <alpha-value>)",
          rules: "rgb(var(--p-rules, var(--c-ice)) / <alpha-value>)",
          arena: "rgb(var(--p-arena, var(--c-navy)) / <alpha-value>)",
          prizes: "rgb(var(--p-prizes, var(--c-ice)) / <alpha-value>)",
          timeline: "rgb(var(--p-timeline, 255 255 255) / <alpha-value>)",
          cta: "rgb(var(--p-cta, var(--c-red)) / <alpha-value>)",
          footer: "rgb(var(--p-footer, var(--c-navy-900)) / <alpha-value>)",
          stage: "rgb(var(--p-stage, var(--c-navy)) / <alpha-value>)",
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
