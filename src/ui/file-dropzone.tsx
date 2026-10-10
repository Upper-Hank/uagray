import { useId, useRef, useState, type ChangeEvent } from "react";
import { Button } from "./components";
import { Icon } from "./icons";
import { Alert } from "./feedback";
export function FileDropzone({
  label,
  buttonLabel = "选择文件",
  accept,
  multiple = false,
  disabled = false,
  maxSize,
  onFiles,
  onReject,
  name,
}: {
  label?: string;
  buttonLabel?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxSize?: number;
  onFiles: (files: File[]) => void;
  onReject?: (message: string) => void;
  name?: string;
}) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  function receive(files: File[]) {
    if (disabled) return;
    const rules =
      accept
        ?.split(",")
        .map((rule) => rule.trim().toLowerCase())
        .filter(Boolean) ?? [];
    const invalid = files.find(
      (file) =>
        (maxSize !== undefined && file.size > maxSize) ||
        (rules.length > 0 &&
          !rules.some((rule) =>
            rule.startsWith(".")
              ? file.name.toLowerCase().endsWith(rule)
              : rule.endsWith("/*")
                ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
                : file.type.toLowerCase() === rule,
          )),
    );
    const message =
      !multiple && files.length > 1
        ? "请一次选择一个文件。"
        : invalid
          ? `文件 ${invalid.name} 的格式或大小不符合要求。`
          : "";
    if (message) {
      setError(message);
      onReject?.(message);
      return;
    }
    if (files.length) {
      setError("");
      onFiles(files);
    }
  }
  const change = (event: ChangeEvent<HTMLInputElement>) => {
    receive(Array.from(event.target.files ?? []));
    event.target.value = "";
  };
  return (
    <div className="ui-upload">
      <div
        className={`ui-dropzone ${dragging ? "ui-dropzone--active" : ""}`}
        aria-disabled={disabled}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            depth.current++;
            setDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = disabled ? "none" : "copy";
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          depth.current = Math.max(0, depth.current - 1);
          if (!depth.current) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          depth.current = 0;
          setDragging(false);
          receive(Array.from(event.dataTransfer.files));
        }}
      >
        <Icon name="plus" size={22} />
        {label && <p id={id}>{label}</p>}
        <Button onClick={() => ref.current?.click()} disabled={disabled}>
          {buttonLabel}
        </Button>
        <input
          className="ui-sr-only"
          tabIndex={-1}
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          name={name}
          aria-labelledby={label ? id : undefined}
          aria-label={label ? undefined : buttonLabel}
          onChange={change}
        />
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}
