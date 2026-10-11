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
  Surface,
} from "./components";
import { Layout } from "./motion";
import { ColorPicker } from "./color-picker";
import { Badge, EmptyState, Toast } from "./feedback";
import { Icon } from "./icons";
import { ConfirmDialog, Dialog } from "./panels";
import { SegmentedControl, SelectionBar, Tabs } from "./selection";
import { FileDropzone } from "./file-dropzone";

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
    <SegmentedControl label="旧" defaultValue="a" onChange={onChange}>{options.map(item => <SegmentedControl.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}><SegmentedControl.Label>{item.label}</SegmentedControl.Label>{(item as { count?: number | string }).count != null ? <SegmentedControl.Count>{(item as { count?: number | string }).count}</SegmentedControl.Count> : null}</SegmentedControl.Item>)}</SegmentedControl>,
  );
  expect(screen.getByRole("radiogroup", { name: "旧" })).toBeTruthy();
  fireEvent.click(screen.getByRole("radio", { name: "B" }));
  expect(onChange).toHaveBeenCalledWith("b");
  view.rerender(
    <SegmentedControl aria-label="新" label="旧" value="a" onValueChange={onValueChange} onChange={onChange}>{options.map(item => <SegmentedControl.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}><SegmentedControl.Label>{item.label}</SegmentedControl.Label>{(item as { count?: number | string }).count != null ? <SegmentedControl.Count>{(item as { count?: number | string }).count}</SegmentedControl.Count> : null}</SegmentedControl.Item>)}</SegmentedControl>,
  );
  fireEvent.click(screen.getByRole("radio", { name: "B" }));
  expect(onValueChange).toHaveBeenCalledWith("b");
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("maps Tabs label and onChange, and lets onValueChange win", () => {
  const onValueChange = vi.fn();
  const onChange = vi.fn();
  const view = render(
    <Tabs label="旧" defaultValue="a" onChange={onChange}>
      <Tabs.List>
        <Tabs.Trigger value="a">A</Tabs.Trigger>
        <Tabs.Trigger value="b">B</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">甲</Tabs.Content>
      <Tabs.Content value="b">乙</Tabs.Content>
    </Tabs>,
  );
  expect(screen.getByRole("tablist", { name: "旧" })).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: "B" }));
  expect(onChange).toHaveBeenCalledWith("b");
  view.rerender(
    <Tabs
      aria-label="新"
      label="旧"
      value="a"
      onValueChange={onValueChange}
      onChange={onChange}
    >
      <Tabs.List>
        <Tabs.Trigger value="a">A</Tabs.Trigger>
        <Tabs.Trigger value="b">B</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">甲</Tabs.Content>
      <Tabs.Content value="b">乙</Tabs.Content>
    </Tabs>,
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
  const view = render(<SelectionBar count={1} tone="soft"><SelectionBar.Count /></SelectionBar>);
  expect(document.querySelector(".ui-selection-bar--contained")).toBeTruthy();
  view.rerender(<SelectionBar count={1} variant="plain" tone="soft"><SelectionBar.Count /></SelectionBar>);
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
  const view = render(<CopyButton text="a" variant="plain"><CopyButton.Label>{"旧"}</CopyButton.Label><CopyButton.Feedback state="success">已复制</CopyButton.Feedback><CopyButton.Feedback state="pending">正在复制</CopyButton.Feedback><CopyButton.Feedback state="error">复制失败</CopyButton.Feedback></CopyButton>);
  expect(screen.getByRole("button", { name: "旧" }).className).toContain(
    "ui-button--quiet",
  );
  view.rerender(
    <CopyButton text="a" emphasis="default" variant="plain"><CopyButton.Label>{"旧"}</CopyButton.Label><CopyButton.Feedback state="success">已复制</CopyButton.Feedback><CopyButton.Feedback state="pending">正在复制</CopyButton.Feedback><CopyButton.Feedback state="error">复制失败</CopyButton.Feedback></CopyButton>,
  );
  const button = screen.getByRole("button", { name: "新" });
  expect(button.className).not.toContain("ui-button--quiet");
});

it("maps ConfirmDialog danger and lets tone win", () => {
  const view = render(
    <ConfirmDialog open onOpenChange={() => {}} onConfirm={() => {}}><ConfirmDialog.Header><ConfirmDialog.Title>{"确认"}</ConfirmDialog.Title></ConfirmDialog.Header><ConfirmDialog.Footer><ConfirmDialog.CancelAction>取消</ConfirmDialog.CancelAction><ConfirmDialog.ConfirmAction>确认</ConfirmDialog.ConfirmAction></ConfirmDialog.Footer></ConfirmDialog>,
  );
  expect(screen.getByRole("button", { name: "确认" }).className).not.toContain(
    "ui-button--danger",
  );
  view.rerender(
    <ConfirmDialog open onOpenChange={() => {}} danger onConfirm={() => {}}><ConfirmDialog.Header><ConfirmDialog.Title>{"确认"}</ConfirmDialog.Title></ConfirmDialog.Header><ConfirmDialog.Footer><ConfirmDialog.CancelAction>取消</ConfirmDialog.CancelAction><ConfirmDialog.ConfirmAction>确认</ConfirmDialog.ConfirmAction></ConfirmDialog.Footer></ConfirmDialog>,
  );
  expect(screen.getByRole("button", { name: "确认" }).className).toContain(
    "ui-button--danger",
  );
  view.rerender(
    <ConfirmDialog open onOpenChange={() => {}} tone="neutral" danger onConfirm={() => {}}><ConfirmDialog.Header><ConfirmDialog.Title>{"确认"}</ConfirmDialog.Title></ConfirmDialog.Header><ConfirmDialog.Footer><ConfirmDialog.CancelAction>取消</ConfirmDialog.CancelAction><ConfirmDialog.ConfirmAction>确认</ConfirmDialog.ConfirmAction></ConfirmDialog.Footer></ConfirmDialog>,
  );
  expect(screen.getByRole("button", { name: "确认" }).className).not.toContain(
    "ui-button--danger",
  );
});

