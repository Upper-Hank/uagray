# 单件实践与基础 API

展示页保留左目录、右实践。当前有 37 个组件条目，每个详情默认展示一个主实例；需要子项的组件保留其必要结构，例如 ButtonGroup 的按钮、Tabs 的面板、Field 的输入、弹层的打开操作。输入、Textarea、Checkbox、Radio、Switch、Dialog、Drawer、ConfirmDialog、Badge 和 Alert 分开，不再将多种组件堆在同一个示例里。

复制/分享仍是 Button 下的使用场景，通过 action 选择 button/copy/share，每次只显示一个实例，不增加独立目录项。旧的 choices/dialogs/feedback/copy 深链接分别映射到 checkbox/dialog/badge/buttons。

## 展示层职责

- `playground-catalog.ts`：条目、默认值与基础控制项，只有展示层消费。
- `playground.tsx`：实例、控件、状态同步与重置。
- `playground-code.ts`：由当前配置生成可复制的 React Example，保留受控状态、事件与必要子项，正确转义编辑后的文本。
- `spec-practice.tsx`：设计、交互与布局规范示例。
- `App.tsx`：分类、目录、主题切换与 hash 定位。

API 保留原始参数名与枚举值，不为每个参数附加中文翻译。标题行右侧提供浅色/灰色/白色画布选择，颜色用统一描边的圆角矩形表示；色块描边仅用于识别颜色样本，不推广为灰色组件的常驻描边。选择使用原生 radio 语义和键盘操作。画布背景是展示设置，不进入组件 API 或生成代码，API 重置也不改变画布设置。

组件实例与 API 工具行统一放在同一个 preview 区块内。API 按功能 part 组织为独立紧凑工具条；元数据分组只负责排列，不显示“内容、视觉、行为”等分类标题。不为每个参数单独铺底或形成表单卡，属性沿同一操作轴呈现，内部竖线区分职责。浅色/灰色画布上采用白工具条，白画布上采用灰工具条。长文本在所属工具条内展开。

配置复用 Field/Input/NumberInput/Textarea/Select/Switch，保持自然 Tab 顺序。用法继续独立使用 Disclosure，默认展开，收起保留配置状态。只配置常用字符串、布尔、枚举、数值；不编辑 ref、任意回调函数、CSS、样式注入或复杂业务对象。不引入新的展示运行时。

options/items 使用每行一个标签的简单编辑形式，lastDisabled、indeterminate、unit、action 等少量展示辅助项在生成代码时转换为真实 API，不作为不存在的组件属性输出。Slider 范围、Progress 与 SelectionBar 数值会归一化，配置、实例和代码同步；重置恢复当前条目默认值。

可选文案默认留空，生成用法省略空的 title、description、hint、error、placeholder、summary、valueLabel 和 directionLabel。Alert 不附带泛化“提示”标题；Progress 不自动附加百分比或“处理中”；SelectionBar 不自动生成数量摘要；上传说明、导航方向文字由对应 API 按需传入。必要的正文、操作名称、真实错误和可访问名称保留。

## 数字输入与间距

NumberInput 是独立导出的数字输入组件，提供 value/defaultValue、onValueChange(number)、min/max/step、disabled/readOnly 和原生 input ref。隐藏浏览器的原生增减箭头，使用统一的减号/加号按钮；保留原生数字输入、上下键和 step 对齐。编辑时允许暂时清空，失焦后恢复有限数值并收敛到范围内。API 面板的数值控制统一消费此组件。

详情区块间距使用 space-6（16px）。API 每行采用 tonal 表面，不自动附加描边或阴影；参数名、值/开关共用完整编辑单元，按容器宽度形成等宽列。工具行 inset 为 8px，内部单元圆角 12px，外圆角按等距关系为 20px；单元间距 8px。状态、实例和生成代码同步。

## 画布与 PageShell

组件实践区为可切换页面浅底/灰底/白底的共同任务范围，上方单件预览、下方按维度分行的配置工具。实例与工具均位于画布内部，不增加第二层整块画布。规范页与 Token 页使用各自的连续阅读结构。

PageShell 详情使用真实组件及 controls/children/footer 插槽，替换旧的 Workspace 占位图。库新增 mainId（默认 main）及 mainAs（默认 main，可选 div），嵌入预览指定独立 ID 和 div，避免重复 ID 或 main 嵌套。Footer 始终由调用方传入。

## 输入焦点

用户选择：仅 Tab 定位显示轻量提示，鼠标点入与普通文字输入不启用外圈。真实 DOM 焦点、光标、输入与原生键盘语义保留。

`src/ui/focus.ts` 用一个共享订阅维护导航意图：Tab 开启，pointerdown 关闭，普通字符不改变；仅在字段组件被使用时注册监听，最后一个字段卸载时清理。Input/Textarea/Select/Slider/SearchField 使用该意图控制中性的 1px focus-outline。按钮等非文本控件保留既有 focus-visible 行为。

