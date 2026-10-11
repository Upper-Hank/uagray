import {
  useId,
  createContext,
  useContext,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonProps } from "./components";
import { Icon, IconSizeContext } from "./icons";
import { Alert } from "./feedback";
import {
  CompositionRoot,
  useComposition,
  useSlot,
  type SlotRule,
} from "./composition";
import { compose, cx, hasContent } from "./host";
const FileContext = createContext<{
  open: () => void;
  disabled: boolean;
  error: string;
  descriptionId: string;
  errorId: string;
  describedBy?: string;
  errorHost: HTMLDivElement | null;
} | null>(null);
const fileRules: readonly SlotRule[] = [
  { name: "icon", min: 1, max: 1 },
  { name: "description", min: 0, max: 1 },
  { name: "trigger", min: 1, max: 1 },
  { name: "error", min: 0, max: 1 },
];
function FileIcon({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span"> & { children: ReactNode }) {
  useSlot("FileDropzone", "icon", { present: hasContent(children) });
  return (
    <IconSizeContext.Provider value={{ size: 22, max: 22 }}>
      <span
        {...props}
        className={cx("ui-dropzone-icon", className)}
        aria-hidden="true"
      >
        {children}
      </span>
    </IconSizeContext.Provider>
  );
}
function FileDescription({
  children,
  id: suppliedId,
  ...props
}: ComponentPropsWithRef<"p"> & { children: ReactNode }) {
  const context = useContext(FileContext);
  const id = suppliedId ?? context?.descriptionId;
  useSlot("FileDropzone", "description", { id, present: hasContent(children) });
  return hasContent(children) ? (
    <p {...props} id={id}>
      {children}
    </p>
  ) : null;
}
function FileTrigger({
  children,
  disabled,
  onClick,
  ...props
}: ButtonProps & { children: ReactNode }) {
  const context = useContext(FileContext);
  useSlot("FileDropzone", "trigger", { present: hasContent(children) });
  return (
    <Button
      {...props}
      disabled={disabled || context?.disabled}
      aria-describedby={
        [props["aria-describedby"], context?.describedBy]
          .filter(Boolean)
          .join(" ") || undefined
      }
      onClick={compose(onClick, (event) => {
        if (!event.defaultPrevented) context?.open();
      })}
    >
      {children}
    </Button>
  );
}
function FileError({ children, id, ...props }: ComponentPropsWithRef<"div">) {
  const context = useContext(FileContext);
  const message = children === undefined ? context?.error : children;
  const errorId = id ?? context?.errorId;
  useSlot("FileDropzone", "error", {
    id: errorId,
    present: hasContent(message),
  });
  return hasContent(message) && context?.errorHost
    ? createPortal(
        <Alert {...props} id={errorId} tone="danger">
          <Alert.Icon>
            <Icon name="close" />
          </Alert.Icon>
          <Alert.Body>{message}</Alert.Body>
        </Alert>,
        context.errorHost,
      )
    : null;
}
export function FileDropzone({
  children,
  accept,
  multiple = false,
  disabled = false,
  maxSize,
  onFiles,
  onReject,
  name,
  className,
  style,
  ref: rootRef,
  "aria-label": ariaLabel = "选择文件",
  ...props
}: Omit<ComponentPropsWithRef<"div">, "onChange" | "children"> & {
  children: ReactNode;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxSize?: number;
  onFiles: (files: File[]) => void;
  onReject?: (message: string) => void;
  name?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [errorHost, setErrorHost] = useState<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState("");
  const composition = useComposition("FileDropzone", fileRules);
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
      setRejected(message);
      onReject?.(message);
      return;
    }
    if (files.length) {
      setRejected("");
      onFiles(files);
    }
  }
  const change = (event: ChangeEvent<HTMLInputElement>) => {
    receive(Array.from(event.target.files ?? []));
    event.target.value = "";
  };
  const description = composition.registrations.find(
    (s) => s.slot === "description" && s.present,
  );
  const errorSlot = composition.registrations.find(
    (s) => s.slot === "error" && s.present,
  );
  const describedBy =
    [description?.id, errorSlot?.id].filter(Boolean).join(" ") || undefined;
  return (
    <CompositionRoot value={composition.value}>
      <FileContext.Provider
        value={{
          open: () => input.current?.click(),
          disabled,
          error: rejected,
          descriptionId: id,
          errorId: `${id}-error`,
          describedBy,
          errorHost,
        }}
      >
        <div
          {...props}
          ref={rootRef}
          className={cx("ui-upload", className)}
          style={style}
        >
          <div
            className={cx(
              "ui-dropzone",
              !disabled && dragging && "ui-dropzone--active",
            )}
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
            {children}
            <input
              className="ui-sr-only"
              tabIndex={-1}
              ref={input}
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={disabled}
              name={name}
              aria-label={ariaLabel}
              aria-describedby={describedBy}
              aria-invalid={errorSlot ? true : undefined}
              onChange={change}
            />
          </div>
          {errorSlot && <div ref={setErrorHost} />}
        </div>
      </FileContext.Provider>
    </CompositionRoot>
  );
}
FileDropzone.Icon = FileIcon;
FileDropzone.Description = FileDescription;
FileDropzone.Trigger = FileTrigger;
FileDropzone.Error = FileError;
