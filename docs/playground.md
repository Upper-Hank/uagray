# 组件 API 调试契约

2026-10-11：公共内容 API 采用 children 与子组件组合，详见 [API 规范](api-contract.md)。实施组件的配置台和生成代码已经按槽位输出；下文关于 options/items 的句子只描述编辑器内部的条目状态。调试源码在 `src/`，组件包不包含这些页面。

现有公共组件的目标入口与实施边界见 [逐组件实施清单](component-api.md)。实施编辑器前先核对对应状态；暂缓组件不输出猜测的新接口。

## 组合式内容的目标接入

- 预设配置与 API 自定义配置分层；预设入口在 API 编辑之外，不把 Button 的 action/showCount 等示例辅助项呈现为 API 同级参数。预设选择后的覆盖、保存与重置策略另行确认。
- 图标选择覆盖当前安装的 uplus icon 可加载全集，支持搜索与预览，不维护精选白名单；Icon 数字尺寸保留，默认尺寸接入组合约束。
- 内容编辑遵守组件声明的槽位规则：允许角色、min/max、排列和跨槽位条件。数量固定的节点仍在 children 中编辑；默认可删除节点只在新建或选择预设时初始化，删除后不自动补回。界面不展示规则元信息。
- 编辑器管理内容块与语义子组件结构；公共代码只生成 children 与子组件，不继续输出 options/items/links 等内容数组 Props。
- 同一内容只有一个编辑归属；Tabs 面板进入 Tabs.Content，不与根 children 提供两套互相覆盖的配置。
- 内部可以保存条目数组、稳定标识与内容树；这些是编辑器状态，不作为新的组件属性。数据项的增删、排序和编辑转成子组件结构。
- 文本是内容节点的一种，当前字符串 args 与文本块尚不能编辑任意组件组合。完整内容树接入须在组件目标 API 落实后实现，不能通过执行 JSX 字符串补齐。
- Select 触发器的富内容显示与删除当前选中项后的行为本轮不动。状态组合按 API 规范继续确认，编辑器不自行制定库默认行为。
- 界面不展示类型、默认值、签名、解释性文案或元信息提示。

## 现有实现基线

以下记录迁移前已实施的编辑器契约。涉及内容入口的部分由上面的组合式目标和 API 规范取代；焦点、草稿、重置与代码同步契约继续适用。

## 设计与布局来源

