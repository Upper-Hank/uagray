import { useId, useState } from "react";
import { Button, Dialog, Icon, Input, Textarea } from "./ui";
import { iconNames, type IconName } from "./ui/icons";
import { choiceItems, type Control, type Value } from "./playground-catalog";
import { OptionsEditor } from "./options-editor";

export type EditorOption = { value: string; label: string; disabled?: boolean };
const toneNames: Record<string, string> = {
  neutral: "常规",
  success: "成功",
  danger: "危险",
};
const emphasisNames: Record<string, string> = {
  strong: "强",
  default: "默认",
  quiet: "弱",
};

/** Visual samples are labels of native radios, never nested interactive controls. */
export function VisualChoice({
  field,
  value,
  options,
  disabled,
  onChange,
}: {
  field: Control;
  value: string;
  options: EditorOption[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const name = useId();
  return (
    <div
      className={`api-visual-choices api-visual-choices--${field.key}`}
      role="radiogroup"
      aria-label={`API ${field.key}`}
    >
      {options.map((option) => (
        <label className="api-visual-option" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            aria-label={option.value}
            checked={value === option.value}
            disabled={disabled || option.disabled}
            onChange={() => onChange(option.value)}
          />
          <span className="api-visual-sample" aria-hidden="true">
            {field.key === "tone" ? (
              <span className={`api-tone-swatch ui-tone--${option.value}`}>
                {value === option.value && <Icon name="check" size={16} />}
              </span>
            ) : field.key === "emphasis" ? (
              <span
                className={`api-emphasis-sample ui-button ui-button--${option.value}`}
              >
                Aa
              </span>
            ) : (
              <span
                className={`api-size-sample ui-button ui-button--${option.value}`}
              >
                Aa
              </span>
            )}
          </span>
          <span className="api-choice-caption">
            {field.key === "tone"
              ? toneNames[option.value]
              : field.key === "emphasis"
                ? emphasisNames[option.value]
                : option.value === "md"
                  ? "标准"
                  : "小号"}
          </span>
        </label>
      ))}
    </div>
  );
}

/** Secondary editing uses a local draft; only Save enters the shared args. */
export function ContentBlock({
  field,
  name = field.label ?? field.key,
  value,
  disabled,
  required = field.required,
  canRemove = !field.required,
  onChange,
}: {
  field: Control;
  name?: string;
  value: string;
  disabled: boolean;
  required?: boolean;
  canRemove?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const multiline =
    field.key === "children" ||
    field.key === "description" ||
    field.key === "body" ||
    field.control === "textarea";
  const label = field.scope === "slot" ? name : `API ${field.key}`;
  return (
    <>
      <div className="api-content-block">
        <Button
          className="api-content-trigger"
          aria-label={`${value ? "编辑" : "添加"} ${name}`}
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={() => {
            setDraft(value);
            setOpen(true);
          }}
        >
          <Button.Label>
            <Icon name={value ? "menu" : "plus"} size={16} />
            <span className="api-content-summary">{value || "添加内容"}</span>
          </Button.Label>
        </Button>
        {!!value && canRemove && (
          <Button
            emphasis="quiet"
            aria-label={`移除 ${name}`}
            disabled={disabled}
            onClick={() => onChange("")}
          >
            <Button.Label>移除</Button.Label>
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen} aria-label={`编辑 ${name}`}>
        <Dialog.Header>
          <Dialog.Title>{`编辑 ${name}`}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          {open &&
            (multiline ? (
              <Textarea
                autoFocus
                aria-label={label}
                value={draft}
                rows={6}
                onChange={(event) => setDraft(event.target.value)}
              />
            ) : (
              <Input
                autoFocus
                aria-label={label}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            ))}
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setOpen(false)}>
            <Button.Label>取消</Button.Label>
          </Button>
          <Button
            emphasis="strong"
            disabled={disabled || (!!required && !draft.trim())}
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
          >
            <Button.Label>保存</Button.Label>
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

export function CollectionBlock({
  field,
  name = field.label ?? field.key,
  value,
  onChange,
}: {
  field: Control;
  name?: string;
  value: Value;
  onChange: (value: Value) => void;
}) {
  const [open, setOpen] = useState(false);
  const items = choiceItems(value);
  return (
    <>
      <Button
        className="api-content-trigger"
        aria-label={`编辑 ${name}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Button.Label>
          <Icon name="grid" size={16} />
          <span className="api-content-summary">
            {items.length
              ? items.map((item) => item.label || item.value).join(" · ")
              : "添加内容"}
          </span>
          <span className="api-collection-count">{items.length} 项</span>
        </Button.Label>
      </Button>
      <Dialog open={open} onOpenChange={setOpen} aria-label={`编辑 ${name}`}>
        <Dialog.Header>
          <Dialog.Title>{`编辑 ${name}`}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          {open && (
            <OptionsEditor
              name={name}
              mode={field.editor ?? "options"}
              value={items}
              onChange={onChange}
            />
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setOpen(false)}>
            <Button.Label>完成</Button.Label>
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

export function IconChoice({
  field,
  value,
  options,
  disabled,
  onChange,
}: {
  field: Control;
  value: string;
  options: EditorOption[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isIcon = (name: string): name is IconName =>
    iconNames.includes(name as IconName);
  const caption = (name: string) =>
    name === "auto" ? "组件默认" : name === "none" ? "无图标" : name;
  const name =
    field.scope === "slot" ? (field.label ?? field.key) : `API ${field.key}`;
  return (
    <>
      <Button
        aria-label={name}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={() => {
          setSearch("");
          setOpen(true);
        }}
      >
        <Button.Label>
          {isIcon(value) && <Icon name={value} size={18} />}
          {value ? caption(value) : "添加图标"}
        </Button.Label>
      </Button>
      <Dialog open={open} onOpenChange={setOpen} aria-label={`选择 ${name}`}>
        <Dialog.Header>
          <Dialog.Title>{`选择 ${name}`}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          {open && (
            <div className="api-icon-picker">
              <Input
                autoFocus
                aria-label="搜索图标"
                placeholder="搜索图标名称"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="api-icon-grid">
                {options
                  .filter(
                    (option) =>
                      option.value !== "" &&
                      (option.value.includes(search.trim().toLowerCase()) ||
                        caption(option.value).includes(search.trim())),
                  )
                  .map((option) => (
                    <Button
                      key={option.value}
                      disabled={disabled || option.disabled}
                      aria-pressed={value === option.value}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <Button.Label>
                        {isIcon(option.value) && (
                          <Icon name={option.value} size={18} />
                        )}
                        <span>{caption(option.value)}</span>
                      </Button.Label>
                    </Button>
                  ))}
              </div>
              {!options.some(
                (option) =>
                  option.value !== "" &&
                  (option.value.includes(search.trim().toLowerCase()) ||
                    caption(option.value).includes(search.trim())),
              ) && <p>没有匹配的图标</p>}
            </div>
          )}
        </Dialog.Body>
        {options.some((option) => option.value === "") && value !== "" && (
          <Dialog.Footer>
            <Button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <Button.Label>移除图标</Button.Label>
            </Button>
          </Dialog.Footer>
        )}
      </Dialog>
    </>
  );
}
