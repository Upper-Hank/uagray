// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import GithubPage from "./github-page";
import VercelPage from "./vercel-page";
import {
  initialIssues,
  issuesKey,
  matchIssue,
  type Issue,
} from "./github-data";
import {
  initialProject,
  launchKey,
  variableError,
  type LaunchProject,
} from "./vercel-data";
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
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
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
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
const savedIssues = (): Issue[] => JSON.parse(localStorage.getItem(issuesKey)!);
const savedProject = (): LaunchProject =>
  JSON.parse(localStorage.getItem(launchKey)!);

it("matches issue qualifiers and rejects incompatible state combinations", () => {
  const issue = initialIssues()[0];
  expect(
    matchIssue(issue, "is:issue is:open label:bug assignee:chen #284"),
  ).toBe(true);
  expect(matchIssue(issue, "is:closed label:bug")).toBe(false);
});
it("closes only selected issues and clears selection when searching", () => {
  render(<GithubPage />);
  fireEvent.click(screen.getByRole("checkbox", { name: "选择问题 #284" }));
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "#285" },
  });
  expect(screen.queryByText("已选 1 个问题")).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", { name: "选择问题 #285" }));
  fireEvent.click(screen.getByRole("button", { name: "关闭所选" }));
  expect(savedIssues().find((issue) => issue.id === 285)?.state).toBe("closed");
  expect(savedIssues().find((issue) => issue.id === 284)?.state).toBe("open");
});
it("validates issue creation and opens its persisted detail", async () => {
  render(<GithubPage />);
  fireEvent.click(screen.getByRole("button", { name: "新建问题" }));
  const dialog = screen.getByRole("dialog", { name: "新建问题" });
  fireEvent.click(within(dialog).getByRole("button", { name: "创建问题" }));
  expect(within(dialog).getByText("请输入问题标题")).toBeTruthy();
  fireEvent.change(within(dialog).getByLabelText(/问题标题/), {
    target: { value: "支持长标签组合" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "创建问题" }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: /支持长标签组合 #296/ }),
    ).toBeTruthy(),
  );
  expect(savedIssues().find((issue) => issue.id === 296)?.title).toBe(
    "支持长标签组合",
  );
});
it("persists discussion and reopens a closed issue", () => {
  window.history.replaceState(null, "", "/github/#/issues/287");
  render(<GithubPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "添加评论" }), {
    target: { value: "已补充新的复现路径" },
  });
  fireEvent.click(screen.getByRole("button", { name: "发表评论" }));
  fireEvent.click(screen.getByRole("button", { name: "重新开放" }));
  const issue = savedIssues().find((issue) => issue.id === 287)!;
  expect(issue.state).toBe("open");
  expect(issue.comments[0].text).toBe("已补充新的复现路径");
});
it("saves settings independently without committing another section's draft", () => {
  render(<VercelPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "名称" }), {
    target: { value: "portal-next" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "根目录" }), {
    target: { value: "apps/portal" },
  });
  fireEvent.click(screen.getByRole("button", { name: "保存名称" }));
  expect(savedProject().name).toBe("portal-next");
  expect(savedProject().root).toBe("./");
  expect(
    (screen.getByRole("textbox", { name: "根目录" }) as HTMLInputElement).value,
  ).toBe("apps/portal");
  fireEvent.click(screen.getByRole("button", { name: "保存目录" }));
  expect(savedProject().root).toBe("apps/portal");
});
it("rejects duplicate environment scopes and saves a valid new variable", () => {
  render(<VercelPage />);
  fireEvent.click(screen.getByRole("button", { name: "环境变量" }));
  fireEvent.click(screen.getByRole("button", { name: "新增变量" }));
  const dialog = screen.getByRole("dialog", { name: "新增环境变量" });
  fireEvent.change(within(dialog).getByLabelText(/变量名称/), {
    target: { value: "PUBLIC_API_URL" },
  });
  fireEvent.change(within(dialog).getByLabelText(/^变量值/), {
    target: { value: "https://preview.example.com" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "保存变量" }));
  expect(within(dialog).getByText("同名变量已存在于所选环境中。")).toBeTruthy();
  fireEvent.change(within(dialog).getByLabelText(/变量名称/), {
    target: { value: "PREVIEW_API_URL" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "保存变量" }));
  expect(
    savedProject().variables.find((item) => item.name === "PREVIEW_API_URL")
      ?.targets,
  ).toEqual(["preview"]);
});
it("permits disjoint environment scopes and rejects an empty target set", () => {
  const variable = {
    id: "new",
    name: "FEATURE_PORTAL_V2",
    value: "disabled",
    targets: ["production"],
  };
  expect(variableError(variable, initialProject().variables)).toBe("");
  expect(
    variableError({ ...variable, targets: [] }, initialProject().variables),
  ).toBe("至少选择一个环境。");
});
it("saves build overrides and transfers the complete configuration", () => {
  render(<VercelPage />);
  fireEvent.click(screen.getByRole("button", { name: "构建与输出" }));
  fireEvent.click(screen.getByRole("switch", { name: "覆盖默认构建配置" }));
  fireEvent.change(screen.getByRole("textbox", { name: "构建命令" }), {
    target: { value: "npm run build:site" },
  });
  fireEvent.click(screen.getByRole("button", { name: "保存构建配置" }));
  fireEvent.click(screen.getByRole("button", { name: "常规" }));
  fireEvent.click(screen.getByRole("button", { name: "转移项目" }));
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "转移项目" })).getByRole(
      "button",
      { name: "确认转移" },
    ),
  );
  expect(savedProject().team).toBe("studio");
  expect(savedProject().build).toBe("npm run build:site");
  expect(savedProject().variables).toHaveLength(2);
});
it("requires the exact project name before deleting its environment data", () => {
  render(<VercelPage />);
  fireEvent.click(screen.getByRole("button", { name: "删除项目" }));
  const dialog = screen.getByRole("dialog", { name: "确认删除项目" });
  fireEvent.click(within(dialog).getByRole("button", { name: "确认删除" }));
  expect(within(dialog).getByText("项目名称不一致。")).toBeTruthy();
  expect(savedProject().deleted).toBe(false);
  fireEvent.change(
    within(dialog).getByRole("textbox", { name: "确认项目名称" }),
    { target: { value: "atlas-portal" } },
  );
  fireEvent.click(within(dialog).getByRole("button", { name: "确认删除" }));
  expect(savedProject().deleted).toBe(true);
  expect(savedProject().variables).toEqual([]);
  expect(screen.getByText("项目已删除")).toBeTruthy();
});
it("restores preset commands when build overrides are disabled", () => {
  const project = { ...initialProject(), override: true, build: "custom build", output: "custom-output", install: "custom install" };
  localStorage.setItem(launchKey, JSON.stringify(project));
  render(<VercelPage />);
  fireEvent.click(screen.getByRole("button", { name: "构建与输出" }));
  fireEvent.click(screen.getByRole("switch", { name: "覆盖默认构建配置" }));
  fireEvent.click(screen.getByRole("button", { name: "保存构建配置" }));
  expect(savedProject()).toMatchObject({ override: false, build: "npm run build", output: "dist", install: "npm ci" });
});
