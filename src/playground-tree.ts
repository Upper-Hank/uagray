import {
  componentEntries,
  exampleArgs,
  choiceItems,
  lines,
  descriptionRows,
  type Args,
  type Control,
} from "./playground-catalog";

/** Editor data only. Public calls are generated as children and semantic components. */
export type ContentNode = {
  id: string;
  type: string;
  props: Args;
  text?: string;
  children: ContentNode[];
  action?: "close";
  suffix?: string;
};
type Rule = { type: string; min: number; max: number };
type Contract = {
  mode:
    | "none"
    | "text"
    | "inline"
    | "free"
    | "actions"
    | "field"
    | "icon"
    | "roles";
  rules?: Rule[];
  sortable?: boolean;
};
const contracts: Record<string, Contract> = {};
const register = (
  type: string,
  mode: Contract["mode"],
  roles = "",
  required: string[] = [],
) => {
  contracts[type] = {
    mode,
    rules: roles
      ? roles.split(" ").map((role) => ({
          type: `${type}.${role}`,
          min: required.includes(role) ? 1 : 0,
          max: 1,
        }))
      : undefined,
  };
};
for (const type of ["Button", "CopyButton", "ShareButton"]) {
  register(
    type,
    "roles",
    "Icon Label Count" + (type !== "Button" ? " Feedback" : ""),
  );
  register(`${type}.Icon`, "icon");
  register(`${type}.Label`, "inline");
  register(`${type}.Count`, "inline");
  if (type !== "Button") register(`${type}.Feedback`, "inline");
}
for (const [type, roles, required] of [
  ["Badge", "Icon Label", "Label"],
  ["Alert", "Icon Title Body", "Icon"],
  ["Field", "Label Control Description Error", "Control"],
  ["Slider", "Label Value", ""],
  ["Progress", "Label Value", ""],
  ["EmptyState", "Icon Title Description Actions", "Title"],
  ["Toast", "Icon Body", "Body"],
  ["Disclosure", "Trigger Actions Body", "Trigger Body"],
  ["Dialog", "Header Body Footer", ""],
  ["Drawer", "Header Body Footer", ""],
  ["ConfirmDialog", "Header Footer", ""],
  ["PageShell", "Header Body Footer", "Body"],
  ["NavigationCard", "Description Title", "Title"],
  ["ShowcaseCard", "Title Description Media ExternalLink", "Title Media"],
  ["Pager", "Previous Next", ""],
  ["ExpandableCode", "Body CopyAction ExpandAction CollapseAction", "Body"],
] as const) {
  register(type, "roles", roles, required.split(" "));
  for (const role of roles.split(" ")) {
    const mode =
      role === "Icon"
        ? "icon"
        : role === "Control"
          ? "field"
          : ["Actions", "Footer"].includes(role)
            ? "actions"
            : ["Body", "Header", "Media"].includes(role)
              ? "free"
              : "inline";
    register(`${type}.${role}`, mode);
  }
}
for (const owner of ["Dialog", "Drawer", "ConfirmDialog"]) {
  contracts[`${owner}.Header`] = {
    mode: "roles",
    rules: ["Title", "Description"].map((role) => ({
      type: `${owner}.${role}`,
      min: 0,
      max: 1,
    })),
  };
  for (const role of ["Title", "Description"])
    register(`${owner}.${role}`, "inline");
}
contracts["ConfirmDialog.Footer"] = {
  mode: "roles",
  rules: ["CancelAction", "ConfirmAction"].map((role) => ({
    type: `ConfirmDialog.${role}`,
    min: 0,
    max: 1,
  })),
};
for (const role of ["CancelAction", "ConfirmAction"])
  register(`ConfirmDialog.${role}`, "inline");
