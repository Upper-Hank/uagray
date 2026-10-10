// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import App from "./App";
import { SpecPractice } from "./spec-practice";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches: false,
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
  vi.stubGlobal("scrollTo", vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.location.hash = "";
});

it("filters the directory, recovers from empty results and renders practice", async () => {
  render(<App />);
  fireEvent.click(screen.getByRole("radio", { name: /^组件/ }));
  expect(
    screen.getAllByRole("link", { name: /Segmented control/ }),
  ).toHaveLength(1);
  fireEvent.change(screen.getByRole("searchbox", { name: "搜索目录" }), {
    target: { value: "no-such-piece" },
  });
  expect(screen.getByText("没有匹配条目")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "清空搜索" }));
  expect(screen.getByRole("link", { name: /Segmented control/ })).toBeTruthy();
  window.location.hash = "#text";
  fireEvent(window, new Event("hashchange"));
  await waitFor(() =>
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Expandable text",
    ),
  );
  expect(screen.getByRole("button", { name: "Show full prompt" })).toBeTruthy();
});

it("organizes the library into rules, tokens and components and updates the segment example", async () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "设计原则",
  );
  expect(
    screen.getByRole("radio", { name: /^规范/ }).getAttribute("aria-checked"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("radio", { name: /^Token/ }));
  expect(screen.getByRole("link", { name: /Typography/ })).toBeTruthy();
  expect(screen.queryByRole("link", { name: /Segmented control/ })).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: /^组件/ }));
  window.location.hash = "#segments";
  fireEvent(window, new Event("hashchange"));
  await waitFor(() =>
    expect(screen.getByRole("radiogroup", { name: "分类" })).toBeTruthy(),
  );
  expect(screen.getAllByRole("radio", { name: /^规范/ })).toHaveLength(3);
  expect(
    screen.queryByRole("radio", { name: /All|Foundations|Tools/ }),
  ).toBeNull();
});

it("presents principles without template status summaries and keeps selections local", () => {
  window.location.hash = "#principles";
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "表面由环境与对象共同决定" }),
  ).toBeTruthy();
  expect(screen.getByText("P10")).toBeTruthy();
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByText(/已添加/)).toBeNull();
  const ownership = within(
    screen
      .getByRole("heading", { name: "共同边界由组合负责" })
      .closest("section")!,
  );
  fireEvent.click(ownership.getByRole("button", { name: "横版" }));
  expect(
    ownership
      .getByRole("button", { name: "横版" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    screen.getByRole("radio", { name: "全部 8" }).getAttribute("aria-checked"),
  ).toBe("true");
  fireEvent.click(ownership.getByRole("button", { name: "重置" }));
  expect(
    ownership
      .getByRole("button", { name: "竖版" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});

it("edits the displayed record and keeps independent form drafts and save feedback local", () => {
  render(<SpecPractice id="principles" />);
  const rule = (title: string) =>
    within(screen.getByRole("heading", { name: title }).closest("section")!);
  const project = rule("保留最小充分对比");
  const settings = rule("围合必须有明确对象");
  const extension = rule("扩展经过组合与成本检验");
  fireEvent.click(project.getByRole("button", { name: "编辑" }));
  fireEvent.change(project.getByRole("textbox", { name: "文档名称" }), {
    target: { value: "交互文档" },
  });
  fireEvent.click(project.getByRole("button", { name: "完成编辑" }));
  expect(project.getByText("交互文档")).toBeTruthy();
  fireEvent.change(extension.getByLabelText("空间名称"), {
    target: { value: "设计空间" },
  });
  expect((settings.getByLabelText("空间名称") as HTMLInputElement).value).toBe(
    "工作空间",
  );
  fireEvent.click(extension.getByRole("button", { name: "保存" }));
  expect(extension.getByRole("button", { name: "已保存" })).toBeTruthy();
  fireEvent.change(extension.getByLabelText("空间名称"), {
    target: { value: "新空间" },
  });
  expect(extension.getByRole("button", { name: "保存" })).toBeTruthy();
  fireEvent.click(extension.getByRole("button", { name: "重置" }));
  expect((extension.getByLabelText("空间名称") as HTMLInputElement).value).toBe(
    "工作空间",
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(rule("强调必须有语义与范围").queryByRole("checkbox")).toBeNull();
});

it("demonstrates behavior through actual items without count summaries", () => {
  render(<SpecPractice id="behavior" />);
  const items = screen.getByRole("list", { name: "示例项目" });
  const remove = screen.getByRole("button", { name: "移除" });
  expect((remove as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "添加" }));
  expect(within(items).getAllByRole("listitem")).toHaveLength(1);
  expect((remove as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(remove);
  expect(within(items).queryAllByRole("listitem")).toHaveLength(0);
  expect(screen.queryByText(/已添加/)).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "收藏 3" }));
  expect(
    screen.getByRole("radio", { name: "收藏 3" }).getAttribute("aria-checked"),
  ).toBe("true");
});

it("resets the inline zoom control to its initial value", () => {
  render(<SpecPractice id="layout-motion" />);
  const toolbar = within(
    screen
      .getByRole("heading", { name: "沿操作轴组织工具" })
      .closest("section")!,
  );
  const slider = toolbar.getByRole("slider", { name: "缩放" });
  fireEvent.change(slider, { target: { value: "75" } });
  expect((slider as HTMLInputElement).value).toBe("75");
  expect(toolbar.getByText("75%")).toBeTruthy();
  fireEvent.click(toolbar.getByRole("button", { name: "重置" }));
  expect((slider as HTMLInputElement).value).toBe("50");
  expect(toolbar.getByText("50%")).toBeTruthy();
});

it("keeps component previews interactive with API configuration and without case links", () => {
  render(<App />);
  expect(screen.queryByRole("link", { name: "案例" })).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: /^组件/ }));
  for (const id of ["slider", "number-input", "segments"]) {
    window.location.hash = `#${id}`;
    fireEvent(window, new Event("hashchange"));
    expect(screen.getByRole("region", { name: "组件预览" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "API 配置" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "收起 API" })).toBeTruthy();
  }
  const group = screen.getByRole("radiogroup", { name: "分类" });
  const option = within(group).getByRole("radio", { name: /^Token/ });
  fireEvent.click(option);
  expect(option.getAttribute("aria-checked")).toBe("true");
});
