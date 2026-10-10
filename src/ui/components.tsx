import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { useKeyboardFocus } from "./focus";
import { Icon, type IconName } from "./icons";
import { LayoutGroup, motion, type MotionProps } from "framer-motion";
import { MotionButton, useUiMotion } from "./motion";
import {
  SelectionIndicator,
  useSelectionIndicator,
} from "./selection-indicator";

const cx = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");
type MotionSafeDiv = Omit<ComponentPropsWithRef<"div">, keyof MotionProps> & {
  style?: CSSProperties;
};
function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
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
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  icon?: IconName;
  count?: number;
  /** `"md"` or `"sm"`. `"default"` and `"small"` are deprecated aliases. */
  size?: ButtonSize | LegacyButtonSize;
  /** Importance of the action. Its fill comes from the surrounding surface. */
  emphasis?: ButtonEmphasis;
  tone?: "neutral" | "danger";
  /** @deprecated Use `emphasis` and `tone`. */
  variant?: LegacyButtonVariant;
};
export function Button({
  icon,
  count,
  size = "md",
  emphasis,
  tone,
  variant,
  className,
  children,
  type = "button",
  ref,
  ...props
}: ButtonProps) {
  const { reduced, transition } = useUiMotion();
  const legacy = variant ? legacyButtonVariants[variant] : undefined;
  const resolvedEmphasis = emphasis ?? legacy?.[0] ?? "default";
  const resolvedTone = tone ?? legacy?.[1] ?? "neutral";
  const resolvedSize = resolveButtonSize(size);
  return (
    <MotionButton
      ref={ref}
      layout={reduced ? false : true}
      transition={transition}
      style={{ borderRadius: "var(--ui-button-radius)" }}
      nativeProps={{
        ...props,
        type,
        className: cx(
          "ui-button",
          `ui-button--${resolvedSize}`,
          resolvedEmphasis !== "default" && `ui-button--${resolvedEmphasis}`,
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
        {icon && <Icon name={icon} size={15} />} {children}
        {count !== undefined && (
          <span className="ui-button-count">{count}</span>
        )}
      </motion.span>
    </MotionButton>
  );
}
type IconButtonProps = Omit<ButtonProps, "children" | "icon" | "aria-label"> & {
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
      icon={icon}
      aria-label={name}
      title={name}
      className={cx("ui-icon-button", props.className)}
    />
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
  const name = ariaLabel ?? label;
  const resolved = resolveGroupVariant(variant, tone, "contained");
  return (
    <LayoutGroup>
      <motion.div
        {...props}
        ref={ref}
        role="group"
        aria-label={name}
        className={cx(
          "ui-button-group",
          `ui-button-group--${resolved}`,
          className,
        )}
        layout={reduced ? false : true}
        transition={transition}
        style={{ borderRadius: "var(--ui-group-radius)", ...style }}
      >
        {children}
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
export type SegmentOption = {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
};
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
export function SegmentedControl({
  "aria-label": ariaLabel,
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  onChange,
}: {
  options: SegmentOption[];
} & ValueChangeProps &
  RequiredAriaLabel) {
  const name = ariaLabel ?? label;
  const [uncontrolled, setUncontrolled] = useState(
    () =>
      defaultValue ?? options.find((option) => !option.disabled)?.value ?? "",
  );
  const selected = value !== undefined ? value : uncontrolled;
  const select = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    emitValue(next, onValueChange, onChange);
  };
  const { reduced, transition } = useUiMotion();
  const activeIndex = options.findIndex(
    (option) => option.value === selected && !option.disabled,
  );
  const { ref: group, bounds } = useSelectionIndicator(
    selected,
    activeIndex,
    options,
  );
  const tabIndex =
    activeIndex >= 0
      ? activeIndex
      : options.findIndex((option) => !option.disabled);
  return (
    <motion.div
      layout={reduced ? false : true}
      transition={transition}
      style={{ borderRadius: "var(--ui-selection-radius)" }}
      className="ui-segments ui-selection-track"
      role="radiogroup"
      aria-label={name}
      ref={group}
    >
      <SelectionIndicator bounds={bounds} />
      {options.map((option, index) => (
        <motion.button
          layout={reduced ? false : true}
          transition={transition}
          type="button"
          key={option.value}
          role="radio"
          aria-checked={selected === option.value}
          disabled={option.disabled}
          tabIndex={index === tabIndex ? 0 : -1}
          onClick={() => {
            if (option.value !== selected) select(option.value);
          }}
          onKeyDown={(event) => {
            const enabled = options
              .map((item, i) => (item.disabled ? -1 : i))
              .filter((i) => i >= 0);
            const position = enabled.indexOf(index);
            const direction = ["ArrowRight", "ArrowDown"].includes(event.key)
              ? 1
              : ["ArrowLeft", "ArrowUp"].includes(event.key)
                ? -1
                : 0;
            if (!direction && event.key !== "Home" && event.key !== "End")
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? enabled[0]
                : event.key === "End"
                  ? enabled.at(-1)!
                  : enabled[
                      (position + direction + enabled.length) % enabled.length
                    ];
            select(options[next].value);
            group.current
              ?.querySelectorAll<HTMLButtonElement>("button")
              [next]?.focus();
          }}
        >
          <motion.span
            layout={reduced ? false : "position"}
            transition={transition}
          >
            {option.label}
          </motion.span>
          {option.count !== undefined && (
            <motion.span
              className="ui-count"
              layout={reduced ? false : "position"}
              transition={transition}
            >
              {option.count}
            </motion.span>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
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
}: {
  placeholder?: string;
  shortcut?: boolean;
} & ValueChangeProps &
  RequiredAriaLabel) {
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
    if (!shortcut) return;
    const handle = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        target?.closest(
          'input, textarea, select, [role="combobox"], [contenteditable="true"]',
        )
      )
        return;
      event.preventDefault();
      ref.current?.focus();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [shortcut]);
  return (
    <motion.label
      layout={reduced ? false : true}
      transition={transition}
      className="ui-search"
      data-keyboard-focus={keyboard || undefined}
      style={{ borderRadius: "var(--ui-radius-control)" }}
    >
      <Icon name="search" size={15} />
      <input
        type="search"
        ref={ref}
        aria-label={name}
        value={current}
        placeholder={placeholder}
        onChange={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            commit("");
          }
        }}
      />
      {shortcut && <Keycap>/</Keycap>}
    </motion.label>
  );
}
export function ExternalLinks({
  links,
  className,
  style,
  ref,
  "aria-label": ariaLabel = "外部链接",
  ...props
}: Omit<ComponentPropsWithRef<"nav">, "children"> & {
  links: { label: string; href: string; icon: IconName }[];
}) {
  return (
    <nav
      {...props}
      ref={ref}
      className={cx(
        "ui-external-links",
        links.length > 1 && "ui-button-group ui-button-group--contained",
        className,
      )}
      style={style}
      aria-label={ariaLabel}
    >
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="ui-icon-button ui-external"
          aria-label={link.label}
          title={link.label}
        >
          <Icon name={link.icon} size={16} />
        </a>
      ))}
    </nav>
  );
}
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
export function ShowcaseCard({
  title,
  description,
  href,
  children,
  externalLink,
  className,
  style,
  ref,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, "title" | "children"> & {
  title: string;
  description?: string;
  href: string;
  children: ReactNode;
  externalLink?: { href: string; label: string };
  ref?: Ref<HTMLElement>;
}) {
  const art = (
    <div className="ui-showcase-art" aria-hidden="true">
      {children}
    </div>
  );
  if (externalLink) {
    return (
      <div
        {...props}
        ref={(node) => setRef(ref, node)}
        className={cx("ui-showcase ui-showcase--external", className)}
        style={style}
      >
        <a
          className="ui-showcase-link"
          href={href}
          aria-label={description ? `${title}：${description}` : title}
        >
          {art}
        </a>
        <a
          className="ui-showcase-external"
          href={externalLink.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {externalLink.label}
          <Icon name="arrow" size={13} />
          <span className="ui-sr-only">（在新标签页打开）</span>
        </a>
      </div>
    );
  }
  return (
    <a
      {...props}
      ref={(node) => setRef(ref, node)}
      className={cx("ui-showcase", className)}
      style={style}
      href={href}
    >
      {art}
      <div className="ui-showcase-caption">
        <span>{title}</span>
      </div>
      {description && <span className="ui-sr-only">{description}</span>}
    </a>
  );
}
export function CopyButton({
  text,
  children,
  label,
  icon = "copy",
  size = "sm",
  emphasis,
  variant,
}: {
  text: string;
  children?: ReactNode;
  /** @deprecated Use `children`. */
  label?: ReactNode;
  icon?: IconName;
  size?: ButtonSize | LegacyButtonSize;
  emphasis?: ButtonEmphasis;
  /** @deprecated Use `emphasis`. `soft` maps to `default`, `plain` maps to `quiet`. */
  variant?: "soft" | "plain";
}) {
  const idle = children ?? label ?? "复制";
  const resolvedEmphasis =
    emphasis ?? (variant === "plain" ? "quiet" : "default");
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  async function copy() {
    clearTimeout(timer.current);
    setStatus("pending");
    try {
      await navigator.clipboard.writeText(text);
      if (mounted.current) setStatus("success");
    } catch {
      if (mounted.current) setStatus("error");
    }
    if (mounted.current)
      timer.current = setTimeout(() => setStatus("idle"), 2200);
  }
  return (
    <Button
      size={resolveButtonSize(size)}
      emphasis={resolvedEmphasis}
      icon={status === "success" ? "check" : icon}
      onClick={copy}
      disabled={status === "pending"}
      className="ui-copy"
    >
      <span role="status" aria-live="polite">
        {status === "success"
          ? "Copied"
          : status === "error"
            ? "Copy failed"
            : status === "pending"
              ? "Copying…"
              : idle}
      </span>
    </Button>
  );
}
export function ShareButton({ url }: { url: string }) {
  return (
    <CopyButton text={url} icon="share" size="md">
      分享
    </CopyButton>
  );
}
export function ExpandableCode({
  code,
  expandLabel,
  label,
  collapsedHeight = 210,
}: {
  code: string;
  expandLabel?: string;
  /** @deprecated Use `expandLabel`. */
  label?: string;
  collapsedHeight?: number;
}) {
  const toggleLabel = expandLabel ?? label ?? "展开全文";
  const { reduced, transition } = useUiMotion();
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const content = useRef<HTMLPreElement>(null);
  const [height, setHeight] = useState(collapsedHeight);
  useEffect(() => {
    const update = () =>
      setHeight(content.current?.scrollHeight ?? collapsedHeight);
    update();
    const observer = new ResizeObserver(update);
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  }, [code, collapsedHeight]);
  return (
    <section className="ui-code" aria-label="Expandable text">
      <div className="ui-code-copy">
        <CopyButton text={code} emphasis="quiet" />
      </div>
      <motion.div
        id={id}
        className="ui-code-content"
        initial={false}
        animate={{ height: expanded ? height : collapsedHeight }}
        transition={reduced ? { duration: 0 } : transition}
      >
        <pre ref={content}>{code}</pre>
        {!expanded && <div className="ui-code-fade" aria-hidden="true" />}
      </motion.div>
      <div className="ui-code-toggle">
        <Button
          size="sm"
          emphasis="quiet"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={id}
        >
          {expanded ? "Show less" : toggleLabel}
          <span className={cx("ui-chevron", expanded && "ui-chevron--up")}>
            <Icon name="down" size={12} />
          </span>
        </Button>
      </div>
    </section>
  );
}
export type NavigationItem = { title: string; href: string };
const pageDirectionLabel = { previous: "上一页", next: "下一页" } as const;
export function Pager({
  previous,
  next,
  className,
  style,
  ref,
  "aria-label": ariaLabel = "页面导航",
  ...props
}: Omit<ComponentPropsWithRef<"nav">, "children"> & {
  previous?: NavigationItem;
  next?: NavigationItem;
}) {
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={ariaLabel}
      className={cx(
        "ui-button-group ui-button-group--contained ui-pager",
        className,
      )}
      style={style}
    >
      {(["previous", "next"] as const).map((direction) => {
        const item = direction === "previous" ? previous : next;
        const icon = direction === "previous" ? "left" : "right";
        const name = pageDirectionLabel[direction];
        return item ? (
          <a
            key={direction}
            className="ui-icon-button ui-external"
            href={item.href}
            aria-label={`${name}：${item.title}`}
            title={item.title}
          >
            <Icon name={icon} size={16} />
          </a>
        ) : (
          <IconButton
            key={direction}
            aria-label={`${name}不可用`}
            icon={icon}
            disabled
          />
        );
      })}
    </nav>
  );
}
export function NavigationCard({
  direction,
  directionLabel,
  title,
  href,
  className,
  style,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<"a">, "children" | "href"> &
  NavigationItem & {
    direction: "previous" | "next";
    directionLabel?: string;
  }) {
  return (
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
      <Icon name={direction === "previous" ? "left" : "right"} size={16} />
      <span>
        {directionLabel && (
          <span className="ui-navigation-label">{directionLabel}</span>
        )}
        <span className="ui-navigation-title">{title}</span>
      </span>
    </a>
  );
}
export function PageShell({
  controls,
  children,
  footer,
  className,
  mainId = "main",
  mainAs = "main",
}: {
  controls?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  mainId?: string;
  mainAs?: "main" | "div";
}) {
  const Main = mainAs;
  return (
    <div className={cx("ui-page", className)}>
      <a className="ui-skip" href={`#${mainId}`}>
        Skip to content
      </a>
      <header className="ui-header">
        <div className="ui-header-inner">{controls}</div>
      </header>
      <Main id={mainId} tabIndex={-1} className="ui-main">
        {children}
      </Main>
      {footer != null && <footer className="ui-footer">{footer}</footer>}
    </div>
  );
}
