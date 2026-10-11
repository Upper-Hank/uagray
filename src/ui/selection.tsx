import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { motion, type MotionProps } from "framer-motion";
import { TransitionPanel, useUiMotion } from "./motion";
import { Icon } from "./icons";
import { Button } from "./components";
import { assignRef, compose, cx, hasContent } from "./host";
import {
  CompositionRegion,
  CompositionRoot,
  duplicateSlotIds,
  useComposition,
  useSlot,
  type SlotRule,
} from "./composition";

function useNamedControl(name: string, children: ReactNode, labelled: boolean) {
  const missing = !hasContent(children) && !labelled;
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !missing) return;
    console.error(`[uagray] ${name} 没有可见 Label 时，控件必须有可访问名称`);
  }, [labelled, missing, name]);
}
import {
  SelectionIndicator,
  useDomSelectionIndicator,
} from "./selection-indicator";

export function Checkbox({
  children,
  className,
  style,
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type"> & {
  children?: ReactNode;
}) {
  useNamedControl(
    "Checkbox",
    children,
    Boolean(props["aria-label"] || props["aria-labelledby"]),
  );
  return (
    <label className={cx("ui-choice", className)} style={style}>
      <input {...props} type="checkbox" />
      <span className="ui-checkbox-mark" aria-hidden="true">
        <Icon name="check" size={14} weight={1.5} />
      </span>
      {hasContent(children) && <span>{children}</span>}
    </label>
  );
}
export function Radio({
  children,
  className,
  style,
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type"> & {
  children?: ReactNode;
}) {
  useNamedControl(
    "Radio",
    children,
    Boolean(props["aria-label"] || props["aria-labelledby"]),
  );
  return (
    <label className={cx("ui-choice", className)} style={style}>
      <input {...props} type="radio" />
      <span className="ui-radio-mark" aria-hidden="true" />
      {hasContent(children) && <span>{children}</span>}
    </label>
  );
}
export function Switch({
  children,
  checked,
  defaultChecked = false,
  onChange,
  className,
  style,
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type" | "role"> & {
  children?: ReactNode;
}) {
  useNamedControl(
    "Switch",
    children,
    Boolean(props["aria-label"] || props["aria-labelledby"]),
  );
  const content = children;
  const [internal, setInternal] = useState(defaultChecked);
  const current = checked ?? internal;
  const { reduced, transition } = useUiMotion();
  return (
    <label className={cx("ui-switch", className)} style={style}>
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
      {hasContent(content) && <span>{content}</span>}
    </label>
  );
}

const segmentItemRules: readonly SlotRule[] = [
  { name: "label", min: 1, max: 1 },
  { name: "count", min: 0, max: 1 },
];
const segmentRules: readonly SlotRule[] = [
  { name: "item", min: 0, max: Number.POSITIVE_INFINITY },
];

type SegmentedContextValue = {
  value: string;
  select: (value: string) => void;
};
const SegmentedContext = createContext<SegmentedContextValue | null>(null);

function useSegmentedContext() {
  const context = useContext(SegmentedContext);
  if (context === null)
    throw new Error("SegmentedControl.Item must be inside SegmentedControl");
  return context;
}

function emitValue(
  next: string,
  onValueChange?: (value: string) => void,
  onChange?: (value: string) => void,
) {
  if (onValueChange) onValueChange(next);
  else onChange?.(next);
}

export type SegmentedControlItemProps = Omit<
  ComponentPropsWithRef<"button">,
  keyof MotionProps | "value" | "children"
> & {
  value: string;
  children: ReactNode;
};

