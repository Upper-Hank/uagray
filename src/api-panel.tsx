import { useState } from "react";
import { Button, SegmentedControl, Select } from "./ui";
import { ContentTreeEditor, NodeParameters } from "./content-tree-editor";
import {
  normalizeTree,
  validateTree,
  type ContentNode,
} from "./playground-tree";

export function CustomConfiguration({
  root,
  onChange,
  mode,
  onModeChange,
  preset,
  presets,
  onPresetChange,
  onReset,
  id,
  hidden,
}: {
  root: ContentNode;
  onChange: (root: ContentNode) => void;
  mode: "preset" | "custom";
  onModeChange: (mode: "preset" | "custom") => void;
  preset: string;
  presets: { value: string; label: string }[];
  onPresetChange: (value: string) => void;
  onReset: () => void;
  id: string;
  hidden: boolean;
}) {
  const [error, setError] = useState<string>();
  const commit = (node: ContentNode) => {
    const error = validateTree(node);
    setError(error);
    if (!error) onChange(normalizeTree(node));
  };
  return (
    <section
      className="api-panel"
      id={id}
      hidden={hidden}
      role="group"
      aria-label="API 配置"
    >
      <header className="api-panel-header">
        <h2>配置</h2>
        <Button
          size="sm"
          onClick={() => {
            setError(undefined);
            onReset();
          }}
        >
          <Button.Label>重置示例</Button.Label>
        </Button>
      </header>
      <div className="configuration-mode">
        <SegmentedControl
          aria-label="配置模式"
          value={mode}
          onValueChange={(value) => {
            setError(undefined);
            onModeChange(value as "preset" | "custom");
          }}
        >
          <SegmentedControl.Item value="preset">
            <SegmentedControl.Label>预设</SegmentedControl.Label>
          </SegmentedControl.Item>
          <SegmentedControl.Item value="custom">
            <SegmentedControl.Label>自定义</SegmentedControl.Label>
          </SegmentedControl.Item>
        </SegmentedControl>
        {mode === "preset" && (
          <Select
            aria-label="预设"
            value={preset}
            onValueChange={onPresetChange}
          >
            {presets.map((preset) => (
              <Select.Item key={preset.value} value={preset.value}>
                {preset.label}
              </Select.Item>
            ))}
          </Select>
        )}
      </div>
      {mode === "custom" && (
        <div className="custom-configuration">
          <NodeParameters node={root} onChange={commit} detailed />
          <ContentTreeEditor root={root} onChange={commit} />
          {error && (
            <p className="content-editor-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
