import { defineConfig } from "vite";

const dependencies = [
  "react",
  "react-dom",
  "framer-motion",
  "@radix-ui/react-select",
  "@uplus-icon/react",
  "react-aria-components",
];

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: "src/ui/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: (id) =>
        dependencies.some((name) => id === name || id.startsWith(`${name}/`)),
    },
  },
});
