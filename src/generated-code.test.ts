import { expect, it } from "vitest";
import ts from "typescript";
import { componentEntries, exampleArgs } from "./playground-catalog";
import { treeFromExample, newNode } from "./playground-tree";
import { treeCode } from "./playground-tree-view";
import { exampleCode } from "./playground-code";

it("typechecks generated examples against the public components", () => {
  const root = decodeURIComponent(new URL("../", import.meta.url).pathname);
  const examples = componentEntries.map((entry) => ({
    id: entry.id,
    code: exampleCode(entry, exampleArgs(entry)),
  }));
  examples.push(
    ...componentEntries.map((entry) => ({
      id: `custom-${entry.id}`,
      code: treeCode(treeFromExample(entry)),
    })),
  );
  const button = componentEntries.find((entry) => entry.id === "buttons")!;
  for (const action of ["copy", "share"])
    examples.push({
      id: action,
      code: exampleCode(button, { ...exampleArgs(button), action }),
    });
  for (const action of ["copy", "share"])
    examples.push({
      id: `custom-${action}`,
      code: treeCode(
        treeFromExample(button, { ...exampleArgs(button), action }),
      ),
    });
  const nested = treeFromExample(
    componentEntries.find((entry) => entry.id === "dialog")!,
  );
  nested.children
    .find((node) => node.type === "Dialog.Body")!
    .children.push(newNode("Input"), newNode("ShareButton"), newNode("Field"));
  examples.push({ id: "nested-dialog", code: treeCode(nested) });
  const files = new Map(
    examples.map(({ id, code }) => [`${root}.generated-api/${id}.tsx`, code]),
  );
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    baseUrl: root,
    paths: { uagray: ["src/ui/index.ts"] },
  };
  const host = ts.createCompilerHost(options);
  const originalSource = host.getSourceFile.bind(host);
  host.getSourceFile = (file, language, onError, shouldCreate) =>
    files.has(file)
      ? ts.createSourceFile(
          file,
          files.get(file)!,
          language,
          true,
          ts.ScriptKind.TSX,
        )
      : originalSource(file, language, onError, shouldCreate);
  const originalExists = host.fileExists.bind(host);
  host.fileExists = (file) => files.has(file) || originalExists(file);
  const program = ts.createProgram([...files.keys()], options, host);
  const errors = ts
    .getPreEmitDiagnostics(program)
    .filter((error) => error.category === ts.DiagnosticCategory.Error);
  const messages = errors.map(
    (error) =>
      `${error.file?.fileName ?? ""}: ${ts.flattenDiagnosticMessageText(error.messageText, "\n")}`,
  );
  expect(messages).toEqual([]);
});
