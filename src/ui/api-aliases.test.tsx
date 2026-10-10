// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Button,
  ButtonGroup,
  CopyButton,
  ExpandableCode,
  IconButton,
  SearchField,
  SegmentedControl,
  Surface,
} from "./components";
import { Layout } from "./motion";
import { ColorPicker } from "./color-picker";
import { Badge, EmptyState, Toast } from "./feedback";
import { ConfirmDialog, Dialog } from "./panels";
import { SelectionBar, Tabs } from "./selection";

beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
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

const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

it("maps deprecated button sizes onto md and sm", () => {
  const view = render(<Button size="default">中</Button>);
  expect(screen.getByRole("button").classList.contains("ui-button--md")).toBe(
    true,
  );
  view.rerender(<Button size="small">小</Button>);
  expect(screen.getByRole("button").classList.contains("ui-button--sm")).toBe(
    true,
  );
});

it("prefers aria-label over the deprecated IconButton label", () => {
  const view = render(<IconButton label="旧" icon="plus" />);
  expect(screen.getByRole("button", { name: "旧" }).getAttribute("title")).toBe(
    "旧",
  );
  view.rerender(<IconButton aria-label="新" label="旧" icon="plus" />);
  expect(screen.getByRole("button", { name: "新" }).getAttribute("title")).toBe(
    "新",
  );
});

it("maps ButtonGroup label and tone, and lets the new names win", () => {
  const view = render(
    <ButtonGroup label="旧" tone="soft">
      <Button>A</Button>
    </ButtonGroup>,
  );
  const legacy = screen.getByRole("group", { name: "旧" });
  expect(legacy.classList.contains("ui-button-group--contained")).toBe(true);
  view.rerender(
    <ButtonGroup aria-label="新" label="旧" variant="plain" tone="soft">
      <Button>A</Button>
    </ButtonGroup>,
  );
  const next = screen.getByRole("group", { name: "新" });
  expect(next.classList.contains("ui-button-group--plain")).toBe(true);
  expect(next.classList.contains("ui-button-group--contained")).toBe(false);
});

