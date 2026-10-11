import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ command }) => {
  if (command !== "serve")
    throw new Error("内部原型仅供本机开发，不提供部署构建。");
  return {
    root: fileURLToPath(new URL("./lab", import.meta.url)),
    publicDir: false,
    server: { host: "127.0.0.1", port: 5174, strictPort: false },
  };
});
