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
import { Button } from "./components";
import { Icon } from "./icons";
import { Alert } from "./feedback";
import { CompositionRoot, useComposition, useSlot, type SlotRule } from "./composition";
import { cx, hasContent } from "./host";
const FileContext = createContext<{ open: () => void; disabled: boolean; error: string; descriptionId: string } | null>(null);
const fileRules: readonly SlotRule[] = [{ name: "description", min: 0, max: 1 }, { name: "trigger", min: 1, max: 1 }, { name: "error", min: 0, max: 1 }];
function FileDescription({ children }: { children: ReactNode }) { const context = useContext(FileContext); useSlot("FileDropzone", "description", { present: hasContent(children) }); return <p id={context?.descriptionId}>{children}</p>; }
function FileTrigger({ children }: { children: ReactNode }) { const context = useContext(FileContext); useSlot("FileDropzone", "trigger", { present: hasContent(children) }); return <Button disabled={context?.disabled} onClick={context?.open}>{typeof children === "string" ? children : <Button.Label>{children}</Button.Label>}</Button>; }
function FileError({ children }: { children?: ReactNode }) {
  const context = useContext(FileContext); useSlot("FileDropzone", "error", { present: children === undefined || hasContent(children) });
  const message = children === undefined ? context?.error : children;
  return hasContent(message) ? <Alert tone="danger"><Alert.Icon><Icon name="close" /></Alert.Icon><Alert.Body>{message}</Alert.Body></Alert> : null;
}
export function FileDropzone({
  children, accept, multiple = false, disabled = false, maxSize, onFiles, onReject, name,
  className, style, ref: rootRef, "aria-label": ariaLabel = "选择文件", ...props
}: Omit<ComponentPropsWithRef<"div">, "onChange" | "children"> & {
  children: ReactNode; accept?: string; multiple?: boolean; disabled?: boolean; maxSize?: number;
  onFiles: (files: File[]) => void; onReject?: (message: string) => void; name?: string;
}) {
  const id = useId(); const input = useRef<HTMLInputElement>(null); const depth = useRef(0);
  const [dragging, setDragging] = useState(false); const [rejected, setRejected] = useState("");
  const composition = useComposition("FileDropzone", fileRules);
  function receive(files: File[]) {
    if (disabled) return;
    const rules = accept?.split(",").map(rule => rule.trim().toLowerCase()).filter(Boolean) ?? [];
    const invalid = files.find(file => (maxSize !== undefined && file.size > maxSize) || (rules.length > 0 && !rules.some(rule => rule.startsWith(".") ? file.name.toLowerCase().endsWith(rule) : rule.endsWith("/*") ? file.type.toLowerCase().startsWith(rule.slice(0, -1)) : file.type.toLowerCase() === rule)));
    const message = !multiple && files.length > 1 ? "请一次选择一个文件。" : invalid ? `文件 ${invalid.name} 的格式或大小不符合要求。` : "";
    if (message) { setRejected(message); onReject?.(message); return; }
    if (files.length) { setRejected(""); onFiles(files); }
  }
  const change = (event: ChangeEvent<HTMLInputElement>) => { receive(Array.from(event.target.files ?? [])); event.target.value = ""; };
  const description = composition.registrations.some(s => s.slot === "description");
  return <CompositionRoot value={composition.value}><FileContext.Provider value={{ open: () => input.current?.click(), disabled, error: rejected, descriptionId: id }}>
    <div {...props} ref={rootRef} className={cx("ui-upload", className)} style={style}>
      <div className={cx("ui-dropzone", !disabled && dragging && "ui-dropzone--active")} aria-disabled={disabled}
        onDragEnter={event => { event.preventDefault(); if (!disabled) { depth.current++; setDragging(true); } }}
        onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = disabled ? "none" : "copy"; }}
        onDragLeave={event => { event.preventDefault(); depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false); }}
        onDrop={event => { event.preventDefault(); depth.current = 0; setDragging(false); receive(Array.from(event.dataTransfer.files)); }}>
        <Icon name="plus" size={22} />{children}
        <input className="ui-sr-only" tabIndex={-1} ref={input} type="file" accept={accept} multiple={multiple} disabled={disabled} name={name}
          aria-label={ariaLabel} aria-describedby={description ? id : undefined} onChange={change} />
      </div>
    </div>
  </FileContext.Provider></CompositionRoot>;
}
FileDropzone.Description = FileDescription;
FileDropzone.Trigger = FileTrigger;
FileDropzone.Error = FileError;