it("maps SegmentedControl label and onChange, and keeps defaultValue", () => {
  const onValueChange = vi.fn();
  const onChange = vi.fn();
  const view = render(
    <SegmentedControl
      label="旧"
      options={options}
      defaultValue="a"
      onChange={onChange}
    />,
  );
  expect(screen.getByRole("radiogroup", { name: "旧" })).toBeTruthy();
  fireEvent.click(screen.getByRole("radio", { name: "B" }));
  expect(onChange).toHaveBeenCalledWith("b");
  view.rerender(
    <SegmentedControl
      aria-label="新"
      label="旧"
      options={options}
      value="a"
      onValueChange={onValueChange}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: "B" }));
  expect(onValueChange).toHaveBeenCalledWith("b");
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("maps Tabs label and onChange, and lets onValueChange win", () => {
  const onValueChange = vi.fn();
  const onChange = vi.fn();
  const view = render(
    <Tabs
      label="旧"
      items={[
        { value: "a", label: "A", content: "甲" },
        { value: "b", label: "B", content: "乙" },
      ]}
      defaultValue="a"
      onChange={onChange}
    />,
  );
  expect(screen.getByRole("tablist", { name: "旧" })).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: "B" }));
  expect(onChange).toHaveBeenCalledWith("b");
  view.rerender(
    <Tabs
      aria-label="新"
      label="旧"
      items={[
        { value: "a", label: "A", content: "甲" },
        { value: "b", label: "B", content: "乙" },
      ]}
      value="a"
      onValueChange={onValueChange}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "B" }));
  expect(onValueChange).toHaveBeenCalledWith("b");
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("maps SearchField label and onChange, and lets onValueChange win", () => {
  const onValueChange = vi.fn();
  const onChange = vi.fn();
  const view = render(
    <SearchField label="旧" defaultValue="a" onChange={onChange} />,
  );
  const field = screen.getByRole("searchbox", {
    name: "旧",
  }) as HTMLInputElement;
  expect(field.value).toBe("a");
  fireEvent.change(field, { target: { value: "b" } });
  expect(onChange).toHaveBeenCalledWith("b");
  view.rerender(
    <SearchField
      aria-label="新"
      label="旧"
      defaultValue="a"
      onValueChange={onValueChange}
      onChange={onChange}
    />,
  );
  fireEvent.change(screen.getByRole("searchbox", { name: "新" }), {
    target: { value: "c" },
  });
  expect(onValueChange).toHaveBeenCalledWith("c");
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("prefers Layout aria-label over the deprecated label", () => {
  const view = render(<Layout label="旧">子项</Layout>);
  expect(screen.getByRole("group", { name: "旧" })).toBeTruthy();
  view.rerender(
    <Layout aria-label="新" label="旧">
      子项
    </Layout>,
  );
  expect(screen.getByRole("group", { name: "新" })).toBeTruthy();
});

it("prefers ColorPicker aria-label over the deprecated label", () => {
  const view = render(<ColorPicker label="旧颜色" />);
  expect(screen.getByText("旧颜色")).toBeTruthy();
  view.rerender(<ColorPicker aria-label="新颜色" label="旧颜色" />);
  expect(screen.getByText("新颜色")).toBeTruthy();
  expect(screen.queryByText("旧颜色")).toBeNull();
});

it("maps SelectionBar tone and lets variant win", () => {
  const view = render(<SelectionBar count={1} tone="soft" />);
  expect(document.querySelector(".ui-selection-bar--contained")).toBeTruthy();
  view.rerender(<SelectionBar count={1} variant="plain" tone="soft" />);
  expect(document.querySelector(".ui-selection-bar--plain")).toBeTruthy();
  expect(document.querySelector(".ui-selection-bar--contained")).toBeNull();
});

it("maps Surface tone and lets variant win", () => {
  const view = render(<Surface tone="raised">层</Surface>);
  expect(
    document
      .querySelector(".ui-surface")
      ?.classList.contains("ui-surface--raised"),
  ).toBe(true);
  view.rerender(
    <Surface variant="soft" tone="raised">
      层
    </Surface>,
  );
  expect(
    document
      .querySelector(".ui-surface")
      ?.classList.contains("ui-surface--raised"),
  ).toBe(false);
});

it("maps Badge variant and lets emphasis win", () => {
  const view = render(<Badge variant="plain">标签</Badge>);
  expect(document.querySelector(".ui-badge--quiet")).toBeTruthy();
  view.rerender(<Badge variant="white">标签</Badge>);
  expect(document.querySelector(".ui-badge--quiet")).toBeNull();
  expect(document.querySelector(".ui-badge--white")).toBeNull();
  view.rerender(
    <Badge emphasis="quiet" variant="soft">
      标签
    </Badge>,
  );
  expect(document.querySelector(".ui-badge--quiet")).toBeTruthy();
});

it("maps CopyButton label and variant, and lets the new names win", () => {
  const view = render(<CopyButton text="a" label="旧" variant="plain" />);
  expect(screen.getByRole("button", { name: "旧" }).className).toContain(
    "ui-button--quiet",
  );
  view.rerender(
    <CopyButton text="a" label="旧" emphasis="default" variant="plain">
      新
    </CopyButton>,
  );
  const button = screen.getByRole("button", { name: "新" });
  expect(button.className).not.toContain("ui-button--quiet");
});

it("maps ConfirmDialog danger and lets tone win", () => {
  const view = render(
    <ConfirmDialog
      open
      onOpenChange={() => {}}
      title="确认"
      onConfirm={() => {}}
    />,
  );
  expect(screen.getByRole("button", { name: "确认" }).className).not.toContain(
    "ui-button--danger",
  );
  view.rerender(
    <ConfirmDialog
      open
      onOpenChange={() => {}}
      title="确认"
      danger
      onConfirm={() => {}}
    />,
  );
  expect(screen.getByRole("button", { name: "确认" }).className).toContain(
    "ui-button--danger",
  );
  view.rerender(
    <ConfirmDialog
      open
      onOpenChange={() => {}}
      title="确认"
      tone="neutral"
      danger
      onConfirm={() => {}}
    />,
  );
  expect(screen.getByRole("button", { name: "确认" }).className).not.toContain(
    "ui-button--danger",
  );
});

it("maps Toast message and lets children win", () => {
  const view = render(<Toast open onOpenChange={() => {}} message="旧" />);
  expect(screen.getByText("旧")).toBeTruthy();
  view.rerender(
    <Toast open onOpenChange={() => {}} message="旧">
      新
    </Toast>,
  );
  expect(screen.getByText("新")).toBeTruthy();
  expect(screen.queryByText("旧")).toBeNull();
});

it("maps EmptyState action, lets actions win, and hides the default icon", () => {
  const view = render(
    <EmptyState title="空" action={<button type="button">旧</button>} />,
  );
  expect(document.querySelector(".ui-empty-state svg")).toBeNull();
  expect(screen.getByRole("button", { name: "旧" })).toBeTruthy();
  view.rerender(
    <EmptyState
      title="空"
      action={<button type="button">旧</button>}
      actions={<button type="button">新</button>}
    />,
  );
  expect(screen.getByRole("button", { name: "新" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "旧" })).toBeNull();
});

it("maps ExpandableCode label and lets expandLabel win", () => {
  const view = render(<ExpandableCode code="line" label="旧标签" />);
  expect(screen.getByRole("button", { name: /旧标签/ })).toBeTruthy();
  view.rerender(
    <ExpandableCode code="line" label="旧标签" expandLabel="新标签" />,
  );
  expect(screen.getByRole("button", { name: /新标签/ })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /旧标签/ })).toBeNull();
});

it("forwards className and style onto the component root", () => {
  const view = render(
    <Badge className="host-badge" style={{ marginTop: 2 }}>
      标记
    </Badge>,
  );
  const badge = screen.getByText("标记");
  expect(badge.classList.contains("host-badge")).toBe(true);
  expect(badge.getAttribute("style")).toContain("margin-top");
  view.rerender(
    <ButtonGroup
      aria-label="动作"
      className="host-group"
      style={{ marginTop: 4 }}
    >
      <Button>一项</Button>
    </ButtonGroup>,
  );
  const group = screen.getByRole("group", { name: "动作" });
  expect(group.classList.contains("host-group")).toBe(true);
  expect(group.getAttribute("style")).toContain("margin-top");
  view.rerender(
    <Dialog
      open
      onOpenChange={() => {}}
      title="标题"
      className="host-dialog"
      style={{ marginTop: 6 }}
    >
      内容
    </Dialog>,
  );
  const dialog = screen.getByRole("dialog");
  expect(dialog.classList.contains("host-dialog")).toBe(true);
  expect(dialog.getAttribute("style")).toContain("margin-top");
});

it("keeps Dialog variant as a deprecated drawer alias", () => {
  render(
    <Dialog open onOpenChange={() => {}} title="标题" variant="drawer">
      内容
    </Dialog>,
  );
  expect(
    screen.getByRole("dialog").classList.contains("ui-dialog--drawer"),
  ).toBe(true);
});
