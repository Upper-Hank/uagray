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
      entry.fields.map((field) => [field.key, field.initial]),
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
  fireEvent.click(within(controls).getByRole("button", { name: "重置" }));
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
  expect(canvas.contains(controls)).toBe(true);
  const content = within(controls).getByRole("region", { name: "内容" });
  const appearance = within(controls).getByRole("region", { name: "视觉" });
  const behavior = within(controls).getByRole("region", { name: "行为" });
  expect(within(content).getByLabelText("API children")).toBeTruthy();
  expect(
    within(appearance).getByRole("combobox", { name: "API variant" }),
  ).toBeTruthy();
  expect(
    within(behavior).getByRole("switch", { name: "API disabled" }),
  ).toBeTruthy();
  expect(
    within(controls).queryByRole("region", { name: "数值约束" }),
  ).toBeNull();
  fireEvent.change(screen.getByLabelText("API children"), {
    target: { value: "保存" },
  });
  const code = screen.getByLabelText("示例代码").textContent;
  fireEvent.click(screen.getByRole("radio", { name: "白色" }));
  expect(canvas.classList.contains("ui-surface--raised")).toBe(true);
  expect(within(preview).getByRole("button", { name: /保存/ })).toBeTruthy();
  expect(screen.getByLabelText("示例代码").textContent).toBe(code);
  fireEvent.click(within(controls).getByRole("button", { name: "重置" }));
  expect(
    (screen.getByRole("radio", { name: "白色" }) as HTMLInputElement).checked,
  ).toBe(true);
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
  fireEvent.change(screen.getByLabelText("API count"), {
    target: { value: "14" },
  });
  const button = within(stage).getByRole("button", { name: /保存/ });
  expect(button.textContent).toContain("14");
  fireEvent.click(screen.getByRole("switch", { name: "API disabled" }));
  expect((button as HTMLButtonElement).disabled).toBe(true);
  const code = document.querySelector("pre")!.textContent!;
  expect(code).toContain("保存");
  expect(code).toContain("useState(14)");
  expect(code).toContain("count={count || undefined}");
  expect(code).toContain("disabled={true}");
  fireEvent.click(screen.getByRole("button", { name: "重置" }));
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
  fireEvent.click(screen.getByRole("button", { name: "contents" }));
  fireEvent.change(screen.getByLabelText("API contents"), {
    target: { value: "4 个项目\n6 个文件\n1 条记录" },
  });
  expect(within(preview).getByRole("tabpanel").textContent).toBe("6 个文件");
  const code = document.querySelector("pre")!.textContent!;
  expect(code).toContain('"content": "6 个文件"');
  expect(code).not.toContain("contents=");
  fireEvent.click(screen.getByRole("button", { name: "重置" }));
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
});
it("edits the slider name and value in compact tools and toggles disabled", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "slider")!}
    />,
  );
  const preview = within(screen.getByRole("region", { name: "组件预览" }));
  fireEvent.click(screen.getByRole("radio", { name: "浅色" }));
  expect(
    screen
      .getByRole("region", { name: "组件预览" })
      .closest(".practice-stage")!
      .classList.contains("practice-stage--background-base"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "编辑名称" }));
  const name = screen.getByLabelText("API label");
  fireEvent.change(name, { target: { value: "" } });
  fireEvent.blur(name);
  expect(
    screen.getByRole("button", { name: "编辑名称" }).textContent?.trim(),
  ).toBe("value");
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
  const disabled = screen.getByRole("button", { name: "API disabled" });
  fireEvent.click(disabled);
  expect(disabled.getAttribute("aria-pressed")).toBe("true");
  expect(
    screen.getByRole("combobox", { name: "展示状态" }).textContent,
  ).toContain("disabled");
  expect((preview.getByRole("slider") as HTMLInputElement).disabled).toBe(true);
  fireEvent.click(disabled);
  expect((preview.getByRole("slider") as HTMLInputElement).disabled).toBe(
    false,
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

it("expands long API text on demand and retains edits when collapsed", () => {
  render(
    <Playground
      entry={componentEntries.find((entry) => entry.id === "segments")!}
    />,
  );
  const controls = screen.getByRole("group", { name: "API 配置" });
  const trigger = within(controls).getByRole("button", { name: "options" });
  expect(screen.queryByLabelText("API options")).toBeNull();
  fireEvent.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  fireEvent.change(screen.getByLabelText("API options"), {
    target: { value: "甲\n乙" },
  });
  expect(
    within(screen.getByRole("region", { name: "组件预览" })).getByRole(
      "radio",
      { name: "甲" },
    ),
  ).toBeTruthy();
  fireEvent.click(trigger);
  expect(screen.queryByLabelText("API options")).toBeNull();
  fireEvent.click(trigger);
  expect(
    (screen.getByLabelText("API options") as HTMLTextAreaElement).value,
  ).toBe("甲\n乙");
  fireEvent.click(within(controls).getByRole("button", { name: "重置" }));
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(trigger);
  expect(
    (screen.getByLabelText("API options") as HTMLTextAreaElement).value,
  ).toBe("规范\nToken\n组件");
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
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  const panel = document.getElementById(toggle.getAttribute("aria-controls")!);
  expect(panel?.getAttribute("aria-hidden")).toBe("true");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(source.textContent).toContain("同步内容");
});
