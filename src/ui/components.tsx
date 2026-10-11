import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useKeyboardFocus } from "./focus";
import { Icon, IconSizeContext, type IconName } from "./icons";
import { LayoutGroup, motion, type MotionProps } from "framer-motion";
import { ChangingText, MotionButton, useUiMotion } from "./motion";
import { assignRef, compose, cx, hasContent } from "./host";
import {
  CompositionRoot,
  slotIds,
  useComposition,
  useSlot,
  type SlotRule,
} from "./composition";
type MotionSafeDiv = Omit<ComponentPropsWithRef<"div">, keyof MotionProps> & {
  style?: CSSProperties;
};
const searchShortcuts = new Set<HTMLInputElement>();
let searchShortcutListening = false;
function onSearchShortcut(event: KeyboardEvent) {
  if (
    event.key !== "/" ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.repeat ||
    event.defaultPrevented
  )
    return;
  const target = event.target instanceof Element ? event.target : null;
  if (
    target?.closest(
      'input, textarea, select, [role="combobox"], [contenteditable="true"]',
    )
  )
    return;
  const field = [...searchShortcuts].find(
    (node) => node.isConnected && !node.disabled,
  );
  if (!field) return;
  event.preventDefault();
  field.focus();
}
function ensureSearchShortcut() {
  if (searchShortcutListening) return;
  searchShortcutListening = true;
  window.addEventListener("keydown", onSearchShortcut);
}
export type ButtonEmphasis = "strong" | "default" | "quiet";
type ButtonSize = "md" | "sm";
/** @deprecated Use `"md"` or `"sm"`. */
type LegacyButtonSize = "default" | "small";
function resolveButtonSize(
  size: ButtonSize | LegacyButtonSize = "md",
): ButtonSize {
  return size === "small" || size === "sm" ? "sm" : "md";
}
type LegacyButtonVariant = "soft" | "plain" | "white" | "dark" | "danger";
const legacyButtonVariants: Record<
  LegacyButtonVariant,
  [ButtonEmphasis, "neutral" | "danger"]
