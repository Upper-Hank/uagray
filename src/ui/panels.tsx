import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, useAnimationControls, type MotionProps } from "framer-motion";
import { motionDistance, useUiMotion } from "./motion";
import { Button } from "./components";
import { Icon, IconSizeContext } from "./icons";
import { assignRef, compose, cx, hasContent } from "./host";
import {
  CompositionRegion,
  CompositionRoot,
  slotIds,
  useComposition,
  useSlot,
  type SlotRule,
} from "./composition";

const disclosureRules: readonly SlotRule[] = [
  { name: "trigger", min: 1, max: 1 },
  { name: "body", min: 1, max: 1 },
  { name: "actions", min: 0, max: 1, region: "root" },
];
const dialogRules: readonly SlotRule[] = [
  { name: "header", min: 0, max: 1 },
  { name: "body", min: 0, max: 1 },
  { name: "footer", min: 0, max: 1 },
  { name: "title", min: 0, max: 1, region: "header" },
  { name: "description", min: 0, max: 1, region: "header" },
];
const layerOwners = ["Dialog", "Drawer"] as const;
type MotionSafeDialog = Omit<
  ComponentPropsWithRef<"dialog">,
  keyof MotionProps | "open" | "title" | "children"
> & { style?: CSSProperties };

type DisclosureContextValue = {
  id: string;
  expanded: boolean;
  toggle: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};
const DisclosureContext = createContext<DisclosureContextValue | null>(null);
function useDisclosureContext() {
  const context = useContext(DisclosureContext);
  if (context === null)
    throw new Error("Disclosure parts must be inside Disclosure");
  return context;
}

export type DisclosureProps = Omit<
  ComponentPropsWithRef<"div">,
  "title" | "children" | "onChange"
> & {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function DisclosureRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  style,
  ref,
  ...props
}: DisclosureProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [internal, setInternal] = useState(defaultOpen);
  const expanded = open ?? internal;
  const toggle = () => {
    if (open === undefined) setInternal((current) => current === false);
    onOpenChange?.(expanded === false);
  };
  const composition = useComposition("Disclosure", disclosureRules);
  return (
    <CompositionRoot value={composition.value}>
      <DisclosureContext.Provider value={{ id, expanded, toggle, triggerRef }}>
        <div
          {...props}
          ref={ref}
          className={cx("ui-disclosure", className)}
          style={style}
        >
          {children}
        </div>
      </DisclosureContext.Provider>
    </CompositionRoot>
  );
}

function DisclosureTrigger({
  children,
  className,
  onClick,
  ...props
}: ComponentPropsWithRef<"button"> & { children: ReactNode }) {
  const context = useDisclosureContext();
  useSlot("Disclosure", "trigger", { present: hasContent(children) });
  const { enter, exit } = useUiMotion();
  return (
    <Button
      {...props}
      ref={context.triggerRef}
      emphasis="quiet"
      className={cx("ui-disclosure-trigger", className)}
      aria-expanded={context.expanded}
      aria-controls={context.id}
      onClick={(event) => {
        onClick?.(event as never);
        if (event.defaultPrevented) return;
        context.toggle();
      }}
    >
      <CompositionRegion name="trigger">{children}</CompositionRegion>
      <motion.span
        initial={false}
        animate={{ rotate: context.expanded ? 180 : 0 }}
        transition={context.expanded ? enter : exit}
      >
        <Icon name="chevron-down" size={14} />
      </motion.span>
    </Button>
  );
}

function DisclosureActions({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div"> & { children: ReactNode }) {
  useSlot("Disclosure", "actions", { present: hasContent(children) });
  return (
    <div {...props} className={cx("ui-disclosure-actions", className)}>
      {children}
    </div>
  );
}

function DisclosureBody({
  children,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"div">, keyof MotionProps> & {
  children: ReactNode;
}) {
  const context = useDisclosureContext();
  useSlot("Disclosure", "body", { present: hasContent(children) });
  const { enter, exit } = useUiMotion();
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (
      context.expanded === false &&
      content.current?.contains(document.activeElement)
    )
      context.triggerRef.current?.focus();
  }, [context.expanded, context.triggerRef]);
  return (
    <motion.div
      {...props}
      ref={content}
      id={context.id}
      className={cx("ui-disclosure-content", className)}
      initial={false}
      animate={{
        height: context.expanded ? "auto" : 0,
        opacity: context.expanded ? 1 : 0,
      }}
      transition={context.expanded ? enter : exit}
      inert={context.expanded === false ? true : undefined}
      aria-hidden={context.expanded === false}
    >
      <div>{children}</div>
    </motion.div>
  );
}

