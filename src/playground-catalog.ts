import { DEFAULT_ICON_WEIGHT, iconNames } from "./ui/icons";

export type ChoiceItem = {
  value: string;
  label: string;
  disabled?: boolean;
  content?: string;
  count?: string;
  href?: string;
  icon?: string;
};
export type Value = string | number | boolean | ChoiceItem[];
export const choiceItems = (value: Value | undefined): ChoiceItem[] =>
  Array.isArray(value) ? value : [];
export type Args = Record<string, Value>;
export type ParameterGroup =
  "content" | "appearance" | "state" | "behavior" | "constraints";

export const parameterGroups: { id: ParameterGroup; title: string }[] = [
  { id: "content", title: "内容" },
  { id: "appearance", title: "视觉" },
  { id: "state", title: "状态" },
  { id: "behavior", title: "行为" },
  { id: "constraints", title: "数值约束" },
];

export type Control = {
  key: string;
  scope: "prop" | "example" | "slot";
  type: string;
  control: "text" | "textarea" | "boolean" | "number" | "enum" | "items";
  group?: ParameterGroup;
  exampleValue: Value;
  componentDefault?: Value;
  required?: boolean;
  /** Visible content name. Slot editors use this instead of a public prop key. */
  label?: string;
  description?: string;
  when?: (args: Args) => boolean;
  removable?: (args: Args) => boolean;
  requiredWhen?: (args: Args) => boolean;
  editor?: "options" | "segments" | "tabs" | "links";
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
const slot = (
  key: string,
  exampleValue: string,
  label: string,
  options: Partial<Control> = {},
): Control => ({
  ...text(key, exampleValue),
  ...options,
  key,
  exampleValue,
  scope: "slot",
  label,
  group: "content",
});
const regionRemains = (args: Args, except: string) => {
  const title = except === "title" ? "" : args.title;
  const description = except === "description" ? "" : args.description;
  const body = except === "body" ? "" : args.body;
  const footer = except === "footer" ? false : args.footer;
  return Boolean(
    String(title ?? "").trim() ||
    String(description ?? "").trim() ||
    String(body ?? "").trim() ||
    footer === true,
  );
};
const confirmRemains = (args: Args, except: string) =>
  ["title", "description", "confirmLabel", "cancelLabel"].some(
    (key) => key !== except && String(args[key] ?? "").trim(),
  );
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
const content = text("children", "内容");
const size = choice("size", "md", ["md", "sm"]);
const tone = choice("tone", "neutral", ["neutral", "success", "danger"]);
const icon = choice("icon", "plus", iconNames);
const value = text("value", "");
const placeholder = text("placeholder", "");
type EntryMeta = {
  defaults?: Record<string, Value>;
  required?: readonly string[];
  callbacks?: readonly string[];
  example?: readonly string[];
};
const meta: Record<string, EntryMeta> = {
  buttons: {
    defaults: {
      emphasis: "default",
      tone: "neutral",
      size: "md",
      copiedLabel: "已复制",
      copyingLabel: "正在复制…",
      copyFailedLabel: "复制失败",
      busy: false,
    },
    callbacks: ["onClick(event: MouseEvent<HTMLButtonElement>)"],
    example: ["action"],
  },
  "icon-button": {
    defaults: { emphasis: "default", tone: "neutral", size: "md" },
    required: ["aria-label", "icon"],
  },
  "button-group": {
    defaults: { variant: "contained" },
    required: ["aria-label", "children"],
    example: ["children"],
  },
  search: {
    defaults: { shortcut: false },
    required: ["aria-label"],
    callbacks: ["onValueChange(value: string)"],
  },
  "color-picker": {
    defaults: { "aria-label": "颜色", disabled: false },
    callbacks: ["onValueChange(value: string)"],
  },
  "number-input": {
    defaults: { step: 1 },
    callbacks: ["onValueChange(value: number)"],
  },
  textarea: {
    defaults: { rows: 3, resizable: true },
    callbacks: ["onChange(event: ChangeEvent<HTMLTextAreaElement>)"],
  },
  fields: { defaults: { required: false } },
  slider: {
    defaults: { min: 0, max: 100, step: 1, variant: "track", layout: "field" },
    callbacks: [
      "onValueChange(value: number)",
      "formatValue(value: number): string",
    ],
    example: ["unit"],
  },
  dialog: {
    defaults: { dismissible: true },
    required: ["open"],
    callbacks: ["onOpenChange(open: boolean)"],
  },
  drawer: {
    defaults: { dismissible: true },
    required: ["open"],
    callbacks: ["onOpenChange(open: boolean)"],
  },
  "confirm-dialog": {
    defaults: {
      tone: "neutral",
      busy: false,
    },
    required: ["open"],
    callbacks: ["onOpenChange(open: boolean)", "onConfirm()"],
  },
  badge: {
    defaults: { tone: "neutral", emphasis: "default" },
  },
  alert: { defaults: { tone: "neutral" } },
  toast: {
    defaults: { tone: "neutral", duration: 4200, closeLabel: "关闭提示" },
    required: ["open"],
    callbacks: ["onOpenChange(open: boolean)"],
  },
  progress: {
    defaults: { max: 100 },
    example: ["indeterminate"],
  },
  upload: {
    defaults: { multiple: false, disabled: false },
    callbacks: ["onFiles(files: File[])", "onReject(message: string)"],
  },
  selection: {
    defaults: {
      busy: false,
      variant: "plain",
      "aria-label": "批量操作",
    },
    required: ["count"],
    callbacks: [
      "SelectAllAction.onClick(event)",
      "ClearAction.onClick(event)",
      "DoneAction.onClick(event)",
    ],
  },
  text: {
    defaults: {
      collapsedHeight: 210,
      "aria-label": "可展开文本",
    },
    required: ["code"],
  },
  spinner: {
    defaults: { size: "md", "aria-label": "加载中" },
    required: ["aria-label"],
  },
  "toast-region": {
    defaults: { "aria-label": "通知" },
    required: ["children"],
    example: ["open"],
  },
  surface: { defaults: { variant: "soft", treatment: "tonal" } },
  icons: {
    defaults: { size: 18, weight: DEFAULT_ICON_WEIGHT, absoluteWeight: true },
    required: ["name"],
  },
  segments: {
    required: ["aria-label"],
    callbacks: ["onValueChange(value: string)"],
  },
  input: { callbacks: ["onChange(event: ChangeEvent<HTMLInputElement>)"] },
  select: {
    callbacks: ["onValueChange(value: string)"],
  },
  checkbox: { callbacks: ["onChange(event: ChangeEvent<HTMLInputElement>)"] },
  radio: { callbacks: ["onChange(event: ChangeEvent<HTMLInputElement>)"] },
  switch: { callbacks: ["onChange(event: ChangeEvent<HTMLInputElement>)"] },
  tabs: {
    required: ["aria-label"],
    callbacks: ["onValueChange(value: string)"],
  },
  disclosure: {
    callbacks: ["onOpenChange(open: boolean)"],
  },
  "empty-state": {},
  cards: { required: ["direction", "href"] },
  showcase: {
    required: ["title", "href", "children"],
    example: ["externalLabel", "externalHref"],
  },
  keycap: { required: ["children"] },
  layout: { required: ["children"], example: ["children"] },
  navigation: {
    defaults: { variant: "contained" },
    example: ["previous", "next"],
  },
  "action-row": { example: ["children", "size", "disabled"] },
  heading: {
    defaults: { level: 2, variant: "section" },
    required: ["children"],
  },
  "body-text": {
    defaults: { as: "p", variant: "body" },
    required: ["children"],
  },
  "text-list": {
    defaults: { ordered: false, variant: "contained" },
    required: ["children"],
  },
  "description-list": {
    defaults: { variant: "contained" },
    required: ["children"],
    example: ["label", "description"],
  },
  links: {},
  shell: {},
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
  callbacks: [...(meta[id]?.callbacks ?? [])],
  fields: fields.map((field) => ({
    ...field,
    scope:
      field.scope === "slot" || field.scope === "example"
        ? field.scope
        : meta[id]?.example?.includes(field.key)
          ? "example"
          : "prop",
    type:
      field.scope === "slot" &&
      (["text", "textarea"].includes(field.control) || field.key === "icon") &&
      field.key !== "code" &&
      !field.key.endsWith("Href")
        ? "ReactNode"
        : id === "buttons" && field.key === "icon"
          ? "IconName | undefined"
          : [
                "title",
                "label",
                "description",
                "children",
                "hint",
                "error",
                "valueLabel",
                "summary",
              ].includes(field.key) && !meta[id]?.example?.includes(field.key)
            ? "ReactNode"
            : field.key === "icon" || (id === "icons" && field.key === "name")
              ? field.type.startsWith("IconName")
                ? field.type
                : "IconName"
              : field.type,
    componentDefault: meta[id]?.defaults?.[field.key],
    required:
      field.required || (meta[id]?.required?.includes(field.key) ?? false),
    description: field.description,
    when:
      field.when ??
      (id === "showcase" && field.key === "externalHref"
        ? (args) => !!args.externalLabel
        : id === "progress" && field.key === "value"
          ? (args) => !args.indeterminate
          : undefined),
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
              "weight",
              "absoluteWeight",
              "layout",
              "direction",
            ].includes(field.key)
          ? "appearance"
          : [
                "value",
                "defaultValue",
                "checked",
                "defaultChecked",
                "open",
                "defaultOpen",
                "count",
                "disabled",
                "readOnly",
                "busy",
              ].includes(field.key)
            ? "state"
            : field.control === "boolean" ||
                ["type", "action", "accept"].includes(field.key) ||
                (field.key === "name" && id !== "icons")
              ? "behavior"
              : "content"),
  })),
});
export const exampleArgs = (entry: ComponentEntry): Args =>
  Object.fromEntries(
    entry.fields.map((field) => [field.key, field.exampleValue]),
  );
