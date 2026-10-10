import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useUiMotion } from "./motion";
import { Button, IconButton } from "./components";
import { Icon } from "./icons";

export function Disclosure({
  title,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  actions,
  className = "",
}: {
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const expanded = open ?? internal;
  const { transition } = useUiMotion();
  return (
    <div className={`ui-disclosure ${className}`}>
      <div className="ui-disclosure-heading">
        <Button
          emphasis="quiet"
          className="ui-disclosure-trigger"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => {
            if (open === undefined) setInternal(!expanded);
            onOpenChange?.(!expanded);
          }}
        >
          {title}
          <motion.span
            initial={false}
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={transition}
          >
            <Icon name="down" size={14} />
          </motion.span>
        </Button>
        {actions && <div className="ui-disclosure-actions">{actions}</div>}
      </div>
      <motion.div
        id={id}
        className="ui-disclosure-content"
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={transition}
        inert={!expanded ? true : undefined}
        aria-hidden={!expanded}
      >
        <div>{children}</div>
      </motion.div>
    </div>
  );
}
export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
  closeLabel?: string;
  /** @deprecated Use the Drawer component. */
  variant?: "dialog" | "drawer";
};
function DialogFrame({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  dismissible = true,
  closeLabel = "关闭",
  variant = "dialog",
}: Omit<DialogProps, "variant"> & { variant?: "dialog" | "drawer" }) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const controls = useAnimationControls();
  const { reduced, transition } = useUiMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    if (open) {
      if (!node.open) {
        controls.set({
          opacity: reduced ? 1 : 0,
          x: variant === "drawer" && !reduced ? 20 : 0,
          y: variant === "dialog" && !reduced ? 8 : 0,
        });
        node.showModal();
      }
      void controls.start({ opacity: 1, x: 0, y: 0, transition });
    } else if (node.open) {
      void controls
        .start({
          opacity: 0,
          x: variant === "drawer" && !reduced ? 20 : 0,
          y: variant === "dialog" && !reduced ? 8 : 0,
          transition,
        })
        .then(() => {
          if (!cancelled) node.close();
        });
    }
    return () => {
      cancelled = true;
    };
  }, [open, controls, reduced, transition.duration, variant]);
  return (
    <motion.dialog
      className={`ui-dialog ui-dialog--${variant}`}
      ref={ref}
      animate={controls}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onOpenChange(false);
      }}
      onClose={() => {
        if (open) onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible)
          onOpenChange(false);
      }}
    >
      <div className="ui-dialog-inner">
        <div className="ui-dialog-heading">
          <h2 id={`${id}-title`}>{title}</h2>
          <IconButton
            aria-label={closeLabel}
            icon="close"
            onClick={() => onOpenChange(false)}
            disabled={!dismissible}
          />
        </div>
        {description && (
          <p className="ui-dialog-description" id={`${id}-description`}>
            {description}
          </p>
        )}
        <div className="ui-dialog-body">{children}</div>
        {footer && <div className="ui-dialog-footer">{footer}</div>}
      </div>
    </motion.dialog>
  );
}
export function Dialog({ variant, ...props }: DialogProps) {
  return (
    <DialogFrame
      {...props}
      variant={variant === "drawer" ? "drawer" : "dialog"}
    />
  );
}
export function Drawer(props: Omit<DialogProps, "variant">) {
  return <DialogFrame {...props} variant="drawer" />;
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  busy = false,
  tone,
  danger,
  confirmLabel = "确认删除",
  cancelLabel = "取消",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  busy?: boolean;
  tone?: "neutral" | "danger";
  /** @deprecated Use `tone`. `true` maps to `"danger"`. */
  danger?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const resolvedTone = tone ?? (danger ? "danger" : "neutral");
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      dismissible={!busy}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            emphasis="strong"
            tone={resolvedTone}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "处理中…" : confirmLabel}
          </Button>
        </>
      }
    >
      <span role="status" className="ui-sr-only">
        {busy ? "操作处理中" : ""}
      </span>
    </Dialog>
  );
}
