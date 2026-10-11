// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef, StrictMode, useState } from "react";
import {
  Button,
  Checkbox,
  ConfirmDialog,
  Dialog,
  Disclosure,
  ExpandableCode,
  Field,
  FileDropzone,
  Icon,
  Input,
  NumberInput,
  Progress,
  Radio,
  SearchField,
  Select,
  SelectionBar,
  SegmentedControl,
  Slider,
  Switch,
  Tabs,
  Textarea,
  Toast,
  ToastRegion,
} from "./index";

it("keeps optional component copy absent until supplied by the host", () => {
  const view = render(
    <>
      <Progress value={48} />
      <FileDropzone onFiles={() => {}}><FileDropzone.Trigger>选择文件</FileDropzone.Trigger><FileDropzone.Error /></FileDropzone>
      <SelectionBar count={2}><SelectionBar.Count /><SelectionBar.Actions>{<Button>归档</Button>}</SelectionBar.Actions></SelectionBar>
    </>,
  );
  expect(
    screen.getByRole("progressbar", { name: "进度" }).getAttribute("value"),
  ).toBe("48");
  expect(screen.queryByText("48%")).toBeNull();
  expect(screen.queryByText(/拖入|已选|处理中/)).toBeNull();
  expect(screen.getByRole("button", { name: "选择文件" })).toBeTruthy();
  view.rerender(
    <>
      <Progress value={48}><Progress.Label>上传</Progress.Label><Progress.Value>48%</Progress.Value></Progress>
      <FileDropzone onFiles={() => {}}><FileDropzone.Description>{"拖入 SVG 文件"}</FileDropzone.Description><FileDropzone.Trigger>{"上传文件"}</FileDropzone.Trigger><FileDropzone.Error /></FileDropzone>
      <SelectionBar count={2}><SelectionBar.Description>{"2 个文件"}</SelectionBar.Description><SelectionBar.Actions>{<Button>归档</Button>}</SelectionBar.Actions></SelectionBar>
    </>,
  );
  expect(screen.getByText("48%")).toBeTruthy();
  expect(screen.getByText("拖入 SVG 文件")).toBeTruthy();
  expect(screen.getByRole("button", { name: "上传文件" })).toBeTruthy();
  expect(screen.getByText("2 个文件")).toBeTruthy();
});

it("NumberInput uses bounded decimal steps and exposes the native input ref", () => {
  const ref = createRef<HTMLInputElement>();
  const onValueChange = vi.fn();
  render(
    <Field><Field.Label>数量</Field.Label><Field.Control>
      <NumberInput ref={ref} defaultValue={1} min={0} max={1.5} step={0.5} onValueChange={onValueChange}/>
    </Field.Control></Field>,
  );
  expect(screen.getByLabelText("数量")).toBe(ref.current);
  fireEvent.click(screen.getByRole("button", { name: "增加" }));
  expect(ref.current?.value).toBe("1.5");
  expect(onValueChange).toHaveBeenLastCalledWith(1.5);
  expect(
    (screen.getByRole("button", { name: "增加" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "减少" }));
  expect(ref.current?.value).toBe("1");
});

it("keeps a rejected step or typed number from replacing the controlled value", () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <NumberInput
      aria-label="数量"
      value={10}
      min={0}
      max={20}
      onValueChange={onValueChange}
    />,
  );
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  fireEvent.click(screen.getByRole("button", { name: "增加" }));
  expect(onValueChange).toHaveBeenLastCalledWith(11);
  expect(input.value).toBe("10");
  fireEvent.change(input, { target: { value: "15" } });
  expect(onValueChange).toHaveBeenLastCalledWith(15);
  expect(input.value).toBe("10");
  fireEvent.change(input, { target: { value: "25" } });
  expect(onValueChange).toHaveBeenLastCalledWith(20);
  expect(input.value).toBe("10");
  rerender(
    <NumberInput
      aria-label="数量"
      value={11}
      min={0}
      max={20}
      onValueChange={onValueChange}
    />,
  );
  expect(input.value).toBe("11");
});

