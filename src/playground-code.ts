import {
  lines,
  descriptionRows,
  choiceItems,
  normalizeArgs,
  type Value,
  type Args,
  type ComponentEntry,
} from "./playground-catalog";

export function exampleCode(entry: ComponentEntry, values: Args): string {
  const args = normalizeArgs(entry, values);
  const literal = (value: Value) => `{${JSON.stringify(value)}}`;
  const string = (key: string) => String(args[key] ?? "");
  let name = entry.name;
  let props: Record<string, Value | undefined> = Object.fromEntries(
    entry.fields
      .filter((field) => field.scope === "prop")
      .map((field) => [field.key, args[field.key]]),
  );
  for (const field of entry.fields) {
    if (field.scope !== "prop") delete props[field.key];
  }
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
  if (entry.id === "switch" && string("label").trim() === "")
    props["aria-label"] = "开关";
  if (["checkbox", "radio"].includes(entry.id) && string("label").trim() === "")
    props["aria-label"] = "名称";
  for (const key of [
    "title",
    "description",
    "hint",
    "error",
    "placeholder",
    "summary",
    "valueLabel",
    "directionLabel",
    "defaultValue",
  ]) {
    if (props[key] === "") delete props[key];
  }
  if (entry.id === "upload" && props.label === "") delete props.label;
  if (entry.id === "color-picker") {
    state("value", "onValueChange");
  }
  if (entry.id === "buttons") {
    name =
      args.action === "copy"
        ? "CopyButton"
        : args.action === "share"
          ? "ShareButton"
          : "Button";
    delete props.action;
    if (name !== "CopyButton") delete props.text;
    if (name !== "ShareButton") delete props.url;
    if (!string("aria-label")) delete props["aria-label"];
  }
  if (entry.id === "icon-button") name = "Button";
  if (entry.id === "input") props["aria-label"] = "输入示例";
  if (entry.id === "number-input") {
    props["aria-label"] = "数字输入示例";
    state("value", "onValueChange");
  }
  if (entry.id === "textarea") props["aria-label"] = "多行输入示例";
  if (["input", "textarea"].includes(entry.id)) state("value", "onChange");
  if (entry.id === "search") state("value", "onValueChange");
  if (entry.id === "spinner") {
    if (string("label").trim() || props["aria-label"] === "")
      delete props["aria-label"];
  }
  if (["checkbox", "radio", "switch"].includes(entry.id))
    state("checked", "onChange");
  if (entry.id === "radio") props.name = "choice";
  if (["select", "segments", "tabs"].includes(entry.id))
    state("value", "onValueChange");
  if (entry.id === "slider") {
    if (string("label").trim() === "") props["aria-label"] = "value";
    state("value", "onValueChange");
    expressions.formatValue = `value => \`\${value}${string("unit").replaceAll("`", "\\`").replaceAll("$", "\\$")}\``;
  }
  if (
    ["disclosure", "dialog", "drawer", "confirm-dialog", "toast"].includes(
      entry.id,
    )
  )
    state("open", "onOpenChange");
  if ((entry.id === "dialog" || entry.id === "drawer") && args.footer === true)
    imports.add("Button");
  if (entry.id === "confirm-dialog") {
    if (string("title")) delete props["aria-label"];
    expressions.onConfirm = "() => setOpen(false)";
  }

  if (entry.id === "upload") {
    helpers.push("const [files, setFiles] = useState<File[]>([]);");
    expressions.onFiles = "setFiles";
  }
  if (entry.id === "progress") {
    delete props.indeterminate;
    if (props["aria-label"] === "") delete props["aria-label"];
    if (args.indeterminate) delete props.value;
  }
  if (entry.id === "fields") imports.add("Input");
  if (entry.id === "empty-state" && args.showActions) imports.add("Button");
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
  if (entry.id === "shell") props.mainId = "workspace-main";
  if (entry.id === "action-row") {
    props = {};
    for (const component of ["Button", "ButtonGroup", "Icon"])
      imports.add(component);
    rawChildren = true;
    children = `<Button size=${JSON.stringify(args.size)} disabled={${Boolean(args.disabled)}}>{${JSON.stringify(string("children"))}}</Button>\n<ButtonGroup aria-label="切换项目">\n<Button shape="square" size=${JSON.stringify(args.size)} aria-label="上一项"><Button.Icon><Icon name="chevron-left" /></Button.Icon></Button>\n<Button shape="square" size=${JSON.stringify(args.size)} aria-label="下一项" disabled><Button.Icon><Icon name="chevron-right" /></Button.Icon></Button>\n</ButtonGroup>`;
  }
  if (entry.id === "text-list") {
    rawChildren = true;
    children = lines(string("children"))
      .map((text) => `<li>{${JSON.stringify(text)}}</li>`)
      .join("\n");
  }
  if (entry.id === "description-list") {
    props = { variant: args.variant };
    rawChildren = true;
    children = descriptionRows(args)
      .map(
        (row) =>
          `<div><dt>{${JSON.stringify(row.label)}}</dt><dd>{${JSON.stringify(row.description)}}</dd></div>`,
      )
      .join("\n");
  }
  if (entry.id === "selection") {
    helpers.push(`const [count, setCount] = useState(${args.count});`);
    delete props.count;
    expressions.count = "count";
  }
  const composed = compositionMarkup(entry.id, args, string);
  if (composed) {
    children = composed.markup;
    rawChildren = true;
    for (const item of composed.imports) imports.add(item);
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
  if (entry.id === "toast-region") {
    imports.add("Toast");
    imports.add("Button");
    helpers.push(
      `const [open, setOpen] = useState(${JSON.stringify(args.open)});`,
    );
    body = `<>\n<Button onClick={() => setOpen(true)}>显示提示</Button>\n<ToastRegion aria-label=${literal(args["aria-label"])}>\n  <Toast open={open} onOpenChange={setOpen}>\n    <Toast.Body>${escapeText(string("children"))}</Toast.Body>\n  </Toast>\n</ToastRegion>\n</>`;
  }
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
  return `${helpers.some((line) => line.includes("useState")) ? 'import { useState } from "react";\n' : ""}import { ${[...imports].join(", ")} } from "uagray";\nimport "uagray/styles.css";\n\n${example}`;
}
function compositionMarkup(
  id: string,
  args: Args,
  text: (key: string) => string,
): { markup: string; imports: string[] } | undefined {
  const piece = (key: string) => escapeText(text(key));
  const present = (key: string) => text(key).trim().length > 0;
  const icon = (name: string) =>
    `<Icon name=${JSON.stringify(name)} size={16} />`;
  const items = choiceItems(args.entries);
  if (id === "buttons" || id === "icon-button") {
    const owner =
      id === "icon-button"
        ? "Button"
        : args.action === "copy"
          ? "CopyButton"
          : args.action === "share"
            ? "ShareButton"
            : "Button";
    const hasIcon = present("icon") && text("icon") !== "none";
    return {
      imports: hasIcon ? ["Icon"] : [],
      markup: [
        hasIcon
          ? `<${owner}.Icon><Icon name=${JSON.stringify(text("icon"))} /></${owner}.Icon>`
          : "",
        id === "buttons" && present("children")
          ? `<${owner}.Label>${piece("children")}</${owner}.Label>`
          : "",
        id === "buttons" && present("count")
          ? `<${owner}.Count>${piece("count")}</${owner}.Count>`
          : "",
        ...(owner === "Button"
          ? []
          : [
              ["copiedLabel", "success"],
              ["copyingLabel", "pending"],
              ["copyFailedLabel", "error"],
            ].map(([key, state]) =>
              present(key)
                ? `<${owner}.Feedback state="${state}">${piece(key)}</${owner}.Feedback>`
                : "",
            )),
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "confirm-dialog") {
    const header = [
      present("title")
        ? `<ConfirmDialog.Title>${piece("title")}</ConfirmDialog.Title>`
        : "",
      present("description")
        ? `<ConfirmDialog.Description>${piece("description")}</ConfirmDialog.Description>`
        : "",
    ].filter(Boolean);
    const actions = [
      present("cancelLabel")
        ? `<ConfirmDialog.CancelAction>${piece("cancelLabel")}</ConfirmDialog.CancelAction>`
        : "",
      present("confirmLabel")
        ? `<ConfirmDialog.ConfirmAction>${piece("confirmLabel")}</ConfirmDialog.ConfirmAction>`
        : "",
    ].filter(Boolean);
    return {
      imports: [],
      markup: [
        header.length
          ? `<ConfirmDialog.Header>\n${header.join("\n")}\n</ConfirmDialog.Header>`
          : "",
        actions.length
          ? `<ConfirmDialog.Footer>\n${actions.join("\n")}\n</ConfirmDialog.Footer>`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "upload")
    return {
      imports: ["Icon"],
      markup: [
        `<FileDropzone.Icon><Icon name=${JSON.stringify(text("icon"))} /></FileDropzone.Icon>`,
        present("label")
          ? `<FileDropzone.Description>${piece("label")}</FileDropzone.Description>`
          : "",
        `<FileDropzone.Trigger>${piece("buttonLabel")}</FileDropzone.Trigger>`,
        args.showError
          ? text("errorSource") === "custom"
            ? `<FileDropzone.Error>{${JSON.stringify(text("error"))}}</FileDropzone.Error>`
            : "<FileDropzone.Error />"
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  if (id === "selection") {
    const actions = [
      ["selectAllLabel", "SelectAllAction", `setCount(${args.total})`],
      ["clearLabel", "ClearAction", "setCount(0)"],
      ["doneLabel", "DoneAction", "setCount(0)"],
    ]
      .filter(([key]) => present(key))
      .map(
        ([key, role, call]) =>
          `<SelectionBar.${role} onClick={() => ${call}}>${piece(key)}</SelectionBar.${role}>`,
      );
    return {
      imports: [],
      markup: [
        present("summary")
          ? `<SelectionBar.Description>{${JSON.stringify(text("summary"))}.replaceAll("{count}", String(count))}</SelectionBar.Description>`
          : "",
        actions.length
          ? `<SelectionBar.Actions>\n${actions.join("\n")}\n</SelectionBar.Actions>`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "text")
    return {
      imports: [],
      markup: [
        `<ExpandableCode.Body>{${JSON.stringify(text("code"))}}</ExpandableCode.Body>`,
        ...[
          ["copyLabel", "CopyAction"],
          ["expandLabel", "ExpandAction"],
          ["collapseLabel", "CollapseAction"],
        ].map(([key, role]) =>
          present(key)
            ? `<ExpandableCode.${role}>${piece(key)}</ExpandableCode.${role}>`
            : "",
        ),
      ]
        .filter(Boolean)
        .join("\n"),
    };
  if (id === "navigation")
    return {
      imports: [],
      markup: [
        ["previousLabel", "previousHref", "Previous"],
        ["nextLabel", "nextHref", "Next"],
      ]
        .map(([key, href, role]) =>
          present(key)
            ? `<Pager.${role}${present(href) ? ` href=${JSON.stringify(text(href))}` : ""}>${piece(key)}</Pager.${role}>`
            : "",
        )
        .filter(Boolean)
        .join("\n"),
    };
  if (id === "showcase")
    return {
      imports: [],
      markup: [
        `<ShowcaseCard.Title>${piece("title")}</ShowcaseCard.Title>`,
        present("description")
          ? `<ShowcaseCard.Description>${piece("description")}</ShowcaseCard.Description>`
          : "",
        `<ShowcaseCard.Media><span style={{ whiteSpace: "pre-wrap", fontSize: 24, lineHeight: 1.6, padding: 24 }}>${escapeText(text("children"))}</span></ShowcaseCard.Media>`,
        present("externalLabel")
          ? `<ShowcaseCard.ExternalLink href=${JSON.stringify(text("externalHref"))}>${piece("externalLabel")}</ShowcaseCard.ExternalLink>`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  if (id === "fields") {
    return {
      imports: ["Input"],
      markup: [
        present("label") ? `<Field.Label>${piece("label")}</Field.Label>` : "",
        `<Field.Control>\n  <Input />\n</Field.Control>`,
        present("description")
          ? `<Field.Description>${piece("description")}</Field.Description>`
          : "",
        present("error") ? `<Field.Error>${piece("error")}</Field.Error>` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (["checkbox", "radio", "switch"].includes(id)) {
    return present("label")
      ? { markup: piece("label"), imports: [] }
      : undefined;
  }
  if (id === "select") {
    return {
      imports: [],
      markup: items
        .map(
          (item) =>
            `<Select.Item value=${JSON.stringify(item.value)}${item.disabled ? " disabled" : ""}>${escapeText(item.label)}</Select.Item>`,
        )
        .join("\n"),
    };
  }
  if (id === "segments") {
    return {
      imports: [],
      markup: items
        .map((item) =>
          [
            `<SegmentedControl.Item value=${JSON.stringify(item.value)}${item.disabled ? " disabled" : ""}>`,
            `  <SegmentedControl.Label>${escapeText(item.label)}</SegmentedControl.Label>`,
            item.count
              ? `  <SegmentedControl.Count>${escapeText(item.count)}</SegmentedControl.Count>`
              : "",
            `</SegmentedControl.Item>`,
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n"),
    };
  }
  if (id === "tabs") {
    const triggers = items
      .map(
        (item) =>
          `<Tabs.Trigger value=${JSON.stringify(item.value)}${item.disabled ? " disabled" : ""}>${escapeText(item.label)}</Tabs.Trigger>`,
      )
      .join("\n");
    const panels = items
      .filter((item) => item.content)
      .map(
        (item) =>
          `<Tabs.Content value=${JSON.stringify(item.value)}>${escapeText(item.content ?? "")}</Tabs.Content>`,
      )
      .join("\n");
    return {
      imports: [],
      markup: `<Tabs.List>\n${triggers}\n</Tabs.List>\n${panels}`,
    };
  }
  if (id === "slider") {
    const parts = [
      present("label") ? `<Slider.Label>${piece("label")}</Slider.Label>` : "",
      args.reading === true ? "<Slider.Value />" : "",
    ].filter(Boolean);
    return parts.length ? { markup: parts.join("\n"), imports: [] } : undefined;
  }
  if (id === "disclosure") {
    return {
      imports: [],
      markup: [
        `<Disclosure.Trigger>${piece("title")}</Disclosure.Trigger>`,
        present("actions")
          ? `<Disclosure.Actions>${piece("actions")}</Disclosure.Actions>`
          : "",
        `<Disclosure.Body>${piece("body")}</Disclosure.Body>`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "dialog" || id === "drawer") {
    const owner = id === "dialog" ? "Dialog" : "Drawer";
    const heading = [
      present("title")
        ? `<${owner}.Title>${piece("title")}</${owner}.Title>`
        : "",
      present("description")
        ? `<${owner}.Description>${piece("description")}</${owner}.Description>`
        : "",
    ].filter(Boolean);
    return {
      imports: args.footer === true ? ["Button"] : [],
      markup: [
        heading.length
          ? `<${owner}.Header>\n${heading.join("\n")}\n</${owner}.Header>`
          : "",
        present("body")
          ? `<${owner}.Body>${piece("body")}</${owner}.Body>`
          : "",
        args.footer === true
          ? `<${owner}.Footer>\n<Button onClick={() => setOpen(false)}>关闭示例</Button>\n</${owner}.Footer>`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "badge") {
    return {
      imports: present("icon") ? ["Icon"] : [],
      markup: [
        present("icon") ? `<Badge.Icon>${icon(text("icon"))}</Badge.Icon>` : "",
        `<Badge.Label>${piece("label")}</Badge.Label>`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "alert") {
    return {
      imports: ["Icon"],
      markup: [
        `<Alert.Icon>${icon(text("icon") || "info")}</Alert.Icon>`,
        present("title") ? `<Alert.Title>${piece("title")}</Alert.Title>` : "",
        present("body") ? `<Alert.Body>${piece("body")}</Alert.Body>` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "progress") {
    const parts = [
      present("label")
        ? `<Progress.Label>${piece("label")}</Progress.Label>`
        : "",
      present("valueLabel")
        ? `<Progress.Value>${piece("valueLabel")}</Progress.Value>`
        : "",
    ].filter(Boolean);
    return parts.length ? { markup: parts.join("\n"), imports: [] } : undefined;
  }
  if (id === "empty-state") {
    return {
      imports: [
        ...(present("icon") ? ["Icon"] : []),
        ...(args.showActions === true ? ["Button", "Icon"] : []),
      ],
      markup: [
        present("icon")
          ? `<EmptyState.Icon>${icon(text("icon"))}</EmptyState.Icon>`
          : "",
        `<EmptyState.Title>${piece("title")}</EmptyState.Title>`,
        present("description")
          ? `<EmptyState.Description>${piece("description")}</EmptyState.Description>`
          : "",
        args.showActions === true
          ? `<EmptyState.Actions>\n<Button><Button.Icon><Icon name="plus" /></Button.Icon><Button.Label>${piece("actionLabel")}</Button.Label></Button>\n</EmptyState.Actions>`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "toast") {
    return {
      imports: present("icon") ? ["Icon"] : [],
      markup: [
        present("icon") ? `<Toast.Icon>${icon(text("icon"))}</Toast.Icon>` : "",
        `<Toast.Body>${piece("body")}</Toast.Body>`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "spinner") {
    return present("label")
      ? { markup: piece("label"), imports: [] }
      : undefined;
  }
  if (id === "links") {
    return {
      imports: items.some((item) => item.icon) ? ["Icon"] : [],
      markup: items
        .map((item) =>
          [
            `<ExternalLinks.Item href=${JSON.stringify(item.href ?? "")}>`,
            `  <ExternalLinks.Label>${escapeText(item.label)}</ExternalLinks.Label>`,
            item.icon
              ? `  <ExternalLinks.Icon>${icon(item.icon)}</ExternalLinks.Icon>`
              : "",
            `</ExternalLinks.Item>`,
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n"),
    };
  }
  if (id === "cards") {
    return {
      imports: [],
      markup: [
        present("description")
          ? `<NavigationCard.Description>${piece("description")}</NavigationCard.Description>`
          : "",
        `<NavigationCard.Title>${piece("title")}</NavigationCard.Title>`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (id === "shell") {
    return {
      imports: [],
      markup: [
        present("header")
          ? `<PageShell.Header><span>${piece("header")}</span></PageShell.Header>`
          : "",
        `<PageShell.Body>${piece("body")}</PageShell.Body>`,
        present("footer")
          ? `<PageShell.Footer><span>${piece("footer")}</span></PageShell.Footer>`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  return undefined;
}
function escapeText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("{", "&#123;")
    .replaceAll("}", "&#125;");
}
