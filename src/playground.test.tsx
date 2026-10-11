// @vitest-environment jsdom
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { Playground } from "./playground";
import { componentEntries } from "./playground-catalog";
import { exampleCode } from "./playground-code";
import {
  treeFromExample,
  validateTree,
  allowedTypes,
  newNode,
  makeNode,
  normalizeTree,
  removable,
} from "./playground-tree";
import { treeCode } from "./playground-tree-view";
import { Badge, Alert, EmptyState, Input, SearchField, Icon } from "./ui";
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function () {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function () {
      this.open = false;
    },
  });
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("omits optional copy in generated examples and preserves explicitly supplied copy", () => {
  for (const [id, key, copy, markup] of [
    ["alert", "title", "网络连接", "<Alert.Title>网络连接</Alert.Title>"],
    ["progress", "valueLabel", "48%", "<Progress.Value>48%</Progress.Value>"],
    [
      "cards",
      "description",
      "下一篇",
      "<NavigationCard.Description>下一篇</NavigationCard.Description>",
    ],
  ] as const) {
    const entry = componentEntries.find((item) => item.id === id)!;
    const args = Object.fromEntries(
      entry.fields.map((field) => [field.key, field.exampleValue]),
    );
    expect(exampleCode(entry, { ...args, [key]: "" })).not.toContain(markup);
    expect(exampleCode(entry, { ...args, [key]: copy })).toContain(markup);
    expect(exampleCode(entry, { ...args, [key]: copy })).not.toContain(
      `${key}=`,
    );
  }
  for (const [id, key, copy] of [
    ["selection", "summary", "2 个文件"],
    ["upload", "label", "拖入 SVG 文件"],
  ] as const) {
    const entry = componentEntries.find((item) => item.id === id)!;
    const args = Object.fromEntries(
      entry.fields.map((field) => [field.key, field.exampleValue]),
    );
    expect(exampleCode(entry, { ...args, [key]: "" })).not.toContain(`${key}=`);
    expect(exampleCode(entry, { ...args, [key]: copy })).toContain(
      id === "selection"
        ? `<SelectionBar.Description>{${JSON.stringify(copy)}.replaceAll("{count}", String(count))}</SelectionBar.Description>`
        : `<FileDropzone.Description>${copy}</FileDropzone.Description>`,
    );
  }
});

it("only enables field focus indicators through Tab navigation, never typing or pointer interaction", () => {
  render(
    <>
      <Input aria-label="输入" />
      <SearchField aria-label="搜索" value="" onValueChange={() => {}} />
    </>,
  );
  const input = screen.getByLabelText("输入");
  const search = screen.getByRole("searchbox");
  input.focus();
  fireEvent.keyDown(input, { key: "a" });
  expect(document.activeElement).toBe(input);
  expect(input.hasAttribute("data-keyboard-focus")).toBe(false);
  fireEvent.keyDown(input, { key: "Tab" });
  expect(input.getAttribute("data-keyboard-focus")).toBe("true");
  expect(search.closest("label")!.getAttribute("data-keyboard-focus")).toBe(
    "true",
  );
  fireEvent.pointerDown(input);
  fireEvent.keyDown(input, { key: "b" });
  expect(input.hasAttribute("data-keyboard-focus")).toBe(false);
  expect(search.closest("label")!.hasAttribute("data-keyboard-focus")).toBe(
    false,
  );
  expect(document.activeElement).toBe(input);
});

it("exposes feedback icons and preserves explicit no-icon choices in generated code", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const { container, rerender } = render(
    <Badge tone="success">
      <Badge.Icon>
        <Icon name="heart" size={14} />
      </Badge.Icon>
      完成
    </Badge>,
  );
  expect(container.querySelector(".ui-badge svg")).toBeTruthy();
  expect(container.querySelector(".ui-tone--success")).toBeTruthy();
  rerender(
    <Alert>
      <Alert.Body>内容</Alert.Body>
    </Alert>,
  );
  expect(container.querySelector("svg")).toBeNull();
  expect(error.mock.calls.map((call) => String(call[0]))).toContain(
    "[uagray] Alert 缺少 icon",
  );
  error.mockClear();
  rerender(
    <EmptyState>
      <EmptyState.Title>空</EmptyState.Title>
    </EmptyState>,
  );
  expect(container.querySelector("svg")).toBeNull();
  expect(error).not.toHaveBeenCalled();
});

