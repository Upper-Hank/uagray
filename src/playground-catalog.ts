import { DEFAULT_ICON_WEIGHT, iconNames } from "./ui/icons";

export type Value = string | number | boolean;
export type Args = Record<string, Value>;
export type ParameterGroup =
  "content" | "appearance" | "behavior" | "constraints";

export const parameterGroups: { id: ParameterGroup; title: string }[] = [
  { id: "content", title: "内容" },
  { id: "appearance", title: "视觉" },
  { id: "behavior", title: "行为" },
  { id: "constraints", title: "数值约束" },
];

type Control = {
  key: string;
  group?: ParameterGroup;
  initial: Value;
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
};
const text = (key: string, initial: string): Control => ({
  key,
  initial,
});
const bool = (key: string, initial = false): Control => ({
  key,
  initial,
});
const number = (
  key: string,
  initial: number,
  min = 0,
  max = 100,
  step = 1,
): Control => ({
  key,
  initial,
  min,
  max,
  step,
});
const choice = (
  key: string,
  initial: string,
  options: readonly string[],
): Control => ({ key, initial, options });
const disabled = bool("disabled");
const label = text("label", "名称");
const content = text("children", "内容");
const size = choice("size", "default", ["default", "small"]);
const tone = choice("tone", "neutral", ["neutral", "success", "danger"]);
const icon = choice("icon", "plus", iconNames);
const feedbackIcon = (initial = "auto") =>
  choice("icon", initial, ["auto", "none", ...iconNames]);
const value = text("value", "");
const placeholder = text("placeholder", "");
const formats = choice("value", "svg", ["svg", "png"]);
const options = text("options", "规范\nToken\n组件");
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
  fields: fields.map((field) => ({
    ...field,
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
              "treatment",
              "size",
              "icon",
              "name",
              "weight",
              "absoluteWeight",
              "layout",
              "direction",
              "unit",
            ].includes(field.key)
          ? "appearance"
          : typeof field.initial === "boolean" ||
              ["type", "action", "accept"].includes(field.key)
            ? "behavior"
            : "content"),
  })),
});
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
    bool("lastDisabled"),
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
    choice("variant", "soft", ["soft", "plain", "white", "dark", "danger"]),
    size,
    icon,
    number("count", 0, 0, 999),
    disabled,
    text("text", "值得保存的内容"),
    text("url", "https://example.com"),
  ]),
  entry("icon-button", "IconButton", "Icon button", [
    text("label", "添加"),
    icon,
    size,
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
    formats,
    text("placeholder", ""),
    disabled,
    bool("required"),
    bool("lastDisabled", true),
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
    text("items", "项目\n文件\n记录"),
    text("contents", ""),
    choice("value", "0", ["0", "1", "2"]),
    bool("lastDisabled", true),
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
