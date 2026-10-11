import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const tarball = path.resolve(
  root,
  process.argv[2] ?? `uagray-${pkg.version}.tgz`,
);

try {
  await access(tarball);
} catch {
  console.error(
    `Missing ${path.basename(tarball)}. Run npm pack first, or pass the tarball path.`,
  );
  process.exit(1);
}

const dir = await mkdtemp(path.join(tmpdir(), "uagray-consumer-"));
try {
  await writeFile(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name: "uagray-consumer-check",
        private: true,
        type: "module",
        dependencies: {
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          uagray: tarball,
        },
        devDependencies: {
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          typescript: "^5.9.0",
          vite: "^7.0.0",
        },
      },
      null,
      2,
    ),
  );
  await writeFile(
    path.join(dir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ["main.tsx"],
      },
      null,
      2,
    ),
  );
  await writeFile(
    path.join(dir, "index.html"),
    '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>Uagray consumer</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
  );
  await writeFile(
    path.join(dir, "main.tsx"),
    `import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, CopyButton, Surface, Input, NumberInput, Select, Progress, Dialog, Toast, ToastRegion, Spinner } from "uagray";
import "uagray/styles.css";
import "uagray/fonts.css";

function App() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState("a");
  const [open, setOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  return (
    <main>
      <Surface>
        <Button onClick={() => setCount((value) => value + 1)}>计数 {count}</Button>
        <CopyButton text="uagray" copiedLabel="已复制">复制</CopyButton>
        <Input aria-label="名称" name="name" />
        <NumberInput aria-label="数量" value={count} onValueChange={setCount} />
        <Select aria-label="选项" value={value} onValueChange={setValue} options={[{ value: "a", label: "甲" }, { value: "b", label: "乙" }]} />
        <Progress aria-label="上传进度" value={count} />
        <Spinner aria-label="加载中" />
        <Button onClick={() => setOpen(true)}>打开</Button>
        <Dialog open={open} onOpenChange={setOpen} title="消费检查">内容</Dialog>
        <Button onClick={() => setToastOpen(true)}>显示提示</Button>
        <ToastRegion><Toast open={toastOpen} onOpenChange={setToastOpen}>提示</Toast></ToastRegion>
      </Surface>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
`,
  );
  await exec(
    "npm",
    ["install", "--no-fund", "--no-audit", "--ignore-scripts"],
    {
      cwd: dir,
    },
  );
  await exec("npx", ["tsc", "--noEmit", "-p", "tsconfig.json"], { cwd: dir });
  await exec("npx", ["vite", "build"], { cwd: dir });
  console.log(`Consumer verified ${path.basename(tarball)}.`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