it("preserves explicit zero and false while omitting an absent optional count", () => {
  const entry = componentEntries.find((entry) => entry.id === "buttons")!;
  const args = Object.fromEntries(
    entry.fields.map((field) => [field.key, field.exampleValue]),
  );
  expect(exampleCode(entry, args)).not.toContain("count=");
  const code = exampleCode(entry, {
    ...args,
    showCount: true,
    count: 0,
    disabled: false,
  });
  expect(code).toContain("<Button.Count>0</Button.Count>");
  expect(code).toContain("disabled={false}");
  expect(code).not.toContain("showCount=");
  expect(code).toContain('from "uagray"');
});

it("generates native typography rows from the edited example without leaking helper props", () => {
  const entry = componentEntries.find(
    (item) => item.id === "description-list",
  )!;
  const code = exampleCode(entry, {
    label: "名称\n\n状态",
    description: "组件\n保留配对\n完成",
    variant: "contained",
  });
  expect(code).toContain('<dt>{""}</dt><dd>{"保留配对"}</dd>');
  expect(code).not.toContain("label=");
  expect(code).not.toContain("description=");
  const list = componentEntries.find((item) => item.id === "text-list")!;
  const listCode = exampleCode(list, {
    children: "检查 <内容>\n确认",
    ordered: true,
    variant: "plain",
  });
  expect(listCode).toContain('<li>{"检查 <内容>"}</li>');
  expect(listCode).toContain("ordered={true}");
});

const entryFor = (id: string) =>
  componentEntries.find((entry) => entry.id === id)!;
function practice(id: string, custom = true) {
  render(<Playground entry={entryFor(id)} />);
  if (custom) fireEvent.click(screen.getByRole("radio", { name: "自定义" }));
  return within(screen.getByRole("region", { name: "组件预览" }));
}
function choose(name: string, option: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name }), {
    key: "ArrowDown",
  });
  fireEvent.click(screen.getByRole("option", { name: option }));
}
function dialog() {
  return within(screen.getByRole("dialog"));
}
function editTextNode(value: string) {
  fireEvent.click(dialog().getByRole("button", { name: "编辑 文字" }));
  fireEvent.change(dialog().getByRole("textbox", { name: "节点内容" }), {
    target: { value },
  });
}
function save() {
  fireEvent.click(dialog().getByRole("button", { name: "保存" }));
}
function usage() {
  return screen.getByLabelText("示例代码").textContent!;
}

it("keeps complete presets outside custom parameters and resets the selected share preset", () => {
  const preview = practice("buttons", false);
  expect(screen.queryByLabelText("API busy")).toBeNull();
  choose("预设", "分享按钮");
  expect(preview.getByRole("button", { name: "分享" })).toBeTruthy();
  expect(usage()).toContain("<ShareButton");
  fireEvent.click(screen.getByRole("radio", { name: "自定义" }));
  expect(screen.queryByRole("combobox", { name: "预设" })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "编辑 ShareButton.Label" }),
  );
  editTextNode("分享项目");
  save();
  expect(preview.getByRole("button", { name: "分享项目" })).toBeTruthy();
  expect(usage()).toContain('"分享项目"');
  expect(usage()).not.toContain("action=");
  fireEvent.click(screen.getByRole("button", { name: "重置示例" }));
  expect(preview.getByRole("button", { name: "分享" })).toBeTruthy();
});

