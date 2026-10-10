// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
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
  Field,
  FileDropzone,
  Input,
  NumberInput,
  Progress,
  Radio,
  Select,
  SelectionBar,
  SegmentedControl,
  Slider,
  Switch,
  Tabs,
  Textarea,
  Toast,
} from "./index";

it("keeps optional component copy absent until supplied by the host", () => {
  const view = render(
    <>
      <Progress value={48} />
      <FileDropzone onFiles={() => {}} />
      <SelectionBar count={2} actions={<Button>归档</Button>} />
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
      <Progress label="上传" value={48} valueLabel="48%" />
      <FileDropzone
        label="拖入 SVG 文件"
        buttonLabel="上传文件"
        onFiles={() => {}}
      />
      <SelectionBar
        count={2}
        summary="2 个文件"
        actions={<Button>归档</Button>}
      />
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
    <Field label="数量">
      <NumberInput
        ref={ref}
        defaultValue={1}
        min={0}
        max={1.5}
        step={0.5}
        onValueChange={onValueChange}
      />
    </Field>,
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
      <Field
        id="project"
        label="项目名称"
        required
        hint="方便识别"
        error="名称重复"
      >
        <Input ref={ref} name="project" defaultValue="Test" />
      </Field>
      <Field label="说明">
        <Textarea name="description" defaultValue="Notes" />
      </Field>
      <Field label="格式">
        <Select
          name="format"
          defaultValue="svg"
          options={[
            { value: "svg", label: "SVG" },
            { value: "png", label: "PNG", disabled: true },
          ]}
        />
      </Field>
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
      <Checkbox label="保留原稿" name="original" defaultChecked />
      <Radio label="SVG" name="format" value="svg" defaultChecked />
      <Radio label="PNG" name="format" value="png" />
      <Switch label="网格" name="grid" onChange={changed} />
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
    <Slider
      label="大小"
      min={16}
      max={96}
      defaultValue={48}
      onValueChange={changed}
      formatValue={(value) => `${value}px`}
    />,
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
      <Tabs
        aria-label="代码"
        value={tab}
        onValueChange={setTab}
        items={[
          {
            value: "a",
            label: "React",
            content: <Input aria-label="名称" defaultValue="Icon" />,
          },
          { value: "b", label: "Vue", disabled: true, content: null },
          { value: "c", label: "SVG", content: "SVG content" },
        ]}
      />
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
    <Disclosure title="高级设置">
      <Input aria-label="参数" defaultValue="4" />
    </Disclosure>,
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
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="设置"
        description="说明"
      >
        <Input aria-label="名称" />
      </Dialog>
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
it("blocks dismissal and confirmation while a confirm operation is busy", () => {
  const close = vi.fn();
  const confirm = vi.fn();
  render(
    <ConfirmDialog
      open
      onOpenChange={close}
      title="删除？"
      description="删除文件"
      tone="danger"
      busy
      onConfirm={confirm}
    />,
  );
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
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
    <FileDropzone
      accept=".svg,image/png"
      maxSize={8}
      multiple
      onFiles={files}
      onReject={rejected}
    />,
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
  const view = render(<FileDropzone onFiles={files} onReject={rejected} />);
  const payload = {
    dataTransfer: {
      files: [new File(["a"], "a.svg"), new File(["b"], "b.svg")],
    },
  };
  fireEvent.drop(view.container.querySelector(".ui-dropzone")!, payload);
  expect(rejected).toHaveBeenCalledOnce();
  view.rerender(<FileDropzone disabled onFiles={files} />);
  fireEvent.drop(view.container.querySelector(".ui-dropzone")!, payload);
  expect(files).not.toHaveBeenCalled();
});
it("pauses toast dismissal for focus even after pointer leaves", () => {
  vi.useFakeTimers();
  const change = vi.fn();
  render(
    <Toast open onOpenChange={change} duration={1000}>
      已保存
    </Toast>,
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
it("disables unavailable batch actions and delegates selection to the host", () => {
  const select = vi.fn();
  const clear = vi.fn();
  const done = vi.fn();
  const view = render(
    <SelectionBar
      count={0}
      total={3}
      onSelectAll={select}
      onClear={clear}
      onDone={done}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "全选" }));
  expect(select).toHaveBeenCalledOnce();
  expect(
    (screen.getByRole("button", { name: "清空" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  view.rerender(
    <SelectionBar
      count={2}
      total={3}
      busy
      onSelectAll={select}
      onClear={clear}
      onDone={done}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "完成" }));
  expect(done).not.toHaveBeenCalled();
});

it("does not commit select values when opening, browsing or cancelling", async () => {
  const change = vi.fn();
  render(
    <Field label="格式">
      <Select
        defaultValue="svg"
        onValueChange={change}
        options={[
          { value: "svg", label: "SVG" },
          { value: "png", label: "PNG" },
          { value: "pdf", label: "PDF", disabled: true },
        ]}
      />
    </Field>,
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
      <Select
        ref={ref}
        name="format"
        placeholder="选择格式"
        options={[{ value: "svg", label: "SVG" }]}
      />
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
    <Slider
      variant="filled"
      label="Size"
      ref={ref}
      min={16}
      max={256}
      defaultValue={140}
      onValueChange={change}
      formatValue={(value) => `${value}px`}
    />,
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
    <Slider
      layout="inline"
      label="缩放"
      defaultValue={20}
      onValueChange={change}
    />,
  );
  fireEvent.change(screen.getByRole("slider", { name: "缩放" }), {
    target: { value: "40" },
  });
  expect(change).toHaveBeenLastCalledWith(40);
  expect(screen.getByText("40")).toBeTruthy();
  view.rerender(
    <Slider
      layout="bare"
      label="缩放"
      defaultValue={20}
      onValueChange={change}
    />,
  );
  expect(screen.getByRole("slider", { name: "缩放" })).toBeTruthy();
  expect(screen.queryByText("40")).toBeNull();
});
it("allows host-owned batch actions without adding unrelated actions", () => {
  const change = vi.fn();
  render(
    <SelectionBar count={2} actions={<Button onClick={change}>归档</Button>} />,
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
      <Tabs
        aria-label="内容"
        value="a"
        onValueChange={onTab}
        items={[
          { value: "a", label: "当前内容", content: "A" },
          { value: "b", label: "其他内容", content: "B" },
        ]}
      />
      <SegmentedControl
        aria-label="模式"
        value="a"
        onValueChange={onSegment}
        options={[
          { value: "a", label: "当前模式" },
          { value: "b", label: "其他模式" },
        ]}
      />
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