it("NumberInput allows clearing while editing and restores a finite value on blur", () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <NumberInput
      aria-label="数量"
      value={10}
      min={0}
      max={20}
      onValueChange={onValueChange}
    />,
  );
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "" } });
  expect(input.value).toBe("");
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.blur(input);
  expect(input.value).toBe("10");
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "" } });
  rerender(
    <NumberInput
      aria-label="数量"
      value={10}
      min={0}
      max={20}
      onValueChange={onValueChange}
    />,
  );
  expect(input.value).toBe("");
  rerender(
    <NumberInput
      aria-label="数量"
      value={12}
      min={0}
      max={20}
      onValueChange={onValueChange}
    />,
  );
  expect(input.value).toBe("12");
  expect(onValueChange).not.toHaveBeenCalled();
  rerender(
    <NumberInput
      aria-label="数量"
      value={12}
      readOnly
      onValueChange={onValueChange}
    />,
  );
  expect(input.value).toBe("12");
  expect(
    (screen.getByRole("button", { name: "增加" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});

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
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  // jsdom has no dialog top layer. This shim tests lifecycle, not browser focus trapping.
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
  vi.useRealTimers();
});

it("associates labels, descriptions and errors while retaining form attributes and ref", () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <form>
      <Field id="project" required><Field.Label>项目名称</Field.Label><Field.Control>
        <Input ref={ref} name="project" defaultValue="Test"/>
      </Field.Control><Field.Description>方便识别</Field.Description><Field.Error>名称重复</Field.Error></Field>
      <Field><Field.Label>说明</Field.Label><Field.Control>
        <Textarea name="description" defaultValue="Notes"/>
      </Field.Control></Field>
      <Field><Field.Label>格式</Field.Label><Field.Control>
        <Select name="format" defaultValue="svg">{[
    { value: "svg", label: "SVG" },
    { value: "png", label: "PNG", disabled: true },
].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
      </Field.Control></Field>
    </form>,
  );
  const input = screen.getByLabelText(/项目名称/) as HTMLInputElement;
  expect(ref.current).toBe(input);
  expect(input.required).toBe(true);
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(input.getAttribute("aria-describedby")).toBe(
    "project-hint project-error",
  );
  expect(new FormData(input.form!).get("project")).toBe("Test");
  expect(new FormData(input.form!).get("format")).toBe("svg");
  expect(
    (
      screen.getByRole("option", {
        name: "PNG",
        hidden: true,
      }) as HTMLOptionElement
    ).disabled,
  ).toBe(true);
  expect((screen.getByLabelText("说明") as HTMLTextAreaElement).value).toBe(
    "Notes",
  );
});
it("retains native button events, ref and submit semantics as text width changes", () => {
  const ref = createRef<HTMLButtonElement>();
  const clicked = vi.fn();
  const drag = vi.fn();
  const view = render(
    <Button ref={ref} type="submit" onClick={clicked} onDrag={drag}>
      生成
    </Button>,
  );
  view.rerender(
    <Button ref={ref} type="submit" onClick={clicked} onDrag={drag}>
      正在生成字体资源包…
    </Button>,
  );
  fireEvent.click(ref.current!);
  fireEvent.drag(ref.current!);
  expect(clicked).toHaveBeenCalledOnce();
  expect(drag).toHaveBeenCalledOnce();
  expect(ref.current?.type).toBe("submit");
  expect(ref.current?.textContent).toContain("字体资源包");
});
it("uses native checked states and names for choices and switch", () => {
  const changed = vi.fn();
  render(
    <form>
      <Checkbox name="original" defaultChecked>保留原稿</Checkbox>
      <Radio name="format" value="svg" defaultChecked>SVG</Radio>
      <Radio name="format" value="png">PNG</Radio>
      <Switch name="grid" onChange={changed}>网格</Switch>
    </form>,
  );
  const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
  expect(checkbox.checked).toBe(true);
  fireEvent.click(checkbox);
  expect(checkbox.checked).toBe(false);
  fireEvent.click(screen.getByRole("radio", { name: "PNG" }));
  expect(
    (screen.getByRole("radio", { name: "SVG" }) as HTMLInputElement).checked,
  ).toBe(false);
  const toggle = screen.getByRole("switch") as HTMLInputElement;
  fireEvent.click(toggle);
  expect(toggle.checked).toBe(true);
  expect(changed).toHaveBeenCalledOnce();
  expect(new FormData(toggle.form!).get("format")).toBe("png");
});
it("emits numeric range values and synchronizes output", () => {
  const changed = vi.fn();
  render(
    <Slider min={16} max={96} defaultValue={48} onValueChange={changed} formatValue={(value) => `${value}px`}>
      <Slider.Label>大小</Slider.Label>
      <Slider.Value />
    </Slider>,
  );
  fireEvent.change(screen.getByRole("slider"), { target: { value: "64" } });
  expect(changed).toHaveBeenCalledWith(64);
  expect(screen.getByText("64px")).toBeTruthy();
  expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe(
    "64px",
  );
});
it("moves tabs past disabled items and retains hidden panel state", () => {
  function Example() {
    const [tab, setTab] = useState("a");
    return (
      <Tabs aria-label="代码" value={tab} onValueChange={setTab}>
        <Tabs.List>
          <Tabs.Trigger value="a">React</Tabs.Trigger>
          <Tabs.Trigger value="b" disabled>
            Vue
          </Tabs.Trigger>
          <Tabs.Trigger value="c">SVG</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">
          <Input aria-label="名称" defaultValue="Icon" />
        </Tabs.Content>
        <Tabs.Content value="c">SVG content</Tabs.Content>
      </Tabs>
    );
  }
  render(<Example />);
  fireEvent.change(screen.getByLabelText("名称"), {
    target: { value: "SearchIcon" },
  });
  fireEvent.keyDown(screen.getByRole("tab", { name: "React" }), {
    key: "ArrowRight",
  });
  expect(document.activeElement).toBe(screen.getByRole("tab", { name: "SVG" }));
  expect(screen.getByRole("tabpanel").textContent).toBe("SVG content");
  fireEvent.keyDown(document.activeElement!, { key: "Home" });
  expect((screen.getByLabelText("名称") as HTMLInputElement).value).toBe(
    "SearchIcon",
  );
});
it("makes a collapsed disclosure inert and preserves its input on reopening", () => {
  render(
    <Disclosure><Disclosure.Trigger>高级设置</Disclosure.Trigger><Disclosure.Body>
      <Input aria-label="参数" defaultValue="4"/>
    </Disclosure.Body></Disclosure>,
  );
  const trigger = screen.getByRole("button", { name: "高级设置" });
  const content = document.getElementById(
    trigger.getAttribute("aria-controls")!,
  )!;
  expect(content.hasAttribute("inert")).toBe(true);
  fireEvent.click(trigger);
  expect(content.hasAttribute("inert")).toBe(false);
  fireEvent.change(screen.getByLabelText("参数"), { target: { value: "8" } });
  fireEvent.click(trigger);
  expect(content.getAttribute("aria-hidden")).toBe("true");
  fireEvent.click(trigger);
  expect((screen.getByLabelText("参数") as HTMLInputElement).value).toBe("8");
});
it("opens and closes a controlled native dialog under StrictMode", async () => {
  function Example() {
    const [open, setOpen] = useState(true);
    return (
      <Dialog open={open} onOpenChange={setOpen}><Dialog.Header><Dialog.Title>设置</Dialog.Title><Dialog.Description>说明</Dialog.Description></Dialog.Header><Dialog.Body>
        <Input aria-label="名称"/>
      </Dialog.Body></Dialog>
    );
  }
  render(
    <StrictMode>
      <Example />
    </StrictMode>,
  );
  const dialog = screen.getByRole("dialog");
  expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  await waitFor(() => expect((dialog as HTMLDialogElement).open).toBe(false));
});
it("does not close a dialog after the host cancels the event", () => {
  const close = vi.fn();
  const view = render(
    <Dialog open onOpenChange={close} onCancel={(event) => event.preventDefault()}><Dialog.Header><Dialog.Title>设置</Dialog.Title></Dialog.Header><Dialog.Body>
      内容
    </Dialog.Body></Dialog>,
  );
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  expect(close).not.toHaveBeenCalled();
  view.rerender(
    <Dialog open onOpenChange={close} onClick={(event) => event.preventDefault()}><Dialog.Header><Dialog.Title>设置</Dialog.Title></Dialog.Header><Dialog.Body>
      内容
    </Dialog.Body></Dialog>,
  );
  fireEvent.click(screen.getByRole("dialog"));
  expect(close).not.toHaveBeenCalled();
});
it("forwards Field host props and replaces built-in action labels", () => {
  const ref = createRef<HTMLDivElement>();
  const scrollHeight = vi
    .spyOn(HTMLElement.prototype, "scrollHeight", "get")
    .mockReturnValue(600);
  const view = render(
    <Field ref={ref} className="host-field" style={{ marginTop: 3 }} data-row="1"><Field.Label>名称</Field.Label><Field.Control>
      <Input />
    </Field.Control></Field>,
  );
  expect(ref.current?.classList.contains("ui-field")).toBe(true);
  expect(ref.current?.classList.contains("host-field")).toBe(true);
  expect(ref.current?.getAttribute("style")).toContain("margin-top");
  expect(ref.current?.getAttribute("data-row")).toBe("1");
  view.rerender(
    <ExpandableCode ><ExpandableCode.Body>{"line"}</ExpandableCode.Body><ExpandableCode.CopyAction>复制</ExpandableCode.CopyAction><ExpandableCode.ExpandAction>{"展开"}</ExpandableCode.ExpandAction><ExpandableCode.CollapseAction>{"收起"}</ExpandableCode.CollapseAction></ExpandableCode>,
  );
  fireEvent.click(screen.getByRole("button", { name: /展开/ }));
  expect(screen.getByRole("button", { name: /收起/ })).toBeTruthy();
  view.rerender(
    <Toast open onOpenChange={() => { }} closeLabel="关掉"><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
      已保存
    </Toast.Body></Toast>,
  );
  expect(screen.getByRole("button", { name: "关掉" })).toBeTruthy();
  view.rerender(
    <ConfirmDialog open onOpenChange={() => {}} busy onConfirm={() => {}}><ConfirmDialog.Header><ConfirmDialog.Title>{"删除？"}</ConfirmDialog.Title></ConfirmDialog.Header><ConfirmDialog.Body><span role="status">{"正在删除"}</span></ConfirmDialog.Body><ConfirmDialog.Footer><ConfirmDialog.CancelAction>取消</ConfirmDialog.CancelAction><ConfirmDialog.ConfirmAction>确认</ConfirmDialog.ConfirmAction></ConfirmDialog.Footer></ConfirmDialog>,
  );
  expect(screen.getByRole("button", { name: "请稍候" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("正在删除");
  scrollHeight.mockRestore();
});
it("blocks dismissal and confirmation while a confirm operation is busy", () => {
  const close = vi.fn();
  const confirm = vi.fn();
  render(
    <ConfirmDialog open onOpenChange={close} tone="danger" busy onConfirm={confirm}><ConfirmDialog.Header><ConfirmDialog.Title>{"删除？"}</ConfirmDialog.Title><ConfirmDialog.Description>{"删除文件"}</ConfirmDialog.Description></ConfirmDialog.Header><ConfirmDialog.Footer><ConfirmDialog.CancelAction>取消</ConfirmDialog.CancelAction><ConfirmDialog.ConfirmAction>确认</ConfirmDialog.ConfirmAction></ConfirmDialog.Footer></ConfirmDialog>,
  );
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  expect(screen.getByRole("status").textContent).toBe("操作处理中");
  fireEvent.click(screen.getByRole("button", { name: "处理中…" }));
  expect(close).not.toHaveBeenCalled();
  expect(confirm).not.toHaveBeenCalled();
  expect(
    (screen.getByRole("button", { name: "取消" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
it("rejects invalid files and accepts repeated valid file selections", () => {
  const files = vi.fn();
  const rejected = vi.fn();
  const { container } = render(
    <FileDropzone accept=".svg,image/png" maxSize={8} multiple onFiles={files} onReject={rejected}><FileDropzone.Trigger>选择文件</FileDropzone.Trigger><FileDropzone.Error /></FileDropzone>,
  );
  const input = container.querySelector("input")!;
  fireEvent.change(input, {
    target: { files: [new File(["bad"], "bad.txt", { type: "text/plain" })] },
  });
  expect(rejected).toHaveBeenCalledOnce();
  expect(files).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toContain("bad.txt");
  const valid = new File(["<svg/>"], "icon.svg", { type: "image/svg+xml" });
  fireEvent.change(input, { target: { files: [valid] } });
  fireEvent.change(input, { target: { files: [valid] } });
  expect(files).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole("alert")).toBeNull();
  fireEvent.change(input, {
    target: {
      files: [new File(["123456789"], "large.png", { type: "image/png" })],
    },
  });
  expect(rejected).toHaveBeenCalledTimes(2);
});
it("rejects multiple dropped files in single mode and ignores disabled drops", () => {
  const files = vi.fn();
  const rejected = vi.fn();
  const view = render(<FileDropzone onFiles={files} onReject={rejected}><FileDropzone.Trigger>选择文件</FileDropzone.Trigger><FileDropzone.Error /></FileDropzone>);
  const payload = {
    dataTransfer: {
      files: [new File(["a"], "a.svg"), new File(["b"], "b.svg")],
    },
  };
  fireEvent.drop(view.container.querySelector(".ui-dropzone")!, payload);
  expect(rejected).toHaveBeenCalledOnce();
  view.rerender(<FileDropzone disabled onFiles={files}><FileDropzone.Trigger>选择文件</FileDropzone.Trigger><FileDropzone.Error /></FileDropzone>);
  fireEvent.drop(view.container.querySelector(".ui-dropzone")!, payload);
  expect(files).not.toHaveBeenCalled();
});
it("pauses toast dismissal for focus even after pointer leaves", () => {
  vi.useFakeTimers();
  const change = vi.fn();
  render(
    <Toast open onOpenChange={change} duration={1000}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
      已保存
    </Toast.Body></Toast>,
  );
  const toast = screen.getByRole("status");
  fireEvent.pointerEnter(toast);
  fireEvent.focus(screen.getByRole("button"));
  fireEvent.pointerLeave(toast);
  vi.advanceTimersByTime(1500);
  expect(change).not.toHaveBeenCalled();
  fireEvent.blur(screen.getByRole("button"), { relatedTarget: null });
  vi.advanceTimersByTime(1000);
  expect(change).toHaveBeenCalledWith(false);
});
it("keeps a toast deadline through new callbacks and content and calls the latest host", () => {
  vi.useFakeTimers();
  const first = vi.fn();
  const latest = vi.fn();
  const view = render(
    <Toast open duration={1000} onOpenChange={first}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
      <span>提示</span>
    </Toast.Body></Toast>,
  );
  act(() => vi.advanceTimersByTime(600));
  view.rerender(
    <Toast open duration={1000} onOpenChange={latest}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
      <span>更新文字</span>
    </Toast.Body></Toast>,
  );
  act(() => vi.advanceTimersByTime(399));
  expect(latest).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(latest).toHaveBeenCalledWith(false);
  expect(first).not.toHaveBeenCalled();
});
it("names the actual progress element and associates its description", () => {
  const view = render(
    <Progress aria-label="上传进度" aria-describedby="details" value={20} />,
  );
  expect(
    screen
      .getByRole("progressbar", { name: "上传进度" })
      .getAttribute("aria-describedby"),
  ).toBe("details");
  view.rerender(
    <>
      <span id="upload-title">文件上传</span>
      <Progress aria-labelledby="upload-title" value={20} />
    </>,
  );
  expect(screen.getByRole("progressbar", { name: "文件上传" })).toBeTruthy();
});
it("provides a focusable notification region with independently dismissible messages", () => {
  const first = vi.fn();
  const second = vi.fn();
  render(
    <ToastRegion>
      <Toast open duration={0} onOpenChange={first}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
        第一条
      </Toast.Body></Toast>
      <Toast open duration={0} onOpenChange={second}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
        第二条
      </Toast.Body></Toast>
    </ToastRegion>,
  );
  const region = screen.getByRole("region", { name: "通知" });
  expect(region.tabIndex).toBe(0);
  expect(region.classList.contains("ui-scroll-area")).toBe(true);
  fireEvent.click(screen.getAllByRole("button", { name: "关闭提示" })[1]);
  expect(second).toHaveBeenCalledWith(false);
  expect(first).not.toHaveBeenCalled();
});
it("scrolls the toast region only when laid-out content exceeds its max height", () => {
  const original = window.getComputedStyle.bind(window);
  const maxHeight = { value: "200px" };
  const style = vi.spyOn(window, "getComputedStyle").mockImplementation((node) => {
    const computed = original(node);
    if (
      !(node instanceof HTMLElement) ||
      !node.classList.contains("ui-toast-region")
    ) {
      return computed;
    }
    return new Proxy(computed, {
      get(target, prop, receiver) {
        if (prop === "maxHeight") return maxHeight.value;
        if (prop === "paddingBottom") return "4px";
        const value = Reflect.get(target, prop, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  });
  const offsetTop = vi
    .spyOn(HTMLElement.prototype, "offsetTop", "get")
    .mockImplementation(function (this: HTMLElement) {
      return this.classList.contains("ui-toast") ? 4 : 0;
    });
  const offsetHeight = vi
    .spyOn(HTMLElement.prototype, "offsetHeight", "get")
    .mockImplementation(function (this: HTMLElement) {
      return this.classList.contains("ui-toast") ? 40 : 0;
    });
  const region = () => screen.getByRole("region", { name: "通知" });
  try {
    const view = render(
      <ToastRegion>
        <Toast open duration={0} onOpenChange={() => { }}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
          短提示
        </Toast.Body></Toast>
      </ToastRegion>,
    );
    expect(region().classList.contains("ui-toast-region--scroll")).toBe(false);
    view.unmount();
    offsetHeight.mockImplementation(function (this: HTMLElement) {
      return this.classList.contains("ui-toast") ? 240 : 0;
    });
    maxHeight.value = "120px";
    render(
      <ToastRegion>
        <Toast open duration={0} onOpenChange={() => { }}><Toast.Icon><Icon name="menu" size={16}/></Toast.Icon><Toast.Body>
          长提示
        </Toast.Body></Toast>
      </ToastRegion>,
    );
    expect(region().classList.contains("ui-toast-region--scroll")).toBe(true);
  } finally {
    style.mockRestore();
    offsetTop.mockRestore();
    offsetHeight.mockRestore();
  }
});
it("disables unavailable batch actions and delegates selection to the host", () => {
  const select = vi.fn();
  const clear = vi.fn();
  const done = vi.fn();
  const view = render(
    <SelectionBar count={0} total={3}><SelectionBar.Count /><SelectionBar.Actions><SelectionBar.SelectAllAction onClick={select}>全选</SelectionBar.SelectAllAction><SelectionBar.ClearAction onClick={clear}>清空</SelectionBar.ClearAction><SelectionBar.DoneAction onClick={done}>完成</SelectionBar.DoneAction></SelectionBar.Actions></SelectionBar>,
  );
  fireEvent.click(screen.getByRole("button", { name: "全选" }));
  expect(select).toHaveBeenCalledOnce();
  expect(
    (screen.getByRole("button", { name: "清空" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  view.rerender(
    <SelectionBar count={2} total={3} busy><SelectionBar.Count /><SelectionBar.Actions><SelectionBar.SelectAllAction onClick={select}>全选</SelectionBar.SelectAllAction><SelectionBar.ClearAction onClick={clear}>清空</SelectionBar.ClearAction><SelectionBar.DoneAction onClick={done}>完成</SelectionBar.DoneAction></SelectionBar.Actions></SelectionBar>,
  );
  fireEvent.click(screen.getByRole("button", { name: "完成" }));
  expect(done).not.toHaveBeenCalled();
});

it("does not commit select values when opening, browsing or cancelling", async () => {
  const change = vi.fn();
  render(
    <Field><Field.Label>格式</Field.Label><Field.Control>
      <Select defaultValue="svg" onValueChange={change}>{[
    { value: "svg", label: "SVG" },
    { value: "png", label: "PNG" },
    { value: "pdf", label: "PDF", disabled: true },
].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
    </Field.Control></Field>,
  );
  const trigger = screen.getByRole("combobox");
  fireEvent.keyDown(trigger, { key: "Enter" });
  const png = await screen.findByRole("option", { name: "PNG" });
  expect(change).not.toHaveBeenCalled();
  png.focus();
  fireEvent.keyDown(png, { key: "Escape" });
  expect(change).not.toHaveBeenCalled();
  expect(trigger.textContent).toContain("SVG");
  fireEvent.keyDown(trigger, { key: "Enter" });
  const option = await screen.findByRole("option", { name: "PNG" });
  fireEvent.keyDown(option, { key: "Enter" });
  expect(change).toHaveBeenCalledWith("png");
});
it("keeps select empty until confirmation and forwards its trigger ref", () => {
  const ref = createRef<HTMLButtonElement>();
  const { container } = render(
    <form>
      <Select ref={ref} name="format" placeholder="选择格式">{[{ value: "svg", label: "SVG" }].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
    </form>,
  );
  expect(ref.current).toBe(screen.getByRole("combobox"));
  expect(ref.current?.textContent).toContain("选择格式");
  expect(new FormData(container.querySelector("form")!).get("format")).toBe("");
});
it("uses the same native range contract for the filled slider", () => {
  const change = vi.fn();
  const ref = createRef<HTMLInputElement>();
  render(
    <Slider variant="filled" ref={ref} min={16} max={256} defaultValue={140} onValueChange={change} formatValue={(value) => `${value}px`}>
      <Slider.Label>Size</Slider.Label>
      <Slider.Value />
    </Slider>,
  );
  expect(ref.current?.value).toBe("140");
  fireEvent.change(screen.getByRole("slider", { name: "Size" }), {
    target: { value: "180" },
  });
  expect(change).toHaveBeenCalledWith(180);
  expect(screen.getByText("180px")).toBeTruthy();
});

it("toggles the textarea resize affordance and retains its native ref", () => {
  const ref = createRef<HTMLTextAreaElement>();
  const { rerender } = render(<Textarea ref={ref} aria-label="备注" />);
  expect(ref.current?.getAttribute("data-resizable")).toBe("true");
  rerender(<Textarea ref={ref} aria-label="备注" resizable={false} />);
  expect(ref.current?.getAttribute("data-resizable")).toBe("false");
  rerender(<Textarea ref={ref} aria-label="备注" disabled resizable />);
  expect(ref.current?.getAttribute("data-resizable")).toBe("false");
  expect(ref.current?.hasAttribute("resizable")).toBe(false);
});

it("preserves native slider values and names in inline and bare layouts", () => {
  const change = vi.fn();
  const view = render(
    <Slider layout="inline" defaultValue={20} onValueChange={change}>
      <Slider.Label>缩放</Slider.Label>
      <Slider.Value />
    </Slider>,
  );
  fireEvent.change(screen.getByRole("slider", { name: "缩放" }), {
    target: { value: "40" },
  });
  expect(change).toHaveBeenLastCalledWith(40);
  expect(screen.getByText("40")).toBeTruthy();
  view.rerender(
    <Slider layout="bare" defaultValue={20} onValueChange={change}><Slider.Label>缩放</Slider.Label></Slider>,
  );
  expect(screen.getByRole("slider", { name: "缩放" })).toBeTruthy();
  expect(screen.queryByText("40")).toBeNull();
});
it("allows host-owned batch actions without adding unrelated actions", () => {
  const change = vi.fn();
  render(
    <SelectionBar count={2}><SelectionBar.Count /><SelectionBar.Actions>{<Button onClick={change}>归档</Button>}</SelectionBar.Actions></SelectionBar>,
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByText(/已选/)).toBeNull();
  expect(screen.getAllByRole("button")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "归档" }));
  expect(change).toHaveBeenCalledOnce();
});
it("supports an accessible checkbox without a visible label", () => {
  const change = vi.fn();
  render(<Checkbox aria-label="选择项目" onChange={change} />);
  fireEvent.click(screen.getByRole("checkbox", { name: "选择项目" }));
  expect(change).toHaveBeenCalledOnce();
});

it("does not repeat selection callbacks when the current selector item is clicked", () => {
  const onTab = vi.fn();
  const onSegment = vi.fn();
  render(
    <>
      <Tabs aria-label="内容" value="a" onValueChange={onTab}>
        <Tabs.List>
          <Tabs.Trigger value="a">当前内容</Tabs.Trigger>
          <Tabs.Trigger value="b">其他内容</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">A</Tabs.Content>
        <Tabs.Content value="b">B</Tabs.Content>
      </Tabs>
      <SegmentedControl aria-label="模式" value="a" onValueChange={onSegment}>{[
    { value: "a", label: "当前模式" },
    { value: "b", label: "其他模式" },
].map(item => <SegmentedControl.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}><SegmentedControl.Label>{item.label}</SegmentedControl.Label>{(item as { count?: number | string }).count != null ? <SegmentedControl.Count>{(item as { count?: number | string }).count}</SegmentedControl.Count> : null}</SegmentedControl.Item>)}</SegmentedControl>
    </>,
  );
  fireEvent.click(screen.getByRole("tab", { name: "当前内容" }));
  fireEvent.click(screen.getByRole("radio", { name: "当前模式" }));
  expect(onTab).not.toHaveBeenCalled();
  expect(onSegment).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("tab", { name: "其他内容" }));
  fireEvent.click(screen.getByRole("radio", { name: "其他模式" }));
  expect(onTab).toHaveBeenCalledWith("b");
  expect(onSegment).toHaveBeenCalledWith("b");
});

it("uses one search shortcut and skips a disabled field", () => {
  render(
    <>
      <SearchField aria-label="第一处" shortcut disabled />
      <SearchField aria-label="第二处" shortcut />
    </>,
  );
  fireEvent.keyDown(window, { key: "/" });
  expect(document.activeElement).toBe(
    screen.getByRole("searchbox", { name: "第二处" }),
  );
});

it("lets tabs present host content when items have no panels", () => {
  const change = vi.fn();
  render(
    <Tabs aria-label="视图" defaultValue="a" onValueChange={change}>
      <Tabs.List>
        <Tabs.Trigger value="a">甲</Tabs.Trigger>
        <Tabs.Trigger value="b">乙</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">外部内容</Tabs.Content>
    </Tabs>,
  );
  expect(screen.getByRole("tabpanel").textContent).toContain("外部内容");
  expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
  fireEvent.click(screen.getByRole("tab", { name: "乙" }));
  expect(change).toHaveBeenCalledWith("b");
});

it("shows a host-provided file error instead of the generated rejection", () => {
  const rejected = vi.fn();
  const view = render(
    <FileDropzone accept=".svg" onFiles={() => {}} onReject={rejected}><FileDropzone.Trigger>选择文件</FileDropzone.Trigger><FileDropzone.Error>{"请改用 SVG。"}</FileDropzone.Error></FileDropzone>,
  );
  fireEvent.change(view.container.querySelector("input")!, {
    target: { files: [new File(["bad"], "bad.txt", { type: "text/plain" })] },
  });
  expect(rejected).toHaveBeenCalledOnce();
  expect(screen.getByRole("alert").textContent).toContain("请改用 SVG。");
});

it("uses replaceable batch action labels", () => {
  render(
    <SelectionBar count={1} total={2}><SelectionBar.Count /><SelectionBar.Actions><SelectionBar.SelectAllAction onClick={() => {}}>{"全部"}</SelectionBar.SelectAllAction><SelectionBar.ClearAction onClick={() => {}}>{"清除"}</SelectionBar.ClearAction><SelectionBar.DoneAction onClick={() => {}}>{"结束"}</SelectionBar.DoneAction></SelectionBar.Actions></SelectionBar>,
  );
  expect(screen.getByRole("button", { name: "全部" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "清除" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "结束" })).toBeTruthy();
});

it("places choice styles on the label", () => {
  render(<Checkbox style={{ marginTop: 4 }}>项目</Checkbox>);
  expect(screen.getByText("项目").closest("label")?.style.marginTop).toBe(
    "4px",
  );
  expect(
    (screen.getByRole("checkbox") as HTMLInputElement).style.marginTop,
  ).toBe("");
});
