// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import {
  CopyButton,
  ExpandableCode,
  Pager,
  SearchField,
  ShowcaseCard,
  SegmentedControl,
} from "./components";

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

describe("keyboard interactions", () => {
  it("moves focus and selection past disabled options, wrapping at boundaries", () => {
    function Example() {
      const [value, setValue] = useState("a");
      return (
        <SegmentedControl
          label="Filter"
          options={[
            { value: "a", label: "A" },
            { value: "b", label: "B", disabled: true },
            { value: "c", label: "C" },
          ]}
          value={value}
          onChange={setValue}
        />
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
            label="Search"
            value={value}
            onChange={setValue}
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
  render(<ExpandableCode code={"line\n".repeat(30)} />);
  const toggle = screen.getByRole("button", { name: /Show full text/ });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(
    document.getElementById(toggle.getAttribute("aria-controls")!),
  ).not.toBeNull();
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
});
it("reports clipboard success and failure honestly", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  render(<CopyButton text="content" />);
  fireEvent.click(screen.getByRole("button", { name: "Copy" }));
  await screen.findByText("Copied");
  expect(writeText).toHaveBeenCalledWith("content");
  writeText.mockRejectedValueOnce(new Error("denied"));
  fireEvent.click(screen.getByRole("button", { name: "Copied" }));
  await screen.findByText("Copy failed");
});
it("uses a real navigation link and disables unavailable targets", () => {
  render(<Pager previous={{ title: "Previous page", href: "#previous" }} />);
  expect(screen.getByRole("link").getAttribute("href")).toBe("#previous");
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
});
it("keeps the card name informational and external actions as sibling links", () => {
  const view = render(
    <ShowcaseCard title="作品" description="查看作品" href="#detail">
      内容
    </ShowcaseCard>,
  );
  expect(screen.getAllByRole("link")).toHaveLength(1);
  view.rerender(
    <ShowcaseCard
      title="作品"
      description="查看作品"
      href="#detail"
      externalLink={{ href: "https://example.com", label: "作者" }}
    >
      内容
    </ShowcaseCard>,
  );
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  expect(links.every((link) => !link.parentElement?.closest("a"))).toBe(true);
  expect(screen.getByRole("link", { name: /作者/ }).getAttribute("rel")).toBe(
    "noopener noreferrer",
  );
});
