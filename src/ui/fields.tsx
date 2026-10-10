import {
  createContext,
  useContext,
  useId,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useKeyboardFocus } from "./focus";
import { Icon } from "./icons";

const FieldContext = createContext<{
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
} | null>(null);
export function Field({
  id: suppliedId,
  label,
  hint,
  error,
  required = false,
  children,
  className = "",
}: {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const generated = useId();
  const id = suppliedId ?? generated;
  const describedBy =
    [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <FieldContext.Provider
      value={{ id, describedBy, invalid: !!error, required }}
    >
      <div className={`ui-field ${className}`}>
        <label htmlFor={id} className="ui-field-label">
          {label}
          {required && <span className="ui-field-required">必填</span>}
        </label>
        {children}
        {hint && (
          <p id={`${id}-hint`} className="ui-field-hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="ui-field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
function useFieldAttributes(props: {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: ComponentPropsWithRef<"input">["aria-invalid"];
}) {
  const field = useContext(FieldContext);
  const keyboard = useKeyboardFocus();
  return {
    "data-keyboard-focus": keyboard || undefined,
    id: field?.id ?? props.id,
    required: props.required ?? field?.required,
    "aria-invalid": props["aria-invalid"] ?? (field?.invalid || undefined),
    "aria-describedby":
      [field?.describedBy, props["aria-describedby"]]
        .filter(Boolean)
        .join(" ") || undefined,
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
      data-resizable={resizable && !props.disabled ? "true" : "false"}
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
  useImperativeHandle(ref, () => inputRef.current!, []);
  const [draft, setDraft] = useState(String(value ?? defaultValue));
  useEffect(() => {
    if (value !== undefined) setDraft(String(value));
  }, [value]);
  const clamp = (next: number) =>
    Math.max(min ?? -Infinity, Math.min(max ?? Infinity, next));
  const commit = (next: number) => {
    const result = clamp(next);
    setDraft(String(result));
    onValueChange?.(result);
  };
  const adjust = (direction: number) => {
    const input = inputRef.current;
    if (!input) return;
    if (!Number.isFinite(input.valueAsNumber))
      input.value = String(clamp(value ?? defaultValue));
    if (direction > 0) input.stepUp();
    else input.stepDown();
    if (Number.isFinite(input.valueAsNumber)) commit(input.valueAsNumber);
  };
  const current = Number(draft);
  return (
    <div className={`ui-number-input ${className}`}>
      <Input
        {...props}
        ref={inputRef}
        type="number"
        value={draft}
        min={min}
        max={max}
        step={step > 0 ? step : 1}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(event) => {
          setDraft(event.target.value);
          const next = event.target.valueAsNumber;
          if (Number.isFinite(next)) onValueChange?.(clamp(next));
        }}
        onBlur={(event) => {
          if (!readOnly && !disabled)
            commit(
              Number.isFinite(event.target.valueAsNumber)
                ? event.target.valueAsNumber
                : (value ?? defaultValue),
            );
          onBlur?.(event);
        }}
      />
      <div className="ui-number-input-actions">
        <button
          type="button"
          aria-label="减少"
          disabled={
            disabled || readOnly || (min !== undefined && current <= min)
          }
          onClick={() => adjust(-1)}
        >
          −
        </button>
        <button
          type="button"
          aria-label="增加"
          disabled={
            disabled || readOnly || (max !== undefined && current >= max)
          }
          onClick={() => adjust(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectProps = Omit<
  ComponentPropsWithRef<typeof SelectPrimitive.Trigger>,
  "children" | "value" | "defaultValue" | "onChange"
> & {
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
};
export function Select({
  options,
  value,
  defaultValue = "",
  onValueChange,
  name,
  required,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  const { required: fieldRequired, ...attrs } = useFieldAttributes({
    ...props,
    required,
  });
  return (
    <SelectPrimitive.Root
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
        className={`ui-select-trigger ui-input ${className}`}
        aria-required={fieldRequired || undefined}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <Icon name="down" size={14} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={8}
          collisionPadding={12}
          className="ui-select-menu"
        >
          <SelectPrimitive.ScrollUpButton className="ui-select-scroll">
            <Icon name="down" size={14} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="ui-select-option"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Icon name="check" size={14} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="ui-select-scroll">
            <Icon name="down" size={14} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
export function Slider({
  label,
  variant = "track",
  layout = "field",
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  onChange,
  formatValue = String,
  className = "",
  style,
  id: suppliedId,
  ...props
}: Omit<
  ComponentPropsWithRef<"input">,
  "type" | "value" | "defaultValue" | "min" | "max" | "step" | "size"
> & {
  label?: string;
  layout?: "field" | "inline" | "bare";
  variant?: "track" | "filled";
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  formatValue?: (value: number) => string;
}) {
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
  return (
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
      {effectiveLayout !== "bare" && (
        <div className="ui-slider-label">
          {label && <label htmlFor={id}>{label}</label>}
          <output htmlFor={id}>{formatValue(current)}</output>
        </div>
      )}
      <input
        {...props}
        id={id}
        type="range"
        data-keyboard-focus={keyboard || undefined}
        min={min}
        max={max}
        step={step}
        value={current}
        aria-label={
          props["aria-label"] ??
          (effectiveLayout === "bare" ? label : undefined)
        }
        aria-valuetext={formatValue(current)}
        style={{ ...style, "--ui-range": `${progress}%` } as CSSProperties}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (value === undefined) setInternal(next);
          onValueChange?.(next);
          onChange?.(event);
        }}
      />
    </div>
  );
}
