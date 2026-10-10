// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { CasePractice } from "./cases";
import { CaseApp } from "./case-app";
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
});
it("filters the gallery and recovers from no matches", () => {
  render(<CasePractice id="case-gallery" />);
  fireEvent.change(screen.getByRole("searchbox", { name: "搜索案例" }), {
    target: { value: "不存在" },
  });
  expect(screen.getByText("没有匹配案例")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "清空筛选" }));
  expect(
    screen.getByRole("link", { name: /海报编辑/ }).getAttribute("href"),
  ).toBe("/cases/workspace.html");
});
it("changes workspace layout, color and scale then restores defaults", () => {
  render(<CasePractice id="case-workspace" />);
  fireEvent.click(screen.getByRole("button", { name: "横版" }));
  expect(
    screen.getByRole("button", { name: "横版" }).getAttribute("aria-pressed"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "颜色" }));
  fireEvent.change(screen.getByLabelText("海报颜色 HEX"), {
    target: { value: "#CA4C58" },
  });
  fireEvent.keyDown(screen.getByLabelText("海报颜色 HEX"), { key: "Enter" });
  expect(
    (screen.getByLabelText("海报颜色 HEX") as HTMLInputElement).value,
  ).toBe("#CA4C58");
  fireEvent.change(screen.getByRole("slider", { name: "缩放" }), {
    target: { value: "120" },
  });
  expect(screen.getByText("120%")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "重置" }));
  expect(
    (screen.getByLabelText("海报颜色 HEX") as HTMLInputElement).value,
  ).toBe("#3765D6");
  expect(
    screen.getByRole("button", { name: "竖版" }).getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.getByText("100%")).toBeTruthy();
});
it("creates a project through validation, filters and completes selected projects", async () => {
  render(<CasePractice id="case-saas" />);
  fireEvent.click(screen.getByRole("button", { name: "新建项目" }));
  const dialog = await screen.findByRole("dialog", { name: "新建项目" });
  fireEvent.click(within(dialog).getByRole("button", { name: "保存" }));
  expect(within(dialog).getByText("请输入项目名称。")).toBeTruthy();
  fireEvent.change(within(dialog).getByLabelText("项目名称"), {
    target: { value: "颜色组件" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "保存" }));
  expect(screen.getByRole("cell", { name: "颜色组件" })).toBeTruthy();
  fireEvent.change(screen.getByRole("searchbox", { name: "搜索项目" }), {
    target: { value: "颜色组件" },
  });
  expect(screen.queryByRole("cell", { name: "品牌字体" })).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", { name: "选择 颜色组件" }));
  fireEvent.click(screen.getByRole("button", { name: "标记完成" }));
  const row = screen.getByRole("cell", { name: "颜色组件" }).closest("tr")!;
  expect(within(row).getByText("已完成")).toBeTruthy();
});

it("keeps case pages separate from the component workbench", () => {
  render(<CaseApp id="case-detail" />);
  expect(screen.queryByRole("searchbox", { name: "搜索目录" })).toBeNull();
  expect(screen.queryByRole("radiogroup", { name: "展示分类" })).toBeNull();
  expect(screen.getByRole("main").id).toBe("detail-content");
  expect(
    screen.getByRole("link", { name: "组件展示" }).getAttribute("href"),
  ).toBe("/");
  expect(
    screen.getByRole("heading", { level: 1, name: "模块研究" }),
  ).toBeTruthy();
});
it("supports keyboard rotation and reset in the reference structure", () => {
  const { container } = render(<CasePractice id="case-detail" />);
  const model = screen.getByRole("group", { name: /模块视图/ });
  fireEvent.keyDown(model, { key: "ArrowRight" });
  expect(
    (
      container.querySelector(".detail-model .module-art") as HTMLElement
    ).style.getPropertyValue("--module-angle"),
  ).toBe("-19deg");
  fireEvent.click(screen.getByRole("button", { name: "重置视图" }));
  expect(
    (
      container.querySelector(".detail-model .module-art") as HTMLElement
    ).style.getPropertyValue("--module-angle"),
  ).toBe("-24deg");
  expect(
    screen.getByRole("navigation", { name: "相邻案例" }).querySelectorAll("a"),
  ).toHaveLength(2);
});
