// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ColorPicker, normalizeHex } from "./color-picker";
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
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("normalizes HEX and rejects unsupported color syntax", () => {
  expect(normalizeHex(" abc ")).toBe("#AABBCC");
  expect(normalizeHex("#00ff80")).toBe("#00FF80");
  expect(normalizeHex("red")).toBeNull();
  expect(normalizeHex("#12345678")).toBe("#12345678");
  expect(normalizeHex("#abcd")).toBe("#AABBCCDD");
});
it("commits valid edits, preserves the selected color on invalid edits and restores on Escape", () => {
  const onValueChange = vi.fn();
  render(<ColorPicker defaultValue="#123456" onValueChange={onValueChange} />);
  const input = screen.getByLabelText("颜色 HEX") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "#abc" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onValueChange).toHaveBeenLastCalledWith("#AABBCC");
  expect(input.value).toBe("#AABBCC");
  onValueChange.mockClear();
  fireEvent.change(input, { target: { value: "#nope" } });
  fireEvent.blur(input);
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Escape" });
  expect(input.value).toBe("#AABBCC");
  expect(screen.queryByRole("alert")).toBeNull();
});
it("links native channel controls and external controlled values", () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <ColorPicker defaultValue="#FFFFFF" onValueChange={onValueChange} />,
  );
  expect(screen.queryByRole("group", { name: "颜色预设色板" })).toBeNull();
  fireEvent.change(screen.getByRole("slider", { name: /饱和度与明度/ }), {
    target: { value: "100" },
  });
  expect(onValueChange).toHaveBeenLastCalledWith("#FF0000");
  rerender(<ColorPicker value="#33865C" />);
  expect((screen.getByLabelText("颜色 HEX") as HTMLInputElement).value).toBe(
    "#33865C",
  );
});
it("follows the controlled value when the host rejects or later replaces it", () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <ColorPicker value="#112233" onValueChange={onValueChange} />,
  );
  const input = screen.getByLabelText("颜色 HEX") as HTMLInputElement;
  fireEvent.change(screen.getByRole("slider", { name: /饱和度与明度/ }), {
    target: { value: "100" },
  });
  expect(onValueChange).toHaveBeenCalled();
  expect(input.value).toBe("#112233");
  fireEvent.change(input, { target: { value: "#ABCDEF" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onValueChange).toHaveBeenLastCalledWith("#ABCDEF");
  expect(input.value).toBe("#112233");
  rerender(<ColorPicker value="#00FF00" onValueChange={onValueChange} />);
  expect(input.value).toBe("#00FF00");
});

it("disables all editable controls", () => {
  const onValueChange = vi.fn();
  render(<ColorPicker disabled onValueChange={onValueChange} />);
  expect(screen.getByLabelText("颜色 HEX").matches(":disabled")).toBe(true);
  expect(
    (screen.getByRole("slider", { name: "色相" }) as HTMLInputElement).disabled,
  ).toBe(true);
  fireEvent.change(screen.getByRole("slider", { name: "色相" }), {
    target: { value: "100" },
  });
  expect(onValueChange).not.toHaveBeenCalled();
});

it("links hue, two dimensional channels and opacity without losing the hue of gray", () => {
  const onValueChange = vi.fn();
  render(<ColorPicker defaultValue="#FFFFFF" onValueChange={onValueChange} />);
  fireEvent.change(screen.getByRole("slider", { name: "色相" }), {
    target: { value: "120" },
  });
  fireEvent.change(screen.getByRole("slider", { name: /饱和度与明度/ }), {
    target: { value: "100" },
  });
  expect(onValueChange).toHaveBeenLastCalledWith("#00FF00");
  fireEvent.change(screen.getByRole("slider", { name: "透明度" }), {
    target: { value: "0.5" },
  });
  expect(onValueChange).toHaveBeenLastCalledWith("#00FF0080");
  expect((screen.getByLabelText("透明度 %") as HTMLInputElement).value).toBe(
    "50",
  );
});
it("samples screen colors while preserving opacity", async () => {
  vi.stubGlobal(
    "EyeDropper",
    class {
      async open() {
        return { sRGBHex: "#FF0000" };
      }
    },
  );
  const onValueChange = vi.fn();
  render(
    <ColorPicker defaultValue="#FFFFFF80" onValueChange={onValueChange} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "吸管取色" }));
  await vi.waitFor(() =>
    expect(onValueChange).toHaveBeenLastCalledWith("#FF000080"),
  );
});

it("switches color formats without changing color and edits individual channels", async () => {
  const onValueChange = vi.fn();
  render(<ColorPicker defaultValue="#FF0000" onValueChange={onValueChange} />);
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
  fireEvent.keyDown(await screen.findByRole("option", { name: "RGB" }), {
    key: "Enter",
  });
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("spinbutton", { name: "绿色" }), {
    target: { value: "255" },
  });
  expect(onValueChange).toHaveBeenLastCalledWith("#FFFF00");
});

it("treats cancelling the eyedropper as a normal dismissal", async () => {
  vi.stubGlobal(
    "EyeDropper",
    class {
      async open() {
        throw new DOMException("Cancelled", "AbortError");
      }
    },
  );
  const onValueChange = vi.fn();
  render(<ColorPicker onValueChange={onValueChange} />);
  fireEvent.click(screen.getByRole("button", { name: "吸管取色" }));
  await vi.waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "吸管取色" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false),
  );
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.queryByRole("alert")).toBeNull();
});

it("exposes HSB and HSL channel editors and keeps the same selected color", async () => {
  const onValueChange = vi.fn();
  render(<ColorPicker defaultValue="#3765D6" onValueChange={onValueChange} />);
  for (const format of ["HSB", "HSL"]) {
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    fireEvent.keyDown(await screen.findByRole("option", { name: format }), {
      key: "Enter",
    });
    expect(screen.getAllByRole("spinbutton")).toHaveLength(4);
  }
  expect(onValueChange).not.toHaveBeenCalled();
});
