import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        votely: {
          purple: "#7956D8",
          deep: "#5F3DBB",
          lavender: "#F3F0FC",
          ink: "#20213A",
          mint: "#36C99A"
        }
      },
      boxShadow: {
        soft: "0 12px 35px rgba(42, 28, 91, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
