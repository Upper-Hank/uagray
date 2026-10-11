import type { ReactNode, Ref } from "react";

export function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/** Run the host listener, then the behavior this component owns. */
export function compose<E>(
  host: ((event: E) => void) | undefined,
  owned: (event: E) => void,
) {
  return (event: E) => {
    host?.(event);
    owned(event);
  };
}

export function hasContent(node: ReactNode) {
  if (node === null || node === undefined || node === false) return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasContent);
  return true;
}
