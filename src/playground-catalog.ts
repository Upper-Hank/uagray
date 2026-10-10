import { DEFAULT_ICON_WEIGHT, iconNames } from "./ui/icons";

export type ChoiceItem = {
  value: string;
  label: string;
  disabled?: boolean;
  content?: string;
};
export type Value = string | number | boolean | ChoiceItem[];
export const choiceItems = (value: Value | undefined): ChoiceItem[] =>
  Array.isArray(value) ? value : [];
export type Args = Record<string, Value>;
export type ParameterGroup =
  "content" | "appearance" | "behavior" | "constraints";

export const parameterGroups: { id: ParameterGroup; title: string }[] = [
  { id: "content", title: "内容" },
  { id: "appearance", title: "视觉" },
  { id: "behavior", title: "行为" },
  { id: "constraints", title: "数值约束" },
];

export type Control = {
  key: string;
  scope: "prop" | "example";
  type: string;
  control: "text" | "textarea" | "boolean" | "number" | "enum" | "items";
  group?: ParameterGroup;
  exampleValue: Value;
  componentDefault?: Value;
  required?: boolean;
  description?: string;
  when?: (args: Args) => boolean;
  options?: readonly string[];
  min?: number;
  max?: number;
  step?: number;
};
export type ComponentEntry = {
  id: string;
  title: string;
  name: string;
  category: "component";
  fields: Control[];
  callbacks: string[];
};
const text = (key: string, exampleValue: string): Control => ({
  key,
  exampleValue,
  type: "string",
  scope: "prop",
  control: key === "code" || exampleValue.includes("\n") ? "textarea" : "text",
});
const bool = (key: string, exampleValue = false): Control => ({
  key,
  exampleValue,
  type: "boolean",
  control: "boolean",
  scope: "prop",
});
const number = (
  key: string,
  exampleValue: number,
  min = 0,
  max = 100,
  step = 1,
): Control => ({
  key,
  exampleValue,
  min,
  max,
  step,
  type: "number",
  control: "number",
  scope: "prop",
});
const choice = (
  key: string,
  exampleValue: string,
  options: readonly string[],
): Control => ({
  key,
  exampleValue,
  options,
  type: options.map((value) => JSON.stringify(value)).join(" | "),
  control: "enum",
  scope: "prop",
});
const items = (key: string, exampleValue: ChoiceItem[]): Control => ({
  key,
  exampleValue,
  type:
    key === "items"
      ? "TabItem[]"
      : "{ value: string; label: ReactNode; disabled?: boolean }[]",
  control: "items",
  scope: "prop",
  description: "value 是稳定标识；修改标签不会改变当前选择。",
});
const disabled = bool("disabled");
const label = text("label", "名称");
const content = text("children", "内容");
const size = choice("size", "default", ["default", "small"]);
const tone = choice("tone", "neutral", ["neutral", "success", "danger"]);
const icon = choice("icon", "plus", iconNames);
const feedbackIcon = (exampleValue = "auto"): Control => ({
  ...choice("icon", exampleValue, ["auto", "none", ...iconNames]),
  type: "IconName | false",
  description: "auto 省略属性，none 传入 false，其他值指定图标。",
});
const value = text("value", "");
const placeholder = text("placeholder", "");
const options = items("options", [
  { value: "0", label: "规范" },
  { value: "1", label: "Token" },
  { value: "2", label: "组件" },
]);
const componentDefaults: Record<string, Record<string, Value>> = {
  buttons: { emphasis: "default", tone: "neutral", size: "default" },
  "icon-button": { emphasis: "default", tone: "neutral", size: "default" },
  "button-group": { tone: "soft" },
  search: { shortcut: false },
  "color-picker": { label: "颜色", disabled: false },
  "number-input": { step: 1 },
  textarea: { rows: 3, resizable: true },
  fields: { required: false },
  slider: { min: 0, max: 100, step: 1, variant: "track", layout: "field" },
  dialog: { dismissible: true },
  drawer: { dismissible: true },
  "confirm-dialog": {
    danger: true,
    busy: false,
    confirmLabel: "确认删除",
    cancelLabel: "取消",
  },
  badge: { tone: "neutral", variant: "soft" },
  alert: { tone: "neutral" },
  toast: { tone: "neutral", duration: 4200 },
  progress: { max: 100 },
  "empty-state": { icon: "grid" },
  upload: { multiple: false, disabled: false, buttonLabel: "选择文件" },
  selection: { busy: false, tone: "plain" },
  text: { label: "Show full text", collapsedHeight: 210 },
  surface: { tone: "soft", treatment: "tonal" },
  icons: { size: 18, weight: DEFAULT_ICON_WEIGHT, absoluteWeight: true },
};
const requiredProps: Record<string, string[]> = {
  segments: ["label", "options", "value"],
  "button-group": ["label", "children"],
  "icon-button": ["label", "icon"],
  search: ["label", "value"],
  fields: ["label"],
  select: ["options"],
  tabs: ["label", "items", "value"],
  disclosure: ["title", "children"],
  dialog: ["open", "title"],
  drawer: ["open", "title"],
  "confirm-dialog": ["open", "title"],
  badge: ["children"],
  alert: ["children"],
  toast: ["open", "message"],
  "empty-state": ["title"],
  selection: ["count"],
  text: ["code"],
  cards: ["direction", "title", "href"],
  showcase: ["title", "href", "children"],
  icons: ["name"],
  keycap: ["children"],
  layout: ["children"],
};
const callbackContracts: Record<string, string[]> = {
  "color-picker": ["onValueChange(value: string)"],
  "number-input": ["onValueChange(value: number)"],
  segments: ["onChange(value: string)"],
  search: ["onChange(value: string)"],
  input: ["onChange(event: ChangeEvent<HTMLInputElement>)"],
  textarea: ["onChange(event: ChangeEvent<HTMLTextAreaElement>)"],
  select: ["onValueChange(value: string)"],
  checkbox: ["onChange(event: ChangeEvent<HTMLInputElement>)"],
  radio: ["onChange(event: ChangeEvent<HTMLInputElement>)"],
  switch: ["onChange(event: ChangeEvent<HTMLInputElement>)"],
  slider: [
    "onValueChange(value: number)",
    "formatValue(value: number): string",
  ],
  tabs: ["onChange(value: string)"],
  disclosure: ["onOpenChange(open: boolean)"],
  dialog: ["onOpenChange(open: boolean)"],
  drawer: ["onOpenChange(open: boolean)"],
  "confirm-dialog": ["onOpenChange(open: boolean)", "onConfirm()"],
  toast: ["onOpenChange(open: boolean)"],
  upload: ["onFiles(files: File[])", "onReject(message: string)"],
  selection: ["onSelectAll()", "onClear()", "onDone()"],
  buttons: ["onClick(event: MouseEvent<HTMLButtonElement>)"],
};
const exampleKeys: Record<string, string[]> = {
  buttons: ["action", "text", "url", "showCount"],
  slider: ["unit"],
  progress: ["indeterminate"],
  "empty-state": ["action"],
  navigation: ["previous", "next"],
  showcase: ["externalLabel", "externalHref"],
  links: ["label", "href", "icon"],
  "button-group": ["children"],
  layout: ["children"],
  shell: ["controls", "footer"],
};
const entry = (
  id: string,
  name: string,
  title: string,
  fields: Control[],
): ComponentEntry => ({
  id,
  name,
  title,
  category: "component",
  callbacks: callbackContracts[id] ?? [],
  fields: fields.map((field) => ({
    ...field,
    scope: exampleKeys[id]?.includes(field.key) ? "example" : "prop",
    type:
      id === "buttons" && field.key === "icon"
        ? "IconName | undefined"
        : ["children", "hint", "error", "valueLabel", "summary"].includes(
              field.key,
            ) && !exampleKeys[id]?.includes(field.key)
          ? "ReactNode（文本）"
          : field.type,
    componentDefault: componentDefaults[id]?.[field.key],
    required: requiredProps[id]?.includes(field.key) ?? false,
    description:
      id === "buttons" && field.key === "icon"
        ? "none 省略图标属性"
        : field.description,
    when:
      id === "showcase" && field.key === "externalHref"
        ? (args) => !!args.externalLabel
        : id === "buttons"
          ? (args) =>
              field.key === "action" ||
              (args.action === "copy"
                ? ["text", "children", "size"].includes(field.key)
                : args.action === "share"
                  ? field.key === "url"
                  : !["text", "url"].includes(field.key) &&
                    (field.key !== "count" || args.showCount === true))
          : id === "progress" && field.key === "value"
            ? (args) => !args.indeterminate
            : undefined,
    group:
      field.group ??
      ([
        "min",
        "max",
        "step",
        "maxSize",
        "duration",
        "collapsedHeight",
        "rows",
        "total",
      ].includes(field.key)
        ? "constraints"
        : [
              "tone",
              "variant",
              "emphasis",
              "treatment",
              "size",
              "icon",
              "name",
              "weight",
              "absoluteWeight",
              "layout",
              "direction",
            ].includes(field.key)
          ? "appearance"
          : field.control === "boolean" ||
              ["type", "action", "accept"].includes(field.key)
            ? "behavior"
            : "content"),
  })),
});
export const exampleArgs = (entry: ComponentEntry): Args =>
  Object.fromEntries(
    entry.fields.map((field) => [field.key, field.exampleValue]),
  );
