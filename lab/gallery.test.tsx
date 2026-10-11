// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import GalleryApp from "./gallery";
import { FocusTimer, PieceExperience } from "./gallery-experiences";
import { findPieces, readPieceId } from "./gallery-data";

beforeEach(() => {
  window.history.replaceState(null, "", "/anish/");
  localStorage.clear();
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
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function route(id: string) {
  window.history.replaceState(null, "", `/anish/#/piece/${id}`);
  fireEvent(window, new HashChangeEvent("hashchange"));
}
it("reads detail routes and searches by title or component name", () => {
  expect(readPieceId("#/piece/reading")).toBe("reading");
  expect(readPieceId("#gallery-main")).toBeNull();
  expect(findPieces("ColorPicker", "tool").map((item) => item.id)).toEqual([
    "palette",
  ]);
});
it("combines category and search with synchronized counts", () => {
  render(<GalleryApp />);
  fireEvent.click(screen.getByRole("radio", { name: /工具/ }));
  expect(within(screen.getByRole("main")).getAllByRole("link")).toHaveLength(3);
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "计时" },
  });
  expect(within(screen.getByRole("main")).getAllByRole("link")).toHaveLength(1);
  expect(screen.getByRole("radio", { name: /全部 1/ })).toBeTruthy();
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "不存在的作品" },
  });
  expect(screen.getByText("没有找到作品")).toBeTruthy();
});
it("opens a deep-linked detail and keeps skip navigation inside that detail", () => {
  window.history.replaceState(null, "", "/anish/#/piece/pulse");
  render(<GalleryApp />);
  expect(
    screen.getByRole("heading", { name: "进度面板", level: 1 }),
  ).toBeTruthy();
  const pager = screen.getByRole("navigation", { name: "作品翻页" });
  expect(pager.classList.contains("ui-button-group--contained")).toBe(true);
  expect(pager.parentElement?.classList.contains("ui-action-row")).toBe(true);
  expect(within(pager).getAllByRole("button")).toHaveLength(1);
  expect(within(pager).getAllByRole("link")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "完成一篇" }));
  expect(
    screen
      .getByRole("progressbar", { name: "阅读计划进度" })
      .getAttribute("value"),
  ).toBe("7");
  window.history.replaceState(null, "", "/anish/#gallery-main");
  fireEvent(window, new HashChangeEvent("hashchange"));
  expect(
    screen.getByRole("heading", { name: "进度面板", level: 1 }),
  ).toBeTruthy();
  route("reading");
  expect(
    screen.getByRole("heading", { name: "阅读便笺", level: 1 }),
  ).toBeTruthy();
  expect(screen.getByRole("navigation", { name: "作品翻页" })).toBeTruthy();
});
it("adds, completes and removes actual checklist items", () => {
  render(<PieceExperience id="checklist" />);
  fireEvent.change(screen.getByRole("textbox", { name: "新增事项" }), {
    target: { value: "检查发布记录" },
  });
  fireEvent.click(screen.getByRole("button", { name: "添加" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "检查发布记录" }));
  const progress = screen.getByRole("progressbar");
  expect(progress.getAttribute("value")).toBe("2");
  expect(progress.getAttribute("max")).toBe("4");
  fireEvent.click(screen.getByRole("button", { name: "清除已完成" }));
  expect(screen.queryByRole("checkbox", { name: "检查发布记录" })).toBeNull();
  expect(screen.getAllByRole("checkbox")).toHaveLength(2);
});
it("pauses and resumes the timer using elapsed time and cleans up on exit", () => {
  vi.useFakeTimers();
  const view = render(<FocusTimer />);
  fireEvent.click(screen.getByRole("button", { name: "开始" }));
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.getByText("14:57")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "暂停" }));
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.getByText("14:57")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "继续" }));
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByText("14:56")).toBeTruthy();
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("handles an unknown piece with a working return link", () => {
  window.history.replaceState(null, "", "/anish/#/piece/missing");
  render(<GalleryApp />);
  expect(screen.getByText("没有找到这个作品")).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "返回作品目录" }).getAttribute("href"),
  ).toBe("/anish/#/");
});

it("keeps the color preview synchronized with the real ColorPicker", () => {
  render(<PieceExperience id="palette" />);
  const hex = screen.getByRole("textbox", { name: "基准色 HEX" });
  fireEvent.change(hex, { target: { value: "#123456" } });
  fireEvent.blur(hex);
  expect(screen.getByRole("img", { name: "当前色样 #123456" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "恢复基准色" }));
  expect(screen.getByRole("img", { name: "当前色样 #6B7F73" })).toBeTruthy();
});
