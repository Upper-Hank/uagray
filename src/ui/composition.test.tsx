// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { Icon } from "./icons";
import { Alert, Progress } from "./feedback";
import { Field, Input, Select } from "./fields";
import { Button, ButtonGroup, CopyButton, ShowcaseCard } from "./components";
import { FileDropzone } from "./file-dropzone";
import { ConfirmDialog, Dialog } from "./panels";

beforeEach(() => {
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function warnings() {
  return vi
    .mocked(console.error)
    .mock.calls.map((call) => String(call[0]))
    .filter((message) => message.startsWith("[uagray]"));
}

function ProjectLabel({ children }: { children: string }) {
  return <Field.Label>{children}</Field.Label>;
}

it("associates custom description and error ids and drops them after unmount", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function Example({ error }: { error: boolean }) {
    return (
      <Field>
        <ProjectLabel>名称</ProjectLabel>
        <Field.Control>
          <Input />
        </Field.Control>
        <Field.Description id="custom-hint">说明</Field.Description>
        {error ? <Field.Error id="custom-error">错误</Field.Error> : null}
      </Field>
    );
  }
  const view = render(<Example error />);
  const input = screen.getByRole("textbox");
  expect(document.getElementById("custom-hint")?.tagName).toBe("P");
  expect(document.getElementById("custom-error")?.id).toBe("custom-error");
  expect(input.getAttribute("aria-describedby")).toContain("custom-hint");
  expect(input.getAttribute("aria-describedby")).toContain("custom-error");
  expect(warnings()).toEqual([]);
  view.rerender(<Example error={false} />);
  expect(document.getElementById("custom-error")).toBeNull();
  expect(input.getAttribute("aria-describedby")).toBe("custom-hint");
});

it("keeps dialog and progress label ids aligned and clears them on unmount", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function Example({ open }: { open: boolean }) {
    return (
      <>
        <Dialog open onOpenChange={() => {}} aria-label="备用">
          {open ? (
            <Dialog.Header>
              <Dialog.Title id="custom-title">标题</Dialog.Title>
              <Dialog.Description id="custom-description">
                说明
              </Dialog.Description>
            </Dialog.Header>
          ) : null}
        </Dialog>
        <Progress value={20}>
          {open ? (
            <Progress.Label id="custom-progress">上传</Progress.Label>
          ) : null}
        </Progress>
      </>
    );
  }
  const view = render(<Example open />);
  const dialog = screen.getByRole("dialog");
  expect(document.getElementById("custom-title")?.id).toBe("custom-title");
  expect(dialog.getAttribute("aria-labelledby")).toBe("custom-title");
  expect(dialog.getAttribute("aria-describedby")).toContain(
    "custom-description",
  );
  expect(screen.getByRole("progressbar").getAttribute("aria-labelledby")).toBe(
    "custom-progress",
  );
  expect(warnings()).toEqual([]);
  view.rerender(<Example open={false} />);
  expect(dialog.getAttribute("aria-labelledby")).toBeNull();
  expect(dialog.getAttribute("aria-describedby")).toBeNull();
  expect(screen.getByRole("progressbar").hasAttribute("aria-labelledby")).toBe(
    false,
  );
  expect(warnings()).toEqual(["[uagray] Dialog 至少需要一个有内容的区域"]);
});

it("accepts mapped items and business wrappers, and reports determinate illegal combinations", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const options = [
    { value: "a", label: "甲" },
    { value: "b", label: "乙" },
  ];
  const { rerender } = render(
    <Select aria-label="格式" value="a" onValueChange={() => {}}>
      {options.map((item) => (
        <Select.Item key={item.value} value={item.value}>
          {item.label}
        </Select.Item>
      ))}
    </Select>,
  );
  expect(warnings()).toEqual([]);
  rerender(
    <Select aria-label="格式" value="a" onValueChange={() => {}}>
      <Select.Item value="a">甲</Select.Item>
      <Select.Item value="a">乙</Select.Item>
    </Select>,
  );
  expect(warnings().some((message) => message.includes("重复"))).toBe(true);
  vi.mocked(console.error).mockClear();
  rerender(
    <Alert tone="danger">
      <Alert.Icon>
        <Icon name="close" size={16} />
      </Alert.Icon>
    </Alert>,
  );
  expect(warnings().some((message) => message.includes("Title 或 Body"))).toBe(
    true,
  );
  vi.mocked(console.error).mockClear();
  rerender(
    <Dialog open onOpenChange={() => {}}>
      <Dialog.Title>标题</Dialog.Title>
    </Dialog>,
  );
  expect(warnings().some((message) => message.includes("header"))).toBe(true);
  vi.mocked(console.error).mockClear();
  rerender(
    <Field>
      <Field.Label>一</Field.Label>
      <Field.Label>二</Field.Label>
      <Field.Control>
        <Input />
      </Field.Control>
    </Field>,
  );
  expect(warnings().some((message) => message.includes("label 重复"))).toBe(
    true,
  );
});