register("SelectionBar", "roles", "Count Description Actions");
register("SelectionBar.Count", "inline");
register("SelectionBar.Description", "inline");
contracts["SelectionBar.Actions"] = {
  mode: "actions",
  rules: ["SelectAllAction", "ClearAction", "DoneAction"].map((role) => ({
    type: `SelectionBar.${role}`,
    min: 0,
    max: 1,
  })),
};
for (const role of ["SelectAllAction", "ClearAction", "DoneAction"])
  register(`SelectionBar.${role}`, "inline");
register("FileDropzone", "roles", "Icon Description Trigger Error", [
  "Icon",
  "Trigger",
]);
register("FileDropzone.Icon", "icon");
for (const role of ["Description", "Trigger", "Error"])
  register(`FileDropzone.${role}`, "inline");
for (const type of [
  "Input",
  "Textarea",
  "NumberInput",
  "SearchField",
  "ColorPicker",
  "Icon",
  "Slider.Value",
])
  register(type, "none");
for (const type of [
  "Heading",
  "Text",
  "Keycap",
  "Checkbox",
  "Radio",
  "Switch",
  "Spinner",
  "Select.Item",
  "Tabs.Trigger",
])
  register(type, "inline");
register("ExpandableCode.Body", "text");
for (const type of [
  "Surface",
  "Layout",
  "Tabs.Content",
  "PageShell.Header",
  "PageShell.Footer",
])
  register(type, "free");
for (const type of ["ButtonGroup", "ActionRow"]) register(type, "actions");
for (const [owner, child] of [
  ["Select", "Item"],
  ["SegmentedControl", "Item"],
  ["ExternalLinks", "Item"],
  ["Tabs.List", "Trigger"],
  ["ToastRegion", "Toast"],
]) {
  const type =
    owner === "Tabs.List"
      ? "Tabs.Trigger"
      : owner === "ToastRegion"
        ? "Toast"
        : `${owner}.${child}`;
  contracts[owner] = {
    mode: "roles",
    rules: [{ type, min: 0, max: Infinity }],
    sortable: true,
  };
}
for (const owner of ["SegmentedControl", "ExternalLinks"]) {
  register(
    `${owner}.Item`,
    "roles",
    owner === "SegmentedControl" ? "Label Count" : "Label Icon",
    ["Label"],
  );
  for (const role of owner === "SegmentedControl"
    ? ["Label", "Count"]
    : ["Label", "Icon"])
    register(`${owner}.${role}`, role === "Icon" ? "icon" : "inline");
  contracts[`${owner}.Item`].rules = (
    owner === "SegmentedControl" ? ["Label", "Count"] : ["Label", "Icon"]
  ).map((role) => ({
    type: `${owner}.${role}`,
    min: role === "Label" ? 1 : 0,
    max: 1,
  }));
}
contracts.Tabs = {
  mode: "roles",
  rules: [
    { type: "Tabs.List", min: 1, max: 1 },
    { type: "Tabs.Content", min: 0, max: Infinity },
  ],
};
contracts.TextList = {
  mode: "roles",
  rules: [{ type: "li", min: 0, max: Infinity }],
  sortable: true,
};
register("li", "inline");
contracts.DescriptionList = {
  mode: "roles",
  rules: [{ type: "div", min: 0, max: Infinity }],
  sortable: true,
};
contracts.div = {
  mode: "roles",
  rules: [
    { type: "dt", min: 1, max: 1 },
    { type: "dd", min: 1, max: 1 },
  ],
};
register("dt", "inline");
register("dd", "free");
register("#text", "none");

export const nodeContract = (type: string): Contract =>
  contracts[type] ?? { mode: "none" };
