import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// На GitHub Pages сайт живёт по адресу /<имя-репозитория>/, поэтому берём имя из GITHUB_REPOSITORY.
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "ERDCBB";
const base = process.env.GITHUB_PAGES === "true" ? `/${repoName}/` : "/";

export default defineConfig({
  base,
  build: {
    outDir: "dist/client",
    // Две страницы: брендбук и прототип внутренней платформы публикаций
    rollupOptions: {
      input: {
        main: "index.html",
        portal: "portal.html",
        covers: "covers.html",
        overviewCovers: "overview-covers.html",
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
