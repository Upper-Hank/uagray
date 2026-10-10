import { useSyncExternalStore } from "react";
let keyboard = false;
const subscribers = new Set<() => void>();
function update(next: boolean) {
  if (keyboard === next) return;
  keyboard = next;
  subscribers.forEach((notify) => notify());
}
function onKey(event: KeyboardEvent) {
  if (event.key === "Tab") update(true);
}
function onPointer() {
  update(false);
}
function subscribe(notify: () => void) {
  if (!subscribers.size) {
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
  }
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
    if (!subscribers.size) {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
      keyboard = false;
    }
  };
}
/** Track navigation intent, not text entry; typing never enables the outer focus ring. */
export function useKeyboardFocus() {
  return useSyncExternalStore(
    subscribe,
    () => keyboard,
    () => false,
  );
}
