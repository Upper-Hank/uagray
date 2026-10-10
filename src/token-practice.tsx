import { useEffect, useState } from "react";
import { CopyButton } from "./ui";

type TokenGroup = {
  id: string;
  title: string;
  description: string;
  kind: "color" | "type" | "space" | "radius" | "size";
  names: readonly string[];
};
const names = (prefix: string, values: readonly (string | number)[]) =>
  values.map((value) => `--ui-${prefix}-${value}`);
export const tokenGroups: TokenGroup[] = [
  {
    id: "surfaces",
    title: "颜色 Color",
    description: "基础灰阶与表面、内容、操作、状态的语义颜色。",
    kind: "color",
    names: [
      ...names(
        "gray",
        [0, 25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 900],
      ),
      ...[
        "preview-border",
        "border-soft",
        "focus-outline",
        "scrollbar-thumb",
        "scrollbar-thumb-hover",
        "raised",
        "action",
        "action-hover",
        "on-action",
        "on-danger",
        "danger-action",
        "background",
        "surface",
        "surface-hover",
        "raised-hover",
        "control",
        "control-hover",
        "selected",
        "region",
        "region-hover",
        "region-control",
        "region-control-hover",
        "success-fill",
        "danger-fill",
        "range-track",
        "white",
        "text",
        "body",
        "button-text",
        "muted",
        "disabled",
        "danger",
        "danger-hover",
        "danger-surface",
        "success",
        "success-surface",
      ].map((name) => `--ui-${name}`),
    ],
  },
  {
    id: "type",
    title: "排版 Typography",
    description: "字体、字号、字重和行高组成内容层级。",
    kind: "type",
    names: [
      "--ui-font",
      "--ui-mono",
      ...names("font-size", [
        "xs",
        "sm",
        "control",
        "body",
        "md",
        "lg",
        "xl",
        "reading-title",
        "reading-lead",
      ]),
      ...names("font-weight", ["regular", "medium"]),
      ...names("font-size", ["label", "control-value", "status-title"]),
      ...names("font-weight", [
        "button",
        "label",
        "control-value",
        "status-title",
      ]),
      ...names("line-height", ["tight", "body", "relaxed", "reading"]),
    ],
  },
  {
    id: "space",
    title: "间距 Space",
    description: "从细节到区域的间距阶梯，并用少量语义别名明确用途。",
    kind: "space",
    names: [
      ...names(
        "space",
        Array.from({ length: 13 }, (_, i) => i),
      ),
      "--ui-gap-control",
      "--ui-gap-stack",
      "--ui-padding-control",
      "--ui-padding-panel",
    ],
  },
  {
    id: "radius",
    title: "圆角 Radius",
    description:
      "标记 4px、小控件 8px、普通控件 12px；容器按内圆角加实际留白派生。",
    kind: "radius",
    names: [
      ...names("radius", [
        0,
        1,
        2,
        3,
        4,
        5,
        "full",
        "sm",
        "control",
        "card",
        "surface",
      ]),
    ],
  },
  {
    id: "sizes",
    title: "尺寸 Size",
    description: "统一控件、图标与内容容器的尺寸；尺寸和间距分开表达。",
    kind: "size",
    names: names("size", [
      "control-sm",
      "control",
      "control-lg",
      "icon-sm",
      "icon",
      "icon-lg",
      "choice",
      "thumb",
      "content",
      "dialog",
      "drawer",
      "scrollbar",
    ]),
  },
];
export function TokenPractice({ id }: { id: string }) {
  const group = tokenGroups.find((group) => group.id === id)!;
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      const styles = getComputedStyle(root);
      setValues(
        Object.fromEntries(
          group.names.map((name) => [
            name,
            styles.getPropertyValue(name).trim(),
          ]),
        ),
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme", "style", "class"],
    });
    return () => observer.disconnect();
  }, [group]);
  return (
    <div className="token-list">
      {group.names.map((name) => (
        <div key={name} className="token-row">
          <div className={`token-visual token-visual--${group.kind}`}>
            {group.kind === "color" ? (
              <span style={{ background: `var(${name})` }} />
            ) : group.kind === "radius" ? (
              <span style={{ borderRadius: `var(${name})` }} />
            ) : group.kind === "space" ? (
              <span style={{ width: `var(${name})` }} />
            ) : group.kind === "size" ? (
              <span
                style={{
                  height:
                    name.includes("icon") ||
                    name.includes("thumb") ||
                    name.includes("choice")
                      ? `var(${name})`
                      : undefined,
                  width: `min(100%, var(${name}))`,
                }}
              />
            ) : (
              <span
                style={
                  name.includes("font-size")
                    ? { fontSize: `var(${name})` }
                    : name.includes("font-weight")
                      ? { fontWeight: `var(${name})` }
                      : name.includes("line-height")
                        ? { lineHeight: `var(${name})` }
                        : { fontFamily: `var(${name})` }
                }
              >
                Ag 字
              </span>
            )}
          </div>
          <div className="token-description">
            <code>{name}</code>
            <span>{values[name] || "读取样式…"}</span>
          </div>
          <CopyButton text={`var(${name})`} emphasis="quiet" />
        </div>
      ))}
    </div>
  );
}
