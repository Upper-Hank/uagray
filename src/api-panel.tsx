import { useState } from "react";
import {
  Button,
  ColorPicker,
  Input,
  NumberInput,
  SegmentedControl,
  Select,
  Surface,
  Switch,
} from "./ui";
import {
  parameterGroups,
  type Args,
  type ComponentEntry,
  type Control,
  type Value,
} from "./playground-catalog";
import {
  CollectionBlock,
  ContentBlock,
  IconChoice,
  VisualChoice,
} from "./api-editors";
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
    const name = field.label ?? field.key;
    const label = field.scope === "slot" ? name : `API ${field.key}`;
    const disabled = fieldDisabled?.(field.key) ?? false;
    const required =
      field.required || field.requiredWhen?.(args) || false;
    const canRemove = field.removable ? field.removable(args) : !required;
    const options = selectOptions(field);
    if (hidden) return null;
    if (entry.id === "color-picker" && field.key === "value") {
      return (
        <ColorPicker
          aria-label={label}
          value={String(value)}
          onValueChange={(next) => patch(field.key, next)}
          disabled={disabled}
        />
      );
    }
    if (
      ["text", "textarea"].includes(field.control) &&
      (field.group === "content" || field.control === "textarea")
    ) {
      return (
        <ContentBlock
          field={field}
          name={name}
          value={String(value ?? "")}
          disabled={disabled}
          required={required}
          canRemove={canRemove}
          onChange={(next) => patch(field.key, next)}
        />
      );
    }
    if (
      field.control === "enum" &&
      (field.key === "icon" || (entry.id === "icons" && field.key === "name"))
    ) {
      return (
        <IconChoice
          field={field}
          value={String(value)}
          options={options ?? []}
          disabled={disabled}
          onChange={(next) => patch(field.key, next)}
        />
      );
    }
    if (
      field.control === "enum" &&
      ["tone", "emphasis", "size"].includes(field.key)
    ) {
      return (
        <VisualChoice
          field={field}
          value={String(value)}
          options={options ?? []}
          disabled={disabled}
          onChange={(next) => patch(field.key, next)}
        />
      );
    }
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
            aria-label={label}
            value={String(value ?? "")}
            onValueChange={(next) => patch(field.key, next)}
          >
            {options.map((option) => (
              <SegmentedControl.Item
                key={option.value}
                value={option.value}
                disabled={disabled || option.disabled}
              >
                <SegmentedControl.Label>{option.label}</SegmentedControl.Label>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
        ) : (
          <Select
            aria-label={label}
            value={String(value ?? "")}
            disabled={disabled}
            onValueChange={(next) => patch(field.key, next)}
          >
            {(options ?? []).map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </Select.Item>
            ))}
          </Select>
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
          <ContentBlock
            field={field}
            name={name}
            value={String(value ?? "")}
            disabled={disabled}
            required={required}
            canRemove={canRemove}
            onChange={(next) => patch(field.key, next)}
          />
        );
      case "items":
        return (
          <CollectionBlock
            field={field}
            name={name}
            value={value}
            onChange={(next) => patch(field.key, next)}
          />
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
              className={`api-param${["textarea", "items"].includes(field.control) || field.key === "children" ? " api-param--wide" : ""}`}
              key={field.key}
            >
              <div className="api-param-heading">
                {field.scope === "slot" ? (
                  (field.label ?? field.key)
                ) : (
                  <code>{field.key}</code>
                )}
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
      variant="raised"
      className="api-panel"
      role="group"
      aria-label="API 配置"
    >
      <header className="api-panel-header">
        <h2>配置</h2>
        <Button
          size="sm"
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
              (field) =>
                (field.scope === "prop" || field.scope === "slot") &&
                field.group === group.id,
            ),
          ),
        )}
        {section(
          "示例配置",
          fields.filter((field) => field.scope === "example"),
        )}
      </div>
    </Surface>
  );
}