it("places add in the children heading and removes nodes without opening the editor", () => {
  const preview = practice("button-group");
  const add = screen.getByRole("button", { name: "添加节点" });
  expect(
    add.closest(".content-tree-heading")?.querySelector("h3")?.textContent,
  ).toBe("children");
  expect(screen.queryByRole("button", { name: /^上移|^下移/ })).toBeNull();
  const handles = screen.getAllByRole("button", { name: "移动 Button" });
  expect(handles).toHaveLength(2);
  fireEvent.keyDown(handles[0], { key: "ArrowUp" });
  expect(
    preview.getAllByRole("button").map((button) => button.textContent),
  ).toEqual(["添加", "取消"]);
  fireEvent.click(screen.getAllByRole("button", { name: "删除 Button" })[1]);
  expect(preview.queryByRole("button", { name: "取消" })).toBeNull();
  expect(usage()).not.toContain('"取消"');
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("button", { name: "移动 Button" })).toBeNull();
  cleanup();
  practice("buttons");
  expect(screen.queryByRole("button", { name: /^移动 / })).toBeNull();
});

it("keeps children settings separate from component parameters and direct edits have no back step", () => {
  practice("checkbox");
  fireEvent.click(screen.getByRole("button", { name: "设置 children" }));
  expect(dialog().queryByRole("checkbox", { name: "API checked" })).toBeNull();
  expect(dialog().queryByRole("button", { name: "返回" })).toBeNull();
  const edit = dialog().getAllByRole("button", { name: /^编辑 / })[0];
  fireEvent.click(edit);
  expect(dialog().getByRole("button", { name: "返回" })).toBeTruthy();
  fireEvent.click(dialog().getByRole("button", { name: "返回" }));
  expect(screen.getByRole("dialog", { name: "设置 children" })).toBeTruthy();
  fireEvent.click(dialog().getByRole("button", { name: "取消" }));
  fireEvent.click(screen.getAllByRole("button", { name: /^编辑 / })[0]);
  expect(dialog().queryByRole("button", { name: "返回" })).toBeNull();
});

it("commits a whole nested draft once and discards cancellation and collapsed drafts", async () => {
  const preview = practice("buttons");
  const original = usage();
  fireEvent.click(screen.getByRole("button", { name: "编辑 Button.Label" }));
  editTextNode("未提交");
  expect(preview.getByRole("button", { name: "Like" })).toBeTruthy();
  expect(usage()).toBe(original);
  fireEvent.click(dialog().getByRole("button", { name: "取消" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "编辑 Button.Label" }));
  editTextNode("保存");
  save();
  expect(preview.getByRole("button", { name: "保存" })).toBeTruthy();
  expect(usage()).toContain('"保存"');
  fireEvent.click(screen.getByRole("button", { name: "编辑 Button.Label" }));
  editTextNode("收起草稿");
  fireEvent.click(screen.getByRole("button", { name: "收起 API" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "展开 API" }));
  expect(preview.getByRole("button", { name: "保存" })).toBeTruthy();
  expect(usage()).not.toContain("收起草稿");
});

it("adds a nested interactive field to Surface with matching state and code", () => {
  const preview = practice("surface");
  fireEvent.click(screen.getByRole("button", { name: "添加节点" }));
  choose("节点类型", "Input");
  fireEvent.change(dialog().getByRole("textbox", { name: "API placeholder" }), {
    target: { value: "项目名称" },
  });
  save();
  const input = preview.getByPlaceholderText("项目名称");
  fireEvent.change(input, { target: { value: "Uagray" } });
  expect(usage()).toContain("<Input");
  expect(usage()).toContain('useState("Uagray")');
  expect(usage()).toMatch(
    /onChange=\{event => setValue\d+\(event.target.value\)\}/,
  );
  fireEvent.click(screen.getByRole("button", { name: "编辑 Input" }));
  fireEvent.click(dialog().getByRole("switch", { name: "API readOnly" }));
  save();
  expect(
    (preview.getByPlaceholderText("项目名称") as HTMLInputElement).readOnly,
  ).toBe(true);
});

