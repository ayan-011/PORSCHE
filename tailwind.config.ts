import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        garage: {
          navy: "#12174F",
          blue: "#1B2178",
          red: "#EF2A3B",
          crimson: "#B01F35",
          cream: "#F9D9D1",
          ink: "#07070A",
          dusk: "#0C0D12",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.35em",
      },
    },
  },
  plugins: [],
};
export default config;
