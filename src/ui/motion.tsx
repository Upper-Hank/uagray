import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  LayoutGroup,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";

export const layoutTransition: Transition = {
  duration: 0.24,
  ease: [0.23, 1, 0.32, 1],
};
export function useUiMotion() {
  const reduced = useReducedMotion() === true;
  return { reduced, transition: reduced ? { duration: 0 } : layoutTransition };
}
// Forward native events separately so DOM onDrag/onAnimationStart retain their meaning.
const ButtonElement = forwardRef<
  HTMLButtonElement,
  {
    nativeProps: ButtonHTMLAttributes<HTMLButtonElement>;
    children?: ReactNode;
    style?: CSSProperties;
  }
>(function ButtonElement({ nativeProps, children, style }, ref) {
  return (
    <button
      {...nativeProps}
      style={{ ...nativeProps.style, ...style }}
      ref={ref}
    >
      {children}
    </button>
  );
});
export const MotionButton = motion.create(ButtonElement);

/** Group related controls so a label resize also moves its siblings smoothly. */
export function Layout({
  children,
  className,
  label,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  /** @deprecated Use `aria-label`. */
  label?: string;
}) {
  const name = ariaLabel ?? label;
  const { reduced, transition } = useUiMotion();
  return (
    <LayoutGroup>
      <motion.div
        className={className}
        role={name ? "group" : undefined}
        aria-label={name}
        layout={reduced ? false : true}
        transition={transition}
      >
        {children}
      </motion.div>
    </LayoutGroup>
  );
}
