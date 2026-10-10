import {
  useEffect,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { AnimatePresence, motion, type MotionProps } from "framer-motion";
import { useUiMotion } from "./motion";
import { Icon, type IconName } from "./icons";
import { IconButton } from "./components";
const cx = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");
type MotionSafeDiv = Omit<ComponentPropsWithRef<"div">, keyof MotionProps> & {
  style?: CSSProperties;
};
export type FeedbackTone = "neutral" | "success" | "danger";
function badgeEmphasis(
  emphasis: "default" | "quiet" | undefined,
  variant: "soft" | "plain" | "white" | undefined,
) {
  if (emphasis) return emphasis;
  if (variant === "plain") return "quiet";
  return "default";
}
export function Badge({
  children,
  tone = "neutral",
  emphasis,
  variant,
  icon,
  className,
  style,
  ref,
  ...props
}: ComponentPropsWithRef<"span"> & {
  tone?: FeedbackTone;
  emphasis?: "default" | "quiet";
  /** @deprecated Use `emphasis`. `plain` maps to `quiet`; `soft` and `white` map to `default`. */
  variant?: "soft" | "plain" | "white";
  icon?: IconName | false;
}) {
  const resolved = badgeEmphasis(emphasis, variant);
  return (
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
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
export function Alert({
  title,
  children,
  tone = "neutral",
  icon,
  className,
  style,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<"div">, "title"> & {
  title?: string;
  tone?: FeedbackTone;
  icon?: IconName | false;
}) {
  return (
    <div
      {...props}
      ref={ref}
      style={style}
      className={cx("ui-alert", `ui-tone--${tone}`, className)}
      role={tone === "danger" ? "alert" : "status"}
    >
      {icon !== false && (
        <Icon
          name={
            icon ??
            (tone === "success"
              ? "check"
              : tone === "danger"
                ? "close"
                : "menu")
          }
          size={16}
        />
      )}
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}
export function Progress({
  label,
  valueLabel,
  value,
  max = 100,
  className,
  style,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<"div">, "children" | "ref"> & {
  label?: string;
  valueLabel?: ReactNode;
  value?: number;
  max?: number;
  ref?: Ref<HTMLProgressElement>;
}) {
  const upper = max > 0 ? max : 100;
  const current =
    value === undefined ? undefined : Math.max(0, Math.min(value, upper));
  return (
    <div {...props} className={cx("ui-progress", className)} style={style}>
      {(label || valueLabel != null) && (
        <div className="ui-slider-label">
          {label && <span>{label}</span>}
          {valueLabel != null && <span>{valueLabel}</span>}
        </div>
      )}
      <progress
        ref={ref}
        aria-label={label || "进度"}
        value={current}
        max={upper}
      />
    </div>
  );
}
export function EmptyState({
  title,
  description,
  actions,
  action,
  icon,
  className,
  style,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<"div">, "title" | "children"> & {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** @deprecated Use `actions`. */
  action?: ReactNode;
  icon?: IconName | false;
}) {
  const slot = actions ?? action;
  return (
    <div
      {...props}
      ref={ref}
      style={style}
      className={cx("ui-empty-state", className)}
    >
      {icon ? <Icon name={icon} size={24} /> : null}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {slot}
    </div>
  );
}
export function Toast({
  open,
  children,
  message,
  onOpenChange,
  tone = "neutral",
  duration = 4200,
  icon,
  className,
  style,
  ref,
  ...props
}: Omit<MotionSafeDiv, "children" | "role"> & {
  open: boolean;
  children?: ReactNode;
  /** @deprecated Use `children`. */
  message?: ReactNode;
  onOpenChange: (open: boolean) => void;
  tone?: FeedbackTone;
  duration?: number;
  icon?: IconName | false;
}) {
  const content = children ?? message;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const { reduced, transition } = useUiMotion();
  useEffect(() => {
    if (!open) {
      setHovered(false);
      setFocused(false);
    }
  }, [open]);
  useEffect(() => {
    if (!open || paused || duration <= 0) return;
    const timer = setTimeout(() => onOpenChange(false), duration);
    return () => clearTimeout(timer);
  }, [open, paused, duration, content, onOpenChange]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...props}
          ref={ref}
          className={cx("ui-toast", `ui-tone--${tone}`, className)}
          role={tone === "danger" ? "alert" : "status"}
          aria-live={tone === "danger" ? "assertive" : "polite"}
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : 8 }}
          transition={transition}
          layout={reduced ? false : true}
          style={{ borderRadius: "var(--ui-radius-card)", ...style }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setFocused(false);
          }}
        >
          {icon !== false && (
            <Icon
              name={
                icon ??
                (tone === "success"
                  ? "check"
                  : tone === "danger"
                    ? "close"
                    : "menu")
              }
              size={16}
            />
          )}
          <motion.span
            layout={reduced ? false : "position"}
            transition={transition}
          >
            {content}
          </motion.span>
          <IconButton
            aria-label="关闭提示"
            icon="close"
            emphasis="quiet"
            onClick={() => onOpenChange(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
