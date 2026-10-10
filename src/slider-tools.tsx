import { useState } from "react";
import { Button, Input, NumberInput, Select, Surface } from "./ui";
import type { Args, Value } from "./playground-catalog";

export function SliderTools({
  args,
  patch,
  background,
  onReset,
}: {
  args: Args;
  patch: (key: string, value: Value) => void;
  background: "base" | "gray" | "white";
  onReset: () => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const label = String(args.label ?? "");
  const tone = background === "white" ? "soft" : "raised";
  const separator = <span className="spec-divider" aria-hidden="true" />;
  return (
    <div
      className="api-configuration slider-tools"
      role="group"
      aria-label="API 配置"
    >
      <Surface tone={tone} className="api-part">
        {editingName ? (
          <Input
            aria-label="API label"
            autoFocus
            value={label}
            onChange={(event) => patch("label", event.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape")
                setEditingName(false);
            }}
          />
        ) : (
          <Button
            variant="plain"
            aria-label="编辑名称"
            onClick={() => setEditingName(true)}
          >
            {label || "value"}
          </Button>
        )}
        {separator}
        <NumberInput
          className="api-stepper"
          aria-label="API value"
          value={Number(args.value)}
          min={Number(args.min)}
          max={Number(args.max)}
          step={Number(args.step)}
          onValueChange={(value) => patch("value", value)}
        />
      </Surface>
      <Surface tone={tone} className="api-part">
        <Select
          aria-label="API variant"
          value={String(args.variant)}
          options={[
            { value: "filled", label: "filled" },
            { value: "track", label: "track" },
          ]}
          onValueChange={(value) => patch("variant", value)}
        />
        {separator}
        <Select
          aria-label="API layout"
          value={String(args.layout)}
          options={["field", "inline", "bare"].map((value) => ({
            value,
            label: value,
          }))}
          onValueChange={(value) => patch("layout", value)}
        />
        {separator}
        <Input
          aria-label="API unit"
          title="单位"
          value={String(args.unit)}
          onChange={(event) => patch("unit", event.target.value)}
        />
      </Surface>
      <Surface tone={tone} className="api-part">
        {(["min", "max", "step"] as const).map((key, index) => (
          <div className="api-limit" key={key}>
            {index > 0 && separator}
            <label>
              {key}
              <NumberInput
                className="api-stepper"
                aria-label={`API ${key}`}
                value={Number(args[key])}
                min={key === "step" ? 1 : 0}
                max={key === "max" ? 512 : 256}
                onValueChange={(value) => patch(key, value)}
              />
            </label>
          </div>
        ))}
      </Surface>
      <Surface tone={tone} className="api-part">
        <Select
          aria-label="展示状态"
          value={args.disabled === true ? "disabled" : "default"}
          options={[
            { value: "default", label: "默认" },
            { value: "disabled", label: "disabled" },
          ]}
          onValueChange={(value) => patch("disabled", value === "disabled")}
        />
        {separator}
        <Button
          variant="plain"
          aria-label="API disabled"
          aria-pressed={args.disabled === true}
          onClick={() => patch("disabled", args.disabled !== true)}
        >
          disabled
        </Button>
        {separator}
        <Button
          variant="plain"
          onClick={() => {
            setEditingName(false);
            onReset();
          }}
        >
          重置
        </Button>
      </Surface>
    </div>
  );
}
