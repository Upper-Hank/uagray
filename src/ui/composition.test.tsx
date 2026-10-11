// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Icon } from "./icons";
import { Alert, Progress } from "./feedback";
import { Field, Input, Select } from "./fields";
import { Dialog } from "./panels";

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
          {open ? <Progress.Label id="custom-progress">上传</Progress.Label> : null}
        </Progress>
      </>
    );
  }
  const view = render(<Example open />);
  const dialog = screen.getByRole("dialog");
  expect(document.getElementById("custom-title")?.id).toBe("custom-title");
  expect(dialog.getAttribute("aria-labelledby")).toBe("custom-title");
  expect(dialog.getAttribute("aria-describedby")).toContain("custom-description");
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