> = {
  soft: ["default", "neutral"],
  white: ["default", "neutral"],
  plain: ["quiet", "neutral"],
  dark: ["strong", "neutral"],
  danger: ["strong", "danger"],
};
const buttonRules: readonly SlotRule[] = [
  { name: "icon", min: 0, max: 1 },
  { name: "label", min: 0, max: 1 },
  { name: "count", min: 0, max: 1 },
];
const ButtonContentContext = createContext({ busy: false });
function ButtonIcon({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("Button", "icon", { present: hasContent(children) });
  const { busy } = useContext(ButtonContentContext);
  return (
    <span
      {...props}
      className={cx("ui-button-icon", className)}
      aria-hidden="true"
    >
      {busy ? <span className="ui-spinner-mark" /> : children}
    </span>
  );
}
function ButtonLabel({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span">) {
  useSlot("Button", "label", { present: hasContent(children) });
  return (
    <span {...props} className={cx("ui-button-label", className)}>
      <ChangingText>{children}</ChangingText>
    </span>
  );
}
function ButtonCount({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span">) {
  useSlot("Button", "count", { present: hasContent(children) });
  return (
    <span {...props} className={cx("ui-button-count", className)}>
      {children}
    </span>
  );
}
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  size?: ButtonSize | LegacyButtonSize;
  shape?: "inline" | "square";
  emphasis?: ButtonEmphasis;
  tone?: "neutral" | "danger";
  busy?: boolean;
  /** @deprecated Use emphasis and tone. */
  variant?: LegacyButtonVariant;
};
export function Button({
  size = "md",
  shape,
  emphasis,
  tone,
  variant,
  busy = false,
  className,
  children,
  type = "button",
  disabled,
  onClick,
  ref,
  ...props
}: ButtonProps) {
  const { reduced, transition } = useUiMotion();
  const legacy = variant ? legacyButtonVariants[variant] : undefined;
  const resolvedEmphasis = emphasis ?? legacy?.[0] ?? "default";
  const resolvedTone = tone ?? legacy?.[1] ?? "neutral";
  const resolvedSize = resolveButtonSize(size);
  const shorthand =
    typeof children === "string" || typeof children === "number";
  const composition = useComposition("Button", buttonRules, (slots) => {
    const label = slots.some((s) => s.slot === "label" && s.present);
    const icon = slots.some((s) => s.slot === "icon" && s.present);
    const messages: string[] = [];
    if (!label && !icon) messages.push("[uagray] Button 需要 Label 或 Icon");
    if (!label && !props["aria-label"] && !props["aria-labelledby"])
      messages.push("[uagray] 纯图标 Button 需要名称");
    if (!label && slots.some((s) => s.slot === "count"))
      messages.push("[uagray] Button.Count 需要 Label");
    return messages;
  });
  const inheritedSize = useContext(IconSizeContext);
  const iconSize = Math.min(
    resolvedSize === "sm" ? 13 : 15,
    inheritedSize?.max ?? Infinity,
  );
  const hasIcon = composition.registrations.some((s) => s.slot === "icon");
  const content = shorthand ? <ButtonLabel>{children}</ButtonLabel> : children;
  return (
    <CompositionRoot value={composition.value}>
      <IconSizeContext.Provider value={{ size: iconSize, max: iconSize }}>
        <ButtonContentContext.Provider value={{ busy }}>
          <MotionButton
            ref={ref}
            layout={reduced ? false : true}
            transition={transition}
            style={{ borderRadius: "var(--ui-button-radius)" }}
            nativeProps={{
              ...props,
              type,
              disabled,
              "aria-busy": busy || undefined,
              "aria-disabled": disabled || busy || props["aria-disabled"],
              onClick: (event) => {
                if (
                  disabled ||
                  busy ||
                  props["aria-disabled"] === true ||
                  props["aria-disabled"] === "true"
                ) {
                  event.preventDefault();
                  return;
                }
                onClick?.(event);
              },
              className: cx(
                "ui-button",
                "ui-pressable",
                `ui-button--${resolvedSize}`,
                (shape === "square" ||
                  (!shape &&
                    hasIcon &&
                    !composition.registrations.some(
                      (s) => s.slot === "label",
                    ))) &&
                  "ui-icon-button",
                resolvedEmphasis !== "default" &&
                  `ui-button--${resolvedEmphasis}`,
                resolvedTone === "danger" && "ui-button--danger",
                className,
              ),
            }}
          >
            <motion.span
              className="ui-button-content"
              layout={reduced ? false : "position"}
              transition={transition}
            >
              {busy && !hasIcon && (
                <span className="ui-spinner-mark" aria-hidden="true" />
              )}
              {content}
            </motion.span>
          </MotionButton>
        </ButtonContentContext.Provider>
      </IconSizeContext.Provider>
    </CompositionRoot>
  );
}
Button.Icon = ButtonIcon;
Button.Label = ButtonLabel;
Button.Count = ButtonCount;
type IconButtonProps = Omit<ButtonProps, "children" | "aria-label"> & {
  icon: IconName;
} & (
    | {
        "aria-label": string;
        /** @deprecated Use `aria-label`. */
        label?: string;
      }
    | {
        "aria-label"?: undefined;
        /** @deprecated Use `aria-label`. */
        label: string;
      }
  );
/** @deprecated Use Button with Button.Icon and shape="square". */
export function IconButton({
  "aria-label": ariaLabel,
  label,
  icon,
  ...props
}: IconButtonProps) {
  const name = ariaLabel ?? label;
  return (
    <Button
      {...props}
      shape="square"
      aria-label={name}
      title={props.title ?? name}
      className={props.className}
    >
      <Button.Icon>
        <Icon name={icon} />
      </Button.Icon>
    </Button>
  );
}
type GroupVariant = "contained" | "plain";
/** @deprecated Use `variant`. `soft` maps to `contained`. */
type LegacyGroupTone = "soft" | "plain";
function resolveGroupVariant(
  variant: GroupVariant | undefined,
  tone: LegacyGroupTone | undefined,
  fallback: GroupVariant,
): GroupVariant {
  if (variant) return variant;
  if (tone === "plain") return "plain";
  if (tone === "soft") return "contained";
  return fallback;
}
type ButtonGroupProps = Omit<MotionSafeDiv, "aria-label"> & {
  children: ReactNode;
  variant?: GroupVariant;
  /** @deprecated Use `variant`. `soft` maps to `contained`. */
  tone?: LegacyGroupTone;
} & (
    | {
        "aria-label": string;
        /** @deprecated Use `aria-label`. */
        label?: string;
      }
    | {
        "aria-label"?: undefined;
        /** @deprecated Use `aria-label`. */
        label: string;
      }
  );
export function ButtonGroup({
  "aria-label": ariaLabel,
  label,
  children,
  variant,
  tone,
  className,
  style,
  ref,
  ...props
}: ButtonGroupProps) {
  const { reduced, transition } = useUiMotion();
  const groupRef = useRef<HTMLDivElement>(null);
  const [controlHeight, setControlHeight] = useState<number>();
  const setGroupRef = useCallback(
    (node: HTMLDivElement | null) => {
      groupRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );
  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    const measure = () => {
      const css = getComputedStyle(node);
      const height =
        node.getBoundingClientRect().height || parseFloat(css.height);
      const inset =
        (parseFloat(css.paddingTop) || 0) +
        (parseFloat(css.paddingBottom) || 0) +
        (parseFloat(css.borderTopWidth) || 0) +
        (parseFloat(css.borderBottomWidth) || 0);
      setControlHeight(height > inset ? height - inset : undefined);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [variant, tone, style]);
  const iconLimit =
    controlHeight === undefined ? undefined : controlHeight * 0.5;
  const inherited = useContext(IconSizeContext);
  const limit = Math.min(iconLimit ?? Infinity, inherited?.max ?? Infinity);
  const name = ariaLabel ?? label;
  const resolved = resolveGroupVariant(variant, tone, "contained");
  return (
    <LayoutGroup>
      <motion.div
        {...props}
        ref={setGroupRef}
        role="group"
        aria-label={name}
        className={cx(
          "ui-button-group",
          `ui-button-group--${resolved}`,
          className,
        )}
        layout={reduced ? false : true}
        transition={transition}
        style={
          {
            borderRadius: "var(--ui-group-radius)",
            ...style,
            ...(controlHeight === undefined
              ? {}
              : { "--ui-group-child-height": `${controlHeight}px` }),
          } as CSSProperties
        }
      >
        <IconSizeContext.Provider
          value={{ size: Math.min(15, limit), max: limit }}
        >
          {children}
        </IconSizeContext.Provider>
      </motion.div>
    </LayoutGroup>
  );
}
export function Keycap({
  children,
  className,
  style,
  ref,
  ...props
}: ComponentPropsWithRef<"kbd">) {
  return (
    <kbd
      {...props}
      ref={ref}
      className={cx("ui-keycap", className)}
      style={style}
    >
      {children}
    </kbd>
  );
}
type ValueChangeProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. */
  onChange?: (value: string) => void;
};
type RequiredAriaLabel =
  | {
      "aria-label": string;
      /** @deprecated Use `aria-label`. */
      label?: string;
    }
  | {
      "aria-label"?: undefined;
      /** @deprecated Use `aria-label`. */
      label: string;
    };
function emitValue(
  next: string,
  onValueChange?: (value: string) => void,
  onChange?: (value: string) => void,
) {
  if (onValueChange) onValueChange(next);
  else onChange?.(next);
}
export function SearchField({
  "aria-label": ariaLabel,
  label,
  value,
  defaultValue,
  onValueChange,
  onChange,
  placeholder,
  shortcut = false,
  className,
  style,
  ref: hostRef,
  onKeyDown,
  ...props
}: {
  placeholder?: string;
  shortcut?: boolean;
} & ValueChangeProps &
  RequiredAriaLabel &
  Omit<
    ComponentPropsWithRef<"input">,
    "value" | "defaultValue" | "onChange" | "size" | "type"
  >) {
  const name = ariaLabel ?? label;
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = value !== undefined ? value : uncontrolled;
  const commit = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    emitValue(next, onValueChange, onChange);
  };
  const { reduced, transition } = useUiMotion();
  const keyboard = useKeyboardFocus();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!shortcut || !node) return;
    searchShortcuts.add(node);
    ensureSearchShortcut();
    return () => {
      searchShortcuts.delete(node);
    };
  }, [shortcut]);
  return (
    <motion.label
      layout={reduced ? false : true}
      transition={transition}
      className={cx("ui-search", className)}
      data-keyboard-focus={keyboard || undefined}
      style={{ borderRadius: "var(--ui-radius-control)", ...style }}
    >
      <Icon name="search" size={15} />
      <input
        {...props}
        type="search"
        ref={(node) => {
          ref.current = node;
          assignRef(hostRef, node);
        }}
        aria-label={name}
        value={current}
        placeholder={placeholder}
        onChange={(e) => commit(e.target.value)}
        onKeyDown={compose(onKeyDown, (e) => {
          if (e.key === "Escape" && !e.defaultPrevented) {
            e.preventDefault();
            commit("");
          }
        })}
      />
      {shortcut && <Keycap>/</Keycap>}
    </motion.label>
  );
}
export type ExternalLinksItemProps = ComponentPropsWithRef<"a"> & {
  href: string;
  children: ReactNode;
};
const linkItemRules: readonly SlotRule[] = [
  { name: "label", min: 1, max: 1 },
  { name: "icon", min: 0, max: 1 },
];
const linkRules: readonly SlotRule[] = [
  { name: "item", min: 0, max: Number.POSITIVE_INFINITY },
];
function ExternalLinksItem({
  children,
  className,
  href,
  ...props
}: ExternalLinksItemProps) {
  const composition = useComposition("ExternalLinks.Item", linkItemRules);
  useSlot("ExternalLinks", "item", { present: hasContent(children) });
  return (
    <CompositionRoot value={composition.value}>
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cx("ui-external ui-pressable", className)}
      >
        {children}
      </a>
    </CompositionRoot>
  );
}
function ExternalLinksLabel({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("ExternalLinks.Item", "label", { present: hasContent(children) });
  return (
    <span {...props} className={cx(className)}>
      {children}
    </span>
  );
}
function ExternalLinksIcon({ children }: { children: ReactNode }) {
  useSlot("ExternalLinks.Item", "icon", { present: hasContent(children) });
  return <span className="ui-external-icon">{children}</span>;
}
export function ExternalLinks({
  children,
  className,
  style,
  ref,
  "aria-label": ariaLabel = "外部链接",
  ...props
}: Omit<ComponentPropsWithRef<"nav">, "children"> & {
  children?: ReactNode;
}) {
  const composition = useComposition("ExternalLinks", linkRules);
  return (
    <CompositionRoot value={composition.value}>
      <nav
        {...props}
        ref={ref}
        className={cx("ui-external-links", className)}
        style={style}
        aria-label={ariaLabel}
      >
        {children}
      </nav>
    </CompositionRoot>
  );
}
ExternalLinks.Item = ExternalLinksItem;
ExternalLinks.Label = ExternalLinksLabel;
ExternalLinks.Icon = ExternalLinksIcon;
type SurfaceVariant = "soft" | "raised";
export type SurfaceProps = ComponentPropsWithRef<"div"> & {
  variant?: SurfaceVariant;
  /** @deprecated Use `variant`. */
  tone?: SurfaceVariant;
  treatment?: "tonal" | "defined" | "physical";
};
export function Surface({
  children,
  className,
  variant,
  tone,
  treatment = "tonal",
  ...props
}: SurfaceProps) {
  const surface = variant ?? tone ?? "soft";
  return (
    <div
      {...props}
      className={cx(
        "ui-surface",
        surface === "raised" && "ui-surface--raised",
        `ui-surface--${treatment}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
const showcaseRules: readonly SlotRule[] = [
  { name: "title", min: 1, max: 1 },
  { name: "description", min: 0, max: 1 },
  { name: "media", min: 1, max: 1 },
  { name: "external", min: 0, max: 1 },
];
const ShowcaseContext = createContext<{
  href: string;
  titleId?: string;
  descriptionId?: string;
  baseId: string;
} | null>(null);
function ShowcaseTitle({
  children,
  id: suppliedId,
  className,
  ...props
}: ComponentPropsWithRef<"div"> & { children: ReactNode }) {
  const context = useContext(ShowcaseContext);
  const id = suppliedId ?? `${context?.baseId}-title`;
  useSlot("ShowcaseCard", "title", { id, present: hasContent(children) });
  return (
    <div {...props} className={cx("ui-showcase-caption", className)} id={id}>
      {children}
    </div>
  );
}
function ShowcaseDescription({
  children,
  id: suppliedId,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  const context = useContext(ShowcaseContext);
  const id = suppliedId ?? `${context?.baseId}-description`;
  useSlot("ShowcaseCard", "description", { id, present: hasContent(children) });
  return hasContent(children) ? (
    <span {...props} className={cx("ui-sr-only", className)} id={id}>
      {children}
    </span>
  ) : null;
}
function ShowcaseMedia({
  children,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"a">, "href"> & { children: ReactNode }) {
  const context = useContext(ShowcaseContext);
  useSlot("ShowcaseCard", "media", { present: hasContent(children) });
  const description =
    [props["aria-describedby"], context?.descriptionId]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <a
      {...props}
      className={cx("ui-showcase-link", className)}
      href={context?.href}
      aria-labelledby={
        props["aria-labelledby"] ??
        (props["aria-label"] ? undefined : context?.titleId)
      }
      aria-describedby={description}
    >
      <div className="ui-showcase-art">{children}</div>
    </a>
  );
}
function ShowcaseExternal({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"a"> & { href: string }) {
  useSlot("ShowcaseCard", "external", { present: hasContent(children) });
  return (
    <a
      {...props}
      target={props.target ?? "_blank"}
      rel={props.rel ?? "noopener noreferrer"}
      className={cx("ui-showcase-external ui-pressable", className)}
    >
      {children}
      <Icon name="external-link" />
    </a>
  );
}
export function ShowcaseCard({
  href,
  children,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"div">, "children" | "title"> & {
  href: string;
  children: ReactNode;
}) {
  const id = useId();
  const composition = useComposition("ShowcaseCard", showcaseRules);
  const external = composition.registrations.some((s) => s.slot === "external");
  const titleId = slotIds(
    composition.registrations.filter((s) => s.present),
    "title",
  )[0];
  const descriptionId = slotIds(
    composition.registrations.filter((s) => s.present),
    "description",
  )[0];
  return (
    <CompositionRoot value={composition.value}>
      <ShowcaseContext.Provider
        value={{ href, baseId: id, titleId, descriptionId }}
      >
        <div
          {...props}
          className={cx(
            "ui-showcase",
            external && "ui-showcase--external",
            className,
          )}
        >
          {children}
        </div>
      </ShowcaseContext.Provider>
    </CompositionRoot>
  );
}
ShowcaseCard.Title = ShowcaseTitle;
ShowcaseCard.Description = ShowcaseDescription;
ShowcaseCard.Media = ShowcaseMedia;
ShowcaseCard.ExternalLink = ShowcaseExternal;
type CopyState = "idle" | "pending" | "success" | "error";
const CopyContext = createContext<{
  state: CopyState;
  host: HTMLSpanElement | null;
}>({ state: "idle", host: null });
const copyRules: readonly SlotRule[] = [
  { name: "feedback-pending", min: 0, max: 1 },
  { name: "feedback-success", min: 0, max: 1 },
  { name: "feedback-error", min: 0, max: 1 },
];
function CopyFeedback({
  state,
  children,
  ...props
}: ComponentPropsWithRef<"span"> & {
  state: Exclude<CopyState, "idle">;
  children: ReactNode;
}) {
  useSlot("CopyButton", `feedback-${state}`, { present: hasContent(children) });
  const current = useContext(CopyContext);
  return current.host
    ? createPortal(
        <span {...props}>{current.state === state ? children : null}</span>,
        current.host,
      )
    : null;
}
export type CopyButtonProps = Omit<ButtonProps, "children"> & {
  text: string;
  children: ReactNode;
};
export function CopyButton({
  text,
  children,
  size = "sm",
  disabled,
  onClick,
  busy,
  className,
  ...props
}: CopyButtonProps) {
  const [status, setStatus] = useState<CopyState>("idle");
  const [feedbackHost, setFeedbackHost] = useState<HTMLSpanElement | null>(
    null,
  );
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  const composition = useComposition("CopyButton", copyRules);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  async function copy() {
    if (inFlight.current) return;
    inFlight.current = true;
    clearTimeout(timer.current);
    setStatus("pending");
    try {
      await navigator.clipboard.writeText(text);
      if (mounted.current) setStatus("success");
    } catch {
      if (mounted.current) setStatus("error");
    } finally {
      inFlight.current = false;
    }
    if (mounted.current)
      timer.current = setTimeout(() => setStatus("idle"), 2200);
  }
  const custom = composition.registrations.some(
    (s) => s.slot === `feedback-${status}`,
  );
  return (
    <CompositionRoot value={composition.value}>
      <CopyContext.Provider value={{ state: status, host: feedbackHost }}>
        <Button
          {...props}
          size={size}
          disabled={disabled}
          busy={busy || status === "pending"}
          onClick={compose(onClick, (event) => {
            if (!event.defaultPrevented) void copy();
          })}
          className={cx("ui-copy", className)}
        >
          {children}
        </Button>
        <div className="ui-sr-only" role="status" aria-live="polite">
          <span>
            {!custom
              ? status === "success"
                ? "已复制"
                : status === "error"
                  ? "复制失败"
                  : status === "pending"
                    ? "正在复制"
                    : ""
              : null}
          </span>
          <span ref={setFeedbackHost} />
        </div>
      </CopyContext.Provider>
    </CompositionRoot>
  );
}
CopyButton.Icon = ButtonIcon;
CopyButton.Label = ButtonLabel;
CopyButton.Count = ButtonCount;
CopyButton.Feedback = CopyFeedback;
export function ShareButton({
  url,
  ...props
}: Omit<CopyButtonProps, "text"> & { url: string }) {
  return <CopyButton {...props} text={url} />;
}
ShareButton.Icon = ButtonIcon;
ShareButton.Label = ButtonLabel;
ShareButton.Count = ButtonCount;
ShareButton.Feedback = CopyFeedback;

const codeRules: readonly SlotRule[] = [
  { name: "body", min: 1, max: 1 },
  { name: "copy", min: 0, max: 1 },
  { name: "expand", min: 0, max: 1 },
  { name: "collapse", min: 0, max: 1 },
];
const CodeContext = createContext<{
  code: string;
  expanded: boolean;
  overflowing: boolean;
  height: number;
  collapsedHeight: number;
  id: string;
  requestFocus: () => void;
  setCode: (code: string) => void;
  setHeight: (height: number) => void;
  setExpanded: (expanded: boolean) => void;
} | null>(null);
function useCode() {
  const value = useContext(CodeContext);
  if (!value) throw new Error("ExpandableCode 子组件需要根组件");
  return value;
}
function CodeBody({
  children,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<"pre">, "children"> & { children: string }) {
  useSlot("ExpandableCode", "body", { present: hasContent(children) });
  const context = useCode();
  const content = useRef<HTMLPreElement>(null);
  const { enter, exit } = useUiMotion();
  const { setCode, setHeight, collapsedHeight } = context;
  useLayoutEffect(() => {
    setCode(children);
  }, [children, setCode]);
  useLayoutEffect(() => {
    const update = () =>
      setHeight(content.current?.scrollHeight ?? collapsedHeight);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  }, [children, collapsedHeight, setHeight]);
  return (
    <motion.div
      id={context.id}
      className="ui-code-content"
      tabIndex={-1}
      initial={false}
      animate={{
        height: context.overflowing
          ? context.expanded
            ? context.height
            : collapsedHeight
          : "auto",
      }}
      transition={context.expanded ? enter : exit}
    >
      <pre
        {...props}
        ref={(node) => {
          content.current = node;
          assignRef(ref, node);
        }}
      >
        {children}
      </pre>
      {context.overflowing && !context.expanded && (
        <div className="ui-code-fade" aria-hidden="true" />
      )}
    </motion.div>
  );
}
function CodeCopy({ children, ...props }: Omit<CopyButtonProps, "text">) {
  useSlot("ExpandableCode", "copy", { present: hasContent(children) });
  const { code } = useCode();
  return (
    <div className="ui-code-copy">
      <CopyButton emphasis="quiet" {...props} text={code}>
        {children}
      </CopyButton>
    </div>
  );
}
function CodeAction({
  children,
  expand,
  onClick,
  ...props
}: ButtonProps & { expand: boolean }) {
  const context = useCode();
  useSlot("ExpandableCode", expand ? "expand" : "collapse", {
    present: hasContent(children),
  });
  if (
    !hasContent(children) ||
    !context.overflowing ||
    context.expanded === expand
  )
    return null;
  return (
    <div className="ui-code-toggle">
      <Button
        size="sm"
        emphasis="quiet"
        {...props}
        aria-expanded={context.expanded}
        aria-controls={context.id}
        onClick={compose(onClick, (event) => {
          if (!event.defaultPrevented) {
            context.requestFocus();
            context.setExpanded(expand);
          }
        })}
      >
        {typeof children === "string" || typeof children === "number" ? (
          <Button.Label>{children}</Button.Label>
        ) : (
          children
        )}
        <span aria-hidden="true">
          <Icon
            name="chevron-down"
            className={cx("ui-chevron", context.expanded && "ui-chevron--up")}
          />
        </span>
      </Button>
    </div>
  );
}
function CodeExpand(props: ButtonProps) {
  return <CodeAction {...props} expand />;
}
function CodeCollapse(props: ButtonProps) {
  return <CodeAction {...props} expand={false} />;
}
export function ExpandableCode({
  children,
  collapsedHeight = 210,
  className,
  ref,
  "aria-label": ariaLabel = "可展开文本",
  ...props
}: Omit<ComponentPropsWithRef<"section">, "children" | "onChange"> & {
  children: ReactNode;
  collapsedHeight?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState("");
  const [height, setHeight] = useState(0);
  const id = useId();
  const composition = useComposition("ExpandableCode", codeRules);
  const section = useRef<HTMLElement>(null);
  const focusRequested = useRef(false);
  useLayoutEffect(() => {
    if (!focusRequested.current) return;
    focusRequested.current = false;
    const target = section.current?.querySelector<HTMLElement>(
      ".ui-code-toggle button, .ui-code-content",
    );
    const action = section.current?.querySelector<HTMLButtonElement>(
      ".ui-code-toggle button",
    );
    (action ?? target)?.focus();
  }, [expanded]);
  return (
    <CompositionRoot value={composition.value}>
      <CodeContext.Provider
        value={{
          code,
          setCode,
          expanded,
          setExpanded,
          height,
          setHeight,
          collapsedHeight,
          id,
          overflowing: height > collapsedHeight + 1,
          requestFocus: () => {
            focusRequested.current = true;
          },
        }}
      >
        <section
          {...props}
          ref={(node) => {
            section.current = node;
            assignRef(ref, node);
          }}
          className={cx("ui-code", className)}
          aria-label={ariaLabel}
        >
          {children}
        </section>
      </CodeContext.Provider>
    </CompositionRoot>
  );
}
ExpandableCode.Body = CodeBody;
ExpandableCode.CopyAction = CodeCopy;
ExpandableCode.ExpandAction = CodeExpand;
ExpandableCode.CollapseAction = CodeCollapse;
export type NavigationItem = { title: string; href: string };
const pagerRules: readonly SlotRule[] = [
  { name: "previous", min: 0, max: 1 },
  { name: "next", min: 0, max: 1 },
];
function PagerLink({
  direction,
  children,
  href,
  className,
  ...props
}: ComponentPropsWithRef<"a"> & { direction: "previous" | "next" }) {
  useSlot("Pager", direction, { present: hasContent(children) });
  const icon = direction === "previous" ? "chevron-left" : "chevron-right";
  const label = direction === "previous" ? "上一页" : "下一页";
  if (!href)
    return (
      <Button shape="square" disabled aria-label={`${label}不可用`}>
        <Button.Icon>
          <Icon name={icon} />
        </Button.Icon>
      </Button>
    );
  return (
    <a
      {...props}
      href={href}
      className={cx("ui-icon-button ui-external ui-pressable", className)}
    >
      <Icon name={icon} size={16} />
      <span className="ui-sr-only">
        {label}：{children}
      </span>
    </a>
  );
}
function PagerPrevious(props: ComponentPropsWithRef<"a">) {
  return <PagerLink {...props} direction="previous" />;
}
function PagerNext(props: ComponentPropsWithRef<"a">) {
  return <PagerLink {...props} direction="next" />;
}
export function Pager({
  variant = "contained",
  children,
  className,
  "aria-label": ariaLabel = "页面导航",
  ...props
}: ComponentPropsWithRef<"nav"> & { variant?: GroupVariant }) {
  const composition = useComposition("Pager", pagerRules);
  return (
    <CompositionRoot value={composition.value}>
      <nav
        {...props}
        aria-label={ariaLabel}
        className={cx(
          "ui-button-group ui-pager",
          `ui-button-group--${variant}`,
          className,
        )}
      >
        {children}
      </nav>
    </CompositionRoot>
  );
}
Pager.Previous = PagerPrevious;
Pager.Next = PagerNext;
const navigationRules: readonly SlotRule[] = [
  { name: "title", min: 1, max: 1 },
  { name: "description", min: 0, max: 1 },
];
export type NavigationCardProps = Omit<
  ComponentPropsWithRef<"a">,
  "children" | "href" | "title"
> &
  Omit<NavigationItem, "title"> & {
    direction: "previous" | "next";
    children?: ReactNode;
  };
function NavigationCardTitle({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("NavigationCard", "title", { present: hasContent(children) });
  return (
    <span {...props} className={cx("ui-navigation-title", className)}>
      {children}
    </span>
  );
}
function NavigationCardDescription({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("NavigationCard", "description", { present: hasContent(children) });
  return (
    <span {...props} className={cx("ui-navigation-label", className)}>
      {children}
    </span>
  );
}
export function NavigationCard({
  direction,
  children,
  href,
  className,
  style,
  ref,
  ...props
}: NavigationCardProps) {
  const composition = useComposition("NavigationCard", navigationRules);
  return (
    <CompositionRoot value={composition.value}>
      <a
        {...props}
        ref={ref}
        className={cx(
          "ui-navigation-card",
          direction === "next" && "ui-navigation-card--next",
          className,
        )}
        style={style}
        href={href}
      >
        <Icon
          name={direction === "previous" ? "chevron-left" : "chevron-right"}
          size={16}
        />
        <span className="ui-navigation-copy">{children}</span>
      </a>
    </CompositionRoot>
  );
}
NavigationCard.Title = NavigationCardTitle;
NavigationCard.Description = NavigationCardDescription;
const PageShellContext = createContext<{
  mainId: string;
  mainAs: "main" | "div";
} | null>(null);
const shellRules: readonly SlotRule[] = [
  { name: "header", min: 0, max: 1 },
  { name: "body", min: 1, max: 1 },
  { name: "footer", min: 0, max: 1 },
];
function PageShellHeader({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"header"> & { children: ReactNode }) {
  useSlot("PageShell", "header", { present: hasContent(children) });
  return (
    <header {...props} className={cx("ui-header", className)}>
      <div className="ui-header-inner">{children}</div>
    </header>
  );
}
function PageShellBody({
  children,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"main">, "ref"> & { children: ReactNode }) {
  useSlot("PageShell", "body", { present: hasContent(children) });
  const context = useContext(PageShellContext);
  const Main = context?.mainAs ?? "main";
  return (
    <Main
      {...props}
      id={context?.mainId ?? "main"}
      tabIndex={-1}
      className={cx("ui-main", className)}
    >
      {children}
    </Main>
  );
}
function PageShellFooter({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"footer"> & { children: ReactNode }) {
  useSlot("PageShell", "footer", { present: hasContent(children) });
  return (
    <footer {...props} className={cx("ui-footer", className)}>
      {children}
    </footer>
  );
}
export function PageShell({
  children,
  className,
  style,
  ref,
  mainId = "main",
  mainAs = "main",
  ...props
}: Omit<ComponentPropsWithRef<"div">, "children"> & {
  children: ReactNode;
  mainId?: string;
  mainAs?: "main" | "div";
}) {
  const composition = useComposition("PageShell", shellRules);
  return (
    <CompositionRoot value={composition.value}>
      <PageShellContext.Provider value={{ mainId, mainAs }}>
        <div
          {...props}
          ref={ref}
          className={cx("ui-page", className)}
          style={style}
        >
          <a className="ui-skip" href={`#${mainId}`}>
            跳到主要内容
          </a>
          {children}
        </div>
      </PageShellContext.Provider>
    </CompositionRoot>
  );
}
PageShell.Header = PageShellHeader;
PageShell.Body = PageShellBody;
PageShell.Footer = PageShellFooter;
/** Coordinate independent actions with complete group surfaces. */
export function ActionRow({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return (
    <div {...props} className={cx("ui-action-row", className)}>
      {children}
    </div>
  );
}