const fieldTypes = [
  "Input",
  "Textarea",
  "NumberInput",
  "SearchField",
  "Select",
  "Checkbox",
  "Radio",
  "Switch",
  "ColorPicker",
  "Slider",
];
const actionTypes = [
  "Button",
  "CopyButton",
  "ShareButton",
  "ButtonGroup",
  "ActionRow",
  "ExternalLinks",
  "Pager",
];
const inlineTypes = ["#text", "Icon", "Keycap", "Badge", "Spinner"];
const roots = [
  ...new Set(componentEntries.map((entry) => entry.name)),
  "CopyButton",
  "ShareButton",
];
export function allowedTypes(
  parent: ContentNode,
  ancestors: string[] = [],
): string[] {
  const contract = nodeContract(parent.type);
  let types =
    contract.mode === "roles"
      ? (contract.rules?.map((rule) => rule.type) ?? [])
      : contract.mode === "inline"
        ? inlineTypes
        : contract.mode === "free"
          ? ["#text", ...roots]
          : contract.mode === "actions"
            ? [
                ...actionTypes,
                ...(contract.rules?.map((rule) => rule.type) ?? []),
              ]
            : contract.mode === "field"
              ? fieldTypes
              : contract.mode === "icon"
                ? ["Icon"]
                : [];
  // Regions may compose controls, but never nest Surface environments or main landmarks.
  if ([...ancestors, parent.type].includes("Surface"))
    types = types.filter((type) => type !== "Surface");
  if ([...ancestors, parent.type].includes("PageShell"))
    types = types.filter((type) => type !== "PageShell");
  if (
    parent.type === "ShowcaseCard.Media" ||
    parent.type.startsWith("NavigationCard.") ||
    parent.type === "ShowcaseCard.ExternalLink" ||
    parent.type.startsWith("Pager.")
  )
    types = types.filter((type) => inlineTypes.includes(type));
  return types.filter((type) => {
    if (type === "Tabs.Content") {
      const triggers =
        parent.children.find((child) => child.type === "Tabs.List")?.children ??
        [];
      if (
        !triggers.some(
          (trigger) =>
            !parent.children.some(
              (content) =>
                content.type === type &&
                content.props.value === trigger.props.value,
            ),
        )
      )
        return false;
    }
    const rule = contract.rules?.find((rule) => rule.type === type);
    if (type.endsWith(".Feedback"))
      return parent.children.filter((child) => child.type === type).length < 3;
    if (contract.mode === "field" || contract.mode === "icon")
      return !parent.children.length;
    if (
      type.endsWith(".Count") &&
      ["Button", "CopyButton", "ShareButton"].includes(parent.type)
    )
      return parent.children.some(
        (child) => child.type === `${parent.type}.Label`,
      );
    return (
      !rule ||
      parent.children.filter((child) => child.type === type).length < rule.max
    );
  });
}
export const canSort = (node: ContentNode) =>
  nodeContract(node.type).sortable ||
  ["free", "inline", "actions"].includes(nodeContract(node.type).mode);
export function makeNode(
  type: string,
  props: Args = {},
  children: ContentNode[] = [],
  text?: string,
): ContentNode {
  return {
    id: crypto.randomUUID(),
    type,
    props,
    children,
    ...(text !== undefined ? { text } : {}),
  };
}
const textNode = (text: string) => makeNode("#text", {}, [], text);
const withText = (type: string, text: string, props: Args = {}) =>
  makeNode(type, props, text ? [textNode(text)] : []);
export const nodeLabel = (node: ContentNode) =>
  node.type === "#text" ? "文字" : node.type;
