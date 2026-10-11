import {
  Children,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { AnimatePresence, motion, type MotionProps } from "framer-motion";
import { motionDistance, PresenceSurface, useUiMotion } from "./motion";
import { Button } from "./components";
import { Icon } from "./icons";
import { assignRef, compose, cx, hasContent } from "./host";
import {
  CompositionRoot,
  slotIds,
  useComposition,
  useSlot,
  type SlotRule,
} from "./composition";

const badgeRules: readonly SlotRule[] = [
  { name: "icon", min: 0, max: 1 },
  { name: "label", min: 1, max: 1 },
];
const alertRules: readonly SlotRule[] = [
  { name: "icon", min: 1, max: 1 },
  { name: "title", min: 0, max: 1 },
  { name: "body", min: 0, max: 1 },
];
const progressRules: readonly SlotRule[] = [
  { name: "label", min: 0, max: 1 },
  { name: "value", min: 0, max: 1 },
];
const emptyRules: readonly SlotRule[] = [
  { name: "icon", min: 0, max: 1 },
  { name: "title", min: 1, max: 1 },
  { name: "description", min: 0, max: 1 },
  { name: "actions", min: 0, max: 1 },
];
const toastRules: readonly SlotRule[] = [
  { name: "icon", min: 0, max: 1 },
  { name: "body", min: 1, max: 1 },
];

function directText(children: ReactNode) {
  return Children.toArray(children).some((child) =>
    typeof child === "string" || typeof child === "number"
      ? String(child).trim().length > 0
      : false,
  );
}

type MotionSafeDiv = Omit<ComponentPropsWithRef<"div">, keyof MotionProps> & {
  style?: CSSProperties;
};
export type FeedbackTone = "neutral" | "success" | "danger";
const ToastPlacement = createContext(false);

function badgeEmphasis(
  emphasis: "default" | "quiet" | undefined,
  variant: "soft" | "plain" | "white" | undefined,
) {
  if (emphasis) return emphasis;
  if (variant === "plain") return "quiet";
  return "default";
}

function BadgeIcon({ children }: { children: ReactNode }) {
  useSlot("Badge", "icon", { present: hasContent(children) });
  return <span className="ui-badge-icon">{children}</span>;
}

function BadgeLabel({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("Badge", "label", { present: hasContent(children) });
  return (
    <span {...props} className={cx(className)}>
      {children}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  emphasis,
  variant,
  className,
  style,
  ref,
  ...props
}: ComponentPropsWithRef<"span"> & {
  tone?: FeedbackTone;
  emphasis?: "default" | "quiet";
  /** @deprecated Use `emphasis`. `plain` maps to `quiet`; `soft` and `white` map to `default`. */
  variant?: "soft" | "plain" | "white";
  children?: ReactNode;
}) {
  const resolved = badgeEmphasis(emphasis, variant);
  const shorthand = directText(children);
  const composition = useComposition("Badge", badgeRules);
  useLayoutEffect(() => {
    if (!shorthand) return;
    return composition.value.register({
      slot: "label",
      present: true,
      region: "root",
    });
  }, [composition.value.register, shorthand]);
  return (
    <CompositionRoot value={composition.value}>
      <span
        {...props}
        ref={ref}
        style={style}
        className={cx(
          "ui-badge",
          resolved === "quiet" && "ui-badge--quiet",
          `ui-tone--${tone}`,
          className,
        )}
      >
        {children}
      </span>
    </CompositionRoot>
  );
}
Badge.Icon = BadgeIcon;
Badge.Label = BadgeLabel;

function AlertIcon({ children }: { children: ReactNode }) {
  useSlot("Alert", "icon", { present: hasContent(children) });
  return <span className="ui-alert-icon">{children}</span>;
}
function AlertTitle({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"strong"> & { children: ReactNode }) {
  useSlot("Alert", "title", { present: hasContent(children) });
  return (
    <strong {...props} className={cx("ui-alert-title", className)}>
      {children}
    </strong>
  );
}
function AlertBody({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div"> & { children: ReactNode }) {
  useSlot("Alert", "body", { present: hasContent(children) });
  return (
    <div {...props} className={cx("ui-alert-body", className)}>
      {children}
    </div>
  );
}

export function Alert({
  children,
  tone = "neutral",
  className,
  style,
  ref,
  ...props
}: ComponentPropsWithRef<"div"> & {
  tone?: FeedbackTone;
  children: ReactNode;
}) {
  const composition = useComposition("Alert", alertRules, (registrations) =>
    registrations.some(
      (item) => (item.slot === "title" || item.slot === "body") && item.present,
    )
      ? []
      : ["[uagray] Alert 需要有内容的 Title 或 Body"],
  );
  return (
    <CompositionRoot value={composition.value}>
      <div
        {...props}
        ref={ref}
        style={style}
        className={cx("ui-alert", `ui-tone--${tone}`, className)}
        role={tone === "danger" ? "alert" : "status"}
      >
        {children}
      </div>
    </CompositionRoot>
  );
}
Alert.Icon = AlertIcon;
Alert.Title = AlertTitle;
Alert.Body = AlertBody;

type ProgressContextValue = { id: string };
const ProgressContext = createContext<ProgressContextValue | null>(null);

function ProgressLabel({
  children,
  className,
  id: suppliedId,
  ...props
}: ComponentPropsWithRef<"label"> & { children: ReactNode }) {
  const context = useContext(ProgressContext);
  const generated = useId();
  const id = suppliedId ?? (context ? `${context.id}-label` : generated);
  useSlot("Progress", "label", { id, present: hasContent(children) });
  return (
    <label {...props} id={id} htmlFor={context?.id} className={cx(className)}>
      {children}
    </label>
  );
}

function ProgressValue({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"output"> & { children?: ReactNode }) {
  const context = useContext(ProgressContext);
  useSlot("Progress", "value", { present: hasContent(children) });
  return (
    <output {...props} htmlFor={context?.id} className={cx(className)}>
      {children}
    </output>
  );
}

export function Progress({
  children,
  value,
  max = 100,
  className,
  style,
  ref,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  ...props
}: Omit<ComponentPropsWithRef<"div">, "children" | "ref"> & {
  children?: ReactNode;
  value?: number;
  max?: number;
  ref?: Ref<HTMLProgressElement>;
}) {
  const upper = max > 0 ? max : 100;
  const current =
    value === undefined ? undefined : Math.max(0, Math.min(value, upper));
  const id = useId();
  const composition = useComposition("Progress", progressRules);
  const labelId =
    slotIds(composition.registrations, "label").join(" ") || undefined;
  const name = labelledBy ?? labelId;
  return (
    <CompositionRoot value={composition.value}>
      <ProgressContext.Provider value={{ id }}>
        <div {...props} className={cx("ui-progress", className)} style={style}>
          {hasContent(children) ? (
            <div className="ui-slider-label">{children}</div>
          ) : null}
          <progress
            ref={ref}
            id={id}
            aria-label={ariaLabel ?? (name ? undefined : "进度")}
            aria-labelledby={name}
            aria-describedby={describedBy}
            value={current}
            max={upper}
          />
        </div>
      </ProgressContext.Provider>
    </CompositionRoot>
  );
}
Progress.Label = ProgressLabel;
Progress.Value = ProgressValue;

function EmptyStateIcon({ children }: { children: ReactNode }) {
  useSlot("EmptyState", "icon", { present: hasContent(children) });
  return <span className="ui-empty-icon">{children}</span>;
}
function EmptyStateTitle({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"h3"> & { children: ReactNode }) {
  useSlot("EmptyState", "title", { present: hasContent(children) });
  return (
    <h3 {...props} className={cx(className)}>
      {children}
    </h3>
  );
}
function EmptyStateDescription({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"p"> & { children: ReactNode }) {
  useSlot("EmptyState", "description", { present: hasContent(children) });
  return (
    <p {...props} className={cx(className)}>
      {children}
    </p>
  );
}
function EmptyStateActions({ children }: { children: ReactNode }) {
  useSlot("EmptyState", "actions", { present: hasContent(children) });
  return <>{children}</>;
}

export function EmptyState({
  children,
  className,
  style,
  ref,
  ...props
}: ComponentPropsWithRef<"div"> & {
  children?: ReactNode;
}) {
  const composition = useComposition("EmptyState", emptyRules);
  return (
    <CompositionRoot value={composition.value}>
      <div
        {...props}
        ref={ref}
        style={style}
        className={cx("ui-empty-state", className)}
      >
        {children}
      </div>
    </CompositionRoot>
  );
}
EmptyState.Icon = EmptyStateIcon;
EmptyState.Title = EmptyStateTitle;
EmptyState.Description = EmptyStateDescription;
EmptyState.Actions = EmptyStateActions;

function ToastIcon({ children }: { children: ReactNode }) {
  useSlot("Toast", "icon", { present: hasContent(children) });
  return <>{children}</>;
}
function ToastBody({
  children,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"span">, keyof MotionProps> & {
  children: ReactNode;
}) {
  useSlot("Toast", "body", { present: hasContent(children) });
  const { reduced, transition } = useUiMotion();
  return (
    <motion.span
      {...props}
      className={cx("ui-toast-body", className)}
      layout={reduced ? false : "position"}
      transition={transition}
    >
      {children}
    </motion.span>
  );
}

export function Toast({
  open,
  children,
  onOpenChange,
  tone = "neutral",
  duration = 4200,
  closeLabel = "关闭提示",
  className,
  style,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: Omit<MotionSafeDiv, "children" | "role"> & {
  open: boolean;
  children?: ReactNode;
  onOpenChange: (open: boolean) => void;
  tone?: FeedbackTone;
  duration?: number;
  closeLabel?: string;
}) {
  const stacked = useContext(ToastPlacement);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const change = useRef(onOpenChange);
  useLayoutEffect(() => {
    change.current = onOpenChange;
  }, [onOpenChange]);
  const { reduced, enter, exit } = useUiMotion();
  const composition = useComposition("Toast", open ? toastRules : []);
  useEffect(() => {
    if (open === false) {
      setHovered(false);
      setFocused(false);
    }
  }, [open]);
  useEffect(() => {
    if (open === false || paused || duration <= 0) return;
    const timer = setTimeout(() => change.current(false), duration);
    return () => clearTimeout(timer);
  }, [open, paused, duration]);
  return (
    <CompositionRoot value={composition.value}>
      <AnimatePresence initial={false}>
        {open && (
          <PresenceSurface
            {...props}
            ref={ref}
            className={cx(
              "ui-toast",
              stacked && "ui-toast--stacked",
              `ui-tone--${tone}`,
              className,
            )}
            role={tone === "danger" ? "alert" : "status"}
            aria-live={tone === "danger" ? "assertive" : "polite"}
            initial={{ opacity: 0, y: reduced ? 0 : motionDistance.floating }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: reduced ? 0 : motionDistance.floating,
              transition: exit,
            }}
            transition={enter}
            layout={reduced ? false : true}
            style={{ borderRadius: "var(--ui-radius-card)", ...style }}
            onPointerEnter={compose(onPointerEnter, () => setHovered(true))}
            onPointerLeave={compose(onPointerLeave, () => setHovered(false))}
            onFocus={compose(onFocus, () => setFocused(true))}
            onBlur={compose(onBlur, (event) => {
              if (
                event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                ) === false
              )
                setFocused(false);
            })}
          >
            {children}
            <Button
              aria-label={closeLabel}
              emphasis="quiet"
              onClick={() => onOpenChange(false)}
              shape="square"
            >
              <Button.Icon>
                <Icon name={"close"} />
              </Button.Icon>
            </Button>
          </PresenceSurface>
        )}
      </AnimatePresence>
    </CompositionRoot>
  );
}
Toast.Icon = ToastIcon;
Toast.Body = ToastBody;

/** Layout height only. Transforms paint outside and must not open a scrollbar. */
function regionLayoutExceeds(region: HTMLElement) {
  const last = region.lastElementChild;
  if (last instanceof HTMLElement === false) return false;
  const style = getComputedStyle(region);
  const maxHeight = Number.parseFloat(style.maxHeight);
  if (Number.isFinite(maxHeight) === false) return false;
  const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
  return last.offsetTop + last.offsetHeight + paddingBottom > maxHeight + 1;
}

function useToastRegionScroll(region: RefObject<HTMLDivElement | null>) {
  const [scroll, setScroll] = useState(false);
  useLayoutEffect(() => {
    const el = region.current;
    if (el === null) return;
    const measure = () => {
      const next = regionLayoutExceeds(el);
      setScroll((current) => (current === next ? current : next));
    };
    const observer = new ResizeObserver(measure);
    const watch = () => {
      observer.disconnect();
      observer.observe(el);
      for (const child of el.children) observer.observe(child);
      measure();
    };
    watch();
    const mutations = new MutationObserver(watch);
    mutations.observe(el, { childList: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [region]);
  return scroll;
}

export function ToastRegion({
  children,
  className,
  style,
  ref,
  "aria-label": ariaLabel = "通知",
  tabIndex = 0,
  ...props
}: ComponentPropsWithRef<"div">) {
  const region = useRef<HTMLDivElement>(null);
  const scroll = useToastRegionScroll(region);
  return (
    <ToastPlacement.Provider value={true}>
      <div
        {...props}
        ref={(node) => {
          region.current = node;
          assignRef(ref, node);
        }}
        className={cx(
          "ui-toast-region ui-scroll-area",
          scroll && "ui-toast-region--scroll",
          className,
        )}
        tabIndex={tabIndex}
        style={style}
        role="region"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </ToastPlacement.Provider>
  );
}

export function Spinner({
  children,
  "aria-label": ariaLabel,
  size = "md",
  className,
  style,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<"span">, "children" | "role"> & {
  size?: "md" | "sm";
  children?: ReactNode;
  "aria-label"?: string;
}) {
  const content = children;
  const unnamed = !hasContent(content) && !ariaLabel;
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !unnamed) return;
    console.error("[uagray] Spinner 没有可见 Label 时，需要 aria-label");
  }, [unnamed]);
  return (
    <span
      {...props}
      ref={ref}
      className={cx("ui-spinner", size === "sm" && "ui-spinner--sm", className)}
      style={style}
      role="status"
      aria-label={hasContent(content) ? undefined : ariaLabel}
    >
      <span className="ui-spinner-mark" aria-hidden="true" />
      {hasContent(content) && <span>{content}</span>}
    </span>
  );
}
