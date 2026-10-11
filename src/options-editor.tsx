import { useEffect, useState } from "react";
import { Button, Field, Input, Switch, Textarea } from "./ui";
import { iconNames } from "./ui/icons";
import type { ChoiceItem } from "./playground-catalog";

type EditorMode = "options" | "segments" | "tabs" | "links";

export function OptionsEditor({
  name,
  value,
  onChange,
  mode = "options",
}: {
  name: string;
  value: ChoiceItem[];
  onChange: (value: ChoiceItem[]) => void;
  mode?: EditorMode;
}) {
  const update = (index: number, patch: Partial<ChoiceItem>) =>
    onChange(
      value.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  const move = (index: number, direction: number) => {
    const next = [...value];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    onChange(next);
  };
  return (
    <div className="api-options">
      {value.map((item, index) => (
        <OptionRow
          key={item.value}
          name={`API ${name} ${index + 1}`}
          item={item}
          mode={mode}
          validValue={(next) =>
            next.trim() !== "" &&
            !value.some((other, i) => i !== index && other.value === next)
          }
          onChange={(patch) => update(index, patch)}
          onRemove={() => onChange(value.filter((_, i) => i !== index))}
          onMoveUp={index > 0 ? () => move(index, -1) : undefined}
          onMoveDown={
            index < value.length - 1 ? () => move(index, 1) : undefined
          }
        />
      ))}
      <Button
        size="sm"
        disabled={value.length >= 8}
        onClick={() => {
          let id = 1;
          while (value.some((item) => item.value === `item-${id}`)) id++;
          onChange([
            ...value,
            {
              value: `item-${id}`,
              label: "新选项",
              ...(mode === "tabs" ? { content: "" } : {}),
              ...(mode === "segments" ? { count: "" } : {}),
              ...(mode === "links"
                ? { href: "https://example.com", icon: "earth" }
                : {}),
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
  mode,
  validValue,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  name: string;
  item: ChoiceItem;
  mode: EditorMode;
  validValue: (value: string) => boolean;
  onChange: (patch: Partial<ChoiceItem>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
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
      <Field>
        <Field.Label>显示名称</Field.Label>
        <Field.Control>
          <Input
            aria-label={`${name} label`}
            value={item.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </Field.Control>
      </Field>
      {mode !== "links" && (
        <Field>
          <Field.Label>稳定标识</Field.Label>
          <Field.Control>
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
          </Field.Control>
          {error && <Field.Error>{error}</Field.Error>}
        </Field>
      )}
      {mode === "links" && (
        <Field>
          <Field.Label>地址</Field.Label>
          <Field.Control>
            <Input
              aria-label={`${name} href`}
              value={item.href ?? ""}
              onChange={(event) => onChange({ href: event.target.value })}
            />
          </Field.Control>
        </Field>
      )}
      <div className="api-option-actions">
        {mode !== "links" && (
          <Switch
            aria-label={`${name} disabled`}
            checked={!!item.disabled}
            onChange={(event) => onChange({ disabled: event.target.checked })}
          >
            禁用此项
          </Switch>
        )}
        <Button
          size="sm"
          emphasis="quiet"
          aria-label={`上移 ${name}`}
          disabled={!onMoveUp}
          onClick={onMoveUp}
        >
          上移
        </Button>
        <Button
          size="sm"
          emphasis="quiet"
          aria-label={`下移 ${name}`}
          disabled={!onMoveDown}
          onClick={onMoveDown}
        >
          下移
        </Button>
        <Button
          size="sm"
          emphasis="quiet"
          aria-label={`删除 ${name}`}
          onClick={onRemove}
        >
          删除
        </Button>
      </div>
      {mode === "tabs" && (
        <Field>
          <Field.Label>面板内容</Field.Label>
          <Field.Control>
            <Textarea
              aria-label={`${name} content`}
              value={item.content ?? ""}
              rows={2}
              resizable={false}
              onChange={(event) => onChange({ content: event.target.value })}
            />
          </Field.Control>
        </Field>
      )}
      {mode === "segments" && (
        <Field>
          <Field.Label>Count</Field.Label>
          <Field.Control>
            <Input
              aria-label={`${name} count`}
              value={item.count ?? ""}
              onChange={(event) => onChange({ count: event.target.value })}
            />
          </Field.Control>
        </Field>
      )}
      {mode === "links" && (
        <Field>
          <Field.Label>Icon</Field.Label>
          <Field.Control>
            <Input
              aria-label={`${name} icon`}
              value={item.icon ?? ""}
              list={`${name}-icons`}
              onChange={(event) => onChange({ icon: event.target.value })}
            />
            <datalist id={`${name}-icons`}>
              {iconNames.map((icon) => (
                <option key={icon} value={icon} />
              ))}
            </datalist>
          </Field.Control>
        </Field>
      )}
    </div>
  );
}