it("edits Dialog.Body children through one editor and keeps the close action working", () => {
  const preview = practice("dialog");
  fireEvent.click(screen.getByRole("button", { name: "编辑 Dialog.Body" }));
  fireEvent.click(dialog().getByRole("button", { name: "添加节点" }));
  choose("节点类型", "Input");
  fireEvent.change(dialog().getByRole("textbox", { name: "API placeholder" }), {
    target: { value: "对话框输入" },
  });
  save();
  expect(usage()).toContain('placeholder={"对话框输入"}');
  fireEvent.click(preview.getByRole("button", { name: "打开" }));
  const panel = screen.getByRole("dialog", { name: "项目设置" });
  const input = within(panel).getByPlaceholderText("对话框输入");
  fireEvent.change(input, { target: { value: "嵌套值" } });
  expect(usage()).toContain('useState("嵌套值")');
  fireEvent.click(within(panel).getByRole("button", { name: "关闭示例" }));
  expect(
    (screen.getByRole("switch", { name: "API open" }) as HTMLInputElement)
      .checked,
  ).toBe(false);
  expect(usage()).toMatch(/onClick=\{\(\) => setOpen\d+\(false\)\}/);
});

it("restricts required nodes, duplicate slots and interactive button descendants", () => {
  practice("buttons");
  expect(
    screen.queryByRole("button", { name: "删除 Button.Label" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "添加节点" }));
  fireEvent.keyDown(screen.getByRole("combobox", { name: "节点类型" }), {
    key: "ArrowDown",
  });
  expect(screen.queryByRole("option", { name: "Button.Label" })).toBeNull();
  expect(screen.getByRole("option", { name: "Button.Icon" })).toBeTruthy();
  fireEvent.click(screen.getByRole("option", { name: "Button.Icon" }));
  save();
  expect(
    screen.queryByRole("button", { name: "删除 Button.Label" }),
  ).toBeNull();
  fireEvent.change(screen.getByRole("textbox", { name: "API aria-label" }), {
    target: { value: "添加" },
  });
  expect(
    screen.getByRole("button", { name: "删除 Button.Label" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "编辑 Button.Label" }));
  fireEvent.click(dialog().getByRole("button", { name: "添加节点" }));
  fireEvent.keyDown(screen.getByRole("combobox", { name: "节点类型" }), {
    key: "ArrowDown",
  });
  expect(screen.queryByRole("option", { name: "Input" })).toBeNull();
  expect(screen.queryByRole("option", { name: "Button" })).toBeNull();
});

it("rejects an empty required label without changing committed content", () => {
  const preview = practice("badge");
  fireEvent.click(screen.getByRole("button", { name: "编辑 Badge.Label" }));
  editTextNode(" ");
  save();
  expect(dialog().getByRole("alert").textContent).toContain("Label");
  expect(preview.getByText("内容")).toBeTruthy();
  expect(usage()).toContain('"内容"');
});

