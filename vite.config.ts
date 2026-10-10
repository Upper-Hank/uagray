import { defineConfig } from "vite";
export default defineConfig({
  build: {
    rollupOptions: {
      input: [
        "index.html",
        "cases/index.html",
        "cases/detail.html",
        "cases/workspace.html",
        "cases/saas.html",
      ],
    },
  },
});
