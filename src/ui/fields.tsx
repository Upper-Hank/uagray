import {
  createContext,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { motion } from "framer-motion";
import { motionDistance, useUiMotion } from "./motion";
import { useKeyboardFocus } from "./focus";
import { Icon } from "./icons";
import { assignRef, cx, hasContent } from "./host";
import {
  CompositionRegion,
  CompositionRoot,
  duplicateSlotIds,
  slotIds,
  useComposition,
  useCompositionContext,
  useSlot,
  type SlotRegistration,
  type SlotRule,
} from "./composition";

const fieldRules: readonly SlotRule[] = [
  { name: "label", min: 0, max: 1 },
  { name: "control", min: 1, max: 1 },
  { name: "control-node", min: 0, max: 1 },
  { name: "description", min: 0, max: 1 },
  { name: "error", min: 0, max: 1 },
];
type FieldContextValue = {
  id: string;
  required: boolean;
  invalid: boolean;
  describedBy?: string;
};
const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext() {
  return useContext(FieldContext);
}

function FieldLabel({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"label"> & { children: ReactNode }) {
  const field = useFieldContext();
  useSlot("Field", "label", { present: hasContent(children) });
  return (
    <label
      {...props}
      htmlFor={field?.id}
      className={cx("ui-field-label", className)}
    >
      {children}
      {field?.required && <span className="ui-field-required">必填</span>}
    </label>
  );
}

function FieldControl({ children }: { children: ReactNode }) {
  useSlot("Field", "control", { present: hasContent(children) });
  return <CompositionRegion name="control">{children}</CompositionRegion>;
}

function associatedId(
  supplied: string | undefined,
  fieldId: string | undefined,
  suffix: string,
  fallback: string,
) {
  return supplied ?? (fieldId ? `${fieldId}-${suffix}` : fallback);
}

function FieldDescription({
  children,
  className,
  id: suppliedId,
  ...props
}: ComponentPropsWithRef<"p"> & { children: ReactNode }) {
  const field = useFieldContext();
  const generated = useId();
  const id = associatedId(suppliedId, field?.id, "hint", generated);
  useSlot("Field", "description", { id, present: hasContent(children) });
  return (
    <p {...props} id={id} className={cx("ui-field-hint", className)}>
      {children}
    </p>
  );
}

function FieldError({
  children,
  className,
  id: suppliedId,
  ...props
}: ComponentPropsWithRef<"p"> & { children: ReactNode }) {
  const field = useFieldContext();
  const generated = useId();
  const id = associatedId(suppliedId, field?.id, "error", generated);
  useSlot("Field", "error", { id, present: hasContent(children) });
  return (
    <p
      {...props}
      id={id}
      role={props.role ?? "alert"}
      className={cx("ui-field-error", className)}
    >
      {children}
    </p>
  );
}

export type FieldProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  required?: boolean;
  children: ReactNode;
};

function fieldMessages(id: string, root: HTMLElement | null) {
  return (registrations: SlotRegistration[]) => {
    const messages: string[] = [];
    if (duplicateSlotIds(registrations, "control-node").length)
      messages.push("[uagray] Field 只关联一个控件");
    const label = registrations.some(
      (item) => item.slot === "label" && item.present,
    );
    if (label || root === null) return messages;
    const control = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (
      control &&
      !control.getAttribute("aria-label") &&
      !control.getAttribute("aria-labelledby")
    )
      messages.push("[uagray] Field 没有 Label 时，控件必须有可访问名称");
    return messages;
  };
}

function FieldRoot({
  id: suppliedId,
  required = false,
  children,
  className,
  style,
  ref,
  ...props
}: FieldProps) {
  const generated = useId();
  const id = suppliedId ?? generated;
  const rootRef = useRef<HTMLDivElement>(null);
  const composition = useComposition(
    "Field",
    fieldRules,
    fieldMessages(id, rootRef.current),
  );
  const describedBy =
    [...slotIds(composition.registrations, "description"), ...slotIds(composition.registrations, "error")]
      .join(" ") || undefined;
  const value = useMemo<FieldContextValue>(
    () => ({
      id,
      required,
      invalid: composition.registrations.some(
        (item) => item.slot === "error" && item.present,
      ),
      describedBy,
    }),
    [composition.registrations, describedBy, id, required],
  );
  return (
    <CompositionRoot value={composition.value}>
      <FieldContext.Provider value={value}>
        <div
          {...props}
          ref={(node) => {
            rootRef.current = node;
            assignRef(ref, node);
          }}
          className={cx("ui-field", className)}
          style={style}
        >
          {children}
        </div>
      </FieldContext.Provider>
    </CompositionRoot>
  );
}

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
});