export const Disclosure = Object.assign(DisclosureRoot, {
  Trigger: DisclosureTrigger,
  Body: DisclosureBody,
  Actions: DisclosureActions,
});

type DialogContextValue = {
  baseId: string;
  open: boolean;
  dismissible: boolean;
  closeLabel: string;
  onOpenChange: (open: boolean) => void;
};
const DialogContext = createContext<DialogContextValue | null>(null);
function useDialogContext() {
  const context = useContext(DialogContext);
  if (context === null) throw new Error("Dialog parts must be inside Dialog");
  return context;
}

export type DialogProps = MotionSafeDialog & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  dismissible?: boolean;
  closeLabel?: string;
  /** @deprecated Use the Drawer component. */
  variant?: "dialog" | "drawer";
};

function DialogFrame({
  open,
  onOpenChange,
  children,
  dismissible = true,
  closeLabel = "关闭",
  className,
  style,
  ref: externalRef,
  variant = "dialog",
  onCancel,
  onClose,
  onClick,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  ...props
}: Omit<DialogProps, "variant"> & { variant?: "dialog" | "drawer" }) {
  const baseId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const controls = useAnimationControls();
  const { reduced, enter, exit } = useUiMotion();
  const owner = variant === "drawer" ? "Drawer" : "Dialog";
  const composition = useComposition(owner, dialogRules, (registrations) => {
    const messages: string[] = [];
    const content = registrations.some(
      (item) =>
        ["title", "description", "body", "footer"].includes(item.slot) &&
        item.present,
    );
    if (!content) messages.push(`[uagray] ${owner} 至少需要一个有内容的区域`);
    const title = registrations.some(
      (item) => item.slot === "title" && item.present,
    );
    if (!title && !ariaLabel && !labelledBy)
      messages.push(
        `[uagray] ${owner} 没有 Title 时，需要 aria-label 或 aria-labelledby`,
      );
    return messages;
  });
  const titleId =
    labelledBy ??
    (slotIds(composition.registrations, "title").join(" ") || undefined);
  const descriptionId =
    [describedBy, ...slotIds(composition.registrations, "description")]
      .filter(Boolean)
      .join(" ") || undefined;
  useEffect(() => {
    const node = ref.current;
    if (node === null) return;
    let cancelled = false;
    if (open) {
      if (node.open === false) {
        controls.set({
          opacity: reduced ? 1 : 0,
          x:
            variant === "drawer" && reduced === false ? motionDistance.edge : 0,
          y:
            variant === "dialog" && reduced === false
              ? motionDistance.floating
              : 0,
        });
        node.showModal();
      }
      void controls.start({ opacity: 1, x: 0, y: 0, transition: enter });
    } else if (node.open) {
      if (node.contains(document.activeElement)) node.focus();
      void controls
        .start({
          opacity: 0,
          x:
            variant === "drawer" && reduced === false ? motionDistance.edge : 0,
          y:
            variant === "dialog" && reduced === false
              ? motionDistance.floating
              : 0,
          transition: exit,
        })
        .then(() => {
          if (cancelled === false) node.close();
        });
    }
    return () => {
      cancelled = true;
    };
  }, [open, controls, reduced, enter, exit, variant]);
  return (
    <CompositionRoot value={composition.value}>
      <DialogContext.Provider
        value={{
          baseId,
          open,
          dismissible,
          closeLabel,
          onOpenChange,
        }}
      >
        <motion.dialog
          {...props}
          className={cx(`ui-dialog ui-dialog--${variant}`, className)}
          style={style}
          ref={(node) => {
            ref.current = node;
            assignRef(externalRef, node);
          }}
          animate={controls}
          tabIndex={props.tabIndex ?? -1}
          data-state={open ? "open" : "closed"}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onCancel={compose(onCancel, (event) => {
            if (event.defaultPrevented) return;
            event.preventDefault();
            if (open && dismissible) onOpenChange(false);
          })}
          onClose={compose(onClose, () => {
            if (open) onOpenChange(false);
          })}
          onClick={compose(onClick, (event) => {
            if (event.defaultPrevented) return;
            if (open && event.target === event.currentTarget && dismissible)
              onOpenChange(false);
          })}
        >
          <div
            className="ui-dialog-inner"
            inert={open === false ? true : undefined}
            aria-hidden={open === false ? true : undefined}
          >
            <IconSizeContext.Provider value={null}>
              <Button
                className="ui-dialog-close"
                aria-label={closeLabel}
                onClick={() => onOpenChange(false)}
                disabled={dismissible === false}
                shape="square"
              >
                <Button.Icon>
                  <Icon name={"close"} />
                </Button.Icon>
              </Button>
              {children}
            </IconSizeContext.Provider>
          </div>
        </motion.dialog>
      </DialogContext.Provider>
    </CompositionRoot>
  );
}