function SegmentedControlLabel({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("SegmentedControl.Item", "label", { present: hasContent(children) });
  return (
    <span {...props} className={cx(className)}>
      {children}
    </span>
  );
}

function SegmentedControlItem({
  value,
  children,
  disabled,
  className,
  onClick,
  ...props
}: SegmentedControlItemProps) {
  const context = useSegmentedContext();
  const composition = useComposition("SegmentedControl.Item", segmentItemRules);
  useSlot("SegmentedControl", "item", {
    id: value,
    present: hasContent(children),
  });
  const selected = context.value === value;
  const { reduced, transition } = useUiMotion();
  return (
    <motion.button
      {...props}
      layout={reduced ? false : true}
      transition={transition}
      type="button"
      role="radio"
      data-ui-value={value}
      aria-checked={selected}
      disabled={disabled}
      tabIndex={selected ? 0 : -1}
      className={cx(className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (value === context.value) return;
        context.select(value);
      }}
    >
      <CompositionRoot value={composition.value}>{children}</CompositionRoot>
    </motion.button>
  );
}

function SegmentedControlCount({
  children,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"span">, keyof MotionProps> & {
  children?: ReactNode;
}) {
  useSlot("SegmentedControl.Item", "count", { present: hasContent(children) });
  const { reduced, transition } = useUiMotion();
  return (
    <motion.span
      {...props}
      className={cx("ui-count", className)}
      layout={reduced ? false : "position"}
      transition={transition}
    >
      {children}
    </motion.span>
  );
}

export type SegmentedControlProps = Omit<
  ComponentPropsWithRef<"div">,
  keyof MotionProps | "children" | "onChange"
> & {
  style?: CSSProperties;
  children?: ReactNode;
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
  );

function SegmentedControlRoot({
  "aria-label": ariaLabel,
  label,
  children,
  value,
  defaultValue,
  onValueChange,
  onChange,
  className,
  style,
  ref,
  onKeyDown,
  ...props
}: SegmentedControlProps) {
  const name = ariaLabel ?? label;
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const selected = value !== undefined ? value : uncontrolled;
  const root = useRef<HTMLDivElement>(null);
  const { reduced, transition } = useUiMotion();
  const bounds = useDomSelectionIndicator(
    root,
    '[role="radio"][aria-checked="true"]',
    selected,
  );
  const select = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    emitValue(next, onValueChange, onChange);
  };
  useLayoutEffect(() => {
    if (value !== undefined || defaultValue !== undefined) return;
    const buttons = [
      ...(root.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ??
        []),
    ];
    if (
      buttons.some((button) => button.getAttribute("aria-checked") === "true")
    )
      return;
    const first = buttons.find((button) => button.disabled === false);
    if (first?.dataset.uiValue) setUncontrolled(first.dataset.uiValue);
  }, [children, defaultValue, selected, value]);
  const composition = useComposition(
    "SegmentedControl",
    segmentRules,
    (registrations) =>
      duplicateSlotIds(registrations, "item").map(
        (id) => `[uagray] SegmentedControl 的 value "${id}" 重复`,
      ),
  );
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const buttons = [
      ...(root.current?.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]:not(:disabled)',
      ) ?? []),
    ];
    if (buttons.length === 0) return;
    const indexes = buttons
      .map((button, index) => (button.disabled ? -1 : index))
      .filter((index) => index >= 0);
    if (indexes.length === 0) return;
    const target =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLButtonElement>('[role="radio"]')
        : null;
    const position = target ? buttons.indexOf(target) : -1;
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (direction === 0 && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? indexes[0]
        : event.key === "End"
          ? indexes.at(-1)!
          : indexes[(position + direction + indexes.length) % indexes.length];
    const next = buttons[nextIndex];
    if (next.dataset.uiValue) select(next.dataset.uiValue);
    next.focus();
  };
  return (
    <CompositionRoot value={composition.value}>
      <SegmentedContext.Provider value={{ value: selected, select }}>
        <motion.div
          {...props}
          layout={reduced ? false : true}
          transition={transition}
          style={{ borderRadius: "var(--ui-selection-radius)", ...style }}
          className={cx("ui-segments ui-selection-track", className)}
          role="radiogroup"
          aria-label={name}
          ref={(node) => {
            root.current = node;
            assignRef(ref, node);
          }}
          onKeyDown={compose(onKeyDown, handleKeyDown)}
        >
          <SelectionIndicator bounds={bounds} />
          {children}
        </motion.div>
      </SegmentedContext.Provider>
    </CompositionRoot>
  );
}

export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
  Label: SegmentedControlLabel,
  Count: SegmentedControlCount,
});

const tabRules: readonly SlotRule[] = [
  { name: "list", min: 1, max: 1 },
  { name: "trigger", min: 0, max: Number.POSITIVE_INFINITY, region: "list" },
  { name: "content", min: 0, max: Number.POSITIVE_INFINITY, region: "root" },
];

type TabsContextValue = {
  value: string;
  name?: string;
  select: (value: string) => void;
  tabId: (value: string) => string;
  panelId: (value: string) => string;
};
const TabsContext = createContext<TabsContextValue | null>(null);
function useTabsContext() {
  const context = useContext(TabsContext);
  if (context === null) throw new Error("Tabs parts must be inside Tabs");
  return context;
}

export type TabsProps = Omit<ComponentPropsWithRef<"div">, "onChange"> & {
  children?: ReactNode;
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
  );

