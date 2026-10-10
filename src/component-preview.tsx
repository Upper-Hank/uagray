import { useState, type ReactNode } from "react";
import {
  lines,
  type Args,
  type Value,
  type ComponentEntry,
} from "./component-examples";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  ColorPicker,
  ConfirmDialog,
  CopyButton,
  Dialog,
  Disclosure,
  Drawer,
  EmptyState,
  ExpandableCode,
  ExternalLinks,
  Field,
  FileDropzone,
  Icon,
  IconButton,
  Input,
  NumberInput,
  Keycap,
  Layout,
  NavigationCard,
  PageShell,
  Pager,
  Progress,
  Radio,
  SearchField,
  SegmentedControl,
  Select,
  SelectionBar,
  ShareButton,
  ShowcaseCard,
  Slider,
  Surface,
  Switch,
  Tabs,
  Textarea,
  Toast,
  type ButtonProps,
  type SurfaceProps,
  type FeedbackTone,
  type IconName,
} from "./ui";

export function ComponentPreview({ entry }: { entry: ComponentEntry }) {
  const [args, setArgs] = useState<Args>(() => ({ ...entry.initial }));
  const [canvasBackground, setCanvasBackground] = useState<
    "base" | "gray" | "white"
  >("gray");
  const [files, setFiles] = useState<File[]>([]);
  const patch = (key: string, value: Value) =>
    setArgs((current) => {
      const next = { ...current, [key]: value };
      if (entry.id === "slider") {
        next.max = Math.max(Number(next.min) + 1, Number(next.max));
        next.value = Math.max(
          Number(next.min),
          Math.min(Number(next.max), Number(next.value)),
        );
      }
      if (entry.id === "number-input") {
        next.max = Math.max(Number(next.min), Number(next.max));
        next.value = Math.max(
          Number(next.min),
          Math.min(Number(next.max), Number(next.value)),
        );
      }
      if (entry.id === "selection")
        next.count = Math.min(Number(next.count), Number(next.total));
      if (entry.id === "progress")
        next.value = Math.min(Number(next.value), Number(next.max));
      if (entry.id === "segments" || entry.id === "tabs") {
        const items = lines(
          String(next[entry.id === "segments" ? "options" : "items"]),
        );
        const enabled = items
          .map((_, i) => i)
          .filter((i) => !(next.lastDisabled && i === items.length - 1));
        if (!enabled.includes(Number(next.value)))
          next.value = String(enabled[0] ?? "");
      }
      return next;
    });
  const s = (key: string) => String(args[key] ?? "");
  const n = (key: string) => Number(args[key]);
  const b = (key: string) => args[key] === true;
  const buttonsAction = s("action");
  const clamped = (key: string, min: number, max: number) =>
    Math.max(min, Math.min(max, n(key)));
  const choices = (key: string) =>
    lines(s(key)).map((label, i) => ({
      value: String(i),
      label,
      disabled: b("lastDisabled") && i === lines(s(key)).length - 1,
    }));
  const feedbackIcon =
    s("icon") === "none"
      ? false
      : s("icon") === "auto"
        ? undefined
        : (s("icon") as IconName);
  let node: ReactNode;
  switch (entry.id) {
    case "color-picker":
      node = (
        <ColorPicker
          label={s("label")}
          value={s("value")}
          disabled={b("disabled")}
          onValueChange={(value) => patch("value", value)}
        />
      );
      break;
    case "segments":
      node = (
        <SegmentedControl
          label={s("label")}
          options={choices("options")}
          value={s("value")}
          onChange={(value) => patch("value", value)}
        />
      );
      break;
    case "search":
      node = (
        <SearchField
          label={s("label")}
          value={s("value")}
          placeholder={s("placeholder")}
          shortcut={b("shortcut")}
          onChange={(value) => patch("value", value)}
        />
      );
      break;
    case "buttons":
      node =
        buttonsAction === "copy" ? (
          <CopyButton
            text={s("text")}
            label={s("children")}
            variant={s("emphasis") === "quiet" ? "plain" : "soft"}
            size={s("size") as ButtonProps["size"]}
          />
        ) : buttonsAction === "share" ? (
          <ShareButton url={s("url")} />
        ) : (
          <Button
            icon={s("icon") as IconName}
            count={n("count") || undefined}
            emphasis={s("emphasis") as ButtonProps["emphasis"]}
            size={s("size") as ButtonProps["size"]}
            disabled={b("disabled")}
            onClick={() => patch("count", n("count") + 1)}
          >
            {s("children")}
          </Button>
        );
      break;
    case "icon-button":
      node = (
        <IconButton
          label={s("label")}
          icon={s("icon") as IconName}
          size={s("size") as ButtonProps["size"]}
          disabled={b("disabled")}
        />
      );
      break;
    case "button-group":
      node = (
        <ButtonGroup label={s("label")} tone={s("tone") as "soft" | "plain"}>
          {lines(s("children")).map((label, i) => (
            <Button key={i}>{label}</Button>
          ))}
        </ButtonGroup>
      );
      break;
    case "number-input":
      node = (
        <NumberInput
          aria-label="数字输入示例"
          value={n("value")}
          min={n("min")}
          max={n("max")}
          step={n("step")}
          disabled={b("disabled")}
          readOnly={b("readOnly")}
          onValueChange={(value) => patch("value", value)}
        />
      );
      break;
    case "input":
      node = (
        <Input
          aria-label="输入示例"
          value={s("value")}
          placeholder={s("placeholder")}
          type={s("type")}
          disabled={b("disabled")}
          readOnly={b("readOnly")}
          required={b("required")}
          onChange={(event) => patch("value", event.target.value)}
        />
      );
      break;
    case "textarea":
      node = (
        <Textarea
          aria-label="多行输入示例"
          value={s("value")}
          placeholder={s("placeholder")}
          rows={n("rows")}
          resizable={b("resizable")}
          disabled={b("disabled")}
          readOnly={b("readOnly")}
          required={b("required")}
          onChange={(event) => patch("value", event.target.value)}
        />
      );
      break;
    case "fields":
      node = (
        <Field
          label={s("label")}
          hint={s("hint") || undefined}
          error={s("error") || undefined}
          required={b("required")}
        >
          <Input placeholder="请输入…" />
        </Field>
      );
      break;
    case "select":
      node = (
        <Select
          aria-label="格式"
          options={[
            { value: "svg", label: "SVG" },
            { value: "png", label: "PNG" },
            { value: "pdf", label: "PDF", disabled: b("lastDisabled") },
          ]}
          value={s("value")}
          placeholder={s("placeholder")}
          disabled={b("disabled")}
          required={b("required")}
          onValueChange={(value) => patch("value", value)}
        />
      );
      break;
    case "checkbox":
      node = (
        <Checkbox
          label={s("label")}
          checked={b("checked")}
          disabled={b("disabled")}
          onChange={(event) => patch("checked", event.target.checked)}
        />
      );
      break;
    case "radio":
      node = (
        <Radio
          label={s("label")}
          name="radio-example"
          checked={b("checked")}
          disabled={b("disabled")}
          onChange={(event) => patch("checked", event.target.checked)}
        />
      );
      break;
    case "switch":
      node = (
        <Switch
          label={s("label") || undefined}
          aria-label={s("label") ? undefined : "开关"}
          checked={b("checked")}
          disabled={b("disabled")}
          onChange={(event) => patch("checked", event.target.checked)}
        />
      );
      break;
    case "slider": {
      const min = n("min");
      const max = Math.max(min + 1, n("max"));
      node = (
        <Slider
          label={s("label") || undefined}
          aria-label={s("label") || "value"}
          variant={s("variant") as "track" | "filled"}
          layout={s("layout") as "field" | "inline" | "bare"}
          value={clamped("value", min, max)}
          min={min}
          max={max}
          step={n("step")}
          disabled={b("disabled")}
          onValueChange={(value) => patch("value", value)}
          formatValue={(value) => `${value}${s("unit")}`}
        />
      );
      break;
    }
    case "tabs":
      node = (
        <Tabs
          label={s("label")}
          value={s("value")}
          onChange={(value) => patch("value", value)}
          items={choices("items").map((item, index) => ({
            ...item,
            content: lines(s("contents"))[index] ? (
              <p className="tabs-example-content">
                {lines(s("contents"))[index] ?? ""}
              </p>
            ) : null,
          }))}
        />
      );
      break;
    case "disclosure":
      node = (
        <Disclosure
          title={s("title")}
          open={b("open")}
          onOpenChange={(open) => patch("open", open)}
        >
          {s("children")}
        </Disclosure>
      );
      break;
    case "dialog":
    case "drawer": {
      const Panel = entry.id === "dialog" ? Dialog : Drawer;
      node = (
        <>
          <Button onClick={() => patch("open", true)}>
            打开{entry.id === "dialog" ? "对话框" : "抽屉"}
          </Button>
          <Panel
            open={b("open")}
            onOpenChange={(open) => patch("open", open)}
            title={s("title")}
            description={s("description") || undefined}
            dismissible={b("dismissible")}
            footer={
              <Button onClick={() => patch("open", false)}>关闭示例</Button>
            }
          >
            {s("children")}
          </Panel>
        </>
      );
      break;
    }
    case "confirm-dialog":
      node = (
        <>
          <Button disabled={b("busy")} onClick={() => patch("open", true)}>
            打开确认框
          </Button>
          <ConfirmDialog
            title={s("title")}
            description={s("description")}
            open={b("open")}
            onOpenChange={(open) => patch("open", open)}
            onConfirm={() => patch("open", false)}
            busy={b("busy")}
            danger={b("danger")}
            confirmLabel={s("confirmLabel")}
            cancelLabel={s("cancelLabel")}
          />
        </>
      );
      break;
    case "badge":
      node = (
        <Badge
          icon={feedbackIcon}
          tone={s("tone") as FeedbackTone}
          variant={s("variant") as "soft" | "plain" | "white"}
        >
          {s("children")}
        </Badge>
      );
      break;
    case "alert":
      node = (
        <Alert
          icon={feedbackIcon}
          title={s("title")}
          tone={s("tone") as FeedbackTone}
        >
          {s("children")}
        </Alert>
      );
      break;
    case "toast":
      node = (
        <>
          <Button onClick={() => patch("open", true)}>显示提示</Button>
          <Toast
            open={b("open")}
            onOpenChange={(open) => patch("open", open)}
            message={s("message")}
            icon={feedbackIcon}
            tone={s("tone") as FeedbackTone}
            duration={n("duration")}
          />
        </>
      );
      break;
    case "progress":
      node = (
        <Progress
          label={s("label") || undefined}
          valueLabel={s("valueLabel") || undefined}
          value={b("indeterminate") ? undefined : clamped("value", 0, n("max"))}
          max={n("max")}
        />
      );
      break;
    case "empty-state":
      node = (
        <EmptyState
          title={s("title")}
          icon={feedbackIcon}
          description={s("description") || undefined}
          action={
            b("action") ? <Button icon="plus">添加文件</Button> : undefined
          }
        />
      );
      break;
    case "upload":
      node = (
        <div className="single-upload">
          <FileDropzone
            label={s("label") || undefined}
            buttonLabel={s("buttonLabel")}
            accept={s("accept")}
            multiple={b("multiple")}
            disabled={b("disabled")}
            maxSize={n("maxSize")}
            onFiles={setFiles}
          />
          {files.length > 0 && (
            <span role="status">
              {files.map((file) => file.name).join("、")}
            </span>
          )}
        </div>
      );
      break;
    case "selection":
      node = (
        <SelectionBar
          summary={s("summary") || undefined}
          tone={s("tone") as "plain" | "soft"}
          count={clamped("count", 0, n("total"))}
          total={n("total")}
          busy={b("busy")}
          onSelectAll={() => patch("count", n("total"))}
          onClear={() => patch("count", 0)}
          onDone={() => patch("count", 0)}
        />
      );
      break;
    case "text":
      node = (
        <ExpandableCode
          code={s("code")}
          label={s("label")}
          collapsedHeight={n("collapsedHeight")}
        />
      );
      break;
    case "navigation":
      node = (
        <Pager
          previous={
            b("previous") ? { title: "按钮", href: "#buttons" } : undefined
          }
          next={b("next") ? { title: "输入", href: "#input" } : undefined}
        />
      );
      break;
    case "cards":
      node = (
        <NavigationCard
          title={s("title")}
          directionLabel={s("directionLabel") || undefined}
          direction={s("direction") as "previous" | "next"}
          href={s("href")}
        />
      );
      break;
    case "showcase":
      node = (
        <ShowcaseCard
          title={s("title")}
          description={s("description")}
          href={s("href")}
          externalLink={
            s("externalLabel")
              ? { label: s("externalLabel"), href: s("externalHref") }
              : undefined
          }
        >
          <span>{s("children")}</span>
        </ShowcaseCard>
      );
      break;
    case "links":
      node = (
        <ExternalLinks
          links={[
            { label: s("label"), href: s("href"), icon: s("icon") as IconName },
          ]}
        />
      );
      break;
    case "surface":
      node = (
        <Surface
          className="surface-demo"
          tone={s("tone") as SurfaceProps["tone"]}
          treatment={s("treatment") as SurfaceProps["treatment"]}
        >
          {s("children")}
        </Surface>
      );
      break;
    case "icons":
      node = (
        <Icon
          name={s("name") as IconName}
          size={n("size")}
          weight={n("weight")}
          absoluteWeight={b("absoluteWeight")}
        />
      );
      break;
    case "keycap":
      node = <Keycap>{s("children")}</Keycap>;
      break;
    case "layout":
      node = (
        <Layout className="example-row" label={s("label")}>
          <Button>{s("children")}</Button>
        </Layout>
      );
      break;
    case "shell":
      node = (
        <PageShell
          className="embedded-shell"
          mainId="example-main"
          mainAs="div"
          controls={<span>{s("controls")}</span>}
          footer={b("footer") ? <span>页脚</span> : undefined}
        >
          {s("children")}
        </PageShell>
      );
      break;
  }
  const stageClassName = `practice-stage practice-stage--component practice-stage--background-${canvasBackground} practice-stage--${entry.id}`;
  const preview = (
    <div className="practice-preview" role="region" aria-label="组件预览">
      <div className={`single-example single-example--${entry.id}`}>{node}</div>
    </div>
  );
  return (
    <>
      <section aria-label="组件展示" className="component-practice">
        <header className="practice-heading practice-heading--component">
          <h1 id="practice-title">{entry.title}</h1>
          <SegmentedControl
            label="画布环境"
            value={canvasBackground}
            onChange={(value) =>
              setCanvasBackground(value as "base" | "gray" | "white")
            }
            options={[
              { value: "base", label: "页面" },
              { value: "gray", label: "灰区" },
              { value: "white", label: "白层" },
            ]}
          />
        </header>
        {canvasBackground === "base" ? (
          <div className={stageClassName}>{preview}</div>
        ) : (
          <Surface
            tone={canvasBackground === "white" ? "raised" : "soft"}
            className={stageClassName}
          >
            {preview}
          </Surface>
        )}
      </section>
      <Disclosure
        title="用法"
        className="usage-code"
        actions={<CopyButton text={entry.code} variant="plain" />}
      >
        <pre
          className="usage-source ui-scroll-area"
          tabIndex={0}
          aria-label="示例代码"
        >
          {entry.code}
        </pre>
      </Disclosure>
    </>
  );
}
