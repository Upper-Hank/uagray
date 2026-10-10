# 组件 API 调试契约

2026-10-10 修订并实施。API 调试保存在 Git 忽略的 `local/site/`，公开展示站保留静态用法，不依赖调试目录。公共组件 Props 与事件名称保持原契约。

## 布局与表面

配置嵌入同一个 Preview 容器，始终位于实例预览下方，使用完整可用宽度；配置区随内容自然展开，不设最大高度或内部滚动。标题、灰底重置按钮与参数一起随工作台内容滚动。预览工具栏提供「收起 API / 展开 API」：收起后移除配置区占用的高度，重新展开保留配置与编辑草稿。

预览展示单个组件或必要组合；「页面 / 灰区 / 白层」与 API 收起/展开按钮位于 Preview 容器内部的顶部工具栏，组件名称保留在容器外。环境切换只改变实例预览环境。配置区是独立白色工具层，编辑器消费对应环境的 control 灰底，环境切换不改变配置区底色、参数或生成代码。配置区不浮动、不遮挡实例、不拖动或缩放，不通过给实例增加底部空白预留浮层位置。

Preview 容器外圆角为 24px，留白 12px，描边 1px。预览区与配置区的圆角为 24px − 13px = 11px，与外框同心。其他关系遵循 [圆角与组合几何契约](design-system.md#圆角与组合几何契约)。不为每条参数增加卡片或常驻描边。

## 参数元数据

`playground-catalog.ts` 记录 37 个条目，参数显式声明 key、scope、type、control、exampleValue，以及必要的 required、componentDefault、约束、说明和 when 条件。控件类型不再从示例初始值推断。

- prop：当前组件的真实属性，按内容、视觉、行为、数值约束分组。
- example：展示组合的辅助配置，例如 Button 的 action/showCount、Slider 的 unit、Progress 的 indeterminate、外链组合数据。它们不作为同名真实属性传入组件。
- 环境：主题和预览背景独立管理，不进入组件属性或生成代码。

保留现有分组层级，分组内部采用响应式多栏网格，按实际宽度自动减少栏数。普通参数名称在左、编辑控件在右；长文本和选项数组占整行，不压进窄栏。不通过新增参数卡片或改变表面层级实现紧凑布局。

普通参数单元宽度最多 360px，少量参数不拉伸铺满整组。名称列默认固定为 112px，让同栏控件起点对齐；窄单元最多占 40%，超长名称换行。名称与控件固定相距 12px。开关不靠栏尾对齐。组内行距小于分组间距，长文本与数组保持整行宽度。

参数名称保持真实拼写。配置区只保留参数名与编辑控件，不提供“契约”入口。类型、必填、组件默认与说明仍保留在元数据中，不能用 exampleValue 冒充组件默认值。继承的原生属性仍按 DOM 契约处理，不把所有原生属性做成调试控件。

## 编辑规则

少量简短枚举使用 SegmentedControl，较多或较长枚举使用 Select。布尔使用 Switch，数字使用 NumberInput，短文本使用 Input。长文本与复杂数组用本系统 Disclosure 按需展开，不使用原生 details/summary 的默认外观。文本可用于编辑 ReactNode 的文本示例，不声称支持任意 JSX 字符串执行。

Select、SegmentedControl 的 options 与 Tabs 的 items 按实际对象结构编辑，保留 label、稳定 value、disabled 及 Tabs 的 content 文本。最多八项；修改标签不重建 value。value 失焦或 Enter 提交，空值或重复值显示错误并保持先前有效配置，Escape 撤销该字段草稿。添加、删除与禁用选项后，选择调整到仍有效的选项；无可选项时选择为空。

Button 使用 emphasis/tone，不再在调试区提供旧颜色 variant。CopyButton 与 ShareButton 通过示例 action 选择，仅显示各自有效参数。showCount 明确决定是否提供 count，显式 count=0 与未传不同。默认不产生点击计数或模拟业务反馈。

Slider/NumberInput 的 min/max/value、SelectionBar 的 count/total、Progress 的 value/max 使用条目级 normalizeArgs 处理；预览与生成代码共用相同规则。参数条件集中在条目元数据，不散落在编辑器内部。

## 状态与用法代码

args 是已提交配置的唯一来源。实例交互回写 args，配置修改更新实例；只有未提交的文本标识草稿留在编辑器内。草稿有错误时生成代码保留先前有效状态。

「重置示例」恢复 exampleValue，清理编辑草稿与已展开的编辑区，保留预览环境；不称为恢复组件默认。

生成用法从同一 args 转换为真实调用，使用 `uagray` 和 `uagray/styles.css` 公共入口，包含受控状态及必要回调。none/auto 的转换、未传的可选文案与显式 false/0 分别处理；示例辅助项、环境和配置面板状态不泄漏到公共 Props。事件与回调提供真实签名说明，不默认生成日志面板。用法采用单个 Disclosure，默认收起；展开后的完整代码局部滚动、可复制，折叠不丢配置。

## 输入焦点

字段仅 Tab 定位显示轻量提示，鼠标点入与普通文字输入不启用外圈。共享 `src/ui/focus.ts` 维护导航意图，保留真实 DOM 焦点、光标与原生键盘语义；按钮等非文本控件保留 focus-visible。不得以 blur 清理输入焦点。

## 验证与边界

本轮本地类型检查通过，16 项配置交互测试通过；37 个默认示例与 CopyButton/ShareButton 两个分支的生成代码，使用真实公共组件源码完成 TypeScript 校验。

浏览器视觉与窄屏布局未验收；未启动浏览器工具或大规模兜底检查。调研来源及方案见 [API 调试优化方案](api-playground-plan.md)，公共 API 中仍待讨论的事项见 [API 规范草案](api-contract.md)。ColorPicker 契约见 [color-picker.md](color-picker.md)。
