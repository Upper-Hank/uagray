// @vitest-environment jsdom
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";
const listeners = new Set<() => void>();
const media = {
  matches: false,
  addEventListener: (_type: string, callback: () => void) =>
    listeners.add(callback),
  removeEventListener: (_type: string, callback: () => void) =>
    listeners.delete(callback),
};
beforeEach(() => {
  localStorage.clear();
  listeners.clear();
  media.matches = false;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});
it("follows system initially, saves a manual choice and restores it on remount", () => {
  media.matches = true;
  const view = render(<ThemeToggle />);
  expect(document.documentElement.dataset.theme).toBe("dark");
  fireEvent.click(screen.getByRole("button", { name: "切换为浅色" }));
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(localStorage.getItem("uagray-theme")).toBe("light");
  view.unmount();
  render(<ThemeToggle />);
  expect(
    screen
      .getByRole("button", { name: "切换为暗色" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
});
it("responds to system changes until the user overrides them", () => {
  render(<ThemeToggle />);
  act(() => {
    media.matches = true;
    listeners.forEach((callback) => callback());
  });
  expect(document.documentElement.dataset.theme).toBe("dark");
  fireEvent.click(screen.getByRole("button", { name: "切换为浅色" }));
  act(() => {
    listeners.forEach((callback) => callback());
  });
  expect(document.documentElement.dataset.theme).toBe("light");
});
it("keeps the switch working when storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole("button", { name: "切换为暗色" }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  act(() => {
    listeners.forEach((callback) => callback());
  });
  expect(document.documentElement.dataset.theme).toBe("dark");
});
