import { useEffect, useState } from "react";
import { Button, Field, Input, Switch, Textarea } from "./ui";
import type { ChoiceItem } from "./playground-catalog";

export function OptionsEditor({
  name,
  value,
  onChange,
  withContent,
}: {
  name: string;
  value: ChoiceItem[];
  onChange: (value: ChoiceItem[]) => void;
  withContent: boolean;
}) {
  const update = (index: number, patch: Partial<ChoiceItem>) =>
    onChange(
      value.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  return (
    <div className="api-options">
      {value.map((item, index) => (
        <OptionRow
          key={index}
          name={`API ${name} ${index + 1}`}
          item={item}
          withContent={withContent}
          validValue={(next) =>
            next.trim() !== "" &&
            !value.some((other, i) => i !== index && other.value === next)
          }
          onChange={(patch) => update(index, patch)}
          onRemove={() => onChange(value.filter((_, i) => i !== index))}
        />
      ))}
      <Button
        size="small"
        disabled={value.length >= 8}
        onClick={() => {
          let id = 1;
          while (value.some((item) => item.value === `item-${id}`)) id++;
          onChange([
            ...value,
            {
              value: `item-${id}`,
              label: "新选项",
              ...(withContent ? { content: "" } : {}),
            },
          ]);
        }}
      >
        添加选项
      </Button>
    </div>
  );
}
function OptionRow({
  name,
  item,
  withContent,
  validValue,
  onChange,
  onRemove,
}: {
  name: string;
  item: ChoiceItem;
  withContent: boolean;
  validValue: (value: string) => boolean;
  onChange: (patch: Partial<ChoiceItem>) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(item.value);
  const [error, setError] = useState<string>();
  useEffect(() => {
    setDraft(item.value);
    setError(undefined);
  }, [item.value]);
  const commit = () => {
    if (!validValue(draft)) {
      setError("value 必须非空且唯一");
      return;
    }
    setError(undefined);
    onChange({ value: draft });
  };
  return (
    <div className="api-option-row">
      <Field label="label">
        <Input
          aria-label={`${name} label`}
          value={item.label}
          onChange={(event) => onChange({ label: event.target.value })}
        />
      </Field>
      <Field label="value" error={error}>
        <Input
          aria-label={`${name} value`}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(undefined);
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              setDraft(item.value);
              setError(undefined);
            }
          }}
        />
      </Field>
      <div className="api-option-actions">
        <Switch
          label="disabled"
          aria-label={`${name} disabled`}
          checked={!!item.disabled}
          onChange={(event) => onChange({ disabled: event.target.checked })}
        />
        <Button
          size="small"
          emphasis="quiet"
          aria-label={`删除 ${name}`}
          onClick={onRemove}
        >
          删除
        </Button>
      </div>
      {withContent && (
        <Field label="content">
          <Textarea
            aria-label={`${name} content`}
            value={item.content ?? ""}
            rows={2}
            resizable={false}
            onChange={(event) => onChange({ content: event.target.value })}
          />
        </Field>
      )}
    </div>
  );
}