it("does not warn for a legal single field after a conditional item unmounts", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function Example() {
    const [extra, setExtra] = useState(true);
    return (
      <Field>
        <Field.Label>名称</Field.Label>
        <Field.Control>
          <Input />
        </Field.Control>
        {extra ? <Field.Description>说明</Field.Description> : null}
        <button type="button" onClick={() => setExtra(false)}>
          移除说明
        </button>
      </Field>
    );
  }
  render(<Example />);
  fireEvent.click(screen.getByRole("button", { name: "移除说明" }));
  expect(warnings()).toEqual([]);
});

it("validates button roles through wrappers and keeps zero as visible content", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function Caption() {
    return <Button.Label>消息</Button.Label>;
  }
  const view = render(
    <Button>
      <Caption />
      <Button.Count>0</Button.Count>
    </Button>,
  );
  expect(screen.getByRole("button", { name: "消息 0" })).toBeTruthy();
  expect(warnings()).toEqual([]);
  view.rerender(
    <Button aria-label="消息">
      <Button.Icon>
        <Icon name="info" />
      </Button.Icon>
      <Button.Count>0</Button.Count>
      <Button.Count>1</Button.Count>
    </Button>,
  );
  expect(warnings()).toContain("[uagray] Button 的 count 重复");
  expect(warnings()).toContain("[uagray] Button.Count 需要 Label");
});

it("does not let an unrelated nested component register against an outer root", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <Field>
      <Field.Label>名称</Field.Label>
      <Field.Control>
        <Input aria-label="名称" />
      </Field.Control>
      <Dialog open onOpenChange={() => {}} aria-label="详情">
        <Dialog.Body>
          <Field.Label>归属错误</Field.Label>
        </Dialog.Body>
      </Dialog>
    </Field>,
  );
  expect(warnings()).toContain("[uagray] Field.label 用在了Dialog");
});

it("keeps explicit icon sizes within a changing group height", () => {
  let height = 24;
  const callbacks: (() => void)[] = [];
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => ({
      width: 160,
      height,
      top: 0,
      left: 0,
      right: 160,
      bottom: height,
      x: 0,
      y: 0,
      toJSON() {},
    }),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
  const view = render(
    <ButtonGroup
      aria-label="操作"
      style={{ height: 24, paddingTop: 4, paddingBottom: 4 }}
    >
      <Button aria-label="添加">
        <Button.Icon>
          <Icon name="plus" size={40} />
        </Button.Icon>
      </Button>
    </ButtonGroup>,
  );
  expect(view.container.querySelector("svg")?.getAttribute("height")).toBe("8");
  expect(
    view.container.querySelector(".ui-button-group")?.getAttribute("style"),
  ).toContain("--ui-group-child-height: 16px");
  act(() => {
    height = 40;
    callbacks.forEach((callback) => callback());
  });
  expect(view.container.querySelector("svg")?.getAttribute("height")).toBe(
    "15",
  );
});

it("keeps copied feedback out of the action name and prevents repeated pending copies", async () => {
  let finish = () => {};
  const write = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: write },
  });
  function Feedback() {
    return <CopyButton.Feedback state="success">复制成功</CopyButton.Feedback>;
  }
  render(
    <CopyButton text="原始内容">
      <CopyButton.Label>复制</CopyButton.Label>
      <Feedback />
    </CopyButton>,
  );
  const button = screen.getByRole("button", { name: "复制" });
  button.focus();
  fireEvent.click(button);
  fireEvent.click(button);
  expect(write).toHaveBeenCalledTimes(1);
  expect(write).toHaveBeenCalledWith("原始内容");
  expect(document.activeElement).toBe(button);
  await act(async () => finish());
  expect(screen.getByRole("status").textContent).toBe("复制成功");
  expect(screen.getByRole("button", { name: "复制" })).toBe(button);
});

