import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useUiMotion } from "./motion";

type SelectionBounds = { x: number; y: number; width: number; height: number };

// Shared geometry for tab and radio selectors, including wrapped rows.
export function useSelectionIndicator(
  value: string,
  selectedIndex: number,
  items: readonly unknown[],
) {
  const ref = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<SelectionBounds | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const button =
        ref.current?.querySelectorAll<HTMLButtonElement>("button")[
          selectedIndex
        ];
      if (!button) {
        setBounds(null);
        return;
      }
      const next = {
        x: button.offsetLeft,
        y: button.offsetTop,
        width: button.offsetWidth,
        height: button.offsetHeight,
      };
      setBounds((current) =>
        current?.x === next.x &&
        current.y === next.y &&
        current.width === next.width &&
        current.height === next.height
          ? current
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (ref.current) {
      observer.observe(ref.current);
      ref.current
        .querySelectorAll("button")
        .forEach((button) => observer.observe(button));
    }
    return () => observer.disconnect();
  }, [value, selectedIndex, items]);
  return { ref, bounds };
}

export function SelectionIndicator({
  bounds,
}: {
  bounds: SelectionBounds | null;
}) {
  const { transition } = useUiMotion();
  if (!bounds) return null;
  return (
    <motion.span
      className="ui-selection-indicator"
      aria-hidden="true"
      initial={false}
      animate={bounds}
      transition={transition}
    />
  );
}
