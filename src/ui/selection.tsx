import {
  useId,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { useUiMotion } from "./motion";
import { Icon } from "./icons";
import { Button } from "./components";
import {
  SelectionIndicator,
  useSelectionIndicator,
} from "./selection-indicator";

export function Checkbox({
  label,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type"> & { label?: ReactNode }) {
  return (
    <label className={`ui-choice ${className}`}>
      <input {...props} type="checkbox" />
      <span className="ui-checkbox-mark" aria-hidden="true">
        <Icon name="check" size={12} />
      </span>
      {label != null && <span>{label}</span>}
    </label>
  );
}
export function Radio({
  label,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type"> & { label?: ReactNode }) {
  return (
    <label className={`ui-choice ${className}`}>
      <input {...props} type="radio" />
      <span className="ui-radio-mark" aria-hidden="true" />
      {label != null && <span>{label}</span>}
    </label>
  );
}
export function Switch({
  label,
  checked,
  defaultChecked = false,
  onChange,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type" | "role"> & {
  label?: ReactNode;
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const current = checked ?? internal;
  const { reduced, transition } = useUiMotion();
  return (
    <label className={`ui-switch ${className}`}>
      <input
        {...props}
        type="checkbox"
        role="switch"
        checked={current}
        onChange={(event) => {
          if (checked === undefined) setInternal(event.target.checked);
          onChange?.(event);
        }}
      />
      <span className="ui-switch-track" aria-hidden="true">
        <motion.span
          className="ui-switch-thumb"
          initial={false}
          animate={{ x: current ? 14 : 0 }}
          transition={reduced ? { duration: 0 } : transition}
        />
      </span>
      {label != null && <span>{label}</span>}
    </label>
  );
}
export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};
export function Tabs({
  "aria-label": ariaLabel,
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  onChange,
}: {
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. */
  onChange?: (value: string) => void;
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
)) {
  const name = ariaLabel ?? label;
  const [uncontrolled, setUncontrolled] = useState(
    () => defaultValue ?? items.find((item) => !item.disabled)?.value ?? "",
  );
  const selectedValue = value !== undefined ? value : uncontrolled;
  const select = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    if (onValueChange) onValueChange(next);
    else onChange?.(next);
  };
  const id = useId();
  const selected = items.findIndex(
    (item) => item.value === selectedValue && !item.disabled,
  );
  const { ref: list, bounds } = useSelectionIndicator(
    selectedValue,
    selected,
    items,
  );
  const tabbable =
    selected >= 0 ? selected : items.findIndex((item) => !item.disabled);
  const { reduced, transition } = useUiMotion();
  return (
    <div className="ui-tabs">
      <motion.div
        className="ui-tab-list ui-selection-track"
        role="tablist"
        aria-label={name}
        ref={list}
        layout={reduced ? false : true}
        transition={transition}
      >
        <SelectionIndicator bounds={bounds} />
        {items.map((item, index) => (
          <motion.button
            layout={reduced ? false : true}
            transition={transition}
            key={item.value}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={index === selected}
            disabled={item.disabled}
            tabIndex={index === tabbable ? 0 : -1}
            onClick={() => {
              if (item.value !== selectedValue) select(item.value);
            }}
            onKeyDown={(event) => {
              const enabled = items
                .map((item, i) => (item.disabled ? -1 : i))
                .filter((i) => i >= 0);
              if (!enabled.length) return;
              const direction =
                event.key === "ArrowRight"
                  ? 1
                  : event.key === "ArrowLeft"
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
                        (enabled.indexOf(index) + direction + enabled.length) %
                          enabled.length
                      ];
              select(items[next].value);
              list.current
                ?.querySelectorAll<HTMLButtonElement>("button")
                [next]?.focus();
            }}
          >
            {item.label}
          </motion.button>
        ))}
      </motion.div>
      {items.map((item, index) => (
        <div
          key={item.value}
          id={`${id}-panel-${index}`}
          className="ui-tab-panel"
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          tabIndex={0}
          hidden={index !== selected}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
export function SelectionBar({
  count,
  total,
  summary,
  onSelectAll,
  onClear,
  onDone,
  busy = false,
  children,
  actions,
  variant,
  tone,
}: {
  count: number;
  total?: number;
  summary?: ReactNode;
  onSelectAll?: () => void;
  onClear?: () => void;
  onDone?: () => void;
  actions?: ReactNode;
  variant?: "contained" | "plain";
  /** @deprecated Use `variant`. `soft` maps to `contained`. */
  tone?: "soft" | "plain";
  busy?: boolean;
  children?: ReactNode;
}) {
  const resolved = variant ?? (tone === "soft" ? "contained" : "plain");
  const { reduced, transition } = useUiMotion();
  return (
    <motion.div
      className={`ui-selection-bar ui-selection-bar--${resolved}`}
      role="group"
      aria-label="批量操作"
      aria-busy={busy}
      layout={reduced ? false : true}
      transition={transition}
      style={{ borderRadius: "var(--ui-radius-card)" }}
    >
      {summary != null && (
        <motion.span
          layout={reduced ? false : "position"}
          transition={transition}
        >
          {summary}
        </motion.span>
      )}
      {actions ?? (
        <>
          {onSelectAll && (
            <Button
              size="sm"
              onClick={onSelectAll}
              disabled={busy || total === 0}
            >
              全选
            </Button>
          )}
          {onClear && (
            <Button size="sm" onClick={onClear} disabled={busy || count === 0}>
              清空
            </Button>
          )}
          {children}
          {onDone && (
            <Button size="sm" onClick={onDone} disabled={busy}>
              完成
            </Button>
          )}
        </>
      )}
    </motion.div>
  );
}