function DialogHeader({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div"> & { children: ReactNode }) {
  useSlot(layerOwners, "header", { present: hasContent(children) });
  return (
    <CompositionRegion name="header">
      <div {...props} className={cx("ui-dialog-heading", className)}>
        {children}
      </div>
    </CompositionRegion>
  );
}

function DialogTitle({
  children,
  className,
  id: suppliedId,
  ...props
}: ComponentPropsWithRef<"h2"> & { children: ReactNode }) {
  const context = useDialogContext();
  const id = suppliedId ?? `${context.baseId}-title`;
  useSlot(layerOwners, "title", { id, present: hasContent(children) });
  return (
    <h2 {...props} id={id} className={cx(className)}>
      {children}
    </h2>
  );
}

function DialogDescription({
  children,
  className,
  id: suppliedId,
  ...props
}: ComponentPropsWithRef<"p"> & { children: ReactNode }) {
  const context = useDialogContext();
  const id = suppliedId ?? `${context.baseId}-description`;
  useSlot(layerOwners, "description", { id, present: hasContent(children) });
  return (
    <p {...props} id={id} className={cx("ui-dialog-description", className)}>
      {children}
    </p>
  );
}

function DialogBody({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div"> & { children: ReactNode }) {
  useSlot(layerOwners, "body", { present: hasContent(children) });
  return (
    <div {...props} className={cx("ui-dialog-body", className)}>
      {children}
    </div>
  );
}

function DialogFooter({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div"> & { children: ReactNode }) {
  useSlot(layerOwners, "footer", { present: hasContent(children) });
  return (
    <div {...props} className={cx("ui-dialog-footer", className)}>
      {children}
    </div>
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
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;

export function Drawer(props: Omit<DialogProps, "variant">) {
  return <DialogFrame {...props} variant="drawer" />;
}
Drawer.Header = DialogHeader;
Drawer.Title = DialogTitle;
Drawer.Description = DialogDescription;
Drawer.Body = DialogBody;
Drawer.Footer = DialogFooter;

const ConfirmContext = createContext<{
  busy: boolean;
  tone: "neutral" | "danger";
  close: () => void;
  confirm: () => void;
} | null>(null);
const confirmRules: readonly SlotRule[] = [
  { name: "cancel", min: 0, max: 1 },
  { name: "confirm", min: 0, max: 1 },
];
function ConfirmCancel({
  children,
  onClick,
  disabled,
  ...props
}: ComponentPropsWithRef<typeof Button>) {
  const context = useContext(ConfirmContext);
  useSlot("ConfirmDialog", "cancel", { present: hasContent(children) });
  return (
    <Button
      {...props}
      disabled={disabled || context?.busy}
      onClick={compose(onClick, (event) => {
        if (!event.defaultPrevented) context?.close();
      })}
    >
      {children}
    </Button>
  );
}
function ConfirmAction({
  children,
  onClick,
  disabled,
  ...props
}: ComponentPropsWithRef<typeof Button>) {
  const context = useContext(ConfirmContext);
  useSlot("ConfirmDialog", "confirm", { present: hasContent(children) });
  return (
    <Button
      emphasis="strong"
      tone={context?.tone}
      {...props}
      busy={context?.busy}
      disabled={disabled}
      onClick={compose(onClick, (event) => {
        if (!event.defaultPrevented) context?.confirm();
      })}
    >
      {children}
    </Button>
  );
}
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  busy = false,
  tone,
  danger,
  children,
  ...props
}: Omit<DialogProps, "dismissible" | "variant"> & {
  onConfirm: () => void;
  busy?: boolean;
  tone?: "neutral" | "danger";
  /** @deprecated Use tone. */ danger?: boolean;
}) {
  const composition = useComposition("ConfirmDialog", open ? confirmRules : []);
  return (
    <CompositionRoot value={composition.value}>
      <ConfirmContext.Provider
        value={{
          busy,
          tone: tone ?? (danger ? "danger" : "neutral"),
          close: () => onOpenChange(false),
          confirm: onConfirm,
        }}
      >
        <Dialog
          {...props}
          open={open}
          onOpenChange={onOpenChange}
          dismissible={!busy}
        >
          {children}
        </Dialog>
      </ConfirmContext.Provider>
    </CompositionRoot>
  );
}
ConfirmDialog.Header = DialogHeader;
ConfirmDialog.Title = DialogTitle;
ConfirmDialog.Description = DialogDescription;
ConfirmDialog.Body = DialogBody;
ConfirmDialog.Footer = DialogFooter;
ConfirmDialog.CancelAction = ConfirmCancel;
ConfirmDialog.ConfirmAction = ConfirmAction;
