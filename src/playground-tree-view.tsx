import {
  createElement,
  useState,
  Fragment,
  type ComponentType,
  type ReactNode,
} from "react";
import * as UI from "./ui";
import { type ContentNode, updateNode, normalizeTree } from "./playground-tree";

const fields = new Set([
  "Input",
  "Textarea",
  "NumberInput",
  "SearchField",
  "Select",
  "SegmentedControl",
  "Tabs",
  "Slider",
  "ColorPicker",
]);
const checks = new Set(["Checkbox", "Radio", "Switch"]);
const panels = new Set(["Dialog", "Drawer", "ConfirmDialog", "Toast"]);
const expands = new Set([...panels, "Disclosure"]);
const nativeFields = new Set(["Input", "Textarea"]);
function componentFor(
  type: string,
): ComponentType<Record<string, unknown>> | string {
  if (["li", "div", "dt", "dd"].includes(type)) return type;
  const [owner, role] = type.split(".");
  const component = UI[owner as keyof typeof UI];
  return (
    role ? (component as unknown as Record<string, unknown>)[role] : component
  ) as ComponentType<Record<string, unknown>>;
}
export function TreePreview({
  root,
  onChange,
}: {
  root: ContentNode;
  onChange: (root: ContentNode) => void;
}) {
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const patch = (id: string, key: string, value: string | number | boolean) =>
    onChange(
      normalizeTree(
        updateNode(root, id, (node) => ({
          ...node,
          props: { ...node.props, [key]: value },
        })),
      ),
    );
  const render = (node: ContentNode, ancestors: ContentNode[]): ReactNode => {
    const panel = [...ancestors]
      .reverse()
      .find((parent) => panels.has(parent.type));
    const selection = [...ancestors]
      .reverse()
      .find((parent) => parent.type === "SelectionBar");
    if (node.type === "#text")
      return node.text?.replaceAll(
        "{count}",
        String(selection?.props.count ?? "{count}"),
      );
    const props: Record<string, unknown> = { ...node.props, key: node.id };
    if (props["aria-label"] === "") delete props["aria-label"];
    if (props.defaultValue === "") delete props.defaultValue;
    if (fields.has(node.type)) {
      if (props.value === undefined)
        props.value =
          node.type === "Slider" || node.type === "NumberInput" ? 0 : "";
      if (nativeFields.has(node.type))
        props.onChange = (event: { target: { value: string } }) =>
          patch(node.id, "value", event.target.value);
      else
        props.onValueChange = (value: string | number) =>
          patch(node.id, "value", value);
    }
    if (node.type === "Slider" && node.suffix !== undefined)
      props.formatValue = (value: number) => `${value}${node.suffix}`;
    if (checks.has(node.type))
      props.onChange = (event: { target: { checked: boolean } }) =>
        patch(node.id, "checked", event.target.checked);
    if (expands.has(node.type))
      props.onOpenChange = (open: boolean) => patch(node.id, "open", open);
    if (node.type === "ConfirmDialog")
      props.onConfirm = () => patch(node.id, "open", false);
    if (node.type === "FileDropzone")
      props.onFiles = (next: File[]) =>
        setFiles((current) => ({ ...current, [node.id]: next }));
    if (node.action === "close" && panel)
      props.onClick = () => patch(panel.id, "open", false);
    if (
      node.type.startsWith("SelectionBar.") &&
      node.type.endsWith("Action") &&
      selection
    )
      props.onClick = () =>
        patch(
          selection.id,
          "count",
          node.type.endsWith("SelectAllAction")
            ? Number(selection.props.total)
            : 0,
        );
    const children =
      node.text !== undefined
        ? node.text
        : node.children.map((child) => render(child, [...ancestors, node]));
    let view: ReactNode = createElement(
      componentFor(node.type),
      props,
      ...(node.text !== undefined || node.children.length ? [children] : []),
    );
    if (panels.has(node.type))
      view = createElement(
        Fragment,
        { key: node.id },
        <UI.Button
          disabled={node.type === "ConfirmDialog" && !!node.props.busy}
          onClick={() => patch(node.id, "open", true)}
        >
          <UI.Button.Label>
            {node.type === "Toast" ? "显示提示" : "打开"}
          </UI.Button.Label>
        </UI.Button>,
        view,
      );
    if (node.type === "FileDropzone" && files[node.id]?.length)
      view = (
        <Fragment key={node.id}>
          {view}
          <span role="status">
            {files[node.id].map((file) => file.name).join("、")}
          </span>
        </Fragment>
      );
    return view;
  };
  return <>{render(root, [])}</>;
}