export function controlsFor(type: string): Control[] {
  const source = componentEntries.find(
    (entry) =>
      entry.name ===
      (["CopyButton", "ShareButton"].includes(type) ? "Button" : type),
  );
  let controls =
    source?.fields.filter(
      (field) =>
        field.scope === "prop" &&
        field.key !== "children" &&
        field.key !== "indeterminate",
    ) ?? [];
  if (source?.id === "action-row") controls = [];
  if (type === "ToastRegion")
    controls = controls.filter((field) => field.key !== "open");
  if (type === "DescriptionList")
    controls = controls.filter(
      (field) => !["label", "description"].includes(field.key),
    );
  if (["Button", "CopyButton", "ShareButton"].includes(type))
    controls = controls.filter((field) => !["text", "url"].includes(field.key));
  controls = controls.map((field) => ({
    ...field,
    when: undefined,
    group: field.group ?? "behavior",
  }));
  const extra = (
    key: string,
    control: Control["control"],
    exampleValue: string | number | boolean,
    options?: string[],
  ): Control => ({
    key,
    scope: "prop",
    type: typeof exampleValue,
    control,
    exampleValue,
    options,
    group: "behavior",
  });
  if (type === "CopyButton")
    controls.push(extra("text", "text", "值得保存的内容"));
  if (type === "ShareButton")
    controls.push(extra("url", "text", "https://example.com"));
  if (
    [
      "Select.Item",
      "SegmentedControl.Item",
      "Tabs.Trigger",
      "Tabs.Content",
    ].includes(type)
  )
    controls.push(extra("value", "text", "item-1"));
  if (["Select.Item", "SegmentedControl.Item", "Tabs.Trigger"].includes(type))
    controls.push(extra("disabled", "boolean", false));
  if (
    [
      "ExternalLinks.Item",
      "ShowcaseCard.ExternalLink",
      "Pager.Previous",
      "Pager.Next",
    ].includes(type)
  )
    controls.push(extra("href", "text", "https://example.com"));
  if (type.endsWith(".Feedback"))
    controls.push(
      extra("state", "enum", "success", ["pending", "success", "error"]),
    );
  if (
    [
      "ConfirmDialog.CancelAction",
      "ConfirmDialog.ConfirmAction",
      "SelectionBar.SelectAllAction",
      "SelectionBar.ClearAction",
      "SelectionBar.DoneAction",
    ].includes(type)
  ) {
    const button = componentEntries.find((entry) => entry.id === "buttons")!;
    controls.push(
      ...button.fields.filter(
        (field) =>
          field.scope === "prop" &&
          [
            "emphasis",
            "tone",
            "size",
            "disabled",
            "busy",
            "aria-label",
          ].includes(field.key),
      ),
    );
  }
  if (type === "Radio")
    controls.push(extra("name", "text", "choice"), extra("value", "text", "a"));
  if (
    !controls.some((field) => field.key === "aria-label") &&
    roots.includes(type)
  )
    controls.push(extra("aria-label", "text", ""));
  return controls;
}