export const visibleFields = (entry: ComponentEntry, args: Args) =>
  entry.fields
    .filter((field) => !field.when || field.when(args))
    .map((field) =>
      entry.id === "buttons" && field.key === "size" && args.action !== "button"
        ? { ...field, componentDefault: "sm" }
        : field,
    );
export function normalizeArgs(entry: ComponentEntry, args: Args): Args {
  const next = { ...args };
  if (entry.id === "heading")
    next.level = Math.max(1, Math.min(6, Math.round(Number(next.level) || 2)));
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
    next.count = Math.max(0, Math.min(Number(next.count), Number(next.total)));
  if (entry.id === "buttons" && !String(next.children ?? "").trim())
    next.count = "";
  if (entry.id === "progress")
    next.value = Math.min(Number(next.value), Number(next.max));
  if (["segments", "tabs", "select"].includes(entry.id)) {
    const enabled = choiceItems(next.entries).filter((item) => !item.disabled);
    if (!enabled.some((item) => item.value === next.value))
      next.value = enabled[0]?.value ?? "";
  }
  return next;
}
export const componentEntries: ComponentEntry[] = [
  entry("color-picker", "ColorPicker", "Color picker", [
    text("aria-label", "颜色"),
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
    text("aria-label", "分类"),
    {
      ...items("entries", [
        { value: "0", label: "规范" },
        { value: "1", label: "Token", count: "12" },
        { value: "2", label: "组件", disabled: true },
      ]),
      scope: "slot",
      label: "Item",
      group: "content",
      editor: "segments",
    },
    choice("value", "0", ["0", "1", "2"]),
    text("defaultValue", ""),
  ]),
  entry("search", "SearchField", "Search field", [
    text("aria-label", "搜索"),
    value,
    text("defaultValue", ""),
    text("placeholder", ""),
    bool("shortcut", true),
    disabled,
  ]),
  entry("buttons", "Button", "Button", [
    {
      ...choice("action", "button", ["button", "copy", "share"]),
      scope: "example",
    },
    slot("children", "Like", "Label", {
      requiredWhen: (args) => !args.icon || args.icon === "none",
      removable: (args) =>
        Boolean(
          args.icon && args.icon !== "none" && !String(args.count ?? "").trim(),
        ),
    }),
    {
      ...choice("icon", "none", ["none", ...iconNames]),
      scope: "slot",
      label: "Icon",
      group: "content",
    },
    slot("count", "", "Count", { when: (args) => Boolean(args.children) }),
    text("aria-label", ""),
    choice("shape", "inline", ["inline", "square"]),
    choice("emphasis", "default", ["strong", "default", "quiet"]),
    choice("tone", "neutral", ["neutral", "danger"]),
    size,
    disabled,
    bool("busy"),
    {
      ...text("text", "值得保存的内容"),
      when: (args) => args.action === "copy",
    },
    {
      ...text("url", "https://example.com"),
      when: (args) => args.action === "share",
    },
    slot("copiedLabel", "已复制", "Feedback · success", {
      when: (args) => args.action !== "button",
    }),
    slot("copyingLabel", "正在复制…", "Feedback · pending", {
      when: (args) => args.action !== "button",
    }),
    slot("copyFailedLabel", "复制失败", "Feedback · error", {
      when: (args) => args.action !== "button",
    }),
  ]),
  entry("icon-button", "Button", "Icon button", [
    text("aria-label", "添加"),
    { ...icon, scope: "slot", label: "Icon", group: "content", required: true },
    choice("shape", "square", ["inline", "square"]),
    size,
    choice("emphasis", "default", ["strong", "default", "quiet"]),
    choice("tone", "neutral", ["neutral", "danger"]),
    disabled,
    bool("busy"),
  ]),
  entry("button-group", "ButtonGroup", "Button group", [
    choice("variant", "contained", ["contained", "plain"]),
    text("aria-label", "成组操作"),
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
    slot("label", "项目名称", "Label", { removable: () => true }),
    slot("description", "", "Description"),
    slot("error", "", "Error"),
    bool("required"),
  ]),
  entry("select", "Select", "Select", [
    choice("value", "svg", ["svg", "png", "pdf"]),
    {
      ...items("entries", [
        { value: "svg", label: "SVG" },
        { value: "png", label: "PNG" },
        { value: "pdf", label: "PDF", disabled: true },
      ]),
      scope: "slot",
      label: "Item",
      group: "content",
    },
    text("placeholder", ""),
    disabled,
    bool("required"),
  ]),
  entry("checkbox", "Checkbox", "Checkbox", [
    slot("label", "名称", "Label", { removable: () => true }),
    bool("checked", true),
    disabled,
  ]),
  entry("radio", "Radio", "Radio", [
    slot("label", "名称", "Label", { removable: () => true }),
    bool("checked", true),
    disabled,
  ]),
  entry("switch", "Switch", "Switch", [
    slot("label", "", "Label"),
    bool("checked", true),
    disabled,
  ]),
  entry("slider", "Slider", "Slider", [
    slot("label", "Size", "Label", { removable: () => true }),
    {
      ...bool("reading", true),
      scope: "slot",
      label: "Value",
      group: "content",
    },
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
    text("aria-label", "内容切换"),
    text("defaultValue", ""),
    {
      ...items("entries", [
        { value: "0", label: "项目", content: "项目内容" },
        { value: "1", label: "文件", content: "文件内容" },
        { value: "2", label: "记录", content: "", disabled: true },
      ]),
      scope: "slot",
      label: "Item",
      group: "content",
      editor: "tabs",
    },
    choice("value", "0", ["0", "1", "2"]),
  ]),
  entry("disclosure", "Disclosure", "Disclosure", [
    slot("title", "高级设置", "Trigger", { required: true }),
    slot("actions", "", "Actions"),
    slot("body", "内容", "Body", { required: true }),
    bool("open"),
  ]),
  entry("dialog", "Dialog", "Dialog", [
    slot("title", "项目设置", "Title", {
      removable: (args) => regionRemains(args, "title"),
    }),
    slot("description", "", "Description", {
      removable: (args) => regionRemains(args, "description"),
    }),
    slot("body", "内容", "Body", {
      removable: (args) => regionRemains(args, "body"),
    }),
    {
      ...bool("footer", true),
      scope: "slot",
      label: "Footer",
      group: "content",
      removable: (args) => regionRemains(args, "footer"),
    },
    bool("dismissible", true),
    bool("open"),
  ]),
  entry("drawer", "Drawer", "Drawer", [
    slot("title", "详情", "Title", {
      removable: (args) => regionRemains(args, "title"),
    }),
    slot("description", "", "Description", {
      removable: (args) => regionRemains(args, "description"),
    }),
    slot("body", "内容", "Body", {
      removable: (args) => regionRemains(args, "body"),
    }),
    {
      ...bool("footer", true),
      scope: "slot",
      label: "Footer",
      group: "content",
      removable: (args) => regionRemains(args, "footer"),
    },
    bool("dismissible", true),
    bool("open"),
  ]),
  entry("confirm-dialog", "ConfirmDialog", "Confirm dialog", [
    slot("title", "删除文件？", "Title", {
      removable: (args) => confirmRemains(args, "title"),
    }),
    slot("description", "此操作无法撤销。", "Description", {
      removable: (args) => confirmRemains(args, "description"),
    }),
    slot("confirmLabel", "确认删除", "ConfirmAction", {
      removable: (args) => confirmRemains(args, "confirmLabel"),
    }),
    slot("cancelLabel", "取消", "CancelAction", {
      removable: (args) => confirmRemains(args, "cancelLabel"),
    }),
    text("aria-label", "确认操作"),
    choice("tone", "danger", ["neutral", "danger"]),
    bool("busy"),
    bool("open"),
  ]),
  entry("badge", "Badge", "Badge", [
    slot("label", "内容", "Label", { required: true }),
    {
      ...choice("icon", "", ["", ...iconNames]),
      scope: "slot",
      label: "Icon",
      group: "content",
      removable: () => true,
    },
    tone,
    choice("emphasis", "default", ["default", "quiet"]),
  ]),
  entry("alert", "Alert", "Alert", [
    slot("title", "", "Title", {
      removable: (args) => String(args.body ?? "").trim().length > 0,
    }),
    slot("body", "连接已断开，请重试。", "Body", {
      removable: (args) => String(args.title ?? "").trim().length > 0,
      requiredWhen: (args) => !String(args.title ?? "").trim(),
    }),
    {
      ...choice("icon", "info", iconNames),
      scope: "slot",
      label: "Icon",
      group: "content",
      required: true,
    },
    tone,
  ]),
  entry("toast", "Toast", "Toast", [
    slot("body", "设置已保存", "Body", { required: true }),
    {
      ...choice("icon", "", ["", ...iconNames]),
      scope: "slot",
      label: "Icon",
      group: "content",
      removable: () => true,
    },
    tone,
    number("duration", 4200, 0, 10000, 100),
    text("closeLabel", "关闭提示"),
    bool("open"),
  ]),
  entry("toast-region", "ToastRegion", "Toast region", [
    text("aria-label", "通知"),
    text("children", "第一条"),
    bool("open", true),
  ]),
  entry("spinner", "Spinner", "Spinner", [
    slot("label", "", "Label"),
    text("aria-label", "加载中"),
    size,
  ]),
  entry("progress", "Progress", "Progress", [
    slot("label", "", "Label"),
    text("aria-label", ""),
    slot("valueLabel", "", "Value"),
    number("value", 48),
    number("max", 100, 1, 200),
    bool("indeterminate"),
  ]),
  entry("empty-state", "EmptyState", "Empty state", [
    slot("title", "还没有文件", "Title", { required: true }),
    slot("description", "", "Description"),
    {
      ...choice("icon", "", ["", ...iconNames]),
      scope: "slot",
      label: "Icon",
      group: "content",
      removable: () => true,
    },
    {
      ...bool("showActions"),
      scope: "slot",
      label: "Actions",
      group: "content",
    },
    slot("actionLabel", "添加文件", "Actions.Button.Label", {
      required: true,
      when: (args) => args.showActions === true,
    }),
  ]),
  entry("upload", "FileDropzone", "File dropzone", [
    {
      ...choice("icon", "plus", iconNames),
      scope: "slot",
      label: "Icon",
      group: "content",
      required: true,
    },
    slot("label", "", "Description"),
    slot("buttonLabel", "选择文件", "Trigger", { required: true }),
    {
      ...bool("showError", true),
      scope: "slot",
      label: "Error",
      group: "content",
    },
    {
      ...choice("errorSource", "auto", ["auto", "custom"]),
      scope: "slot",
      label: "Error.source",
      group: "content",
      when: (args) => args.showError === true,
    },
    slot("error", "", "Error.children", {
      when: (args) => args.showError === true && args.errorSource === "custom",
    }),
    text("accept", ".svg,.png"),
    bool("multiple"),
    number("maxSize", 5 * 1024 * 1024, 1, 20 * 1024 * 1024, 1024),
    disabled,
  ]),
  entry("selection", "SelectionBar", "Selection bar", [
    choice("variant", "plain", ["contained", "plain"]),
    slot("summary", "已选择 {count} 项", "Description"),
    slot("selectAllLabel", "全选", "SelectAllAction"),
    slot("clearLabel", "清空", "ClearAction"),
    slot("doneLabel", "完成", "DoneAction"),
    number("count", 4, 0, 10),
    number("total", 10, 0, 100),
    bool("busy"),
  ]),
  entry("text", "ExpandableCode", "Expandable text", [
    slot(
      "code",
      "A small interface, quiet by design.\n\n" +
        "Use space to establish hierarchy.\n".repeat(10),
      "Body",
      { required: true, type: "string" },
    ),
    slot("copyLabel", "复制", "CopyAction"),
    slot("expandLabel", "展开全文", "ExpandAction"),
    slot("collapseLabel", "收起全文", "CollapseAction"),
    text("aria-label", "可展开文本"),
    number("collapsedHeight", 180, 80, 320),
  ]),
  entry("navigation", "Pager", "Page navigation", [
    choice("variant", "contained", ["contained", "plain"]),
    slot("previousLabel", "按钮", "Previous"),
    {
      ...text("previousHref", "#buttons"),
      scope: "slot",
      label: "Previous.href",
      group: "content",
    },
    slot("nextLabel", "输入", "Next"),
    {
      ...text("nextHref", "#input"),
      scope: "slot",
      label: "Next.href",
      group: "content",
    },
  ]),
  entry("action-row", "ActionRow", "Action row", [
    text("children", "分享"),
    size,
    disabled,
  ]),
  entry("heading", "Heading", "Heading", [
    text("children", "清楚的阅读层级"),
    number("level", 2, 1, 6),
    choice("variant", "section", ["page", "section"]),
  ]),
  entry("body-text", "Text", "Text", [
    text(
      "children",
      "用内容、留白与清楚的层级组织信息，让读者自然找到需要的内容。",
    ),
    choice("as", "p", ["p", "span"]),
    choice("variant", "body", ["body", "supporting"]),
  ]),
  entry("text-list", "TextList", "Text list", [
    text(
      "children",
      "明确任务与内容关系\n复用现有组件与语义资源\n保留真实状态与操作反馈",
    ),
    bool("ordered"),
    choice("variant", "contained", ["contained", "plain"]),
  ]),
  entry("description-list", "DescriptionList", "Description list", [
    text("label", "设计关注\n构建方式"),
    text("description", "清晰的内容层级与操作关系\nUagray 组件与原生 CSS"),
    choice("variant", "contained", ["contained", "plain"]),
  ]),
  entry("cards", "NavigationCard", "Navigation card", [
    choice("direction", "previous", ["previous", "next"]),
    slot("description", "", "Description"),
    slot("title", "颜色 Token", "Title", { required: true }),
    text("href", "#surfaces"),
  ]),
  entry("showcase", "ShowcaseCard", "Showcase card", [
    slot("title", "字与留白", "Title", { required: true }),
    slot("externalLabel", "", "ExternalLink"),
    {
      ...text("externalHref", "https://icon.upper.website"),
      scope: "slot",
      label: "ExternalLink.href",
      group: "content",
    },
    slot("description", "以字号、行距与留白建立阅读层次。", "Description"),
    text("href", "#text"),
    slot("children", "Aa  字\n\n字与留白\nType & Space\n0123456789", "Media", {
      required: true,
    }),
  ]),
  entry("links", "ExternalLinks", "External links", [
    {
      ...items("entries", [
        {
          value: "uplus",
          label: "Uplus Icon",
          href: "https://icon.upper.website",
          icon: "earth",
        },
      ]),
      scope: "slot",
      label: "Item",
      group: "content",
      editor: "links",
    },
  ]),
  entry("surface", "Surface", "Surface", [
    content,
    choice("variant", "soft", ["soft", "raised"]),
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
    text("aria-label", "布局"),
    text("children", "生成预览"),
  ]),
  entry("shell", "PageShell", "Page shell", [
    slot("header", "页头", "Header", { removable: () => true }),
    slot("body", "内容", "Body", { required: true }),
    slot("footer", "", "Footer"),
  ]),
];

export const lines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

/** Text-only row configuration belongs to the example, not the public dl API. */
export function descriptionRows(args: Args) {
  if (!args.label && !args.description) return [];
  const labels = String(args.label ?? "").split(/\r?\n/);
  const descriptions = String(args.description ?? "").split(/\r?\n/);
  return Array.from(
    { length: Math.max(labels.length, descriptions.length) },
    (_, index) => ({
      label: labels[index] ?? "",
      description: descriptions[index] ?? "",
    }),
  );
}

export function presetArgs(entry: ComponentEntry, action: string): Args {
  const args = exampleArgs(entry);
  if (entry.id !== "buttons") return args;
  return {
    ...args,
    action,
    children: action === "copy" ? "复制" : action === "share" ? "分享" : "Like",
    icon: action === "button" ? "none" : action === "copy" ? "copy" : "share",
  };
}
