import { useState } from "react";
import {
  Button,
  Disclosure,
  Input,
  NumberInput,
  SegmentedControl,
  Select,
  Surface,
  Switch,
  Textarea,
} from "./ui";
import {
  choiceItems,
  parameterGroups,
  type Args,
  type ComponentEntry,
  type Control,
  type Value,
} from "./playground-catalog";
import { OptionsEditor } from "./options-editor";
type Option = { value: string; label: string; disabled?: boolean };

export function ApiPanel({
  id,
  hidden,
  entry,
  fields,
  args,
  patch,
  onReset,
  selectOptions,
  fieldDisabled,
}: {
  id: string;
  hidden: boolean;
  entry: ComponentEntry;
  fields: Control[];
  args: Args;
  patch: (key: string, value: Value) => void;
  onReset: () => void;
  selectOptions: (field: Control) => Option[] | null;
  fieldDisabled?: (key: string) => boolean;
}) {
  const [resetKey, setResetKey] = useState(0);
  const editor = (field: Control) => {
    const value = args[field.key];
    const label = `API ${field.key}`;
    const disabled = fieldDisabled?.(field.key) ?? false;
    const options = selectOptions(field);
    const bounds =
      field.key === "value" && ["slider", "number-input"].includes(entry.id)
        ? {
            min: Number(args.min),
            max: Number(args.max),
            step: Number(args.step),
          }
        : field.key === "value" && entry.id === "progress"
          ? { min: 0, max: Number(args.max), step: field.step }
          : field.key === "count" && entry.id === "selection"
            ? { min: 0, max: Number(args.total), step: field.step }
            : field;
    switch (field.control) {
      case "boolean":
        return (
          <Switch
            aria-label={label}
            checked={value === true}
            disabled={disabled}
            onChange={(event) => patch(field.key, event.target.checked)}
          />
        );
      case "enum":
        return options &&
          options.length <= 3 &&
          options.every((option) => option.label.length <= 12) ? (
          <SegmentedControl
            label={label}
            value={String(value ?? "")}
            options={options.map((option) => ({
              ...option,
              disabled: disabled || option.disabled,
            }))}
            onChange={(next) => patch(field.key, next)}
          />
        ) : (
          <Select
            aria-label={label}
            value={String(value ?? "")}
            options={options ?? []}
            disabled={disabled}
            onValueChange={(next) => patch(field.key, next)}
          />
        );
      case "number":
        return (
          <NumberInput
            aria-label={label}
            value={Number(value)}
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            disabled={disabled}
            onValueChange={(next) => patch(field.key, next)}
          />
        );
      case "text":
        return (
          <Input
            aria-label={label}
            value={String(value ?? "")}
            disabled={disabled}
            onChange={(event) => patch(field.key, event.target.value)}
          />
        );
      case "textarea":
        return (
          <Disclosure className="api-editor" title={`编辑 ${field.key}`}>
            <Textarea
              aria-label={label}
              value={String(value ?? "")}
              rows={4}
              resizable={false}
              disabled={disabled}
              onChange={(event) => patch(field.key, event.target.value)}
            />
          </Disclosure>
        );
      case "items":
        return (
          <Disclosure className="api-editor" title={`编辑 ${field.key}`}>
            <OptionsEditor
              name={field.key}
              value={choiceItems(value)}
              withContent={field.key === "items"}
              onChange={(next) => patch(field.key, next)}
            />
          </Disclosure>
        );
    }
  };
  const section = (title: string, controls: Control[]) =>
    controls.length > 0 && (
      <section className="api-section" aria-label={title} key={title}>
        <h3>{title}</h3>
        <div className="api-param-grid">
          {controls.map((field) => (
            <div
              className={`api-param${["textarea", "items"].includes(field.control) ? " api-param--wide" : ""}`}
              key={field.key}
            >
              <div className="api-param-heading">
                <code>{field.key}</code>
              </div>
              <div className="api-param-value">{editor(field)}</div>
            </div>
          ))}
        </div>
      </section>
    );
  return (
    <Surface
      id={id}
      hidden={hidden}
      tone="raised"
      className="api-panel"
      role="group"
      aria-label="API 配置"
    >
      <header className="api-panel-header">
        <h2>配置</h2>
        <Button
          size="small"
          emphasis="default"
          onClick={() => {
            setResetKey((key) => key + 1);
            onReset();
          }}
        >
          重置示例
        </Button>
      </header>
      <div key={resetKey} className="api-panel-content">
        {parameterGroups.map((group) =>
          section(
            group.title,
            fields.filter(
              (field) => field.scope === "prop" && field.group === group.id,
            ),
          ),
        )}
        {section(
          "示例配置",
          fields.filter((field) => field.scope === "example"),
        )}
        {entry.callbacks.length > 0 && (
          <Disclosure className="api-callbacks" title="事件与回调">
            {entry.callbacks.map((callback) => (
              <code key={callback}>{callback}</code>
            ))}
          </Disclosure>
        )}
      </div>
    </Surface>
  );
}
