// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import LabApp from "./App";
import { initialTasks, storageKey, type Task } from "./model";

beforeEach(() => {
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function stored(): Task[] {
  return JSON.parse(localStorage.getItem(storageKey)!);
}

it("opens on a project task page and navigates to overview and other scopes", () => {
  render(<LabApp />);
  expect(
    screen.getByRole("heading", { name: "客户门户 2.0", level: 1 }),
  ).toBeTruthy();
  expect(screen.getAllByRole("checkbox")).toHaveLength(16);
  expect(screen.queryByText("实验条件")).toBeNull();
  fireEvent.click(screen.getByRole("tab", { name: "概览" }));
  expect(screen.getByRole("heading", { name: "项目简介" })).toBeTruthy();
  fireEvent.click(
    within(screen.getByRole("navigation", { name: "工作空间" })).getByRole(
      "button",
      { name: "我的任务" },
    ),
  );
  expect(
    screen.getByRole("heading", { name: "我的任务", level: 1 }),
  ).toBeTruthy();
  expect(screen.getAllByRole("checkbox")).toHaveLength(5);
  fireEvent.click(screen.getByRole("button", { name: "移动端体验" }));
  expect(screen.getAllByRole("checkbox")).toHaveLength(4);
});

it("validates a new task and persists its creation", () => {
  render(<LabApp />);
  fireEvent.click(screen.getAllByRole("button", { name: "新建任务" })[1]);
  const dialog = screen.getByRole("dialog", { name: "新建任务" });
  fireEvent.click(within(dialog).getByRole("button", { name: "创建任务" }));
  expect(within(dialog).getByText("请输入任务标题")).toBeTruthy();
  fireEvent.change(within(dialog).getByLabelText(/任务标题/), {
    target: { value: "添加客户反馈入口" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "创建任务" }));
  expect(
    screen.getByRole("button", { name: /打开 ATL-121 添加客户反馈入口/ }),
  ).toBeTruthy();
  expect(stored().find((task) => task.id === 121)?.title).toBe(
    "添加客户反馈入口",
  );
});

it("preserves discussion when saving edited task details", () => {
  render(<LabApp />);
  fireEvent.click(screen.getByRole("button", { name: /打开 ATL-105/ }));
  const dialog = screen.getByRole("dialog", { name: "ATL-105" });
  fireEvent.change(within(dialog).getByLabelText(/任务标题/), {
    target: { value: "修复导航长名称" },
  });
  fireEvent.change(within(dialog).getByLabelText("添加评论"), {
    target: { value: "已确认复现路径" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "发送评论" }));
  expect(within(dialog).getByText("已确认复现路径")).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "保存更改" }));
  const task = stored().find((task) => task.id === 105)!;
  expect(task.title).toBe("修复导航长名称");
  expect(task.comments.map((item) => item.text)).toContain("已确认复现路径");
});

it("clears selection on filtering and completes exactly the selected tasks", () => {
  render(<LabApp />);
  fireEvent.click(screen.getByRole("checkbox", { name: "选择 ATL-102" }));
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "ATL-103" },
  });
  expect(screen.queryByText("已选 1 个任务")).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", { name: "选择 ATL-103" }));
  fireEvent.click(screen.getByRole("button", { name: "标记已完成" }));
  expect(stored().find((task) => task.id === 103)?.status).toBe("done");
  expect(stored().find((task) => task.id === 102)?.status).toBe("progress");
});

it("confirms deletion and restores persisted changes after remount", () => {
  localStorage.setItem(storageKey, JSON.stringify(initialTasks()));
  const view = render(<LabApp />);
  fireEvent.click(screen.getByRole("checkbox", { name: "选择 ATL-102" }));
  fireEvent.click(screen.getByRole("button", { name: "删除" }));
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "删除 1 个任务？" })).getByRole(
      "button",
      { name: "删除任务" },
    ),
  );
  expect(stored().some((task) => task.id === 102)).toBe(false);
  view.unmount();
  render(<LabApp />);
  expect(screen.queryByRole("checkbox", { name: "选择 ATL-102" })).toBeNull();
});

it("moves an edited task to another project with a valid milestone", () => {
  render(<LabApp />);
  fireEvent.click(screen.getByRole("button", { name: /打开 ATL-102/ }));
  const dialog = screen.getByRole("dialog", { name: "ATL-102" });
  fireEvent.keyDown(within(dialog).getByRole("combobox", { name: "项目" }), {
    key: "ArrowDown",
  });
  fireEvent.click(screen.getByRole("option", { name: "移动端体验" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "保存更改" }));
  const moved = stored().find((task) => task.id === 102)!;
  expect(moved.project).toBe("mobile");
  expect(moved.milestone).toBe("交互梳理");
  expect(screen.queryByRole("checkbox", { name: "选择 ATL-102" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "移动端体验" }));
  expect(screen.getByRole("checkbox", { name: "选择 ATL-102" })).toBeTruthy();
});