it("renders Toast body content", () => {
  const view = render(
    <Toast open onOpenChange={() => {}}>
      <Toast.Icon>
        <Icon name="menu" size={16} />
      </Toast.Icon>
      <Toast.Body>旧</Toast.Body>
    </Toast>,
  );
  expect(screen.getByText("旧")).toBeTruthy();
  view.rerender(
    <Toast open onOpenChange={() => {}}>
      <Toast.Icon>
        <Icon name="menu" size={16} />
      </Toast.Icon>
      <Toast.Body>新</Toast.Body>
    </Toast>,
  );
  expect(screen.getByText("新")).toBeTruthy();
  expect(screen.queryByText("旧")).toBeNull();
});

it("maps EmptyState action, lets actions win, and hides the default icon", () => {
  const view = render(
    <EmptyState><EmptyState.Title>空</EmptyState.Title><EmptyState.Actions><button type="button">旧</button></EmptyState.Actions></EmptyState>,
  );
  expect(document.querySelector(".ui-empty-state svg")).toBeNull();
  expect(screen.getByRole("button", { name: "旧" })).toBeTruthy();
  view.rerender(
    <EmptyState><EmptyState.Title>空</EmptyState.Title><EmptyState.Actions><button type="button">新</button></EmptyState.Actions></EmptyState>,
  );
  expect(screen.getByRole("button", { name: "新" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "旧" })).toBeNull();
});

it("maps ExpandableCode label and lets expandLabel win", () => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(600);
  const view = render(<ExpandableCode ><ExpandableCode.Body>{"line"}</ExpandableCode.Body><ExpandableCode.CopyAction>复制</ExpandableCode.CopyAction><ExpandableCode.ExpandAction>{"旧标签"}</ExpandableCode.ExpandAction><ExpandableCode.CollapseAction>收起代码</ExpandableCode.CollapseAction></ExpandableCode>);
  expect(screen.getByRole("button", { name: /旧标签/ })).toBeTruthy();
  view.rerender(
    <ExpandableCode ><ExpandableCode.Body>{"line"}</ExpandableCode.Body><ExpandableCode.CopyAction>复制</ExpandableCode.CopyAction><ExpandableCode.ExpandAction>{"新标签"}</ExpandableCode.ExpandAction><ExpandableCode.CollapseAction>收起代码</ExpandableCode.CollapseAction></ExpandableCode>,
  );
  expect(screen.getByRole("button", { name: /新标签/ })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /旧标签/ })).toBeNull();
});

it("forwards host props and still runs owned listeners", () => {
  const enter = vi.fn();
  const { rerender } = render(
    <Toast open onOpenChange={() => { }} onPointerEnter={enter}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
      已保存
    </Toast.Body></Toast>,
  );
  fireEvent.pointerEnter(screen.getByRole("status"));
  expect(enter).toHaveBeenCalledOnce();
  const click = vi.fn();
  rerender(
    <Dialog open onOpenChange={() => { }} onClick={click}><Dialog.Header><Dialog.Title>标题</Dialog.Title></Dialog.Header><Dialog.Body>
      内容
    </Dialog.Body></Dialog>,
  );
  fireEvent.click(screen.getByRole("dialog"));
  expect(click).toHaveBeenCalledOnce();
  rerender(
    <Tabs aria-label="分区" className="host-tabs" style={{ marginTop: 2 }}>
      <Tabs.List>
        <Tabs.Trigger value="a">甲</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">内容</Tabs.Content>
    </Tabs>,
  );
  const tabs = document.querySelector(".host-tabs");
  expect(tabs?.classList.contains("ui-tabs")).toBe(true);
  expect(tabs?.getAttribute("style")).toContain("margin-top");
  rerender(
    <FileDropzone className="host-upload" aria-label="上传" onFiles={() => {}}><FileDropzone.Trigger>选择文件</FileDropzone.Trigger><FileDropzone.Error /></FileDropzone>,
  );
  expect(
    document.querySelector(".host-upload")?.classList.contains("ui-upload"),
  ).toBe(true);
  rerender(
    <SelectionBar count={1} className="host-selection"><SelectionBar.Description>{"已选 1 项"}</SelectionBar.Description></SelectionBar>,
  );
  expect(
    screen
      .getByRole("group", { name: "批量操作" })
      .classList.contains("host-selection"),
  ).toBe(true);
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
    <Dialog open onOpenChange={() => { }} className="host-dialog" style={{ marginTop: 6 }}><Dialog.Header><Dialog.Title>标题</Dialog.Title></Dialog.Header><Dialog.Body>
      内容
    </Dialog.Body></Dialog>,
  );
  const dialog = screen.getByRole("dialog");
  expect(dialog.classList.contains("host-dialog")).toBe(true);
  expect(dialog.getAttribute("style")).toContain("margin-top");
});

it("keeps Dialog variant as a deprecated drawer alias", () => {
  render(
    <Dialog open onOpenChange={() => { }} variant="drawer"><Dialog.Header><Dialog.Title>标题</Dialog.Title></Dialog.Header><Dialog.Body>
      内容
    </Dialog.Body></Dialog>,
  );
  expect(
    screen.getByRole("dialog").classList.contains("ui-dialog--drawer"),
  ).toBe(true);
});
