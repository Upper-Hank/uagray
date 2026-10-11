// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Button, Dialog, Icon, Select, Tabs, Toast } from "./index";

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => preference.reduced,
}));
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value() {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value() {
      this.open = false;
    },
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  preference.reduced = false;
  vi.restoreAllMocks();
});

it("uses only the latest button label for layout, naming and activation during rapid replacement", async () => {
  const click = vi.fn();
  const view = render(<Button onClick={click}>复制</Button>);
  expect(
    view.container.querySelectorAll(".ui-changing-text > span"),
  ).toHaveLength(1);
  view.rerender(<Button onClick={click}>已复制</Button>);
  expect(screen.getByRole("button", { name: "已复制" })).toBeTruthy();
  expect(
    view.container
      .querySelector(".ui-changing-text-outgoing")
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  view.rerender(<Button onClick={click}>重试</Button>);
  view.rerender(<Button onClick={click}>已复制</Button>);
  expect(
    view.container.querySelectorAll(".ui-changing-text > span"),
  ).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "已复制" }));
  expect(click).toHaveBeenCalledOnce();
  await waitFor(() =>
    expect(
      view.container.querySelectorAll(".ui-changing-text > span"),
    ).toHaveLength(1),
  );
});

it("keeps reduced-motion button content clear and current", () => {
  preference.reduced = true;
  const view = render(<Button>保存</Button>);
  view.rerender(<Button>已保存</Button>);
  const label = screen
    .getByRole("button", { name: "已保存" })
    .querySelector(
      ".ui-changing-text > span:not([aria-hidden])",
    ) as HTMLElement;
  expect(label.style.filter).toBe("blur(0px)");
  expect(label.style.opacity).toBe("1");
});

it("isolates outgoing panels immediately and preserves input through reversal", async () => {
  const items = [
    {
      value: "a",
      label: "甲",
      content: <input aria-label="草稿" defaultValue="原文" />,
    },
    { value: "b", label: "乙", content: "第二页" },
  ];
  const tabs = (current: string) => (
    <Tabs aria-label="内容" value={current}>
      <Tabs.List>
        {items.map((item) => (
          <Tabs.Trigger key={item.value} value={item.value}>
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {items.map((item) => (
        <Tabs.Content key={item.value} value={item.value}>
          {item.content}
        </Tabs.Content>
      ))}
    </Tabs>
  );
  const view = render(tabs("a"));
  const input = screen.getByRole("textbox") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "保留的草稿" } });
  input.focus();
  const first = screen.getByRole("tabpanel");
  view.rerender(tabs("b"));
  expect(first.hasAttribute("inert")).toBe(true);
  expect(first.getAttribute("aria-hidden")).toBe("true");
  expect(screen.getByRole("tabpanel").textContent).toBe("第二页");
  expect(document.activeElement).toBe(screen.getByRole("tab", { name: "乙" }));
  view.rerender(tabs("a"));
  expect(screen.getByRole("textbox")).toBe(input);
  expect(input.value).toBe("保留的草稿");
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 180));
  });
  expect(first.hidden).toBe(false);
  expect(first.hasAttribute("inert")).toBe(false);
});

it("does not let an obsolete dialog exit close a reopened window", async () => {
  const change = vi.fn();
  const view = render(
    <Dialog open onOpenChange={change}><Dialog.Header><Dialog.Title>设置</Dialog.Title></Dialog.Header><Dialog.Body>
      <input aria-label="窗口输入"/>
    </Dialog.Body></Dialog>,
  );
  const dialog = screen.getByRole("dialog") as HTMLDialogElement;
  view.rerender(
    <Dialog open={false} onOpenChange={change}><Dialog.Header><Dialog.Title>设置</Dialog.Title></Dialog.Header><Dialog.Body>
      <input aria-label="窗口输入"/>
    </Dialog.Body></Dialog>,
  );
  expect(dialog.querySelector(".ui-dialog-inner")?.hasAttribute("inert")).toBe(
    true,
  );
  view.rerender(
    <Dialog open onOpenChange={change}><Dialog.Header><Dialog.Title>设置</Dialog.Title></Dialog.Header><Dialog.Body>
      <input aria-label="窗口输入"/>
    </Dialog.Body></Dialog>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 180));
  });
  expect(dialog.open).toBe(true);
  expect(dialog.querySelector(".ui-dialog-inner")?.hasAttribute("inert")).toBe(
    false,
  );
  expect(change).not.toHaveBeenCalled();
  view.rerender(
    <Dialog open={false} onOpenChange={change}><Dialog.Header><Dialog.Title>设置</Dialog.Title></Dialog.Header><Dialog.Body>
      <input aria-label="窗口输入"/>
    </Dialog.Body></Dialog>,
  );
  await waitFor(() => expect(dialog.open).toBe(false));
});

it("removes an exiting toast from operation and announcement before unmount", () => {
  const view = render(
    <Toast open duration={0} onOpenChange={() => { }}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
      已保存
    </Toast.Body></Toast>,
  );
  const toast = screen.getByRole("status");
  view.rerender(
    <Toast open={false} duration={0} onOpenChange={() => { }}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
      已保存
    </Toast.Body></Toast>,
  );
  expect(toast.hasAttribute("inert")).toBe(true);
  expect(toast.getAttribute("aria-hidden")).toBe("true");
  expect(toast.getAttribute("aria-live")).toBe("off");
  expect(screen.queryByRole("status")).toBeNull();
});

it("keeps Radix selection semantics and makes the closing menu inert", async () => {
  const change = vi.fn();
  render(
    <Select aria-label="类型" defaultValue="a" onValueChange={change}>{[
    { value: "a", label: "甲" },
    { value: "b", label: "乙" },
].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>,
  );
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
  const menu = await screen.findByRole("listbox");
  expect(menu.getAttribute("data-state")).toBe("open");
  fireEvent.keyDown(menu, { key: "Escape" });
  await waitFor(() =>
    expect(screen.getByRole("combobox").getAttribute("aria-expanded")).toBe(
      "false",
    ),
  );
  expect(menu.hasAttribute("inert")).toBe(true);
  expect(menu.getAttribute("aria-hidden")).toBe("true");
  expect(change).not.toHaveBeenCalled();
});