function TabsRoot({
  "aria-label": ariaLabel,
  label,
  children,
  value,
  defaultValue,
  onValueChange,
  onChange,
  className,
  style,
  ref,
  ...props
}: TabsProps) {
  const name = ariaLabel ?? label;
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const selected = value !== undefined ? value : uncontrolled;
  const root = useRef<HTMLDivElement>(null);
  const select = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    emitValue(next, onValueChange, onChange);
  };
  useLayoutEffect(() => {
    if (value !== undefined || defaultValue !== undefined) return;
    const tabs = [
      ...(root.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ??
        []),
    ];
    if (tabs.some((tab) => tab.getAttribute("aria-selected") === "true"))
      return;
    const first = tabs.find((tab) => tab.disabled === false);
    if (first?.dataset.uiValue) setUncontrolled(first.dataset.uiValue);
  }, [children, defaultValue, selected, value]);
  const tabId = (tabValue: string) =>
    `${baseId}-tab-${encodeURIComponent(tabValue)}`;
  const panelId = (panelValue: string) =>
    `${baseId}-panel-${encodeURIComponent(panelValue)}`;
  const composition = useComposition("Tabs", tabRules, (registrations) => {
    const messages = [
      ...duplicateSlotIds(registrations, "trigger").map(
        (id) => `[uagray] Tabs.Trigger 的 value "${id}" 重复`,
      ),
      ...duplicateSlotIds(registrations, "content").map(
        (id) => `[uagray] Tabs.Content 的 value "${id}" 重复`,
      ),
    ];
    const triggers = new Set(
      registrations
        .filter((item) => item.slot === "trigger" && item.id)
        .map((item) => item.id),
    );
    for (const content of registrations) {
      if (content.slot !== "content" || !content.id || triggers.has(content.id))
        continue;
      messages.push(
        `[uagray] Tabs.Content 的 value "${content.id}" 没有对应的 Trigger`,
      );
    }
    return messages;
  });
  return (
    <CompositionRoot value={composition.value}>
      <TabsContext.Provider
        value={{ value: selected, name, select, tabId, panelId }}
      >
        <div
          {...props}
          ref={(node) => {
            root.current = node;
            assignRef(ref, node);
          }}
          className={cx("ui-tabs", className)}
          style={style}
        >
          {children}
        </div>
      </TabsContext.Provider>
    </CompositionRoot>
  );
}

export type TabsListProps = Omit<
  ComponentPropsWithRef<"div">,
  keyof MotionProps
> & {
  children: ReactNode;
};
function TabsList({ children, className, ...props }: TabsListProps) {
  const context = useTabsContext();
  useSlot("Tabs", "list", { present: hasContent(children) });
  const list = useRef<HTMLDivElement>(null);
  const bounds = useDomSelectionIndicator(
    list,
    '[role="tab"][aria-selected="true"]',
    context.value,
  );
  const { reduced, transition } = useUiMotion();
  useLayoutEffect(() => {
    const tabs = [
      ...(list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ??
        []),
    ];
    const selectedIndex = tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );
    const firstEnabled = tabs.findIndex((tab) => tab.disabled === false);
    const tabbable = selectedIndex >= 0 ? selectedIndex : firstEnabled;
    tabs.forEach((tab, index) => {
      tab.tabIndex = index === tabbable ? 0 : -1;
    });
  }, [children, context.value]);
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const tabs = [
      ...(list.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not(:disabled)',
      ) ?? []),
    ];
    if (tabs.length === 0) return;
    const indexes = tabs
      .map((tab, index) => (tab.disabled ? -1 : index))
      .filter((index) => index >= 0);
    if (indexes.length === 0) return;
    const target =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLButtonElement>('[role="tab"]')
        : null;
    const position = target ? tabs.indexOf(target) : -1;
    const direction =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (direction === 0 && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? indexes[0]
        : event.key === "End"
          ? indexes.at(-1)!
          : indexes[(position + direction + indexes.length) % indexes.length];
    const next = tabs[nextIndex];
    if (next.dataset.uiValue) context.select(next.dataset.uiValue);
    next.focus();
  };
  return (
    <CompositionRegion name="list">
      <motion.div
        {...props}
        ref={(node) => {
          list.current = node;
        }}
        className={cx("ui-tab-list ui-selection-track", className)}
        role="tablist"
        aria-label={context.name}
        layout={reduced ? false : true}
        transition={transition}
        onKeyDown={handleKeyDown}
      >
        <SelectionIndicator bounds={bounds} />
        {children}
      </motion.div>
    </CompositionRegion>
  );
}

export type TabsTriggerProps = Omit<
  ComponentPropsWithRef<"button">,
  keyof MotionProps | "value" | "children"
> & {
  value: string;
  children: ReactNode;
};
function TabsTrigger({
  value,
  children,
  disabled,
  className,
  onClick,
  ...props
}: TabsTriggerProps) {
  const context = useTabsContext();
  useSlot("Tabs", "trigger", { id: value, present: hasContent(children) });
  const selected = context.value === value;
  const { reduced, transition } = useUiMotion();
  return (
    <motion.button
      {...props}
      layout={reduced ? false : true}
      transition={transition}
      type="button"
      role="tab"
      id={context.tabId(value)}
      aria-controls={context.panelId(value)}
      data-ui-value={value}
      aria-selected={selected}
      disabled={disabled}
      tabIndex={selected ? 0 : -1}
      className={cx(className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (value === context.value) return;
        context.select(value);
      }}
    >
      {children}
    </motion.button>
  );
}