it("updates root boolean APIs directly while keeping canvas environment out of code", () => {
  const preview = practice("buttons");
  fireEvent.click(screen.getByRole("switch", { name: "API disabled" }));
  expect(
    (preview.getByRole("button", { name: "Like" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  const code = usage();
  fireEvent.click(screen.getByRole("radio", { name: "白层" }));
  expect(
    preview
      .getByRole("button", { name: "Like" })
      .closest(".practice-stage")
      ?.classList.contains("ui-surface--raised"),
  ).toBe(true);
  expect(usage()).toBe(code);
  fireEvent.click(screen.getByRole("button", { name: "重置示例" }));
  expect(
    (preview.getByRole("button", { name: "Like" }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
  expect(
    screen.getByRole("radio", { name: "白层" }).getAttribute("aria-checked"),
  ).toBe("true");
});

it("keeps a single collapsed usage disclosure and restores presets when leaving custom", () => {
  const preview = practice("buttons");
  fireEvent.click(screen.getByRole("button", { name: "编辑 Button.Label" }));
  editTextNode("自定义内容");
  save();
  const toggle = screen.getByRole("button", { name: "用法" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(usage()).toContain("自定义内容");
  fireEvent.click(screen.getByRole("radio", { name: "预设" }));
  expect(preview.getByRole("button", { name: "Like" })).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "编辑 Button.Label" }),
  ).toBeNull();
});

it("preserves Tabs association and stable identities when editing rich panel content", () => {
  const preview = practice("tabs");
  const edits = screen.getAllByRole("button", { name: "编辑 Tabs.Content" });
  fireEvent.click(edits[1]);
  fireEvent.click(dialog().getByRole("button", { name: "添加节点" }));
  choose("节点类型", "Button");
  save();
  fireEvent.click(preview.getByRole("tab", { name: "文件" }));
  expect(preview.getByRole("tabpanel").textContent).toContain("文件内容");
  expect(preview.getByRole("tabpanel").textContent).toContain("Like");
  expect(usage()).toContain('<Tabs.Content value={"1"}>');
  expect(usage()).toContain("<Button.Label>");
});

it("normalizes numeric constraints and supports omission of Progress.value", () => {
  const preview = practice("slider");
  fireEvent.change(screen.getByRole("spinbutton", { name: "API max" }), {
    target: { value: "100" },
  });
  expect((preview.getByRole("slider") as HTMLInputElement).value).toBe("100");
  expect(usage()).toContain("useState(100)");
  cleanup();
  practice("progress");
  fireEvent.click(screen.getByRole("switch", { name: "提供 value" }));
  expect(screen.getByRole("progressbar").hasAttribute("value")).toBe(false);
  expect(usage()).not.toContain(" value=");
});

it("preserves selection actions and count updates in a custom composition", () => {
  const preview = practice("selection");
  const bar = within(preview.getByRole("group", { name: "批量操作" }));
  fireEvent.click(bar.getByRole("button", { name: "全选" }));
  expect(bar.getByText("已选择 10 项")).toBeTruthy();
  fireEvent.click(bar.getByRole("button", { name: "清空" }));
  expect(bar.getByText("已选择 0 项")).toBeTruthy();
  expect(
    (bar.getByRole("button", { name: "清空" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect(usage()).toMatch(/replaceAll\("\{count\}", String\(count\d+\)\)/);
});

it("keeps complete initial trees valid and exposes all registered roles without environment nesting", () => {
  for (const entry of componentEntries)
    expect(validateTree(treeFromExample(entry)), entry.id).toBeUndefined();
  const button = treeFromExample(entryFor("buttons"));
  expect(allowedTypes(button)).not.toContain("Button.Label");
  expect(removable(button, button.children[0].id)).toBe(false);
  const surface = treeFromExample(entryFor("surface"));
  expect(allowedTypes(surface)).not.toContain("Surface");
  expect(allowedTypes(surface)).toContain("Input");
  const tabs = treeFromExample(entryFor("tabs"));
  const list = tabs.children[0];
  list.children[1].props.value = list.children[0].props.value;
  expect(validateTree(tabs)).toBeTruthy();
  const segment = treeFromExample(entryFor("segments"));
  segment.children[0].props.disabled = true;
  expect(normalizeTree(segment).props.value).toBe("1");
  expect(allowedTypes(newNode("SelectionBar"))).toContain("SelectionBar.Count");
  const source = makeNode("Text", {}, [
    makeNode("#text", {}, [], "<Input /> ${x} {unsafe}"),
  ]);
  expect(treeCode(source)).toContain('{"<Input /> ${x} {unsafe}"}');
});

it("keeps nested fields independent and preserves selection identity when reordered", () => {
  const preview = practice("surface");
  for (const placeholder of ["第一个字段", "第二个字段"]) {
    fireEvent.click(screen.getByRole("button", { name: "添加节点" }));
    choose("节点类型", "Input");
    fireEvent.change(
      dialog().getByRole("textbox", { name: "API placeholder" }),
      { target: { value: placeholder } },
    );
    save();
  }
  fireEvent.change(preview.getByPlaceholderText("第一个字段"), {
    target: { value: "独立值" },
  });
  expect(
    (preview.getByPlaceholderText("第二个字段") as HTMLInputElement).value,
  ).toBe("");
  expect(usage()).toContain('useState("独立值")');
  cleanup();
  const segments = practice("segments");
  fireEvent.click(segments.getByRole("radio", { name: "Token 12" }));
  fireEvent.keyDown(
    screen.getAllByRole("button", { name: "移动 SegmentedControl.Item" })[1],
    { key: "ArrowUp" },
  );
  expect(
    segments
      .getByRole("radio", { name: "Token 12" })
      .getAttribute("aria-checked"),
  ).toBe("true");
  expect(usage().indexOf('value={"1"} disabled={false}')).toBeLessThan(
    usage().indexOf('value={"0"} disabled={false}'),
  );
});
