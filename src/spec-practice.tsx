import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  Field,
  Input,
  Layout,
  SegmentedControl,
  Slider,
  Switch,
  Surface,
} from "./ui";

export const specEntries = [
  { id: "principles", title: "设计原则", category: "spec" as const },
  { id: "behavior", title: "交互规范", category: "spec" as const },
  { id: "layout-motion", title: "布局过渡", category: "spec" as const },
  { id: "context-matrix", title: "环境矩阵", category: "spec" as const },
];

function Rule({
  title,
  code,
  children,
  demo,
}: {
  title: string;
  code?: string;
  children: ReactNode;
  demo: ReactNode;
}) {
  return (
    <section className="spec-rule">
      <div className="spec-rule-text">
        <div className="spec-rule-heading">
          {code && <span className="spec-principle-id">{code}</span>}
          <h2>{title}</h2>
        </div>
        {children}
      </div>
      <figure className="ui-surface spec-rule-demo" aria-label={`${title}示例`}>
        <div className="spec-demo-content">{demo}</div>
      </figure>
    </section>
  );
}

export function SpecPractice({ id }: { id: string }) {
  const [format, setFormat] = useState("portrait");
  const [layoutFormat, setLayoutFormat] = useState("portrait");
  const [value, setValue] = useState(50);
  const [names, setNames] = useState<Record<string, string>>({});
  const setName = (key: string, name: string) =>
    setNames((current) => ({ ...current, [key]: name }));
  const [itemCount, setItemCount] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const setChecked = (key: string, checked: boolean) =>
    setChecks((current) => ({ ...current, [key]: checked }));
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const save = (key: string, value: boolean) =>
    setSaved((current) => ({ ...current, [key]: value }));
  const [editingProject, setEditingProject] = useState(false);
  const orientation = (
    <ButtonGroup aria-label="示例版式" variant="plain">
      <Button
        emphasis="quiet"
        aria-pressed={layoutFormat === "portrait"}
        onClick={() => setLayoutFormat("portrait")}
      >
        竖版
      </Button>
      <Button
        emphasis="quiet"
        aria-pressed={layoutFormat === "landscape"}
        onClick={() => setLayoutFormat("landscape")}
      >
        横版
      </Button>
    </ButtonGroup>
  );
  const whiteTools = (
    <Surface
      variant="raised"
      treatment="physical"
      className="ui-tool-surface ui-toolbar-row spec-tools"
    >
      {orientation}
      <span className="spec-divider" aria-hidden="true" />
      <Button emphasis="quiet" onClick={() => setLayoutFormat("portrait")}>
        重置
      </Button>
    </Surface>
  );

  if (id === "behavior")
    return (
      <div className="spec-document">
        <p className="spec-lead">
          先定义操作含义，再表达反馈。悬停、按压、选择与焦点各有职责，交互过程中保持文字和图标的视觉重量。
        </p>
        <Rule
          title="反馈作用于当前动作"
          demo={
            <div className="spec-demo-stack">
              <ButtonGroup aria-label="操作反馈">
                <Button
                  icon="plus"
                  onClick={() => setItemCount((current) => current + 1)}
                >
                  添加
                </Button>
                <Button
                  icon="close"
                  disabled={itemCount === 0}
                  onClick={() =>
                    setItemCount((current) => Math.max(0, current - 1))
                  }
                >
                  移除
                </Button>
              </ButtonGroup>
              <div
                className="spec-feedback-items"
                role="list"
                aria-label="示例项目"
              >
                {Array.from({ length: itemCount }, (_, index) => (
                  <span key={index} role="listitem">
                    项目 {index + 1}
                  </span>
                ))}
              </div>
            </div>
          }
        >
          <p>
            独立动作可以改变前景和背景；共同操作组只反馈当前子项。颜色渐变过渡，按压反馈不改变字重或图标描边。
          </p>
          <p>禁用表示操作不可用，不能只更换文案而继续响应点击。</p>
        </Rule>
        <Rule
          title="选择是持续状态"
          demo={
            <SegmentedControl
              aria-label="示例分类"
              value={format}
              onValueChange={setFormat}
              options={[
                { value: "portrait", label: "全部", count: 8 },
                { value: "landscape", label: "收藏", count: 3 },
              ]}
            />
          }
        >
          <p>
            选择说明当前值，hover
            说明指针位置。两者可以共用主标签颜色，但不共用全部反馈。
          </p>
          <p>
            Segmented
            的计数不随选择变深；当前项使用共享指示块。内容色块可以用外圈保留自身颜色，不必统一套白底。
          </p>
        </Rule>
        <Rule
          title="可访问语义与焦点"
          demo={
            <div className="spec-demo-stack">
              <Checkbox
                label="接收通知"
                checked={checks.focus ?? false}
                onChange={(event) => {
                  setChecked("focus", event.target.checked);
                  save("focus", false);
                }}
              />
              <Button onClick={() => save("focus", true)}>
                {saved.focus ? "已保存" : "保存设置"}
              </Button>
            </div>
          }
        >
          <p>
            操作使用 button，导航使用
            a，输入与选择保留原生或对应的可访问语义。没有可见标签时仍需提供可访问名称。
          </p>
          <p>
            键盘焦点用轻量边缘标明当前位置；减少动态效果时关闭非必要位移，保留状态变化。
          </p>
        </Rule>
      </div>
    );

  if (id === "layout-motion")
    return (
      <div className="spec-document">
        <p className="spec-lead">
          布局由任务决定。先安排分组、对齐和宽度，再考虑尺寸变化与过渡；换行不能补救没有组织的控件堆叠。
        </p>
        <Rule
          title="沿操作轴组织工具"
          demo={
            <Surface
              variant="raised"
              treatment="physical"
              className="ui-tool-surface ui-toolbar-row spec-tools spec-tools--slider"
            >
              <Slider
                className="ui-toolbar-field"
                layout="inline"
                label="缩放"
                value={value}
                onValueChange={setValue}
                formatValue={(n) => `${n}%`}
              />
              <span className="spec-divider" aria-hidden="true" />
              <Button emphasis="quiet" onClick={() => setValue(50)}>
                重置
              </Button>
            </Surface>
          }
        >
          <p>
            Slider 的字段布局适合表单；工具栏使用 inline
            布局，把标签、轨道和数值作为一个完整操作单元。细轨道仍保留足够命中高度。
          </p>
          <p>
            宽度由宿主分配。缩放与对应重置沿同一操作轴排列，以竖线分隔；空间不足时优先收缩轨道，不能让重置单独换行。
          </p>
        </Rule>
        <Rule
          title="文字变化带动布局"
          demo={
            <Surface className="spec-workspace">
              <Layout
                className="ui-toolbar-row spec-tools"
                aria-label="布局变化示例"
              >
                <Button onClick={() => setExpanded(!expanded)}>
                  {expanded ? "收起完整项目名称" : "展开名称"}
                </Button>
                <Button emphasis="quiet" onClick={() => setExpanded(false)}>
                  重置
                </Button>
              </Layout>
            </Surface>
          }
        >
          <p>
            内容变长时，容器和相邻元素共同适应。过渡帮助理解位置变化，不使用回弹或重量变化增加刺激。
          </p>
          <p>尺寸角色控制高度、间距和字号，不改变动作语义与颜色。</p>
        </Rule>
        <Rule
          title="对齐阅读内容，而不仅是盒子"
          demo={
            <Surface className="spec-data">
              <table>
                <caption className="ui-sr-only">项目阅读示例</caption>
                <thead>
                  <tr>
                    <th scope="col">项目</th>
                    <th scope="col">状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>组件文档</td>
                    <td>进行中</td>
                  </tr>
                  <tr>
                    <td>颜色契约</td>
                    <td>已完成</td>
                  </tr>
                </tbody>
              </table>
            </Surface>
          }
        >
          <p>
            表格靠列轴、行距与必要分隔组织阅读。文本、Badge
            和按钮的内部留白不同，单元格对齐不代表文字已经对齐。
          </p>
          <p>
            状态可以直接使用文字。只有确实需要独立识别的标签或动作才增加承载范围。
          </p>
        </Rule>
      </div>
    );

  const editableName = (key: string) => (
    <Field label="空间名称">
      <Input
        value={names[key] ?? "工作空间"}
        onChange={(event) => {
          setName(key, event.target.value);
          save(key, false);
        }}
      />
    </Field>
  );
  return (
    <div className="spec-document">
      <p className="spec-lead">
        最小充分对比。用有限的视觉资源表达清楚的信息、对象和操作关系；每处底色、边缘和阴影都应有具体职责。
      </p>
      <Rule
        code="P01"
        title="分别判断信息、对象与空间层级"
        demo={
          <div className="spec-hierarchies">
            <section className="spec-hierarchy">
              <h3>信息</h3>
              <div className="spec-information">
                <p>项目计划</p>
                <span>安排本周任务</span>
              </div>
            </section>
            <section className="spec-hierarchy">
              <h3>对象</h3>
              <Surface variant="raised" className="spec-object">
                设计稿
              </Surface>
            </section>
            <section className="spec-hierarchy">
              <h3>空间</h3>
              <div className="spec-spatial">
                <div className="spec-spatial-content" aria-hidden="true" />
                <Surface
                  variant="raised"
                  treatment="physical"
                  className="spec-spatial-overlay"
                >
                  浮层
                </Surface>
              </div>
            </section>
          </div>
        }
      >
        <p>
          标题与正文的阅读层级、字段与面板的对象关系、浮层与页面的空间关系分别判断。信息更重要，不代表容器必须更深或更高。
        </p>
        <p>
          信息通过字号与留白区分；设计稿通过独立表面识别；浮层通过遮挡与阴影表达前后关系。
        </p>
      </Rule>
      <Rule
        code="P02"
        title="连续基底是默认组织方式"
        demo={
          <div
            className="spec-wireframe"
            role="img"
            aria-label="标题、两列正文与列表通过留白组织，共享同一灰色基底"
          >
            <div className="spec-wireframe-title" />
            <div className="spec-wireframe-columns">
              {[0, 1].map((column) => (
                <div className="spec-wireframe-copy" key={column}>
                  <i />
                  <i />
                  <i />
                </div>
              ))}
            </div>
            <div className="spec-wireframe-list">
              <i />
              <i />
              <i />
            </div>
          </div>
        }
      >
        <p>
          标题、列表、指标和说明可以共享页面基底。结构分区不必同时成为背景分区。
        </p>
        <p>通过阅读轴、段落间距和必要分隔保持连续性，避免一块内容一个灰盒。</p>
      </Rule>
      <Rule
        code="P03"
        title="表面由环境与对象共同决定"
        demo={
          <div className="spec-contexts">
            <Surface variant="raised" className="spec-context">
              <span>白底</span>
              <Badge tone="success">已完成</Badge>
            </Surface>
            <div className="spec-context">
              <span>灰底</span>
              <Badge tone="success">已完成</Badge>
            </div>
          </div>
        }
      >
        <p>
          Base、Muted、White 与 Dark
          是有限的颜色资源。相同动作在不同承载环境中可以使用不同表面，但职责与操作应保持可预测。
        </p>
        <p>
          同一状态标签在白底使用轻量语义底色，在灰底使用深一级的语义底色；文字、含义与对象职责保持一致。
        </p>
      </Rule>
      <Rule
        code="P04"
        title="底色、描边与阴影分别决策"
        demo={
          <div className="spec-patterns">
            <Surface variant="raised" className="spec-pattern">
              <span>色差识别</span>
            </Surface>
            <Surface
              variant="raised"
              treatment="defined"
              className="spec-pattern"
            >
              <span>独立边界</span>
            </Surface>
            <Surface
              variant="raised"
              treatment="physical"
              className="spec-pattern"
            >
              <span>实体感</span>
            </Surface>
          </div>
        }
      >
        <p>
          Tonal 通过色差组织，Defined 用描边明确边界，Physical
          增加实体感。它们不是固定的强弱阶梯。
        </p>
        <p>
          白色不自动附带描边和阴影。静态配置区与悬浮工具不是同一种空间关系。
        </p>
      </Rule>
      <Rule
        code="P05"
        title="保留最小充分对比"
        demo={
          <Surface variant="raised" className="spec-document-row">
            <div className="spec-document-identity">
              {editingProject ? (
                <Input
                  aria-label="文档名称"
                  value={names.project ?? "组件文档"}
                  onChange={(event) => setName("project", event.target.value)}
                />
              ) : (
                <p className="spec-example-heading">
                  {names.project ?? "组件文档"}
                </p>
              )}
              <span>林 · 负责人</span>
            </div>
            <div className="spec-document-actions">
              <Badge tone="success">已完成</Badge>
              <Button
                emphasis="quiet"
                onClick={() => setEditingProject((current) => !current)}
              >
                {editingProject ? "完成编辑" : "编辑"}
              </Button>
            </div>
          </Surface>
        }
      >
        <p>
          白色表面明确一条文档记录的范围，标题与负责人通过排版组织；状态标签表达完成情况，编辑作为记录内的附属操作。
        </p>
        <p>克制不能牺牲文字、可点击区域、禁用状态和键盘焦点的辨识。</p>
      </Rule>
      <Rule
        code="P06"
        title="围合必须有明确对象"
        demo={
          <div className="spec-inline-form">
            {editableName("settings")}
            <Switch
              label="接收通知"
              checked={checks.settings ?? false}
              onChange={(event) => {
                setChecked("settings", event.target.checked);
                save("settings", false);
              }}
            />
            <Button onClick={() => save("settings", true)}>
              {saved.settings ? "已保存" : "保存设置"}
            </Button>
          </div>
        }
      >
        <p>
          连续组织适合共同阅读、比较和编辑；离散围合适合需要独立识别或操作的对象。选择组织策略，不能只看数据是不是列表。
        </p>
        <p>
          表单字段可以保持连续。作品预览、编辑画布和弹出面板则有自己的对象边界。
        </p>
      </Rule>
      <Rule code="P07" title="共同边界由组合负责" demo={whiteTools}>
        <p>
          工具栏承担共同底座，内部普通动作常态透明，hover
          只反馈当前动作。子项的选择范围属于另一项职责。
        </p>
        <p>
          父子边界可以共存，但不能重复表达同一关系。容器 inset、单元 padding
          和组间 gap 分别负责有效留白。
        </p>
      </Rule>
      <Rule
        code="P08"
        title="交互反馈跟随行为语义"
        demo={
          <SegmentedControl
            aria-label="项目范围"
            value={format}
            onValueChange={setFormat}
            options={[
              { value: "portrait", label: "全部", count: 8 },
              { value: "landscape", label: "收藏", count: 3 },
            ]}
          />
        }
      >
        <p>
          hover
          是短暂反馈，选中是持续状态，焦点标记键盘位置。动作、值选择与内容导航可以有不同的反馈模型。
        </p>
        <p>
          胶囊选择器移动共享指示块，主标签变深，计数保持常态色；字重与图标描边全程不变。
        </p>
      </Rule>
      <Rule
        code="P09"
        title="强调必须有语义与范围"
        demo={
          <div
            className="spec-emphasis-actions"
            role="group"
            aria-label="操作强调层级"
          >
            <Button emphasis="strong">提交</Button>
            <Button>预览</Button>
            <Button emphasis="quiet">取消</Button>
          </div>
        }
      >
        <p>
          同一操作行中的提交、预览和取消分别声明 strong、default 和
          quiet，颜色由所在环境给出。
        </p>
        <p>
          避免一个页面处处强调；改变字号、颜色或边界前，先确定强调的对象和范围。
        </p>
      </Rule>
      <Rule
        code="P10"
        title="扩展经过组合与成本检验"
        demo={
          <Surface variant="raised" treatment="defined" className="spec-editor">
            {editableName("extension")}
            <ButtonGroup aria-label="编辑操作" variant="plain">
              <Button onClick={() => save("extension", true)}>
                {saved.extension ? "已保存" : "保存"}
              </Button>
              <Button
                emphasis="quiet"
                onClick={() => {
                  setName("extension", "工作空间");
                  save("extension", false);
                }}
              >
                重置
              </Button>
            </ButtonGroup>
          </Surface>
        }
      >
        <p>
          新外观必须通过必要性、一致性、可组合性、可预测性、可访问性和维护成本检查。
        </p>
        <p>
          先使用现有资源与合法组合。遇到单个场景的问题，先检查职责与执行，不直接新增原则或任意样式开关。
        </p>
      </Rule>
    </div>
  );
}