Preview、配置与用法的现行排布、表面、收缩、默认展开状态及参数名称列统一见 [展示与设计实践](design-system.md#展示与设计实践)，几何见 [组合圆角](design-system.md#圆角与组合几何契约)。本文只维护状态、编辑与代码生成的工程契约。

分组内部按可用宽度响应，普通参数单元最多 360px；名称与编辑对象纵向排列。主内容和数组摘要占整行。组件展示的这些宿主限制不变成公共组件默认宽度或新增属性。

## 参数元数据

`playground-catalog.ts` 记录 42 个条目，参数显式声明 key、scope、type、control、exampleValue，以及必要的 required、componentDefault、约束、说明和 when 条件。控件类型不再从示例初始值推断。

- prop：当前组件的真实属性，按内容、视觉、状态、行为、数值约束分组。
- example：展示组合的辅助配置，例如 Button 的 action/showCount、Slider 的 unit、Progress 的 indeterminate。它们不作为同名真实属性传入组件。
- slot：实施组件的内容槽位。界面使用槽位名称，生成代码输出语义子组件，不把内部 key 当作公共 Props。
- 环境：主题和预览背景独立管理，不进入组件属性或生成代码。

参数名称保持真实拼写。配置区以编辑对象为主，保留真实参数名；类型、必填、组件默认值与说明仅保存在内部元数据中，不在界面、提示或编辑弹窗展示，不提供“契约”入口。title、label、description 等内容属性的元数据标为 ReactNode，不能用 exampleValue 冒充组件默认值。继承的原生属性仍按 DOM 契约处理，不把所有原生属性做成调试控件。

## 编辑规则

tone 通过语义色样选择，仅展示组件支持的子集，输出仍为 neutral/success/danger。emphasis 与 size 用强调和尺度样本选择，使用原生 radio 的键盘语义。其他少量简短枚举使用 SegmentedControl，较多或较长枚举使用 Select。布尔使用 Switch，数字使用 NumberInput；颜色值复用 ColorPicker。内容以摘要块显示，空值提供添加入口，点击在本系统 Dialog 中编辑短文字或长正文；可选内容支持移除。文本编辑只保留本地草稿，保存才进入 args，取消、关闭或 Escape 丢弃草稿；必填文本不允许保存空内容。数组以集合摘要进入 Dialog 管理，修改即时应用，使用“完成”退出。图标以可搜索预览选择，候选与生成代码使用同一份已安装图标元数据。必需图标不能移除；可选图标删除后不自动补回。文本可用于编辑槽位中的文本示例，不声称支持任意 JSX 字符串执行或任意组件树。

Select、SegmentedControl、Tabs 与 ExternalLinks 的条目保存在编辑器内部，按 label、稳定 value、disabled，以及对应的 content、count、href、icon 编辑。最多八项；支持上移、下移，排序和修改标签均不重建 value。value 失焦或 Enter 提交，空值或重复值显示错误并保持先前有效配置，Escape 撤销该字段草稿。添加、删除与禁用选项后，选择调整到仍有效的选项；无可选项时选择为空。生成代码输出语义子组件，不输出 options、items 或 links 属性。

Button 使用 emphasis/tone，不再在调试区提供旧颜色 variant。CopyButton 与 ShareButton 通过示例 action 选择，仅显示各自有效参数。showCount 明确决定是否提供 count，显式 count=0 与未传不同。默认不产生点击计数或模拟业务反馈。

Slider/NumberInput 的 min/max/value、SelectionBar 的 count/total、Progress 的 value/max 使用条目级 normalizeArgs 处理；预览与生成代码共用相同规则。参数条件集中在条目元数据，不散落在编辑器内部。

## 状态与用法代码

args 是已提交配置的唯一来源。实例交互回写 args，配置修改更新实例；只有未提交的文本标识草稿留在编辑器内。草稿有错误时生成代码保留先前有效状态。

「重置示例」恢复 exampleValue，清理编辑草稿并关闭二次编辑弹窗，保留预览环境；收起 API 会关闭编辑入口并丢弃未保存草稿；不称为恢复组件默认。

生成用法从同一 args 转换为真实调用，使用 `uagray` 和 `uagray/styles.css` 公共入口，包含受控状态及必要回调。none/auto 的转换、未传的可选文案与显式 false/0 分别处理；示例辅助项、环境和配置面板状态不泄漏到公共 Props。事件与回调按真实签名生成用法，不在配置区另列签名或解释文字，不默认生成日志面板。用法采用单个 Disclosure；展开后的完整代码可复制，折叠不丢配置。外观与默认展开状态遵循主规范。

## 输入焦点

字段仅 Tab 定位显示轻量提示，鼠标点入与普通文字输入不启用外圈。共享 `src/ui/focus.ts` 维护导航意图，保留真实 DOM 焦点、光标与原生键盘语义；按钮等非文本控件保留 focus-visible。不得以 blur 清理输入焦点。

## 验证与边界

本轮本地类型检查通过，16 项配置交互测试通过；37 个默认示例与 CopyButton/ShareButton 两个分支的生成代码，使用真实公共组件源码完成 TypeScript 校验。

浏览器视觉与窄屏布局未验收；未启动浏览器工具或大规模兜底检查。调研来源及方案见 [API 调试优化方案](references/history/api-playground-plan.md)，组件属性名见 [API 规范](api-contract.md)。ColorPicker 契约见 [color-picker.md](color-picker.md)。

文本体例新增 Heading、Text、TextList，并统一 DescriptionList 的配置与生成用法。TextList 的 children 按行编辑文本示例并生成原生 li；DescriptionList 的 label/description 是按行配对的示例配置，转换为 dt/dd，不作为公共属性传入。空行保留配对位置，不执行 JSX 字符串。Pager 的 variant 配置与预览、生成用法同步。

ActionRow 的 size、disabled 与 children 是子项示例配置，不作为 ActionRow Props；预览与生成代码共同应用到实际子动作。
