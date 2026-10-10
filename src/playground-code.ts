import {
  lines,
  type Value,
  type Args,
  type ComponentEntry,
} from "./playground-catalog";

export function exampleCode(entry: ComponentEntry, args: Args): string {
  const literal = (value: Value) => `{${JSON.stringify(value)}}`;
  const string = (key: string) => String(args[key] ?? "");
  let name = entry.name;
  let props: Record<string, Value | undefined> = { ...args };
  let children = Object.hasOwn(args, "children")
    ? string("children")
    : undefined;
  let rawChildren = false;
  const expressions: Record<string, string> = {};
  const helpers: string[] = [];
  const imports = new Set([name]);
  const state = (key: string, handler: string) => {
    helpers.push(
      `const [${key}, set${key[0].toUpperCase() + key.slice(1)}] = useState(${JSON.stringify(args[key])});`,
    );
    expressions[key] = key;
    expressions[handler] =
      handler === "onChange"
        ? `event => set${key[0].toUpperCase() + key.slice(1)}(event.target.${key === "checked" ? "checked" : "value"})`
        : `set${key[0].toUpperCase() + key.slice(1)}`;
  };
  delete props.children;
  if (entry.id === "switch" && props.label === "") {
    delete props.label;
    props["aria-label"] = "开关";
  }
  for (const key of [
    "title",
    "description",
    "hint",
    "error",
    "placeholder",
    "summary",
    "valueLabel",
    "directionLabel",
  ]) {
    if (props[key] === "") delete props[key];
  }
  if (["progress", "upload"].includes(entry.id) && props.label === "") {
    delete props.label;
  }
  if (["badge", "alert", "toast", "empty-state"].includes(entry.id)) {
    if (args.icon === "auto") delete props.icon;
    else if (args.icon === "none") props.icon = false;
  }
  if (entry.id === "color-picker") {
    state("value", "onValueChange");
  }
  if (entry.id === "buttons") {
    delete props.action;
    if (args.action === "copy") {
      name = "CopyButton";
      props = {
        text: args.text,
        label: args.children,
        size: args.size,
        variant: args.variant === "plain" ? "plain" : "soft",
      };
      children = undefined;
    } else if (args.action === "share") {
      name = "ShareButton";
      props = { url: args.url };
      children = undefined;
    } else {
      delete props.text;
      delete props.url;
      helpers.push(`const [count, setCount] = useState(${args.count});`);
      delete props.count;
      expressions.count = "count || undefined";
      expressions.onClick = "() => setCount(count => count + 1)";
    }
  }
  if (entry.id === "input") props["aria-label"] = "输入示例";
  if (entry.id === "number-input") {
    props["aria-label"] = "数字输入示例";
    state("value", "onValueChange");
  }
  if (entry.id === "textarea") props["aria-label"] = "多行输入示例";
  if (["input", "textarea", "search"].includes(entry.id))
    state("value", "onChange");
  if (entry.id === "search") expressions.onChange = "setValue";
  if (["checkbox", "radio", "switch"].includes(entry.id))
    state("checked", "onChange");
  if (entry.id === "radio") props.name = "choice";
  if (entry.id === "select") {
    state("value", "onValueChange");
    delete props.lastDisabled;
    helpers.push(
      `const options = ${JSON.stringify(
        [
          { value: "svg", label: "SVG" },
          { value: "png", label: "PNG" },
          { value: "pdf", label: "PDF", disabled: args.lastDisabled },
        ],
        null,
        2,
      )};`,
    );
    expressions.options = "options";
  }
  if (entry.id === "segments" || entry.id === "tabs") {
    state("value", "onChange");
    expressions.onChange = "setValue";
    const key = entry.id === "segments" ? "options" : "items";
    delete props[key];
    delete props.lastDisabled;
    if (entry.id === "tabs") delete props.contents;
    helpers.push(
      `const ${key} = ${JSON.stringify(
        lines(string(key)).map((label, i) => ({
          value: String(i),
          label,
          ...(entry.id === "tabs"
            ? { content: lines(string("contents"))[i] ?? "" }
            : {}),
          disabled: !!args.lastDisabled && i === lines(string(key)).length - 1,
        })),
        null,
        2,
      )};`,
    );
    expressions[key] = key;
  }
  if (entry.id === "showcase") {
    delete props.externalLabel;
    delete props.externalHref;
    if (args.externalLabel)
      expressions.externalLink = JSON.stringify({
        label: args.externalLabel,
        href: args.externalHref,
      });
  }
  if (entry.id === "slider") {
    if (props.label === "") {
      delete props.label;
      props["aria-label"] = "value";
    }
    delete props.unit;
    props.max = Math.max(Number(args.min) + 1, Number(args.max));
    state("value", "onValueChange");
    expressions.formatValue = `value => \`\${value}${string("unit").replaceAll("`", "\\`").replaceAll("$", "\\$")}\``;
  }
  if (
    ["disclosure", "dialog", "drawer", "confirm-dialog", "toast"].includes(
      entry.id,
    )
  )
    state("open", "onOpenChange");
  if (entry.id === "dialog" || entry.id === "drawer") {
    imports.add("Button");
    expressions.footer =
      "<Button onClick={() => setOpen(false)}>关闭示例</Button>";
  }
  if (entry.id === "confirm-dialog") {
    children = undefined;
    expressions.onConfirm = "() => setOpen(false)";
  }

  if (entry.id === "upload") {
    helpers.push("const [files, setFiles] = useState<File[]>([]);");
    expressions.onFiles = "setFiles";
  }
  if (entry.id === "progress") {
    delete props.indeterminate;
    if (args.indeterminate) delete props.value;
  }
  if (entry.id === "fields") {
    imports.add("Input");
    children = "<Input />";
    rawChildren = true;
  }
  if (entry.id === "empty-state") {
    delete props.action;
    if (args.action) {
      imports.add("Button");
      expressions.action = '<Button icon="plus">添加文件</Button>';
    }
  }
  if (entry.id === "button-group") {
    imports.add("Button");
    rawChildren = true;
    children = lines(string("children"))
      .map((label) => `<Button>${escapeText(label)}</Button>`)
      .join("\n  ");
  }
  if (entry.id === "layout") {
    imports.add("Button");
    props.className = "example-row";
    rawChildren = true;
    children = `<Button>${escapeText(string("children"))}</Button>`;
  }
  if (entry.id === "shell") {
    delete props.footer;
    expressions.controls = `<span>${escapeText(string("controls"))}</span>`;
    delete props.controls;
    if (args.footer) expressions.footer = "<span>页脚</span>";
    props.mainId = "workspace-main";
  }
  if (entry.id === "links") {
    props = {};
    expressions.links = JSON.stringify(
      [{ label: args.label, href: args.href, icon: args.icon }],
      null,
      2,
    );
  }
  if (entry.id === "navigation") {
    props = {};
    if (args.previous)
      expressions.previous = '{ title: "按钮", href: "#buttons" }';
    if (args.next) expressions.next = '{ title: "输入", href: "#input" }';
  }
  if (entry.id === "selection") {
    helpers.push(`const [count, setCount] = useState(${args.count});`);
    delete props.count;
    expressions.count = "count";
    expressions.onSelectAll = `() => setCount(${args.total})`;
    expressions.onClear = "() => setCount(0)";
    expressions.onDone = "() => setCount(0)";
  }
  imports.delete(entry.name);
  imports.add(name);
  const attributes = [
    ...Object.entries(props)
      .filter(([key, v]) => v !== undefined && !Object.hasOwn(expressions, key))
      .map(([key, v]) => `${key}=${literal(v!)}`),
    ...Object.entries(expressions).map(([key, v]) => `${key}={${v}}`),
  ];
  const opening = `<${name}${attributes.length ? "\n  " + attributes.join("\n  ") : ""}`;
  let body =
    children === undefined
      ? `${opening}\n/>`
      : `${opening}\n>\n  ${children === "" ? '{""}' : rawChildren ? children : escapeText(children)}\n</${name}>`;
  if (entry.id === "upload")
    body = `<>\n${body}\n{files.length > 0 && <p role="status">{files.map(file => file.name).join("、")}</p>}\n</>`;
  if (["dialog", "drawer", "confirm-dialog", "toast"].includes(entry.id)) {
    imports.add("Button");
    body = `<>\n<Button onClick={() => setOpen(true)}${entry.id === "confirm-dialog" ? ` disabled={${args.busy}}` : ""}>打开</Button>\n${body}\n</>`;
  }
  const example = `export function Example() {\n${helpers
    .map((line) =>
      line
        .split("\n")
        .map((part) => "  " + part)
        .join("\n"),
    )
    .join("\n")}${helpers.length ? "\n\n" : ""}  return (\n${body
    .split("\n")
    .map((line) => "    " + line)
    .join("\n")}\n  );\n}`;
  return `${helpers.some((line) => line.includes("useState")) ? 'import { useState } from "react";\n' : ""}import { ${[...imports].join(", ")} } from './ui';\n\n${example}`;
}
function escapeText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("{", "&#123;")
    .replaceAll("}", "&#125;");
}
