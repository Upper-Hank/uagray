import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { useKeyboardFocus } from "./focus";
import { Icon, type IconName } from "./icons";
import { LayoutGroup, motion } from "framer-motion";
import { MotionButton, useUiMotion } from "./motion";
import {
  SelectionIndicator,
  useSelectionIndicator,
} from "./selection-indicator";

const cx = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");
export type ButtonEmphasis = "strong" | "default" | "quiet";
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
  size?: "default" | "small";
  /** Importance of the action. Its fill comes from the surrounding surface. */
  emphasis?: ButtonEmphasis;
  tone?: "neutral" | "danger";
  /** @deprecated Use `emphasis` and `tone`. */
  variant?: LegacyButtonVariant;
};
export function Button({
  icon,
  count,
  size = "default",
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
          `ui-button--${size}`,
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
export function IconButton({
  label,
  icon,
  ...props
}: Omit<ButtonProps, "children" | "icon"> & { label: string; icon: IconName }) {
  return (
    <Button
      {...props}
      icon={icon}
      aria-label={label}
      title={label}
      className={cx("ui-icon-button", props.className)}
    />
  );
}
export function ButtonGroup({
  label,
  children,
  tone = "soft",
}: {
  label: string;
  children: ReactNode;
  tone?: "soft" | "plain";
}) {
  const { reduced, transition } = useUiMotion();
  return (
    <LayoutGroup>
      <motion.div
        role="group"
        aria-label={label}
        className={`ui-button-group ui-button-group--${tone}`}
        layout={reduced ? false : true}
        transition={transition}
        style={{ borderRadius: "var(--ui-group-radius)" }}
      >
        {children}
      </motion.div>
    </LayoutGroup>
  );
}
export function Keycap({ children }: { children: ReactNode }) {
  return <kbd className="ui-keycap">{children}</kbd>;
}
export type SegmentOption = {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
};
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { reduced, transition } = useUiMotion();
  const activeIndex = options.findIndex(
    (option) => option.value === value && !option.disabled,
  );
  const { ref: group, bounds } = useSelectionIndicator(
    value,
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
      aria-label={label}
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
          aria-checked={value === option.value}
          disabled={option.disabled}
          tabIndex={index === tabIndex ? 0 : -1}
          onClick={() => {
            if (option.value !== value) onChange(option.value);
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
            onChange(options[next].value);
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
  label,
  value,
  onChange,
  placeholder,
  shortcut = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  shortcut?: boolean;
}) {
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
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onChange("");
          }
        }}
      />
      {shortcut && <Keycap>/</Keycap>}
    </motion.label>
  );
}
export function ExternalLinks({
  links,
}: {
  links: { label: string; href: string; icon: IconName }[];
}) {
  return (
    <nav
      className={cx(
        "ui-external-links",
        links.length > 1 && "ui-button-group ui-button-group--soft",
      )}
      aria-label="External links"
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
export type SurfaceProps = ComponentPropsWithRef<"div"> & {
  tone?: "soft" | "raised";
  treatment?: "tonal" | "defined" | "physical";
};
export function Surface({
  children,
  className,
  tone = "soft",
  treatment = "tonal",
  ...props
}: SurfaceProps) {
  return (
    <div
      {...props}
      className={cx(
        "ui-surface",
        tone === "raised" && "ui-surface--raised",
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
}: {
  title: string;
  description?: string;
  href: string;
  children: ReactNode;
  externalLink?: { href: string; label: string };
}) {
  const art = (
    <div className="ui-showcase-art" aria-hidden="true">
      {children}
    </div>
  );
  if (externalLink) {
    return (
      <div className="ui-showcase ui-showcase--external">
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
    <a className="ui-showcase" href={href}>
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
  label = "Copy",
  icon = "copy",
  size = "small",
  variant = "soft",
}: {
  text: string;
  label?: string;
  icon?: IconName;
  size?: "default" | "small";
  variant?: "soft" | "plain";
}) {
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
      size={size}
      emphasis={variant === "plain" ? "quiet" : "default"}
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
              : label}
      </span>
    </Button>
  );
}
export function ShareButton({ url }: { url: string }) {
  return <CopyButton text={url} label="Share" icon="share" size="default" />;
}
export function ExpandableCode({
  code,
  label = "Show full text",
  collapsedHeight = 210,
}: {
  code: string;
  label?: string;
  collapsedHeight?: number;
}) {
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
        <CopyButton text={code} variant="plain" />
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
          size="small"
          emphasis="quiet"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={id}
        >
          {expanded ? "Show less" : label}
          <span className={cx("ui-chevron", expanded && "ui-chevron--up")}>
            <Icon name="down" size={12} />
          </span>
        </Button>
      </div>
    </section>
  );
}
export type NavigationItem = { title: string; href: string };
export function Pager({
  previous,
  next,
}: {
  previous?: NavigationItem;
  next?: NavigationItem;
}) {
  return (
    <nav
      aria-label="Page navigation"
      className="ui-button-group ui-button-group--soft ui-pager"
    >
      {(["previous", "next"] as const).map((direction) => {
        const item = direction === "previous" ? previous : next;
        const icon = direction === "previous" ? "left" : "right";
        return item ? (
          <a
            key={direction}
            className="ui-icon-button ui-external"
            href={item.href}
            aria-label={`${direction}: ${item.title}`}
            title={item.title}
          >
            <Icon name={icon} size={16} />
          </a>
        ) : (
          <IconButton
            key={direction}
            label={`${direction} unavailable`}
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
}: NavigationItem & {
  direction: "previous" | "next";
  directionLabel?: string;
}) {
  return (
    <a
      className={cx(
        "ui-navigation-card",
        direction === "next" && "ui-navigation-card--next",
      )}
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
