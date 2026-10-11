import { useState, type CSSProperties, type ReactNode } from "react";
import { Alert, Badge, Button, ButtonGroup, Checkbox, Disclosure, FileDropzone, Input, NavigationCard, Radio, SearchField, SegmentedControl, Select, Slider, Surface, Switch, Icon } from "./ui";

const contexts = [
  { id: "background", label: "页面" },
  { id: "surface", label: "灰色区域" },
  { id: "raised", label: "白色层" },
] as const;

type Context = (typeof contexts)[number]["id"];

function ContextColumn({
  context,
  style,
  children,
}: {
  context: Context;
  style: CSSProperties;
  children: ReactNode;
}) {
  if (context === "background")
    return (
      <div className="matrix-column" style={style}>
        {children}
      </div>
    );
  return (
    <Surface
      tone={context === "raised" ? "raised" : "soft"}
      treatment={context === "raised" ? "physical" : "tonal"}
      className="matrix-column"
      style={style}
    >
      {children}
    </Surface>
  );
}

function PlainGroup() {
  const [value, setValue] = useState("portrait");
  return (
    <ButtonGroup aria-label="版式" variant="plain">
      {[
        ["portrait", "竖版"],
        ["landscape", "横版"],
      ].map(([id, label]) => (
        <Button
          key={id}
          emphasis="quiet"
          aria-pressed={value === id}
          onClick={() => setValue(id)}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

function Search() {
  const [value, setValue] = useState("");
  return (
    <SearchField
      aria-label="搜索"
      value={value}
      onValueChange={setValue}
      placeholder="搜索组件"
    />
  );
}

function Segments() {
  const [value, setValue] = useState("week");
  return (
    <SegmentedControl aria-label="周期" value={value} onValueChange={setValue}>{[
    { value: "day", label: "日" },
    { value: "week", label: "周" },
    { value: "month", label: "月" },
].map(item => <SegmentedControl.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}><SegmentedControl.Label>{item.label}</SegmentedControl.Label>{(item as { count?: number | string }).count != null ? <SegmentedControl.Count>{(item as { count?: number | string }).count}</SegmentedControl.Count> : null}</SegmentedControl.Item>)}</SegmentedControl>
  );
}

type Row = { label: string; height?: number; render: () => ReactNode };
type Section = { title: string; rows: Row[] };

const sections: Section[] = [
  {
    title: "按钮",
    rows: [
      {
        label: "strong",
        render: () => <Button emphasis="strong">提交</Button>,
      },
      {
        label: "default",
        render: () => (
          <>
            <Button>保存</Button>
            <Button >{((icon) => icon === undefined ? null : <Button.Icon><Icon name={icon as Parameters<typeof Icon>[0]["name"]} /></Button.Icon>)("plus")}<Button.Label>添加</Button.Label></Button>
          </>
        ),
      },
      { label: "quiet", render: () => <Button emphasis="quiet">取消</Button> },
      {
        label: "danger",
        render: () => (
          <>
            <Button emphasis="strong" tone="danger">
              删除
            </Button>
            <Button emphasis="quiet" tone="danger">
              移除
            </Button>
          </>
        ),
      },
      {
        label: "disabled",
        render: () => (
          <>
            <Button disabled>保存</Button>
            <Button emphasis="strong" disabled>
              提交
            </Button>
          </>
        ),
      },
      {
        label: "操作组",
        render: () => (
          <ButtonGroup aria-label="编辑">
            <Button>撤销</Button>
            <Button>重做</Button>
            <Button emphasis="strong">完成</Button>
          </ButtonGroup>
        ),
      },
      { label: "透明组", render: () => <PlainGroup /> },
    ],
  },
  {
    title: "字段",
    rows: [
      {
        label: "输入",
        render: () => <Input aria-label="名称" placeholder="输入名称" />,
      },
      { label: "搜索", render: () => <Search /> },
      {
        label: "选择器",
        render: () => (
          <Select aria-label="排序" defaultValue="recent">{[
    { value: "recent", label: "最近更新" },
    { value: "name", label: "名称" },
].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
        ),
      },
      {
        label: "滑块",
        render: () => (
          <Slider variant="filled" layout="bare" defaultValue={40}>
            <Slider.Label>透明度</Slider.Label>
            <Slider.Value />
          </Slider>
        ),
      },
    ],
  },
  {
    title: "选择",
    rows: [
      {
        label: "勾选",
        render: () => (
          <>
            <Checkbox>未选</Checkbox>
            <Checkbox defaultChecked>已选</Checkbox>
            <Radio>单选</Radio>
          </>
        ),
      },
      { label: "开关", render: () => <Switch defaultChecked>同步</Switch> },
      { label: "分段", render: () => <Segments /> },
    ],
  },
  {
    title: "状态",
    rows: [
      {
        label: "徽标",
        render: () => (
          <>
            <Badge>草稿</Badge>
            <Badge tone="success">已发布</Badge>
            <Badge tone="danger">失败</Badge>
          </>
        ),
      },
      {
        label: "提示",
        height: 88,
        render: () => <Alert tone="success"><Alert.Icon><Icon name="check" size={16}/></Alert.Icon><Alert.Body>更改已保存。</Alert.Body></Alert>,
      },
    ],
  },
  {
    title: "区域",
    rows: [
      {
        label: "折叠",
        height: 168,
        render: () => (
          <Disclosure defaultOpen><Disclosure.Trigger>发布设置</Disclosure.Trigger><Disclosure.Body>
            <div className="matrix-region-content">
              <Badge tone="success">已同步</Badge>
              <Button>编辑</Button>
            </div>
          </Disclosure.Body></Disclosure>
        ),
      },
      {
        label: "上传",
        height: 216,
        render: () => <FileDropzone onFiles={() => {}}><FileDropzone.Description>{"拖入文件"}</FileDropzone.Description><FileDropzone.Trigger>选择文件</FileDropzone.Trigger><FileDropzone.Error /></FileDropzone>,
      },
      {
        label: "导航",
        height: 112,
        render: () => (
          <NavigationCard direction="next" href="#context-matrix"><NavigationCard.Title>下一节</NavigationCard.Title></NavigationCard>
        ),
      },
    ],
  },
];

const sectionHeight = 40;
const rowHeight = 64;
const template = [
  "32px",
  ...sections.flatMap((section) => [
    `${sectionHeight}px`,
    ...section.rows.map((row) => `${row.height ?? rowHeight}px`),
  ]),
].join(" ");

export function ContextMatrix() {
  const style = { gridTemplateRows: template };
  return (
    <div className="context-matrix">
      <div
        className="matrix-column matrix-labels"
        style={style}
        aria-hidden="true"
      >
        <span className="matrix-heading" />
        {sections.map((section) => (
          <SectionLabels key={section.title} section={section} />
        ))}
      </div>
      {contexts.map((context) => (
        <ContextColumn key={context.id} context={context.id} style={style}>
          <h2 className="matrix-heading">{context.label}</h2>
          {sections.map((section) => (
            <SectionCells key={section.title} section={section} />
          ))}
        </ContextColumn>
      ))}
    </div>
  );
}

function SectionLabels({ section }: { section: Section }) {
  return (
    <>
      <span className="matrix-section">{section.title}</span>
      {section.rows.map((row) => (
        <span key={row.label} className="matrix-cell">
          {row.label}
        </span>
      ))}
    </>
  );
}

function SectionCells({ section }: { section: Section }) {
  return (
    <>
      <span className="matrix-section" aria-hidden="true" />
      {section.rows.map((row) => (
        <div key={row.label} className="matrix-cell">
          {row.render()}
        </div>
      ))}
    </>
  );
}