function useFieldAttributes(props: {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: ComponentPropsWithRef<"input">["aria-invalid"];
}) {
  const field = useFieldContext();
  const composition = useCompositionContext();
  const keyboard = useKeyboardFocus();
  const inControl =
    composition?.owner === "Field" && composition.region === "control";
  const register = composition?.register;
  const region = composition?.region;
  useLayoutEffect(() => {
    if (!inControl || !register || !region) return;
    return register({ slot: "control-node", present: true, region });
  }, [inControl, region, register]);
  if (!field || !inControl) {
    return {
      "data-keyboard-focus": keyboard || undefined,
      id: props.id,
      required: props.required,
      "aria-invalid": props["aria-invalid"],
      "aria-describedby": props["aria-describedby"],
    };
  }
  return {
    "data-keyboard-focus": keyboard || undefined,
    id: field.id,
    required: props.required ?? field.required,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    "aria-describedby":
      [field.describedBy, props["aria-describedby"]].filter(Boolean).join(" ") ||
      undefined,
  };
}

export function Input({
  className = "",
  ...props
}: ComponentPropsWithRef<"input">) {
  const attrs = useFieldAttributes(props);
  return <input {...props} {...attrs} className={`ui-input ${className}`} />;
}

export type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  /** Allow native vertical resizing; width remains owned by the parent layout. */
  resizable?: boolean;
};
export function Textarea({
  className = "",
  rows = 3,
  resizable = true,
  ...props
}: TextareaProps) {
  const attrs = useFieldAttributes(props);
  return (
    <textarea
      {...props}
      {...attrs}
      rows={rows}
      data-resizable={resizable && props.disabled !== true ? "true" : "false"}
      className={`ui-input ui-textarea ${className}`}
    />
  );
}
export type NumberInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> & {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
};
function isCompleteNumber(text: string) {
  return /^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text);
}
export function NumberInput({
  value,
  defaultValue = 0,
  min,
  max,
  step = 1,
  onValueChange,
  onBlur,
  disabled,
  readOnly,
  className = "",
  ref,
  ...props
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [draft, setDraft] = useState<string | null>(null);
  const committed = value ?? uncontrolled;
  const seenValue = useRef(value);
  const clamp = (next: number) =>
    Math.max(min ?? -Infinity, Math.min(max ?? Infinity, next));
  useLayoutEffect(() => {
    const valueChanged = seenValue.current !== value;
    seenValue.current = value;
    if (value === undefined || draft === null) return;
    if (isCompleteNumber(draft) || valueChanged) setDraft(null);
  }, [value, draft]);
  const commit = (next: number) => {
    const result = clamp(next);
    if (value === undefined) setUncontrolled(result);
    setDraft(null);
    if (result !== committed) onValueChange?.(result);
  };
  const adjust = (direction: number) => {
    const input = inputRef.current;
    if (input === null || disabled || readOnly) return;
    const shown = input.value;
    input.value = String(committed);
    if (direction > 0) input.stepUp();
    else input.stepDown();
    const next = input.valueAsNumber;
    input.value = shown;
    if (Number.isFinite(next)) commit(next);
  };
  return (
    <div className={`ui-number-input ${className}`}>
      <Input
        {...props}
        ref={inputRef}
        type="number"
        value={draft ?? String(committed)}
        min={min}
        max={max}
        step={step > 0 ? step : 1}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(event) => {
          const text = event.target.value;
          if (isCompleteNumber(text) === false) {
            setDraft(text);
            return;
          }
          const next = clamp(Number(text));
          if (value === undefined) {
            setUncontrolled(next);
            setDraft(null);
          } else setDraft(text);
          if (next !== committed) onValueChange?.(next);
        }}
        onBlur={(event) => {
          if (readOnly !== true && disabled !== true) {
            const next = event.target.valueAsNumber;
            if (Number.isFinite(next)) commit(next);
            else setDraft(null);
          }
          onBlur?.(event);
        }}
      />
      <div className="ui-number-input-actions">
        <button
          type="button"
          aria-label="减少"
          className="ui-pressable"
          disabled={
            disabled || readOnly || (min !== undefined && committed <= min)
          }
          onClick={() => adjust(-1)}
        >
          −
        </button>
        <button
          type="button"
          aria-label="增加"
          className="ui-pressable"
          disabled={
            disabled || readOnly || (max !== undefined && committed >= max)
          }
          onClick={() => adjust(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

const selectRules: readonly SlotRule[] = [
  { name: "item", min: 0, max: Number.POSITIVE_INFINITY },
];

export type SelectItemProps = Omit<
  ComponentPropsWithRef<typeof SelectPrimitive.Item>,
  "children" | "value"
> & {
  value: string;
  children: ReactNode;
};
function SelectItem({
  value,
  disabled,
  children,
  className,
  ...props
}: SelectItemProps) {
  useSlot("Select", "item", { id: value, present: hasContent(children) });
  return (
    <SelectPrimitive.Item
      {...props}
      value={value}
      disabled={disabled}
      className={cx("ui-select-option", className)}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Icon name="check" size={14} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export type SelectProps = Omit<
  ComponentPropsWithRef<typeof SelectPrimitive.Trigger>,
  "children" | "value" | "defaultValue" | "onChange"
> & {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
};
function SelectRoot({
  children,
  value,
  defaultValue = "",
  onValueChange,
  name,
  required,
  placeholder,
  className = "",
  ref,
  ...props
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement>();
  useImperativeHandle(ref, () => trigger.current!);
  useLayoutEffect(() => {
    setPortalContainer(trigger.current?.closest("dialog") ?? undefined);
  }, []);
  const { reduced, enter, exit } = useUiMotion();
  const { required: fieldRequired, ...attrs } = useFieldAttributes({
    ...props,
    required,
  });
  const composition = useComposition("Select", selectRules, (registrations) =>
    duplicateSlotIds(registrations, "item").map(
      (id) => `[uagray] Select 的 value "${id}" 重复`,
    ),
  );
  return (
    <CompositionRoot value={composition.value}>
    <SelectPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      required={fieldRequired}
      disabled={props.disabled}
    >
      <SelectPrimitive.Trigger
        {...props}
        {...attrs}
        ref={trigger}
        className={cx("ui-select-trigger ui-input", className)}
        aria-required={fieldRequired || undefined}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <Icon name="chevron-down" size={14} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal container={portalContainer}>
        <SelectPrimitive.Content
          asChild
          position="popper"
          sideOffset={8}
          collisionPadding={12}
          className="ui-select-menu"
        >
          <motion.div
            style={
              {
                "--ui-anchor-distance": `${motionDistance.anchor}px`,
              } as CSSProperties
            }
            initial={{
              opacity: 0,
              x: reduced ? 0 : "var(--ui-anchor-x)",
              y: reduced ? 0 : "var(--ui-anchor-y)",
            }}
            animate={
              open
                ? { opacity: 1, x: 0, y: 0 }
                : {
                    opacity: 0,
                    x: reduced ? 0 : "var(--ui-anchor-x)",
                    y: reduced ? 0 : "var(--ui-anchor-y)",
                  }
            }
            transition={open ? enter : exit}
            inert={open === false ? true : undefined}
            aria-hidden={open === false ? true : undefined}
          >
            <SelectPrimitive.ScrollUpButton className="ui-select-scroll">
              <Icon name="chevron-down" size={14} />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="ui-select-scroll">
              <Icon name="chevron-down" size={14} />
            </SelectPrimitive.ScrollDownButton>
          </motion.div>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
    </CompositionRoot>
  );
}
export const Select = Object.assign(SelectRoot, { Item: SelectItem });

const sliderRules: readonly SlotRule[] = [
  { name: "label", min: 0, max: 1 },
  { name: "value", min: 0, max: 1 },
];
type SliderContextValue = {
  id: string;
  current: number;
  formatValue: (value: number) => string;
};
const SliderContext = createContext<SliderContextValue | null>(null);

function SliderLabel({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"label"> & { children: ReactNode }) {
  const slider = useContext(SliderContext);
  useSlot("Slider", "label", { present: hasContent(children) });
  return (
    <label
      {...props}
      htmlFor={slider?.id}
      className={cx("ui-slider-label-text", className)}
    >
      {children}
    </label>
  );
}

function SliderValue({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"output"> & { children?: ReactNode }) {
  const slider = useContext(SliderContext);
  useSlot("Slider", "value", { present: true });
  return (
    <output
      {...props}
      htmlFor={slider?.id}
      className={cx("ui-slider-value", className)}
    >
      {hasContent(children)
        ? children
        : slider
          ? slider.formatValue(slider.current)
          : null}
    </output>
  );
}

export type SliderProps = Omit<
  ComponentPropsWithRef<"input">,
  | "type"
  | "value"
  | "defaultValue"
  | "min"
  | "max"
  | "step"
  | "size"
  | "onChange"
  | "children"
> & {
  children?: ReactNode;
  layout?: "field" | "inline" | "bare";
  variant?: "track" | "filled";
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  formatValue?: (value: number) => string;
};
function SliderRoot({
  children,
  variant = "track",
  layout = "field",
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  formatValue = String,
  className = "",
  style,
  id: suppliedId,
  ...props
}: SliderProps) {
  const generated = useId();
  const keyboard = useKeyboardFocus();
  const id = suppliedId ?? generated;
  const clamp = (value: number) => Math.max(min, Math.min(max, value));
  const [internal, setInternal] = useState(() => clamp(defaultValue));
  const current = clamp(value ?? internal);
  const effectiveLayout = variant === "filled" ? "field" : layout;
  const progress =
    max > min
      ? Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100))
      : 0;
  const context = useMemo(
    () => ({ id, current, formatValue }),
    [current, formatValue, id],
  );
  const composition = useComposition("Slider", sliderRules, (registrations) => {
    const named = registrations.some(
      (item) => item.slot === "label" && item.present,
    );
    if (named || props["aria-label"] || props["aria-labelledby"]) return [];
    return ["[uagray] Slider 没有 Label 时，控件必须有可访问名称"];
  });
  return (
    <CompositionRoot value={composition.value}>
      <SliderContext.Provider value={context}>
        <div
          className={`ui-slider ui-slider--${variant} ui-slider--${effectiveLayout} ${className}`}
          style={{ "--ui-range": `${progress}%` } as CSSProperties}
        >
          {variant === "filled" && (
            <>
              <span className="ui-slider-fill" aria-hidden="true" />
              <span className="ui-slider-ticks" aria-hidden="true" />
              <span className="ui-slider-handle" aria-hidden="true" />
            </>
          )}
          {hasContent(children) ? (
            <div className="ui-slider-label">{children}</div>
          ) : null}
          <input
            {...props}
            id={id}
            type="range"
            data-keyboard-focus={keyboard || undefined}
            min={min}
            max={max}
            step={step}
            value={current}
            aria-valuetext={formatValue(current)}
            style={{ ...style, "--ui-range": `${progress}%` } as CSSProperties}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (value === undefined) setInternal(next);
              onValueChange?.(next);
            }}
          />
        </div>
      </SliderContext.Provider>
    </CompositionRoot>
  );
}
export const Slider = Object.assign(SliderRoot, {
  Label: SliderLabel,
  Value: SliderValue,
});