/** Translate the existing complete examples into editor nodes once, on mode/preset changes. */
export function treeFromExample(
  entry: (typeof componentEntries)[number],
  args = exampleArgs(entry),
): ContentNode {
  const type =
    entry.id === "buttons"
      ? args.action === "copy"
        ? "CopyButton"
        : args.action === "share"
          ? "ShareButton"
          : "Button"
      : entry.name;
  const props = Object.fromEntries(
    controlsFor(type).map((field) => [
      field.key,
      args[field.key] ?? field.exampleValue,
    ]),
  );
  const root = makeNode(type, props);
  const s = (key: string) => String(args[key] ?? "");
  const add = (
    role: string,
    key: string,
    force = false,
    attributes: Args = {},
  ) => {
    if (force || (s(key) && s(key) !== "none"))
      root.children.push(withText(`${type}.${role}`, s(key), attributes));
  };
  const icon = (role = "Icon") => {
    if (s("icon") && s("icon") !== "none")
      root.children.push(
        makeNode(`${type}.${role}`, {}, [
          makeNode("Icon", { name: s("icon") }),
        ]),
      );
  };
  if (["buttons", "icon-button"].includes(entry.id)) {
    icon();
    if (entry.id === "buttons") {
      add("Label", "children");
      add("Count", "count");
    }
    if (type !== "Button")
      for (const [key, state] of [
        ["copiedLabel", "success"],
        ["copyingLabel", "pending"],
        ["copyFailedLabel", "error"],
      ])
        add("Feedback", key, false, { state });
  } else if (["dialog", "drawer", "confirm-dialog"].includes(entry.id)) {
    const header = makeNode(`${type}.Header`);
    for (const [role, key] of [
      ["Title", "title"],
      ["Description", "description"],
    ])
      if (s(key)) header.children.push(withText(`${type}.${role}`, s(key)));
    if (header.children.length) root.children.push(header);
    if (entry.id !== "confirm-dialog") {
      add("Body", "body");
      if (args.footer) {
        const close = makeNode("Button", {}, [
          withText("Button.Label", "关闭示例"),
        ]);
        close.action = "close";
        root.children.push(makeNode(`${type}.Footer`, {}, [close]));
      }
    } else {
      const footer = makeNode("ConfirmDialog.Footer");
      for (const [role, key] of [
        ["CancelAction", "cancelLabel"],
        ["ConfirmAction", "confirmLabel"],
      ])
        if (s(key))
          footer.children.push(withText(`ConfirmDialog.${role}`, s(key)));
      if (footer.children.length) root.children.push(footer);
    }
  } else if (["select", "segments", "tabs", "links"].includes(entry.id)) {
    const items = choiceItems(args.entries);
    if (entry.id === "tabs") {
      root.children.push(
        makeNode(
          "Tabs.List",
          {},
          items.map((item) =>
            withText("Tabs.Trigger", item.label, {
              value: item.value,
              disabled: !!item.disabled,
            }),
          ),
        ),
      );
      for (const item of items)
        if (item.content)
          root.children.push(
            withText("Tabs.Content", item.content, { value: item.value }),
          );
    } else
      for (const item of items) {
        const node = makeNode(
          `${type}.Item`,
          entry.id === "links"
            ? { href: item.href ?? "" }
            : { value: item.value, disabled: !!item.disabled },
        );
        if (entry.id === "select") node.children = [textNode(item.label)];
        else {
          node.children.push(withText(`${type}.Label`, item.label));
          if (item.count)
            node.children.push(withText(`${type}.Count`, item.count));
          if (item.icon)
            node.children.push(
              makeNode(`${type}.Icon`, {}, [
                makeNode("Icon", { name: item.icon }),
              ]),
            );
        }
        root.children.push(node);
      }
  } else if (entry.id === "fields") {
    add("Label", "label");
    root.children.push(
      makeNode("Field.Control", {}, [
        makeNode("Input", {
          value: "",
          placeholder: "请输入…",
          "aria-label": s("label") || "输入",
        }),
      ]),
    );
    add("Description", "description");
    add("Error", "error");
  } else if (entry.id === "selection") {
    add("Description", "summary");
    const actions = makeNode("SelectionBar.Actions");
    for (const [role, key] of [
      ["SelectAllAction", "selectAllLabel"],
      ["ClearAction", "clearLabel"],
      ["DoneAction", "doneLabel"],
    ])
      if (s(key))
        actions.children.push(withText(`SelectionBar.${role}`, s(key)));
    if (actions.children.length) root.children.push(actions);
  } else if (entry.id === "toast-region")
    root.children.push(
      makeNode("Toast", { open: !!args.open, duration: 4200 }, [
        withText("Toast.Body", s("children")),
      ]),
    );
  else if (entry.id === "empty-state") {
    icon();
    add("Title", "title", true);
    add("Description", "description");
    if (args.showActions)
      root.children.push(
        makeNode("EmptyState.Actions", {}, [
          makeNode("Button", {}, [withText("Button.Label", s("actionLabel"))]),
        ]),
      );
  } else if (entry.id === "upload") {
    icon();
    add("Description", "label");
    add("Trigger", "buttonLabel", true);
    if (args.showError)
      root.children.push(
        args.errorSource === "custom"
          ? withText("FileDropzone.Error", s("error"))
          : makeNode("FileDropzone.Error"),
      );
  } else if (entry.id === "text") {
    root.children.push(makeNode("ExpandableCode.Body", {}, [], s("code")));
    add("CopyAction", "copyLabel");
    add("ExpandAction", "expandLabel");
    add("CollapseAction", "collapseLabel");
  } else if (entry.id === "navigation") {
    add(
      "Previous",
      "previousLabel",
      false,
      s("previousHref") ? { href: s("previousHref") } : {},
    );
    add(
      "Next",
      "nextLabel",
      false,
      s("nextHref") ? { href: s("nextHref") } : {},
    );
  } else if (entry.id === "showcase") {
    add("Title", "title", true);
    add("Description", "description");
    add("Media", "children", true);
    add("ExternalLink", "externalLabel", false, { href: s("externalHref") });
  } else if (entry.id === "shell") {
    add("Header", "header");
    add("Body", "body", true);
    add("Footer", "footer");
    root.props.mainId = `main-${root.id}`;
    root.props.mainAs = "div";
  } else if (entry.id === "text-list")
    root.children = lines(s("children")).map((text) => withText("li", text));
  else if (entry.id === "description-list")
    root.children = descriptionRows(args).map((row) =>
      makeNode("div", {}, [
        withText("dt", row.label),
        withText("dd", row.description),
      ]),
    );
  else if (["layout", "button-group", "action-row"].includes(entry.id)) {
    root.children = lines(s("children")).map((label) =>
      makeNode(
        "Button",
        { size: args.size ?? "md", disabled: args.disabled ?? false },
        [withText("Button.Label", label)],
      ),
    );
    if (entry.id === "action-row")
      root.children.push(
        makeNode("ButtonGroup", { "aria-label": "切换项目" }, [
          makeNode(
            "Button",
            {
              size: args.size ?? "md",
              shape: "square",
              "aria-label": "上一项",
            },
            [
              makeNode("Button.Icon", {}, [
                makeNode("Icon", { name: "chevron-left" }),
              ]),
            ],
          ),
          makeNode(
            "Button",
            {
              size: args.size ?? "md",
              shape: "square",
              "aria-label": "下一项",
              disabled: true,
            },
            [
              makeNode("Button.Icon", {}, [
                makeNode("Icon", { name: "chevron-right" }),
              ]),
            ],
          ),
        ]),
      );
  } else if (["checkbox", "radio", "switch", "spinner"].includes(entry.id)) {
    if (s("label")) root.children = [textNode(s("label"))];
  } else if (["heading", "body-text", "keycap", "surface"].includes(entry.id))
    root.children = [textNode(s("children"))];
  else if (entry.id === "disclosure") {
    add("Trigger", "title", true);
    add("Actions", "actions");
    add("Body", "body", true);
  } else if (entry.id === "slider") {
    root.suffix = s("unit");
    add("Label", "label");
    if (args.reading) root.children.push(makeNode("Slider.Value"));
  } else if (entry.id === "progress") {
    add("Label", "label");
    add("Value", "valueLabel");
    if (args.indeterminate) delete root.props.value;
  } else if (entry.id === "cards") {
    add("Description", "description");
    add("Title", "title", true);
  } else if (entry.id === "badge") {
    icon();
    add("Label", "label", true);
  } else if (entry.id === "alert") {
    icon();
    add("Title", "title");
    add("Body", "body");
  } else if (entry.id === "toast") {
    icon();
    add("Body", "body", true);
  }
  const namedByContent = ["Checkbox", "Radio", "Switch"].includes(type)
    ? root.children.some(hasContent)
    : root.children.some(
        (child) => child.type.endsWith(".Label") && hasContent(child),
      );
  if (
    [
      "Input",
      "Textarea",
      "NumberInput",
      "Checkbox",
      "Radio",
      "Switch",
      "Slider",
      "Select",
      "Progress",
    ].includes(type) &&
    !props["aria-label"] &&
    !namedByContent
  )
    props["aria-label"] = entry.title;
  if (["Dialog", "Drawer", "ConfirmDialog"].includes(type))
    props["aria-label"] = s("title") ? "" : entry.title;
  return root;
}
export function newNode(type: string): ContentNode {
  const entry = componentEntries.find(
    (entry) =>
      entry.name ===
      (["CopyButton", "ShareButton"].includes(type) ? "Button" : type),
  );
  if (entry)
    return treeFromExample(entry, {
      ...exampleArgs(entry),
      ...(type === "CopyButton"
        ? { action: "copy" }
        : type === "ShareButton"
          ? { action: "share" }
          : {}),
    });
  const node = makeNode(
    type,
    Object.fromEntries(
      controlsFor(type).map((field) => [field.key, field.exampleValue]),
    ),
  );
  const contract = nodeContract(type);
  if (type === "#text") node.text = "内容";
  else if (contract.mode === "text") node.text = "内容";
  else if (
    contract.mode === "inline" &&
    type !== "SelectionBar.Count" &&
    type !== "FileDropzone.Error"
  )
    node.children = [textNode("内容")];
  else if (contract.mode === "icon")
    node.children = [makeNode("Icon", { name: "plus" })];
  else if (contract.mode === "field") node.children = [newNode("Input")];
  else
    for (const rule of contract.rules ?? [])
      if (rule.min) node.children.push(newNode(rule.type));
  return node;
}
export function updateNode(
  root: ContentNode,
  id: string,
  update: (node: ContentNode) => ContentNode,
): ContentNode {
  return root.id === id
    ? update(root)
    : {
        ...root,
        children: root.children.map((child) => updateNode(child, id, update)),
      };
}
export const hasContent = (node: ContentNode): boolean =>
  node.type === "#text" || nodeContract(node.type).mode === "text"
    ? !!node.text?.trim()
    : nodeContract(node.type).mode === "none" || node.children.some(hasContent);