export type TabsContentProps = ComponentPropsWithRef<"div"> & {
  value: string;
  children: ReactNode;
};
function TabsContent({
  value,
  children,
  className,
  ...props
}: TabsContentProps) {
  const context = useTabsContext();
  useSlot("Tabs", "content", { id: value, present: hasContent(children) });
  const active = context.value === value;
  return (
    <TransitionPanel
      {...props}
      id={context.panelId(value)}
      className={cx("ui-tab-panel", className)}
      role="tabpanel"
      aria-labelledby={context.tabId(value)}
      tabIndex={0}
      active={active}
      onDeactivate={() => {
        const tab = document.getElementById(context.tabId(context.value));
        if (tab instanceof HTMLElement) tab.focus();
      }}
    >
      {children}
    </TransitionPanel>
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

const SelectionContext = createContext<{
  count: number;
  total?: number;
  busy: boolean;
} | null>(null);
const selectionRules: readonly SlotRule[] = [
  { name: "count", min: 0, max: 1 },
  { name: "description", min: 0, max: 1 },
  { name: "actions", min: 0, max: 1 },
  { name: "select-all", min: 0, max: 1 },
  { name: "clear", min: 0, max: 1 },
  { name: "done", min: 0, max: 1 },
];
function SelectionCount({ children, ...props }: ComponentPropsWithRef<"span">) {
  useSlot("SelectionBar", "count");
  const context = useContext(SelectionContext);
  return <span {...props}>{children ?? context?.count}</span>;
}
function SelectionDescription({
  children,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("SelectionBar", "description", { present: hasContent(children) });
  return hasContent(children) ? <span {...props}>{children}</span> : null;
}
function SelectionActions({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("SelectionBar", "actions", { present: hasContent(children) });
  return hasContent(children) ? (
    <span {...props} className={cx("ui-selection-actions", className)}>
      {children}
    </span>
  ) : null;
}
function SelectionAction({
  actionKind,
  children,
  disabled,
  busy,
  ...props
}: ComponentPropsWithRef<typeof Button> & {
  actionKind: "select-all" | "clear" | "done";
}) {
  const context = useContext(SelectionContext);
  useSlot("SelectionBar", actionKind, { present: hasContent(children) });
  const unavailable =
    actionKind === "select-all"
      ? context?.total === 0
      : actionKind === "clear"
        ? context?.count === 0
        : false;
  return (
    <Button
      size="sm"
      {...props}
      disabled={disabled || unavailable || context?.busy}
      busy={busy}
    >
      {children}
    </Button>
  );
}
function SelectionSelectAll(props: ComponentPropsWithRef<typeof Button>) {
  return <SelectionAction {...props} actionKind="select-all" />;
}
function SelectionClear(props: ComponentPropsWithRef<typeof Button>) {
  return <SelectionAction {...props} actionKind="clear" />;
}
function SelectionDone(props: ComponentPropsWithRef<typeof Button>) {
  return <SelectionAction {...props} actionKind="done" />;
}
export function SelectionBar({
  count,
  total,
  busy = false,
  children,
  variant,
  tone,
  className,
  style,
  "aria-label": ariaLabel = "批量操作",
  ...props
}: Omit<ComponentPropsWithRef<"div">, keyof MotionProps | "children"> & {
  style?: CSSProperties;
  count: number;
  total?: number;
  busy?: boolean;
  children: ReactNode;
  variant?: "contained" | "plain";
  /** @deprecated Use variant. */ tone?: "soft" | "plain";
}) {
  const { reduced, transition } = useUiMotion();
  const composition = useComposition("SelectionBar", selectionRules);
  return (
    <CompositionRoot value={composition.value}>
      <SelectionContext.Provider value={{ count, total, busy }}>
        <motion.div
          {...props}
          role="group"
          aria-label={ariaLabel}
          aria-busy={busy}
          className={cx(
            "ui-selection-bar",
            `ui-selection-bar--${variant ?? (tone === "soft" ? "contained" : "plain")}`,
            className,
          )}
          layout={reduced ? false : true}
          transition={transition}
          style={{ borderRadius: "var(--ui-radius-card)", ...style }}
        >
          {children}
        </motion.div>
      </SelectionContext.Provider>
    </CompositionRoot>
  );
}
SelectionBar.Count = SelectionCount;
SelectionBar.Description = SelectionDescription;
SelectionBar.Actions = SelectionActions;
SelectionBar.SelectAllAction = SelectionSelectAll;
SelectionBar.ClearAction = SelectionClear;
SelectionBar.DoneAction = SelectionDone;
