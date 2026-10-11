// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import {
  Button,
  CopyButton,
  ExpandableCode,
  IconButton,
  Pager,
  SearchField,
  ShowcaseCard,
} from "./components";
import { Icon } from "./icons";
import { SegmentedControl } from "./selection";

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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.location.hash = "";
});

describe("keyboard interactions", () => {
  it("moves focus and selection past disabled options, wrapping at boundaries", () => {
    function Example() {
      const [value, setValue] = useState("a");
      return (
        <SegmentedControl
          aria-label="Filter"
          value={value}
          onValueChange={setValue}
        >
          {[
            { value: "a", label: "A" },
            { value: "b", label: "B", disabled: true },
            { value: "c", label: "C" },
          ].map((item) => (
            <SegmentedControl.Item
              key={item.value}
              value={item.value}
              disabled={(item as { disabled?: boolean }).disabled}
            >
              <SegmentedControl.Label>{item.label}</SegmentedControl.Label>
              {(item as { count?: number | string }).count != null ? (
                <SegmentedControl.Count>
                  {(item as { count?: number | string }).count}
                </SegmentedControl.Count>
              ) : null}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      );
    }
    render(<Example />);
    fireEvent.keyDown(screen.getByRole("radio", { name: "A" }), {
      key: "ArrowRight",
    });
    expect(
      screen.getByRole("radio", { name: "C" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: "C" }),
    );
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(
      screen.getByRole("radio", { name: "A" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
  it("focuses search via slash, ignores other inputs and clears via Escape", () => {
    function Example() {
      const [value, setValue] = useState("hello");
      return (
        <>
          <input aria-label="Other input" />
          <SearchField
            aria-label="Search"
            value={value}
            onValueChange={setValue}
            shortcut
          />
        </>
      );
    }
    render(<Example />);
    fireEvent.keyDown(window, { key: "/" });
    const search = screen.getByRole("searchbox") as HTMLInputElement;
    expect(document.activeElement).toBe(search);
    fireEvent.keyDown(search, { key: "Escape" });
    expect(search.value).toBe("");
    const other = screen.getByLabelText("Other input");
    other.focus();
    fireEvent.keyDown(other, { key: "/" });
    expect(document.activeElement).toBe(other);
  });
});
it("expands and collapses text with associated accessibility state", () => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(600);
  render(
    <ExpandableCode>
      <ExpandableCode.Body>{"line\n".repeat(30)}</ExpandableCode.Body>
      <ExpandableCode.CopyAction>复制</ExpandableCode.CopyAction>
      <ExpandableCode.ExpandAction>展开全文</ExpandableCode.ExpandAction>
      <ExpandableCode.CollapseAction>收起全文</ExpandableCode.CollapseAction>
    </ExpandableCode>,
  );
  const toggle = screen.getByRole("button", { name: /展开全文/ });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(
    document.getElementById(toggle.getAttribute("aria-controls")!),
  ).not.toBeNull();
  fireEvent.click(toggle);
  const collapse = screen.getByRole("button", { name: "收起全文" });
  expect(collapse.getAttribute("aria-expanded")).toBe("true");
  expect(document.querySelector(".ui-code-fade")).toBeNull();
  fireEvent.click(collapse);
  expect(
    screen
      .getByRole("button", { name: "展开全文" })
      .getAttribute("aria-expanded"),
  ).toBe("false");
  expect(document.querySelector(".ui-code-fade")).not.toBeNull();
});
it("does not truncate short text or offer an unnecessary expansion", () => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(80);
  render(
    <ExpandableCode>
      <ExpandableCode.Body>{"短内容"}</ExpandableCode.Body>
      <ExpandableCode.CopyAction>复制</ExpandableCode.CopyAction>
      <ExpandableCode.ExpandAction>展开全文</ExpandableCode.ExpandAction>
      <ExpandableCode.CollapseAction>收起全文</ExpandableCode.CollapseAction>
    </ExpandableCode>,
  );
  expect(screen.getByText("短内容")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "展开全文" })).toBeNull();
  expect(document.querySelector(".ui-code-fade")).toBeNull();
});
it("removes the fade and toggle when resized content no longer overflows", () => {
  let contentHeight = 600;
  const callbacks: (() => void)[] = [];
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(
    () => contentHeight,
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
  render(
    <ExpandableCode>
      <ExpandableCode.Body>{"内容\n".repeat(30)}</ExpandableCode.Body>
      <ExpandableCode.CopyAction>复制</ExpandableCode.CopyAction>
      <ExpandableCode.ExpandAction>展开全文</ExpandableCode.ExpandAction>
      <ExpandableCode.CollapseAction>收起全文</ExpandableCode.CollapseAction>
    </ExpandableCode>,
  );
  expect(screen.getByRole("button", { name: "展开全文" })).toBeTruthy();
  contentHeight = 80;
  act(() => callbacks.forEach((callback) => callback()));
  expect(screen.queryByRole("button", { name: "展开全文" })).toBeNull();
  expect(document.querySelector(".ui-code-fade")).toBeNull();
});
it("keeps the label and blocks another click while a button is busy", () => {
  const click = vi.fn();
  render(
    <Button busy onClick={click}>
      {((icon) =>
        icon === undefined ? null : (
          <Button.Icon>
            <Icon name={icon as Parameters<typeof Icon>[0]["name"]} />
          </Button.Icon>
        ))("check")}
      <Button.Label>保存</Button.Label>
    </Button>,
  );
  const button = screen.getByRole("button", { name: "保存" });
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect((button as HTMLButtonElement).disabled).toBe(false);
  expect(button.querySelector(".ui-spinner-mark")).toBeTruthy();
  expect(button.querySelector("svg")).toBeNull();
  fireEvent.click(button);
  expect(click).not.toHaveBeenCalled();
});
it("keeps an icon button name while the action is busy", () => {
  render(<IconButton busy icon="close" aria-label="关闭" />);
  const button = screen.getByRole("button", { name: "关闭" });
  expect(button.getAttribute("title")).toBe("关闭");
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.querySelector(".ui-spinner-mark")).toBeTruthy();
  expect(button.querySelector("svg")).toBeNull();
});
it("marks a pending copy as busy without disabling the button", async () => {
  let finish = () => {};
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    },
  });
  render(
    <CopyButton text="content">
      <CopyButton.Label>复制</CopyButton.Label>
      <CopyButton.Feedback state="success">已复制</CopyButton.Feedback>
      <CopyButton.Feedback state="pending">正在复制</CopyButton.Feedback>
      <CopyButton.Feedback state="error">复制失败</CopyButton.Feedback>
    </CopyButton>,
  );
  fireEvent.click(screen.getByRole("button", { name: "复制" }));
  await screen.findByText("正在复制");
  const pending = screen.getByRole("button", { name: "复制" });
  expect(pending.getAttribute("aria-busy")).toBe("true");
  expect((pending as HTMLButtonElement).disabled).toBe(false);
  await act(async () => finish());
});
it("reports clipboard success and failure honestly", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  render(
    <CopyButton text="content">
      <CopyButton.Label>复制</CopyButton.Label>
      <CopyButton.Feedback state="success">已复制</CopyButton.Feedback>
      <CopyButton.Feedback state="pending">正在复制</CopyButton.Feedback>
      <CopyButton.Feedback state="error">复制失败</CopyButton.Feedback>
    </CopyButton>,
  );
  fireEvent.click(screen.getByRole("button", { name: "复制" }));
  await screen.findByText("已复制");
  expect(writeText).toHaveBeenCalledWith("content");
  writeText.mockRejectedValueOnce(new Error("denied"));
  fireEvent.click(screen.getByRole("button", { name: "复制" }));
  await screen.findByText("复制失败");
});
it("uses a real navigation link and disables unavailable targets", () => {
  render(
    <Pager>
      {((item) =>
        item && <Pager.Previous href={item.href}>{item.title}</Pager.Previous>)(
        { title: "Previous page", href: "#previous" },
      )}
    </Pager>,
  );
  expect(screen.getByRole("link").getAttribute("href")).toBe("#previous");
  expect(screen.queryByRole("button")).toBeNull();
  const { container } = render(
    <Pager>
      <Pager.Next>下一篇</Pager.Next>
    </Pager>,
  );
  expect(
    (container.querySelector("button") as HTMLButtonElement).disabled,
  ).toBe(true);
});
it("keeps the card name informational and external actions as sibling links", () => {
  const view = render(
    <ShowcaseCard href="#detail">
      <ShowcaseCard.Title>{"作品"}</ShowcaseCard.Title>
      <ShowcaseCard.Description>{"查看作品"}</ShowcaseCard.Description>
      <ShowcaseCard.Media>内容</ShowcaseCard.Media>
    </ShowcaseCard>,
  );
  expect(screen.getAllByRole("link")).toHaveLength(1);
  view.rerender(
    <ShowcaseCard href="#detail">
      <ShowcaseCard.Title>{"作品"}</ShowcaseCard.Title>
      <ShowcaseCard.Description>{"查看作品"}</ShowcaseCard.Description>
      <ShowcaseCard.Media>内容</ShowcaseCard.Media>
      {((link) =>
        link && (
          <ShowcaseCard.ExternalLink href={link.href}>
            {link.label}
          </ShowcaseCard.ExternalLink>
        ))({ href: "https://example.com", label: "作者" })}
    </ShowcaseCard>,
  );
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  expect(links.every((link) => !link.parentElement?.closest("a"))).toBe(true);
  expect(screen.getByRole("link", { name: /作者/ }).getAttribute("rel")).toBe(
    "noopener noreferrer",
  );
});