export function validateTree(
  node: ContentNode,
  ancestors: string[] = [],
): string | undefined {
  const contract = nodeContract(node.type);
  const roles = node.children.map((child) => child.type);
  for (const rule of contract.rules ?? []) {
    const count = roles.filter((type) => type === rule.type).length;
    if (
      count < rule.min ||
      (rule.min > 0 &&
        !node.children.some(
          (child) =>
            child.type === rule.type &&
            (rule.type === "Tabs.List" || hasContent(child)),
        )) ||
      (count > rule.max && !rule.type.endsWith(".Feedback"))
    )
      return `${node.type} 的 ${rule.type.split(".").at(-1)} 数量无效`;
  }
  if (["Button", "CopyButton", "ShareButton"].includes(node.type)) {
    const icon = roles.includes(`${node.type}.Icon`),
      label = node.children.find(
        (child) => child.type === `${node.type}.Label`,
      );
    if (!icon && (!label || !hasContent(label))) return "按钮需要图标或文字";
    if (roles.includes(`${node.type}.Count`) && (!label || !hasContent(label)))
      return "Count 需要 Label";
    if (
      (!label || !hasContent(label)) &&
      !String(node.props["aria-label"] ?? "").trim()
    )
      return "纯图标按钮需要 aria-label";
    const states = node.children
      .filter((child) => child.type.endsWith(".Feedback"))
      .map((child) => child.props.state);
    if (
      states.some(
        (state) => !["pending", "success", "error"].includes(String(state)),
      ) ||
      new Set(states).size !== states.length
    )
      return "Feedback 状态必须有效且唯一";
  }
  if (
    node.type === "Alert" &&
    !node.children.some(
      (child) => /\.(Title|Body)$/.test(child.type) && hasContent(child),
    )
  )
    return "Alert 需要标题或正文";
  if (
    ["Dialog", "Drawer", "ConfirmDialog"].includes(node.type) &&
    !node.children.some(hasContent)
  )
    return "对话框需要内容";
  if (
    [
      "Field.Control",
      "Button.Icon",
      "CopyButton.Icon",
      "ShareButton.Icon",
      "Badge.Icon",
      "Alert.Icon",
      "Toast.Icon",
      "FileDropzone.Icon",
      "EmptyState.Icon",
      "ExternalLinks.Icon",
    ].includes(node.type) &&
    node.children.length !== 1
  )
    return `${node.type} 需要一个子节点`;
  if (
    [
      "Select.Item",
      "SegmentedControl.Item",
      "Tabs.Trigger",
      "Tabs.Content",
    ].includes(node.type) &&
    !String(node.props.value ?? "").trim()
  )
    return "value 不能为空";
  if (["Dialog", "Drawer", "ConfirmDialog"].includes(node.type)) {
    const title = node.children
      .find((child) => child.type === `${node.type}.Header`)
      ?.children.find((child) => child.type === `${node.type}.Title`);
    if (
      (!title || !hasContent(title)) &&
      !String(node.props["aria-label"] ?? "").trim()
    )
      return "弹层需要 Title 或 aria-label";
  }
  if (node.type === "Icon" && !String(node.props.name ?? "").trim())
    return "请选择图标";
  if (
    ["Slider", "NumberInput"].includes(node.type) &&
    ["min", "max", "step", "value"].some(
      (key) =>
        node.props[key] !== undefined &&
        !Number.isFinite(Number(node.props[key])),
    )
  )
    return "请输入有效数值";
  if (
    node.type === "ExternalLinks.Item" &&
    !String(node.props.href ?? "").trim()
  )
    return "href 不能为空";
  if (node.type === "Tabs") {
    const triggers =
      node.children.find((child) => child.type === "Tabs.List")?.children ?? [];
    const values = new Set(triggers.map((child) => child.props.value));
    if (
      node.children.some(
        (child) =>
          child.type === "Tabs.Content" && !values.has(child.props.value),
      )
    )
      return "Content 的 value 必须对应 Trigger";
  }
  for (const type of [
    "Select.Item",
    "SegmentedControl.Item",
    "Tabs.Trigger",
    "Tabs.Content",
  ]) {
    const values = node.children
      .filter((child) => child.type === type)
      .map((child) => child.props.value);
    if (new Set(values).size !== values.length) return "value 必须唯一";
  }
  for (const child of node.children) {
    const siblingsRemoved = {
      ...node,
      children: node.children.filter((item) => item.id !== child.id),
    };
    if (!allowedTypes(siblingsRemoved, ancestors).includes(child.type))
      return `${node.type} 不能添加 ${nodeLabel(child)}`;
    const error = validateTree(child, [...ancestors, node.type]);
    if (error) return error;
  }
  return undefined;
}
export function removable(parent: ContentNode, id: string): boolean {
  return !validateTree({
    ...parent,
    children: parent.children.filter((child) => child.id !== id),
  });
}
export function normalizeTree(root: ContentNode): ContentNode {
  const children = root.children.map(normalizeTree);
  const contract = nodeContract(root.type);
  if (contract.mode === "roles" && !contract.sortable && contract.rules) {
    const order = contract.rules.map((rule) => rule.type);
    children.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  }
  let props = root.props;
  if (
    ["Slider", "NumberInput", "Progress", "SelectionBar"].includes(root.type)
  ) {
    props = { ...props };
    if (["Slider", "NumberInput"].includes(root.type)) {
      const min = Number(props.min ?? 0),
        max = Math.max(min, Number(props.max ?? 100));
      props.max = max;
      props.step = Math.max(0.01, Number(props.step ?? 1));
      props.value = Math.max(min, Math.min(max, Number(props.value ?? 0)));
    } else if (root.type === "SelectionBar") {
      props.total = Math.max(0, Number(props.total ?? 0));
      props.count = Math.max(
        0,
        Math.min(props.total, Number(props.count ?? 0)),
      );
    } else {
      props.max = Math.max(1, Number(props.max ?? 100));
      if (props.value !== undefined)
        props.value = Math.max(0, Math.min(props.max, Number(props.value)));
    }
  }
  if (["Select", "SegmentedControl", "Tabs"].includes(root.type)) {
    const items =
      root.type === "Tabs"
        ? (children.find((child) => child.type === "Tabs.List")?.children ?? [])
        : children;
    const available = items.filter((child) => !child.props.disabled);
    if (!available.some((child) => child.props.value === props.value))
      props = { ...props, value: available[0]?.props.value ?? "" };
  }
  return { ...root, props, children };
}