it("does not recreate removed confirm actions or duplicate their behavior", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const close = vi.fn(),
    confirm = vi.fn();
  const view = render(
    <ConfirmDialog open onOpenChange={close} onConfirm={confirm}>
      <ConfirmDialog.Header>
        <ConfirmDialog.Title>删除项目</ConfirmDialog.Title>
      </ConfirmDialog.Header>
      <ConfirmDialog.Footer>
        <ConfirmDialog.ConfirmAction
          onClick={(event) => event.preventDefault()}
        >
          删除
        </ConfirmDialog.ConfirmAction>
      </ConfirmDialog.Footer>
    </ConfirmDialog>,
  );
  fireEvent.click(screen.getByRole("button", { name: "删除" }));
  expect(confirm).not.toHaveBeenCalled();
  view.rerender(
    <ConfirmDialog open onOpenChange={close} onConfirm={confirm}>
      <ConfirmDialog.Header>
        <ConfirmDialog.Title>删除项目</ConfirmDialog.Title>
      </ConfirmDialog.Header>
    </ConfirmDialog>,
  );
  expect(screen.queryByRole("button", { name: "删除" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "关闭" }));
  expect(close).toHaveBeenCalledExactlyOnceWith(false);
  expect(confirm).not.toHaveBeenCalled();
  expect(warnings()).toEqual([]);
});

it("associates file errors and honors an explicitly hidden or absent error slot", () => {
  const reject = vi.fn();
  function Example({ feedback }: { feedback: "auto" | "hidden" | "absent" }) {
    return (
      <FileDropzone accept="image/png" onFiles={() => {}} onReject={reject}>
        <FileDropzone.Icon>
          <Icon name="plus" />
        </FileDropzone.Icon>
        <FileDropzone.Description id="file-hint">
          上传 PNG
        </FileDropzone.Description>
        <FileDropzone.Trigger>选择图片</FileDropzone.Trigger>
        {feedback === "auto" ? (
          <FileDropzone.Error id="file-error" />
        ) : feedback === "hidden" ? (
          <FileDropzone.Error>{null}</FileDropzone.Error>
        ) : null}
      </FileDropzone>
    );
  }
  const view = render(<Example feedback="auto" />);
  const input = view.container.querySelector("input")!;
  fireEvent.change(input, {
    target: {
      files: [new File(["bad"], "bad.svg", { type: "image/svg+xml" })],
    },
  });
  const alert = screen.getByRole("alert");
  expect(alert.id).toBe("file-error");
  expect(alert.closest(".ui-dropzone")).toBeNull();
  expect(input.getAttribute("aria-describedby")).toBe("file-hint file-error");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  view.rerender(<Example feedback="hidden" />);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(input.getAttribute("aria-describedby")).toBe("file-hint");
  expect(input.hasAttribute("aria-invalid")).toBe(false);
  view.rerender(<Example feedback="absent" />);
  fireEvent.change(input, {
    target: {
      files: [new File(["bad"], "bad.svg", { type: "image/svg+xml" })],
    },
  });
  expect(reject).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole("alert")).toBeNull();
});

it("keeps custom showcase ids associated only while the nodes exist", () => {
  const view = render(
    <ShowcaseCard href="#details">
      <ShowcaseCard.Title id="piece-name">作品</ShowcaseCard.Title>
      <ShowcaseCard.Description id="piece-description">
        作品说明
      </ShowcaseCard.Description>
      <ShowcaseCard.Media>预览</ShowcaseCard.Media>
    </ShowcaseCard>,
  );
  const link = screen.getByRole("link", { name: "作品" });
  expect(link.getAttribute("aria-labelledby")).toBe("piece-name");
  expect(link.getAttribute("aria-describedby")).toBe("piece-description");
  view.rerender(
    <ShowcaseCard href="#details">
      <ShowcaseCard.Title id="piece-name">作品</ShowcaseCard.Title>
      <ShowcaseCard.Media>预览</ShowcaseCard.Media>
    </ShowcaseCard>,
  );
  expect(
    screen.getByRole("link", { name: "作品" }).hasAttribute("aria-describedby"),
  ).toBe(false);
});
