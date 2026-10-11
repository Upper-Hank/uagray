import { useId, useState, type ReactNode } from "react";
import {
  lines,
  descriptionRows,
  choiceItems,
  exampleArgs,
  normalizeArgs,
  visibleFields,
  type Value,
  type ComponentEntry,
} from "./playground-catalog";
import { ApiPanel } from "./api-panel";
import { exampleCode } from "./playground-code";
import {
  ActionRow,
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
  DescriptionList,
  Heading,
  Text,
  TextList,
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
  Spinner,
  Surface,
  Switch,
  Tabs,
  Textarea,
  Toast,
  ToastRegion,
  type ButtonProps,
  type SurfaceProps,
  type FeedbackTone,
  type IconName,
} from "./ui";

export function Playground({ entry }: { entry: ComponentEntry }) {
  const apiId = useId();
  const [apiOpen, setApiOpen] = useState(true);
  const [args, setArgs] = useState(() => exampleArgs(entry));
  const [canvasBackground, setCanvasBackground] = useState<
    "base" | "gray" | "white"
  >("gray");
  const [files, setFiles] = useState<File[]>([]);
  const patch = (key: string, value: Value) =>
    setArgs((current) => normalizeArgs(entry, { ...current, [key]: value }));
  const s = (key: string) => String(args[key] ?? "");
  const n = (key: string) => Number(args[key]);
  const b = (key: string) => args[key] === true;
  const buttonsAction = s("action");
  const fields = visibleFields(entry, args);
  const choices = (key: string) => choiceItems(args[key]);
  let node: ReactNode;
  switch (entry.id) {
    case "color-picker":
      node = (
        <ColorPicker
          aria-label={s("aria-label")}
          value={s("value")}
          disabled={b("disabled")}
          onValueChange={(value) => patch("value", value)}
        />
      );
      break;
    case "segments":
      node = (
        <SegmentedControl
          aria-label={s("aria-label")}
          value={s("value")}
          defaultValue={s("defaultValue") || undefined}
          onValueChange={(value) => patch("value", value)}
        >
          {choices("entries").map((item) => (
            <SegmentedControl.Item
              key={item.value}
              value={item.value}
              disabled={(item as { disabled?: boolean }).disabled}
            >
              <SegmentedControl.Label>{item.label}</SegmentedControl.Label>
              {item.count && (
                <SegmentedControl.Count>{item.count}</SegmentedControl.Count>
              )}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      );
      break;
    case "search":
      node = (
        <SearchField
          aria-label={s("aria-label")}
          value={s("value")}
          defaultValue={s("defaultValue") || undefined}
          placeholder={s("placeholder")}
          shortcut={b("shortcut")}
          disabled={b("disabled")}
          onValueChange={(value) => patch("value", value)}
        />
      );
      break;
    case "buttons":
      node =
        buttonsAction === "copy" ? (
          <CopyButton text={s("text")} emphasis={s("emphasis") as ButtonProps["emphasis"]} size={s("size") as ButtonProps["size"]}><CopyButton.Label>
            {s("children")}
          </CopyButton.Label><CopyButton.Feedback state="success">{s("copiedLabel")}</CopyButton.Feedback><CopyButton.Feedback state="pending">{s("copyingLabel")}</CopyButton.Feedback><CopyButton.Feedback state="error">{s("copyFailedLabel")}</CopyButton.Feedback></CopyButton>
        ) : buttonsAction === "share" ? (
          <ShareButton url={s("url")}><ShareButton.Label>分享</ShareButton.Label><ShareButton.Feedback state="success">已复制</ShareButton.Feedback><ShareButton.Feedback state="pending">正在复制</ShareButton.Feedback><ShareButton.Feedback state="error">复制失败</ShareButton.Feedback></ShareButton>
        ) : (
          <Button emphasis={s("emphasis") as ButtonProps["emphasis"]} tone={s("tone") as ButtonProps["tone"]} size={s("size") as ButtonProps["size"]} disabled={b("disabled")} busy={b("busy")}>{((icon) => icon === undefined ? null : <Button.Icon><Icon name={icon as Parameters<typeof Icon>[0]["name"]} /></Button.Icon>)(s("icon") === "none" ? undefined : (s("icon") as IconName))}<Button.Label>
            {s("children")}
          </Button.Label>{(b("showCount") ? n("count") : undefined) !== undefined && <Button.Count>{b("showCount") ? n("count") : undefined}</Button.Count>}</Button>
        );
      break;
    case "icon-button":
      node = (
        <IconButton
          aria-label={s("aria-label")}
          icon={s("icon") as IconName}
          size={s("size") as ButtonProps["size"]}
          emphasis={s("emphasis") as ButtonProps["emphasis"]}
          tone={s("tone") as ButtonProps["tone"]}
          disabled={b("disabled")}
          busy={b("busy")}
        />
      );
      break;
    case "button-group":
      node = (
        <ButtonGroup
          aria-label={s("aria-label")}
          variant={s("variant") as "contained" | "plain"}
        >
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
        <Field required={b("required")}>
          {s("label") && <Field.Label>{s("label")}</Field.Label>}
          <Field.Control>
            <Input placeholder="请输入…" />
          </Field.Control>
          {s("description") && (
            <Field.Description>{s("description")}</Field.Description>
          )}
          {s("error") && <Field.Error>{s("error")}</Field.Error>}
        </Field>
      );
      break;
    case "select":
      node = (
        <Select
          aria-label="格式"
          value={s("value")}
          placeholder={s("placeholder")}
          disabled={b("disabled")}
          required={b("required")}
          onValueChange={(value) => patch("value", value)}
        >
          {choices("entries").map((item) => (
            <Select.Item
              key={item.value}
              value={item.value}
              disabled={(item as { disabled?: boolean }).disabled}
            >
              {item.label}
            </Select.Item>
          ))}
        </Select>
      );
      break;
    case "checkbox":
      node = (
        <Checkbox
          aria-label={s("label") ? undefined : "名称"}
          checked={b("checked")}
          disabled={b("disabled")}
          onChange={(event) => patch("checked", event.target.checked)}
        >
          {s("label")}
        </Checkbox>
      );
      break;
    case "radio":
      node = (
        <Radio
          aria-label={s("label") ? undefined : "名称"}
          name="radio-example"
          value="a"
          checked={b("checked")}
          disabled={b("disabled")}
          onChange={(event) => patch("checked", event.target.checked)}
        >
          {s("label")}
        </Radio>
      );
      break;
    case "switch":
      node = (
        <Switch
          aria-label={s("label") ? undefined : "开关"}
          checked={b("checked")}
          disabled={b("disabled")}
          onChange={(event) => patch("checked", event.target.checked)}
        >
          {s("label")}
        </Switch>
      );
      break;
    case "slider": {
      const min = n("min");
      const max = n("max");
      node = (
        <Slider
          aria-label={s("label") ? undefined : "value"}
          variant={s("variant") as "track" | "filled"}
          layout={s("layout") as "field" | "inline" | "bare"}
          value={n("value")}
          min={min}
          max={max}
          step={n("step")}
          disabled={b("disabled")}
          onValueChange={(value) => patch("value", value)}
          formatValue={(value) => `${value}${s("unit")}`}
        >
          {s("label") && <Slider.Label>{s("label")}</Slider.Label>}
          {b("reading") && <Slider.Value />}
        </Slider>
      );
      break;
    }
    case "tabs":
      node = (
        <Tabs
          aria-label={s("aria-label")}
          value={s("value")}
          defaultValue={s("defaultValue") || undefined}
          onValueChange={(value) => patch("value", value)}
        >
          <Tabs.List>
            {choices("entries").map((item) => (
              <Tabs.Trigger
                key={item.value}
                value={item.value}
                disabled={(item as { disabled?: boolean }).disabled}
              >
                {item.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {choices("entries").map((item) =>
            item.content ? (
              <Tabs.Content key={item.value} value={item.value}>
                {item.content}
              </Tabs.Content>
            ) : null,
          )}
        </Tabs>
      );
      break;
    case "disclosure":
      node = (
        <Disclosure
          open={b("open")}
          onOpenChange={(open) => patch("open", open)}
        >
          <Disclosure.Trigger>{s("title")}</Disclosure.Trigger>
          {s("actions") && (
            <Disclosure.Actions>{s("actions")}</Disclosure.Actions>
          )}
          <Disclosure.Body>{s("body")}</Disclosure.Body>
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
            dismissible={b("dismissible")}
            aria-label={s("title") ? undefined : "示例"}
          >
            {(s("title") || s("description")) && (
              <Panel.Header>
                {s("title") && <Panel.Title>{s("title")}</Panel.Title>}
                {s("description") && (
                  <Panel.Description>{s("description")}</Panel.Description>
                )}
              </Panel.Header>
            )}
            {s("body") && <Panel.Body>{s("body")}</Panel.Body>}
            {b("footer") && (
              <Panel.Footer>
                <Button onClick={() => patch("open", false)}>关闭示例</Button>
              </Panel.Footer>
            )}
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
          <ConfirmDialog open={b("open")} onOpenChange={(open) => patch("open", open)} onConfirm={() => patch("open", false)} busy={b("busy")} tone={s("tone") as "neutral" | "danger"}><ConfirmDialog.Header><ConfirmDialog.Title>{s("title")}</ConfirmDialog.Title><ConfirmDialog.Description>{s("description")}</ConfirmDialog.Description></ConfirmDialog.Header><ConfirmDialog.Body><span role="status">{s("statusLabel")}</span></ConfirmDialog.Body><ConfirmDialog.Footer><ConfirmDialog.CancelAction>{s("cancelLabel")}</ConfirmDialog.CancelAction><ConfirmDialog.ConfirmAction>{s("confirmLabel")}</ConfirmDialog.ConfirmAction></ConfirmDialog.Footer></ConfirmDialog>
        </>
      );
      break;
    case "badge":
      node = (
        <Badge
          tone={s("tone") as FeedbackTone}
          emphasis={s("emphasis") as "default" | "quiet"}
        >
          {s("icon") && (
            <Badge.Icon>
              <Icon name={s("icon") as IconName} size={16} />
            </Badge.Icon>
          )}
          <Badge.Label>{s("label")}</Badge.Label>
        </Badge>
      );
      break;
    case "alert":
      node = (
        <Alert tone={s("tone") as FeedbackTone}>
          <Alert.Icon>
            <Icon name={(s("icon") || "info") as IconName} size={16} />
          </Alert.Icon>
          {s("title") && <Alert.Title>{s("title")}</Alert.Title>}
          {s("body") && <Alert.Body>{s("body")}</Alert.Body>}
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
            tone={s("tone") as FeedbackTone}
            duration={n("duration")}
            closeLabel={s("closeLabel")}
          >
            {s("icon") && (
              <Toast.Icon>
                <Icon name={s("icon") as IconName} size={16} />
              </Toast.Icon>
            )}
            <Toast.Body>{s("body")}</Toast.Body>
          </Toast>
        </>
      );
      break;
    case "toast-region":
      node = (
        <>
          <Button onClick={() => patch("open", true)}>显示提示</Button>
          <ToastRegion aria-label={s("aria-label")}>
            <Toast
              open={b("open")}
              onOpenChange={(open) => patch("open", open)}
            >
              <Toast.Body>{s("children")}</Toast.Body>
            </Toast>
          </ToastRegion>
        </>
      );
      break;
    case "spinner":
      node = s("label") ? (
        <Spinner size={s("size") as "md" | "sm"}>{s("label")}</Spinner>
      ) : (
        <Spinner aria-label={s("aria-label")} size={s("size") as "md" | "sm"} />
      );
      break;
    case "progress":
      node = (
        <Progress
          aria-label={s("aria-label") || undefined}
          value={b("indeterminate") ? undefined : n("value")}
          max={n("max")}
        >
          {s("label") && <Progress.Label>{s("label")}</Progress.Label>}
          {s("valueLabel") && <Progress.Value>{s("valueLabel")}</Progress.Value>}
        </Progress>
      );
      break;
    case "empty-state":
      node = (
        <EmptyState>
          {s("icon") && (
            <EmptyState.Icon>
              <Icon name={s("icon") as IconName} size={16} />
            </EmptyState.Icon>
          )}
          <EmptyState.Title>{s("title")}</EmptyState.Title>
          {s("description") && (
            <EmptyState.Description>{s("description")}</EmptyState.Description>
          )}
          {b("showActions") && (<EmptyState.Actions><Button><Button.Icon><Icon name="plus" /></Button.Icon><Button.Label>{s("actionLabel")}</Button.Label></Button></EmptyState.Actions>)}
        </EmptyState>
      );
      break;
    case "upload":
      node = (
        <div className="single-upload">
          <FileDropzone accept={s("accept")} multiple={b("multiple")} disabled={b("disabled")} maxSize={n("maxSize")} onFiles={setFiles}><FileDropzone.Description>{s("label") || undefined}</FileDropzone.Description><FileDropzone.Trigger>{s("buttonLabel")}</FileDropzone.Trigger><FileDropzone.Error>{s("error") || undefined}</FileDropzone.Error></FileDropzone>
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
        <SelectionBar variant={s("variant") as "contained" | "plain"} count={n("count")} total={n("total")} busy={b("busy")} aria-label={s("aria-label") || undefined}><SelectionBar.Description>{s("summary").replaceAll("{count}", String(n("count"))) || undefined}</SelectionBar.Description><SelectionBar.Actions><SelectionBar.SelectAllAction onClick={() => patch("count", n("total"))}>{s("selectAllLabel") || undefined}</SelectionBar.SelectAllAction><SelectionBar.ClearAction onClick={() => patch("count", 0)}>{s("clearLabel") || undefined}</SelectionBar.ClearAction><SelectionBar.DoneAction onClick={() => patch("count", 0)}>{s("doneLabel") || undefined}</SelectionBar.DoneAction></SelectionBar.Actions></SelectionBar>
      );
      break;
    case "text":
      node = (
        <ExpandableCode collapsedHeight={n("collapsedHeight")} aria-label={s("aria-label")}><ExpandableCode.Body>{s("code")}</ExpandableCode.Body><ExpandableCode.CopyAction>复制</ExpandableCode.CopyAction><ExpandableCode.ExpandAction>{s("expandLabel")}</ExpandableCode.ExpandAction><ExpandableCode.CollapseAction>{s("collapseLabel")}</ExpandableCode.CollapseAction></ExpandableCode>
      );
      break;
    case "navigation":
      node = (
        <Pager variant={s("variant") as "contained" | "plain"}>{((item) => item && <Pager.Previous href={item.href}>{item.title}</Pager.Previous>)(b("previous") ? { title: "按钮", href: "#buttons" } : undefined)}{((item) => item && <Pager.Next href={item.href}>{item.title}</Pager.Next>)(b("next") ? { title: "输入", href: "#input" } : undefined)}</Pager>
      );
      break;
    case "action-row":
      node = (
        <ActionRow>
          <Button size={s("size") as "md" | "sm"} disabled={b("disabled")}>
            {s("children")}
          </Button>
          <ButtonGroup aria-label="切换项目">
            <IconButton
              size={s("size") as "md" | "sm"}
              icon="chevron-left"
              aria-label="上一项"
            />
            <IconButton
              size={s("size") as "md" | "sm"}
              icon="chevron-right"
              aria-label="下一项"
              disabled
            />
          </ButtonGroup>
        </ActionRow>
      );
      break;
    case "heading":
      node = (
        <Heading
          level={n("level") as 1 | 2 | 3 | 4 | 5 | 6}
          variant={s("variant") as "page" | "section"}
        >
          {s("children")}
        </Heading>
      );
      break;
    case "body-text":
      node = (
        <Text
          as={s("as") === "span" ? "span" : "p"}
          variant={s("variant") as "body" | "supporting"}
        >
          {s("children")}
        </Text>
      );
      break;
    case "text-list":
      node = (
        <TextList
          ordered={b("ordered")}
          variant={s("variant") as "contained" | "plain"}
        >
          {lines(s("children")).map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </TextList>
      );
      break;
    case "description-list":
      node = (
        <DescriptionList variant={s("variant") as "contained" | "plain"}>
          {descriptionRows(args).map((row, index) => (
            <div key={index}>
              <dt>{row.label}</dt>
              <dd>{row.description}</dd>
            </div>
          ))}
        </DescriptionList>
      );
      break;
    case "cards":
      node = (
        <NavigationCard
          direction={s("direction") as "previous" | "next"}
          href={s("href")}
        >
          {s("description") && (
            <NavigationCard.Description>{s("description")}</NavigationCard.Description>
          )}
          <NavigationCard.Title>{s("title")}</NavigationCard.Title>
        </NavigationCard>
      );
      break;
    case "showcase":
      node = (
        <ShowcaseCard href={s("href")}><ShowcaseCard.Title>{s("title")}</ShowcaseCard.Title><ShowcaseCard.Description>{s("description")}</ShowcaseCard.Description><ShowcaseCard.Media>
          <span
            style={{
              whiteSpace: "pre-wrap",
              fontSize: 24,
              lineHeight: 1.6,
              padding: 24,
            }}
          >
            {s("children")}
          </span>
        </ShowcaseCard.Media>{((link) => link && <ShowcaseCard.ExternalLink href={link.href}>{link.label}</ShowcaseCard.ExternalLink>)(s("externalLabel")
              ? { label: s("externalLabel"), href: s("externalHref") }
              : undefined)}</ShowcaseCard>
      );
      break;
    case "links":
      node = (
        <ExternalLinks>
          {choices("entries").map((item) => (
            <ExternalLinks.Item key={item.value} href={item.href ?? ""}>
              <ExternalLinks.Label>{item.label}</ExternalLinks.Label>
              {item.icon && (
                <ExternalLinks.Icon>
                  <Icon name={item.icon as IconName} size={16} />
                </ExternalLinks.Icon>
              )}
            </ExternalLinks.Item>
          ))}
        </ExternalLinks>
      );
      break;
    case "surface":
      node = (
        <Surface
          className="surface-demo"
          variant={s("variant") as SurfaceProps["variant"]}
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
        <Layout className="example-row" aria-label={s("aria-label")}>
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
        >
          {s("header") && (
            <PageShell.Header>
              <span>{s("header")}</span>
            </PageShell.Header>
          )}
          <PageShell.Body>{s("body")}</PageShell.Body>
          {s("footer") && (
            <PageShell.Footer>
              <span>{s("footer")}</span>
            </PageShell.Footer>
          )}
        </PageShell>
      );
      break;
  }
  const code = exampleCode(entry, args);
  return (
    <>
      <section aria-label="组件展示" className="component-practice">
        <header className="practice-heading practice-heading--component">
          <h1 id="practice-title">{entry.title}</h1>
        </header>
        <Surface
          variant="raised"
          className="practice-layout"
          role="group"
          aria-label="Preview"
        >
          <div className="practice-toolbar">
            <h2 className="practice-toolbar-title">预览</h2>
            <SegmentedControl
              aria-label="画布环境"
              value={canvasBackground}
              onValueChange={(value) =>
                setCanvasBackground(value as "base" | "gray" | "white")
              }
            >
              {(
                [
                  ["base", "页面"],
                  ["gray", "灰区"],
                  ["white", "白层"],
                ] as const
              ).map(([value, label]) => (
                <SegmentedControl.Item key={value} value={value}>
                  <SegmentedControl.Label>{label}</SegmentedControl.Label>
                </SegmentedControl.Item>
              ))}
            </SegmentedControl>
            <Button
              aria-expanded={apiOpen}
              aria-controls={apiId}
              onClick={() => setApiOpen((open) => !open)}
            >
              {apiOpen ? "收起 API" : "展开 API"}
            </Button>
          </div>
          <Surface
            tone={canvasBackground === "white" ? "raised" : "soft"}
            className={`practice-stage practice-stage--component practice-stage--background-${canvasBackground} practice-stage--${entry.id}`}
          >
            <div
              className="practice-preview"
              role="region"
              aria-label="组件预览"
            >
              <div className={`single-example single-example--${entry.id}`}>
                {node}
              </div>
            </div>
          </Surface>
          <ApiPanel
            id={apiId}
            hidden={!apiOpen}
            entry={entry}
            fields={fields}
            args={args}
            patch={patch}
            selectOptions={(field) =>
              ["segments", "tabs", "select"].includes(entry.id) &&
              field.key === "value"
                ? choices("entries")
                : (field.options?.map((value) => ({
                    value,
                    label: value,
                  })) ?? null)
            }
            fieldDisabled={(key) =>
              entry.id === "confirm-dialog" && key === "open" && b("busy")
            }
            onReset={() => {
              setArgs(exampleArgs(entry));
              setFiles([]);
            }}
          />
        </Surface>
      </section>
      <Disclosure className="usage-code">
        <Disclosure.Trigger>用法</Disclosure.Trigger>
        <Disclosure.Actions>
          <CopyButton text={code} emphasis="quiet"><CopyButton.Label>复制</CopyButton.Label><CopyButton.Feedback state="success">已复制</CopyButton.Feedback><CopyButton.Feedback state="pending">正在复制</CopyButton.Feedback><CopyButton.Feedback state="error">复制失败</CopyButton.Feedback></CopyButton>
        </Disclosure.Actions>
        <Disclosure.Body>
          <pre
            className="usage-source ui-scroll-area"
            tabIndex={0}
            aria-label="示例代码"
          >
            {code}
          </pre>
        </Disclosure.Body>
      </Disclosure>
    </>
  );
}