文本输入的原生 focus-visible 可能在鼠标聚焦时也匹配，因此不能只替换一个伪类达成此次要求。[WebKit 对 focus-visible 的说明](https://webkit.org/blog/12179/the-focus-indicated-pseudo-class-focus-visible/)。键盘定位提示必须保留，不通过 blur 取消输入焦点。[WAI Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible?lang=en)。

## 验证

33 项定向 DOM 测试通过，新增覆盖单按钮实例、API/实例/代码同步、重置、输入属性、Slider 范围归一化和 Tab/指针输入意图。此前 70 份默认/编辑文本的生成用法通过 TypeScript API 检查；本轮完成类型检查与生产构建。此为新配置与代码生成契约的定向验证，未使用浏览器，不代表全部视觉、动画或无障碍行为已验收。

Surface 提供 soft / raised 表面和独立 treatment，默认 tonal 不加阴影；Button 的 plain 是透明操作，size 不改变背景。规范页示例展示共同底座和灰色工作区中的白色工具层，而不是逐层加深的灰色容器。

新增 ColorPicker 的 value/label/disabled 配置，生成代码使用受控颜色值。组合案例独立于组件单件实践，详见 [案例说明](cases.md)。

## API 审计与下一步

[API 规范草案](api-contract.md) 区分真实参数、组件默认值、示例初始值与展示辅助项。本文件记录现状，后续元数据与事件命名调整以用户确认的契约为准。

## 灰色配置区与组合布局

API 配置与主实例共用可切换底色的展示区，以多行工具呈现，不再使用独立 Disclosure。内部编辑字段按工具行表面选择对比资源。Slider 的 layout 是真实 API；inline 和 bare 适用于工具栏，filled 保持内部布局。Showcase 的 externalLabel / externalHref 是展示辅助项，非空标签转换为真实 externalLink 对象。复制代码与实践保持一致。

## 规范页与组件页分工

设计原则、交互规范、布局过渡使用独立的文档阅读结构：规则说明和演示并列，800px 以下按说明、演示顺序堆叠。规则不是代码，全部常驻呈现，不复用实践/API/用法模板。组件详情继续保留实时配置与代码生成；ButtonGroup 和 SelectionBar 的 tone 为真实组合接口并同步生成用法。

## API 迁入展示工具栏

所有组件详情共用一个 preview 区块：组件名称与画布背景选择同行，实例与 API 各维度工具行处于同一画布内。工具行按任务维度组织，同类参数并排，不出现统一包裹所有 API 的配置卡。参数名与控件组成完整单元，名称在左、值/选择/开关在右，内部编辑控件透明；长文本在所属行按需展开。重置位于尾部。配置保留原参数名、可访问名称、状态同步与代码生成；实例保留独立命名区域，避免把配置控件误认为组件实例。

撤销此前单一白色阅读边界：用法代码属于文本体例，浅页面上采用灰色阅读承载，不带常驻外描边。Disclosure 标题旁为复制动作，下方完整代码通过局部滚动阅读。移除内层 ExpandableCode、渐隐、覆盖按钮及二次展开；只保留整块收起。辅助复制动作与标题按钮是同级元素；折叠不丢代码或配置状态。有标题/正文分隔线时 Copy 常态必须透明；无分隔线时可透明或深一级灰。独立 ExpandableCode 同样遵循文本体例，不强制白壳。详见 [表面实施契约](surface-contract.md)；相关代码已迁移，实际视觉尚未验收。

本轮更新：Surface 配置新增 treatment，预览与生成代码同步；Tabs 的 contents 为可选展示辅助项，默认面板为空；仅呈现宿主明确传入的实际内容，不生成数量注释或重复标签。Token 采用连续列表。完整记录见 [全站打磨](visual-polish.md)。

## 教学展示与等距圆角

规范页的 Rule 统一提供一层灰色展示承载，留白为 padding-panel（24px），圆角为 radius-surface（24px）。示例直接排列在灰底中，不增加整块白底描边画布，不重置灰底的字段与动作资源。内部 Surface 仅用于需要演示的独立对象关系，不重复包裹单个字段或整个示例。教学示例中的独立动作按内容宽度排列。

动作组、选择轨道、字段面板与示例面板按 [等距圆角契约](design-system.md#等距圆角契约) 协调轮廓；字号与按钮高度保持各自尺寸角色。

Badge 的 variant 是真实 API，提供 soft / plain / white 并同步预览与代码。CopyButton 新增 variant="soft|plain"；用法区采用 plain，有分隔线时复制常态透明。

规范页规则编号与标题并排；教学示例选题必须与原则直接对应，允许使用线框图和环境对照。不得默认添加“已添加 0 项”等演示计数、模拟成功消息或重复状态旁注。plain 操作组保留主要按钮的填充，不自动使子按钮透明。选择器不再自动套白色工具壳，灰底使用单层深一级灰轨道。

本轮工具条契约：背景选择提供浅色（页面 background）、灰色（surface）、白色（raised）；浅色画布以细描边区分页面，使用不占布局空间的 inset box-shadow，切换背景不改变内外尺寸。此为展示画布的明确例外，不扩展灰色组件常驻描边规则。Slider 作为属性专用工具条样板：名称为透明动作，点击后编辑，清空显示 value；数值使用左减、居中数值、右加的同轴布局。视觉选项直接显示当前 variant/layout/unit，以两条竖线分隔，不重复参数名。min/max/step 保留必要识别名并同轴排列。状态选择仅管理真实的默认/disabled，与 disabled 切换按钮共享同一个参数状态；禁用优先，不强制模拟 hover/按下/焦点，也不创建额外组件状态 API。
