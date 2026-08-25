/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        meghblue: "#0b3d5c",
        meghteal: "#0e7490",
        meghsky: "#0284c7",
        // Page background: soft blue-indigo tint instead of plain white/black.
        meghsurface: {
          light: "#eef1fb", // subtle indigo-tinted off-white (not pure white)
          dark: "#161b30", // lightened indigo-navy (not near-black) for comfortable dark-mode viewing
        },
        // Card/panel background: kept clearly distinguishable from the page
        // background in both modes so surfaces read as "elevated".
        meghcard: {
          light: "#ffffff",
          dark: "#232a4a", // visibly lighter than meghsurface.dark -> elevation
        },
        // Tailwind's built-in `slate` ramp (used throughout for text/borders/
        // hover states) is overridden here with the SAME lightness values as
        // Tailwind's defaults — only hue/saturation shift toward blue-indigo —
        // so every existing text-slate-*/border-slate-*/bg-slate-* class in
        // every component automatically picks up the tinted, cohesive look
        // without any component file needing to change, and without
        // regressing contrast ratios (lightness, which drives contrast, is
        // preserved from the original palette).
        slate: {
          50: "#f4f6fc",
          100: "#eaedf9",
          200: "#dde3f4",
          300: "#c1c9e8",
          400: "#8891c2",
          500: "#5b6597",
          600: "#434c78",
          700: "#323a5e",
          800: "#1f253d",
          900: "#141829",
          950: "#0c0f1c",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        // Indigo-tinted (rather than neutral black) shadows for a more
        // cohesive "floating card" depth effect; slightly stronger than
        // before so elevation reads clearly against the tinted background.
        card: "0 1px 3px rgba(30, 41, 82, 0.08), 0 1px 2px rgba(30, 41, 82, 0.05)",
        "card-hover": "0 8px 20px rgba(30, 41, 82, 0.14), 0 3px 6px rgba(30, 41, 82, 0.08)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