export const visibleFields = (entry: ComponentEntry, args: Args) =>
  entry.fields.filter((field) => !field.when || field.when(args));
export function normalizeArgs(entry: ComponentEntry, args: Args): Args {
  const next = { ...args };
  if (["slider", "number-input"].includes(entry.id)) {
    next.max = Math.max(
      Number(next.min) + (entry.id === "slider" ? 1 : 0),
      Number(next.max),
    );
    next.value = Math.max(
      Number(next.min),
      Math.min(Number(next.max), Number(next.value)),
    );
  }
  if (entry.id === "selection")
    next.count = Math.min(Number(next.count), Number(next.total));
  if (entry.id === "progress")
    next.value = Math.min(Number(next.value), Number(next.max));
  if (["segments", "tabs", "select"].includes(entry.id)) {
    const enabled = choiceItems(
      next[entry.id === "tabs" ? "items" : "options"],
    ).filter((item) => !item.disabled);
    if (!enabled.some((item) => item.value === next.value))
      next.value = enabled[0]?.value ?? "";
  }
  return next;
}
export const componentEntries: ComponentEntry[] = [
  entry("color-picker", "ColorPicker", "Color picker", [
    text("label", "颜色"),
    text("value", "#3765D6"),
    disabled,
  ]),
  entry("number-input", "NumberInput", "Number input", [
    number("value", 10, -999, 999),
    number("min", 0, -999, 999),
    number("max", 100, -999, 999),
    number("step", 1, 0.1, 100, 0.1),
    disabled,
    bool("readOnly"),
  ]),
  entry("segments", "SegmentedControl", "Segmented control", [
    text("label", "分类"),
    options,
    choice("value", "0", ["0", "1", "2"]),
  ]),
  entry("search", "SearchField", "Search field", [
    text("label", "搜索"),
    value,
    text("placeholder", ""),
    bool("shortcut", true),
  ]),
  entry("buttons", "Button", "Button", [
    choice("action", "button", ["button", "copy", "share"]),
    text("children", "Like"),
    bool("showCount"),
    choice("emphasis", "default", ["strong", "default", "quiet"]),
    choice("tone", "neutral", ["neutral", "danger"]),
    size,
    choice("icon", "none", ["none", ...iconNames]),
    number("count", 0, 0, 999),
    disabled,
    text("text", "值得保存的内容"),
    text("url", "https://example.com"),
  ]),
  entry("icon-button", "IconButton", "Icon button", [
    text("label", "添加"),
    icon,
    size,
    choice("emphasis", "default", ["strong", "default", "quiet"]),
    choice("tone", "neutral", ["neutral", "danger"]),
    disabled,
  ]),
  entry("button-group", "ButtonGroup", "Button group", [
    choice("tone", "soft", ["soft", "plain"]),
    text("label", "成组操作"),
    text("children", "添加\n取消"),
  ]),
  entry("input", "Input", "Input", [
    value,
    placeholder,
    choice("type", "text", ["text", "email", "password", "number"]),
    disabled,
    bool("readOnly"),
    bool("required"),
  ]),
  entry("textarea", "Textarea", "Textarea", [
    value,
    placeholder,
    number("rows", 3, 1, 8),
    bool("resizable", true),
    disabled,
    bool("readOnly"),
    bool("required"),
  ]),
  entry("fields", "Field", "Field", [
    text("label", "项目名称"),
    text("hint", ""),
    text("error", ""),
    bool("required"),
  ]),
  entry("select", "Select", "Select", [
    choice("value", "svg", ["svg", "png", "pdf"]),
    items("options", [
      { value: "svg", label: "SVG" },
      { value: "png", label: "PNG" },
      { value: "pdf", label: "PDF", disabled: true },
    ]),
    text("placeholder", ""),
    disabled,
    bool("required"),
  ]),
  entry("checkbox", "Checkbox", "Checkbox", [
    label,
    bool("checked", true),
    disabled,
  ]),
  entry("radio", "Radio", "Radio", [label, bool("checked", true), disabled]),
  entry("switch", "Switch", "Switch", [
    text("label", ""),
    bool("checked", true),
    disabled,
  ]),
  entry("slider", "Slider", "Slider", [
    text("label", "Size"),
    choice("variant", "filled", ["filled", "track"]),
    choice("layout", "field", ["field", "inline", "bare"]),
    number("value", 140, 16, 256),
    number("min", 16, 0, 256),
    number("max", 256, 1, 512),
    number("step", 1, 1, 16),
    text("unit", "px"),
    disabled,
  ]),
  entry("tabs", "Tabs", "Tabs", [
    text("label", "内容切换"),
    items("items", [
      { value: "0", label: "项目", content: "" },
      { value: "1", label: "文件", content: "" },
      { value: "2", label: "记录", content: "", disabled: true },
    ]),
    choice("value", "0", ["0", "1", "2"]),
  ]),
  entry("disclosure", "Disclosure", "Disclosure", [
    text("title", "高级设置"),
    bool("open"),
    content,
  ]),
  entry("dialog", "Dialog", "Dialog", [
    text("title", "项目设置"),
    text("description", ""),
    bool("dismissible", true),
    bool("open"),
    content,
  ]),
  entry("drawer", "Drawer", "Drawer", [
    text("title", "详情"),
    text("description", ""),
    bool("dismissible", true),
    bool("open"),
    content,
  ]),
  entry("confirm-dialog", "ConfirmDialog", "Confirm dialog", [
    text("title", "删除文件？"),
    text("description", "此操作无法撤销。"),
    text("confirmLabel", "确认删除"),
    text("cancelLabel", "取消"),
    bool("danger", true),
    bool("busy"),
    bool("open"),
  ]),
  entry("badge", "Badge", "Badge", [
    content,
    tone,
    choice("variant", "soft", ["soft", "plain", "white"]),
    feedbackIcon("none"),
  ]),
  entry("alert", "Alert", "Alert", [
    text("title", ""),
    text("children", "连接已断开，请重试。"),
    tone,
    feedbackIcon(),
  ]),
  entry("toast", "Toast", "Toast", [
    text("message", "设置已保存"),
    feedbackIcon(),
    tone,
    number("duration", 4200, 0, 10000, 100),
    bool("open"),
  ]),
  entry("progress", "Progress", "Progress", [
    text("label", ""),
    text("valueLabel", ""),
    number("value", 48),
    number("max", 100, 1, 200),
    bool("indeterminate"),
  ]),
  entry("empty-state", "EmptyState", "Empty state", [
    text("title", "还没有文件"),
    feedbackIcon("grid"),
    text("description", ""),
    bool("action"),
  ]),
  entry("upload", "FileDropzone", "File dropzone", [
    text("label", ""),
    text("buttonLabel", "选择文件"),
    text("accept", ".svg,.png"),
    bool("multiple"),
    number("maxSize", 5 * 1024 * 1024, 1, 20 * 1024 * 1024, 1024),
    disabled,
  ]),
  entry("selection", "SelectionBar", "Selection bar", [
    choice("tone", "plain", ["plain", "soft"]),
    text("summary", ""),
    number("count", 0, 0, 10),
    number("total", 10, 0, 100),
    bool("busy"),
  ]),
  entry("text", "ExpandableCode", "Expandable text", [
    text(
      "code",
      "A small interface, quiet by design.\n\n" +
        "Use space to establish hierarchy.\n".repeat(10),
    ),
    text("label", "Show full prompt"),
    number("collapsedHeight", 180, 80, 320),
  ]),
  entry("navigation", "Pager", "Page navigation", [
    bool("previous", true),
    bool("next", true),
  ]),
  entry("cards", "NavigationCard", "Navigation card", [
    choice("direction", "previous", ["previous", "next"]),
    text("directionLabel", ""),
    text("title", "颜色 Token"),
    text("href", "#surfaces"),
  ]),
  entry("showcase", "ShowcaseCard", "Showcase card", [
    text("title", "内容卡片"),
    text("externalLabel", ""),
    text("externalHref", "https://icon.upper.website"),
    text("description", ""),
    text("href", "#buttons"),
    content,
  ]),
  entry("links", "ExternalLinks", "External links", [
    text("label", "Uplus Icon"),
    text("href", "https://icon.upper.website"),
    choice("icon", "globe", iconNames),
  ]),
  entry("surface", "Surface", "Surface", [
    content,
    choice("tone", "soft", ["soft", "raised"]),
    choice("treatment", "tonal", ["tonal", "defined", "physical"]),
  ]),
  entry("icons", "Icon", "Icon", [
    choice("name", "search", iconNames),
    number("size", 24, 12, 64),
    number("weight", DEFAULT_ICON_WEIGHT, 0.5, 2, 0.25),
    bool("absoluteWeight", true),
  ]),
  entry("keycap", "Keycap", "Keycap", [text("children", "/")]),
  entry("layout", "Layout", "Layout", [
    text("label", "布局"),
    text("children", "生成预览"),
  ]),
  entry("shell", "PageShell", "Page shell", [
    text("controls", "页头"),
    content,
    bool("footer"),
  ]),
];

export const lines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