/** JSX is output text only. The preview resolves the same nodes through the component registry. */
export function treeCode(root: ContentNode): string {
  const imports = new Set<string>();
  const helpers: string[] = [];
  let index = 0;
  const literal = (value: unknown) => `{${JSON.stringify(value)}}`;
  const render = (
    node: ContentNode,
    ancestors: { node: ContentNode; state: Record<string, string> }[],
  ): string => {
    const selection = [...ancestors]
      .reverse()
      .find((parent) => parent.node.type === "SelectionBar");
    if (node.type === "#text")
      return `{${JSON.stringify(node.text ?? "")}${selection && node.text?.includes("{count}") ? `.replaceAll("{count}", String(${selection.state.count}))` : ""}}`;
    if (!["li", "div", "dt", "dd"].includes(node.type))
      imports.add(node.type.split(".")[0]);
    const suffix = index++;
    const props: Record<string, unknown> = { ...node.props };
    const expressions: Record<string, string> = {};
    const state: Record<string, string> = {};
    const bind = (key: string, handler?: string) => {
      const name = `${key}${suffix}`,
        setter = `set${key[0].toUpperCase()}${key.slice(1)}${suffix}`;
      helpers.push(
        `const [${name}, ${setter}] = useState(${JSON.stringify(props[key] ?? (key === "checked" || key === "open" ? false : ""))});`,
      );
      state[key] = name;
      state[`set${key}`] = setter;
      expressions[key] = name;
      if (handler)
        expressions[handler] =
          handler === "onChange"
            ? `event => ${setter}(event.target.${key})`
            : setter;
      delete props[key];
    };
    if (fields.has(node.type))
      bind("value", nativeFields.has(node.type) ? "onChange" : "onValueChange");
    if (node.type === "Slider" && node.suffix !== undefined)
      expressions.formatValue = `value => String(value) + ${JSON.stringify(node.suffix)}`;
    if (checks.has(node.type)) bind("checked", "onChange");
    if (expands.has(node.type)) bind("open", "onOpenChange");
    if (node.type === "SelectionBar") bind("count");
    if (node.type === "ConfirmDialog")
      expressions.onConfirm = `() => ${state.setopen}(false)`;
    if (node.type === "FileDropzone") {
      helpers.push(
        `const [files${suffix}, setFiles${suffix}] = useState<File[]>([]);`,
      );
      expressions.onFiles = `setFiles${suffix}`;
    }
    const panel = [...ancestors]
      .reverse()
      .find((parent) => panels.has(parent.node.type));
    if (node.action === "close" && panel)
      expressions.onClick = `() => ${panel.state.setopen}(false)`;
    if (
      node.type.startsWith("SelectionBar.") &&
      node.type.endsWith("Action") &&
      selection
    )
      expressions.onClick = `() => ${selection.state.setcount}(${node.type.endsWith("SelectAllAction") ? JSON.stringify(selection.node.props.total) : "0"})`;
    if (props["aria-label"] === "") delete props["aria-label"];
    if (props.defaultValue === "") delete props.defaultValue;
    const attributes = [
      ...Object.entries(props).map(
        ([key, value]) => `${key}=${literal(value)}`,
      ),
      ...Object.entries(expressions).map(
        ([key, expression]) => `${key}={${expression}}`,
      ),
    ];
    const open = `<${node.type}${attributes.length ? " " + attributes.join(" ") : ""}`;
    const children =
      node.text !== undefined
        ? literal(node.text)
        : node.children
            .map((child) => render(child, [...ancestors, { node, state }]))
            .join("\n");
    let markup = children
      ? `${open}>\n${children
          .split("\n")
          .map((line) => "  " + line)
          .join("\n")}\n</${node.type}>`
      : `${open} />`;
    if (node.type === "FileDropzone")
      markup = `<>\n${markup}\n{files${suffix}.length > 0 && <span role="status">{files${suffix}.map(file => file.name).join("、")}</span>}\n</>`;
    if (panels.has(node.type)) {
      imports.add("Button");
      markup = `<>\n<Button onClick={() => ${state.setopen}(true)}${node.type === "ConfirmDialog" ? ` disabled={${Boolean(node.props.busy)}}` : ""}>${node.type === "Toast" ? "显示提示" : "打开"}</Button>\n${markup}\n</>`;
    }
    return markup;
  };
  const markup = render(root, []);
  return `${helpers.length ? 'import { useState } from "react";\n' : ""}import { ${[...imports].join(", ")} } from "uagray";\nimport "uagray/styles.css";\n\nexport function Example() {\n${helpers.map((line) => "  " + line).join("\n")}${helpers.length ? "\n\n" : ""}  return (\n${markup
    .split("\n")
    .map((line) => "    " + line)
    .join("\n")}\n  );\n}`;
}
