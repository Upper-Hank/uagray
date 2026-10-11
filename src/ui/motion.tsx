import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  LayoutGroup,
  animate,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useIsPresent,
  useReducedMotion,
  type MotionProps,
  type Transition,
} from "framer-motion";
import { assignRef } from "./host";

export const layoutTransition: Transition = {
  duration: 0.24,
  ease: [0.23, 1, 0.32, 1],
};
export const motionTiming = { enter: 0.24, exit: 0.14, reduced: 0.1 };
export const motionDistance = { floating: 8, edge: 20, anchor: 4, blur: 4 };
export const exitTransition: Transition = {
  duration: motionTiming.exit,
  ease: [0.4, 0, 1, 1],
};
const reducedFadeTransition: Transition = {
  duration: motionTiming.reduced,
  x: { duration: 0 },
  y: { duration: 0 },
  width: { duration: 0 },
  height: { duration: 0 },
  scale: { duration: 0 },
  rotate: { duration: 0 },
  filter: { duration: 0 },
  layout: { duration: 0 },
};
export function useUiMotion() {
  const reduced = useReducedMotion() === true;
  return {
    reduced,
    transition: reduced ? { duration: 0 } : layoutTransition,
    enter: reduced ? reducedFadeTransition : layoutTransition,
    exit: reduced ? reducedFadeTransition : exitTransition,
  };
}

/** Two persistent layers allow reversal without queuing obsolete labels. */
function TextTransition({ value }: { value: string | number }) {
  const { reduced, enter, exit } = useUiMotion();
  const opacity0 = useMotionValue(1);
  const opacity1 = useMotionValue(0);
  const blur0 = useMotionValue(0);
  const blur1 = useMotionValue(motionDistance.blur);
  const filter0 = useMotionTemplate`blur(${blur0}px)`;
  const filter1 = useMotionTemplate`blur(${blur1}px)`;
  const appliedRevision = useRef(0);
  const [state, setState] = useState<{
    values: [string | number, string | number | null];
    active: 0 | 1;
    revision: number;
    fresh: boolean;
  }>({ values: [value, null], active: 0, revision: 0, fresh: false });
  if (state.values[state.active] !== value) {
    const next = state.active === 0 ? 1 : 0;
    const values: typeof state.values = [...state.values];
    const fresh = values[next] !== value;
    values[next] = value;
    setState({ values, active: next, revision: state.revision + 1, fresh });
  }
  useLayoutEffect(() => {
    const opacities = [opacity0, opacity1];
    const blurs = [blur0, blur1];
    if (reduced) {
      opacities.forEach((opacity, index) =>
        opacity.set(index === state.active ? 1 : 0),
      );
      blurs.forEach((blur) => blur.set(0));
      appliedRevision.current = state.revision;
      return;
    }
    if (!state.revision) return;
    if (state.fresh && appliedRevision.current !== state.revision) {
      opacities[state.active].set(0);
      blurs[state.active].set(motionDistance.blur);
    }
    appliedRevision.current = state.revision;
    let cancelled = false;
    const animations = opacities.flatMap((opacity, index) => {
      const active = index === state.active;
      const timing = active ? enter : exit;
      return [
        animate(opacity, active ? 1 : 0, timing),
        animate(blurs[index], active ? 0 : motionDistance.blur, timing),
      ];
    });
    void animations[(1 - state.active) * 2].then(() => {
      if (cancelled) return;
      setState((current) => {
        if (current.revision !== state.revision) return current;
        const values: typeof current.values = [...current.values];
        values[1 - current.active] = null;
        return { ...current, values };
      });
    });
    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.stop());
    };
  }, [
    state.active,
    state.revision,
    reduced,
    opacity0,
    opacity1,
    blur0,
    blur1,
    enter.duration,
    exit.duration,
  ]);
  return (
    <span className="ui-changing-text">
      {state.values.map((text, index) =>
        text === null || (reduced && index !== state.active) ? null : (
          <motion.span
            key={index}
            aria-hidden={index !== state.active ? true : undefined}
            className={
              index === state.active ? undefined : "ui-changing-text-outgoing"
            }
            style={{
              opacity: reduced ? 1 : index === 0 ? opacity0 : opacity1,
              filter: reduced ? "blur(0px)" : index === 0 ? filter0 : filter1,
            }}
          >
            {text}
          </motion.span>
        ),
      )}
    </span>
  );
}

export function ChangingText({ children }: { children: ReactNode }) {
  return typeof children === "string" || typeof children === "number" ? (
    <TextTransition value={children} />
  ) : (
    children
  );
}

export function PresenceSurface(
  props: ComponentPropsWithRef<typeof motion.div>,
) {
  const present = useIsPresent();
  return (
    <motion.div
      {...props}
      inert={!present ? true : props.inert}
      aria-hidden={!present ? true : props["aria-hidden"]}
      aria-live={!present ? "off" : props["aria-live"]}
    />
  );
}

/** Host-owned content stays mounted; its latest version receives a short fade. */
export function FadeContent({
  identity,
  children,
  ...props
}: {
  identity: string;
  children: ReactNode;
} & Omit<ComponentPropsWithRef<"div">, keyof MotionProps | "children">) {
  const previous = useRef(identity);
  const controls = useAnimationControls();
  const { enter } = useUiMotion();
  useLayoutEffect(() => {
    if (previous.current === identity) return;
    previous.current = identity;
    controls.set({ opacity: 0 });
    void controls.start({ opacity: 1, transition: enter });
    return () => controls.stop();
  }, [identity, controls, enter.duration]);
  return (
    <motion.div {...props} initial={false} animate={controls}>
      {children}
    </motion.div>
  );
}

/** Keep inactive panel state, but remove its operation rights at exit start. */
export function TransitionPanel({
  active,
  onDeactivate,
  children,
  ref,
  ...props
}: {
  active: boolean;
  onDeactivate?: () => void;
  children: ReactNode;
} & Omit<ComponentPropsWithRef<"div">, keyof MotionProps | "children">) {
  const { reduced, transition, enter, exit } = useUiMotion();
  const element = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!active && element.current?.contains(document.activeElement))
      onDeactivate?.();
  }, [active, onDeactivate]);
  const [shown, setShown] = useState(active);
  if (active && !shown) setShown(true);
  return (
    <motion.div
      {...props}
      ref={(node) => {
        element.current = node;
        assignRef(ref, node);
      }}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      layout={reduced ? false : "position"}
      transition={{ ...(active ? enter : exit), layout: transition }}
      hidden={!active && !shown}
      inert={!active ? true : undefined}
      aria-hidden={!active ? true : undefined}
      onAnimationComplete={() => {
        if (!active) setShown(false);
      }}
    >
      {children}
    </motion.div>
  );
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
  style,
  label,
  "aria-label": ariaLabel,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<"div">, keyof MotionProps | "children"> & {
  children: ReactNode;
  style?: CSSProperties;
  /** @deprecated Use `aria-label`. */
  label?: string;
}) {
  const name = ariaLabel ?? label;
  const { reduced, transition } = useUiMotion();
  return (
    <LayoutGroup>
      <motion.div
        {...props}
        ref={ref}
        className={className}
        style={style}
        role={name ? "group" : props.role}
        aria-label={name}
        layout={reduced ? false : true}
        transition={transition}
      >
        {children}
      </motion.div>
    </LayoutGroup>
  );
}
