// @vitest-environment jsdom
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { Playground } from "./playground";
import { componentEntries } from "./playground-catalog";
import { exampleCode } from "./playground-code";
import { Badge, Alert, EmptyState, Input, SearchField } from "./ui";
beforeEach(() => {
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
  vi.unstubAllGlobals();
});
it("collapses API configuration while preserving edits and uses a gray reset button", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "input")!}
    />,
  );
  fireEvent.change(screen.getByLabelText("API value"), {
    target: { value: "保留配置" },
  });
  const collapse = screen.getByRole("button", { name: "收起 API" });
  const preview = screen.getByRole("group", { name: "Preview" });
  expect(preview.contains(collapse)).toBe(true);
  expect(
    preview.contains(screen.getByRole("radiogroup", { name: "画布环境" })),
  ).toBe(true);
  const panelId = collapse.getAttribute("aria-controls")!;
  fireEvent.click(collapse);
  expect(screen.queryByRole("group", { name: "API 配置" })).toBeNull();
  expect(document.getElementById(panelId)?.hidden).toBe(true);
  expect(
    (
      within(screen.getByRole("region", { name: "组件预览" })).getByRole(
        "textbox",
      ) as HTMLInputElement
    ).value,
  ).toBe("保留配置");
  const expand = screen.getByRole("button", { name: "展开 API" });
  expect(expand.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(expand);
  expect((screen.getByLabelText("API value") as HTMLInputElement).value).toBe(
    "保留配置",
  );
  const reset = screen.getByRole("button", { name: "重置示例" });
  expect(reset.classList.contains("ui-button--quiet")).toBe(false);
  fireEvent.click(reset);
  expect((screen.getByLabelText("API value") as HTMLInputElement).value).toBe(
    "",
  );
});
it("omits optional copy in generated examples and preserves explicitly supplied copy", () => {
  for (const [id, key, copy] of [
    ["alert", "title", "网络连接"],
    ["progress", "valueLabel", "48%"],
    ["selection", "summary", "2 个文件"],
    ["upload", "label", "拖入 SVG 文件"],
    ["cards", "directionLabel", "下一篇"],
  ]) {
    const entry = componentEntries.find((item) => item.id === id)!;
    const args = Object.fromEntries(
      entry.fields.map((field) => [field.key, field.exampleValue]),
    );
    expect(exampleCode(entry, args)).not.toContain(`${key}=`);
    expect(exampleCode(entry, { ...args, [key]: copy })).toContain(
      `${key}={${JSON.stringify(copy)}}`,
    );
  }
});
it("keeps API configuration inside the practice area and resets edits", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "input")!}
    />,
  );
  const practice = screen.getByRole("region", { name: "组件展示" });
  const controls = within(practice).getByRole("group", { name: "API 配置" });
  const preview = within(practice).getByRole("group", { name: "Preview" });
  expect(preview.contains(controls)).toBe(true);
  expect(
    preview.contains(screen.getByRole("region", { name: "组件预览" })),
  ).toBe(true);
  expect(within(controls).queryByText("契约")).toBeNull();
  expect(controls.querySelector("details, summary")).toBeNull();
  const callbacks = within(controls).getByRole("button", {
    name: "事件与回调",
  });
  fireEvent.click(callbacks);
  expect(callbacks.getAttribute("aria-expanded")).toBe("true");
  expect(screen.queryByRole("button", { name: "API" })).toBeNull();
  fireEvent.change(within(controls).getByLabelText("API value"), {
    target: { value: "保留" },
  });
  expect(
    (
      within(screen.getByRole("region", { name: "组件预览" })).getByRole(
        "textbox",
      ) as HTMLInputElement
    ).value,
  ).toBe("保留");
  fireEvent.click(within(controls).getByRole("button", { name: "重置示例" }));
  expect((screen.getByLabelText("API value") as HTMLInputElement).value).toBe(
    "",
  );
});
it("switches the shared canvas background independently from grouped API values", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "buttons")!}
    />,
  );
  const preview = screen.getByRole("region", { name: "组件预览" });
  const canvas = preview.closest(".practice-stage")!;
  const controls = screen.getByRole("group", { name: "API 配置" });
  expect(canvas.contains(controls)).toBe(false);
  expect(within(controls).getByLabelText("API children")).toBeTruthy();
  expect(
    within(controls).getByRole("radiogroup", { name: "API emphasis" }),
  ).toBeTruthy();
  expect(
    within(controls).getByRole("switch", { name: "API disabled" }),
  ).toBeTruthy();
  fireEvent.change(screen.getByLabelText("API children"), {
    target: { value: "保存" },
  });
  const code = screen.getByLabelText("示例代码").textContent;
  fireEvent.click(screen.getByRole("radio", { name: "白层" }));
  expect(canvas.classList.contains("ui-surface--raised")).toBe(true);
  expect(within(preview).getByRole("button", { name: /保存/ })).toBeTruthy();
  expect(screen.getByLabelText("示例代码").textContent).toBe(code);
  fireEvent.click(within(controls).getByRole("button", { name: "重置示例" }));
  expect(
    screen.getByRole("radio", { name: "白层" }).getAttribute("aria-checked"),
  ).toBe("true");
  expect(within(preview).getByRole("button", { name: /Like/ })).toBeTruthy();
});
it("shows original API keys and enum values without translated decoration", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "alert")!}
    />,
  );
  const panel = screen.getByRole("group", { name: "API 配置" });
  expect(within(panel).getByText("title")).toBeTruthy();
  expect(within(panel).getByText("children")).toBeTruthy();
  expect(within(panel).getByText("tone")).toBeTruthy();
  expect(within(panel).getByText("neutral")).toBeTruthy();
  expect(document.querySelector("pre")!.textContent).toContain(
    'tone={"neutral"}',
  );
});
it("renders one button and synchronizes configuration, example and copied code", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "buttons")!}
    />,
  );
  const stage = screen.getByRole("region", { name: "组件预览" });
  expect(within(stage).getAllByRole("button")).toHaveLength(1);
  fireEvent.change(screen.getByLabelText("API children"), {
    target: { value: "保存" },
  });
  fireEvent.click(screen.getByRole("switch", { name: "API showCount" }));
  fireEvent.change(screen.getByLabelText("API count"), {
    target: { value: "14" },
  });
  const button = within(stage).getByRole("button", { name: /保存/ });
  expect(button.textContent).toContain("14");
  fireEvent.click(screen.getByRole("switch", { name: "API disabled" }));
  expect((button as HTMLButtonElement).disabled).toBe(true);
  const code = document.querySelector("pre")!.textContent!;
  expect(code).toContain("保存");
  expect(code).toContain("count={14}");
  expect(code).toContain("disabled={true}");
  fireEvent.click(screen.getByRole("button", { name: "重置示例" }));
  expect(within(stage).getByRole("button", { name: /Like/ })).toBeTruthy();
});
it("switches real tab content and keeps edited panels in generated code", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "tabs")!}
    />,
  );
  const preview = screen.getByRole("region", { name: "组件预览" });
  expect(within(preview).getByRole("tabpanel").textContent).toBe("");
  fireEvent.click(within(preview).getByRole("tab", { name: "文件" }));
  expect(within(preview).getByRole("tabpanel").textContent).toBe("");
  fireEvent.click(screen.getByText("编辑 items"));
  fireEvent.change(screen.getByLabelText("API items 2 content"), {
    target: { value: "6 个文件" },
  });
  expect(within(preview).getByRole("tabpanel").textContent).toBe("6 个文件");
  const code = document.querySelector("pre")!.textContent!;
  expect(code).toContain('"content": "6 个文件"');
  expect(code).not.toContain("contents=");
  fireEvent.click(screen.getByRole("button", { name: "重置示例" }));
  expect(within(preview).getByRole("tabpanel").textContent).toBe("");
});
it("keeps input content linked to its value API without adding companion controls to the example", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "input")!}
    />,
  );
  const stage = screen.getByRole("region", { name: "组件预览" });
  fireEvent.change(within(stage).getByRole("textbox"), {
    target: { value: "abc" },
  });
  expect((screen.getByLabelText("API value") as HTMLInputElement).value).toBe(
    "abc",
  );
  fireEvent.click(screen.getByRole("switch", { name: "API readOnly" }));
  expect(
    (within(stage).getByRole("textbox") as HTMLInputElement).readOnly,
  ).toBe(true);
  expect(within(stage).getAllByRole("textbox")).toHaveLength(1);
});
it("normalizes range limits so the API, output and generated snippet stay consistent", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "slider")!}
    />,
  );
  fireEvent.change(screen.getByLabelText("API min"), {
    target: { value: "256" },
  });
  expect((screen.getByLabelText("API max") as HTMLInputElement).value).toBe(
    "257",
  );
  expect(screen.getByText("256px")).toBeTruthy();
  expect(document.querySelector("pre")!.textContent).toContain("max={257}");
  const value = screen.getByLabelText("API value") as HTMLInputElement;
  expect(value.min).toBe("256");
  expect(value.max).toBe("257");
  fireEvent.change(screen.getByLabelText("API max"), {
    target: { value: "400" },
  });
  fireEvent.change(value, { target: { value: "350" } });
  expect(value.value).toBe("350");
  expect(screen.getByLabelText("示例代码").textContent).toContain(
    "useState(350)",
  );
});
it("edits slider values from the fixed API panel and toggles disabled", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "slider")!}
    />,
  );
  const preview = within(screen.getByRole("region", { name: "组件预览" }));
  const controls = screen.getByRole("group", { name: "API 配置" });
  fireEvent.click(screen.getByRole("radio", { name: "页面" }));
  expect(
    screen
      .getByRole("region", { name: "组件预览" })
      .closest(".practice-stage")!
      .classList.contains("practice-stage--background-base"),
  ).toBe(true);
  fireEvent.change(screen.getByLabelText("API label"), {
    target: { value: "" },
  });
  expect(preview.getByRole("slider", { name: "value" })).toBeTruthy();
  expect(screen.getByLabelText("示例代码").textContent).toContain(
    'aria-label={"value"}',
  );
  const value = screen.getByLabelText("API value");
  const stepper = within(value.closest(".ui-number-input")! as HTMLElement);
  fireEvent.click(stepper.getByRole("button", { name: "增加" }));
  expect((value as HTMLInputElement).value).toBe("141");
  fireEvent.click(stepper.getByRole("button", { name: "减少" }));
  expect((value as HTMLInputElement).value).toBe("140");
  const disabled = within(controls).getByRole("switch", {
    name: "API disabled",
  });
  fireEvent.click(disabled);
  expect((disabled as HTMLInputElement).checked).toBe(true);
  expect((preview.getByRole("slider") as HTMLInputElement).disabled).toBe(true);
  fireEvent.click(disabled);
  expect((preview.getByRole("slider") as HTMLInputElement).disabled).toBe(
    false,
  );
});
it("keeps example controls separate and changes the Button action conditionally", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "buttons")!}
    />,
  );
  const controls = screen.getByRole("group", { name: "API 配置" });
  expect(
    within(controls).getByRole("region", { name: "示例配置" }),
  ).toBeTruthy();
  expect(screen.queryByLabelText("API text")).toBeNull();
  fireEvent.click(
    within(screen.getByRole("radiogroup", { name: "API action" })).getByRole(
      "radio",
      { name: "copy" },
    ),
  );
  expect(screen.getByLabelText("API text")).toBeTruthy();
  expect(screen.queryByRole("radiogroup", { name: "API emphasis" })).toBeNull();
  expect(screen.getByLabelText("示例代码").textContent).toContain(
    "<CopyButton",
  );
  expect(screen.getByLabelText("示例代码").textContent).not.toContain(
    "action=",
  );
});
it("only enables field focus indicators through Tab navigation, never typing or pointer interaction", () => {
  render(
    <>
      <Input aria-label="输入" />
      <SearchField label="搜索" value="" onChange={() => {}} />
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
  const { container, rerender } = render(
    <Badge icon="heart" tone="success">
      完成
    </Badge>,
  );
  expect(container.querySelector(".ui-badge svg")).toBeTruthy();
  expect(container.querySelector(".ui-tone--success")).toBeTruthy();
  rerender(<Alert icon={false}>内容</Alert>);
  expect(container.querySelector("svg")).toBeNull();
  rerender(<EmptyState title="空" icon={false} />);
  expect(container.querySelector("svg")).toBeNull();
});

it("edits structured options without changing selection identity and rejects duplicate values", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "segments")!}
    />,
  );
  const preview = within(screen.getByRole("region", { name: "组件预览" }));
  fireEvent.click(preview.getByRole("radio", { name: "Token" }));
  fireEvent.click(screen.getByText("编辑 options"));
  fireEvent.change(screen.getByLabelText("API options 2 label"), {
    target: { value: "令牌" },
  });
  expect(
    preview.getByRole("radio", { name: "令牌" }).getAttribute("aria-checked"),
  ).toBe("true");
  const id = screen.getByLabelText("API options 2 value");
  fireEvent.change(id, { target: { value: "0" } });
  fireEvent.blur(id);
  expect(screen.getByText("value 必须非空且唯一")).toBeTruthy();
  expect(screen.getByLabelText("示例代码").textContent).toContain(
    '"value": "1"',
  );
  fireEvent.click(
    screen.getByRole("switch", { name: "API options 2 disabled" }),
  );
  expect(
    preview.getByRole("radio", { name: "规范" }).getAttribute("aria-checked"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "重置示例" }));
  expect(preview.getByRole("radio", { name: "Token" })).toBeTruthy();
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
  expect(code).toContain("count={0}");
  expect(code).toContain("disabled={false}");
  expect(code).not.toContain("showCount=");
  expect(code).toContain('from "uagray"');
});
it("shows complete usage with one disclosure state and no nested expansion", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "input")!}
    />,
  );
  const source = screen.getByLabelText("示例代码");
  expect(source.textContent).toContain("return");
  expect(screen.queryByRole("button", { name: "展开完整示例" })).toBeNull();
  fireEvent.change(screen.getByLabelText("API value"), {
    target: { value: "同步内容" },
  });
  expect(source.textContent).toContain("同步内容");
  const toggle = screen.getByRole("button", { name: "用法" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  const panel = document.getElementById(toggle.getAttribute("aria-controls")!);
  expect(panel?.getAttribute("aria-hidden")).toBe("true");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(source.textContent).toContain("同步内容");
});
