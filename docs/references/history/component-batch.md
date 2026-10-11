# 需求驱动组件批次 · 2026-10-09

> 历史参考材料：仅保留当时的观察、讨论或实现快照，不作为现行规范。现行设计依据见 [设计参考规范](../../design-system.md)。
> 本批按用户授权，从本地 `uplus-icon` 和 `my-font` 的实际界面需求提炼通用组件。只修改 Uagray；未替换两个宿主项目的组件，也不搬入它们的 API、路由、事件总线和业务数据。

## 需求清单与实现

以下路径相对于 `/Users/upper/Web/`。所有新增导出经 `src/ui/index.ts` 提供，展示站增加 14 组组件示例及 1 项布局动效规范。

| 需求来源                                                                                                              | 新增组件                                                                        | 提炼后的职责                                                   |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `my-font/web/src/pages/Project.jsx`、`uplus-icon/apps/site/src/components/SelectMenu.tsx`                             | Field、Input、Textarea、Select                                                  | 标签/描述/错误关联、原生输入、统一下拉菜单；不复制业务下拉菜单 |
| `my-font/web/src/components/GlyphAdjustment.jsx`、`uplus-icon/apps/site/src/components/SwitchControl.tsx`             | Checkbox、Radio、Switch                                                         | 原生单选、多选、即时设置；不携带全局偏好存储                   |
| `GlyphAdjustment.jsx`、`my-font/web/src/pages/Build.jsx`、`uplus-icon/apps/site/src/components/IconDetailPreview.tsx` | Slider                                                                          | 受控或非受控数值调节、单位读数、键盘与表单语义                 |
| `uplus-icon/apps/site/src/components/PreviewColorPicker.tsx`                                                          | Tabs                                                                            | 内容面板切换；与分类筛选的 SegmentedControl 区分               |
| `my-font/web/src/ui.jsx`                                                                                              | Disclosure、Dialog、ConfirmDialog                                               | 折叠设置、模态内容、确认动作；不执行删除请求                   |
| `uplus-icon/apps/site/src/components/IconDetailDrawer.tsx`                                                            | Drawer                                                                          | 侧边模态详情；共享 Dialog 生命周期                             |
| `my-font/web/src/ui.jsx`、`web/src/components/Toast.jsx` 与各页面保存反馈                                             | Badge、Alert、Toast、Progress、EmptyState                                       | 状态、错误、短提示、进度、空内容；不绑定 router/provider       |
| `my-font/web/src/pages/Photos.jsx`、`Templates.jsx`、`Fonts.jsx`                                                      | FileDropzone                                                                    | 拖入/选择、扩展名/MIME/大小校验；输出 File[]，不发请求         |
| `my-font/web/src/components/ManageToolbar.jsx`                                                                        | SelectionBar                                                                    | 数量及批量动作；不复制 body 高度调整或全局自定义事件           |
| `my-font/web/src/pages/Project.jsx` 生成按钮、`uplus-icon/apps/site/src/components/SlidingSurface.tsx`                | Layout；改进 Button、ButtonGroup、SegmentedControl、SearchField、ExpandableCode | 文案/数量引起尺寸变化时平滑过渡，组合内同步位置                |

## API 与状态约定

字段组件保留 React 19 原生元素属性与 ref。其余组合组件只开放必要的契约，使用 `React.ComponentProps<typeof Component>` 获取完整类型，不引入重复 props 模型。

| 导出             | 主要属性与约定                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field            | `label, id?, hint?, error?, required?, children, className?`；内部一个主输入，Field 管理关联 ID，自定义 ID 设在 Field 上                                                                                |
| Input / Textarea | 原生 input/textarea 属性与 ref；继承 Field 的 ID、required、aria-invalid、描述；也可独立使用并传 label 关联                                                                                             |
| Select           | `options: {value,label,disabled?}[]`，`value/defaultValue/onValueChange`，`name/required/disabled/placeholder` 与 trigger button 属性/ref；由 Radix Select 管理浮层；不实现 searchable 或多选           |
| Checkbox / Radio | `label` + 原生 input 属性/ref；Radio 的同组项共享 `name`；支持 checked/defaultChecked                                                                                                                   |
| Switch           | `label` + 原生 input 属性/ref；`checked/defaultChecked/onChange`，内部原生 checkbox，role=switch                                                                                                        |
| Slider           | `label, variant?: track/filled, value?/defaultValue?, min?, max?, step?, onValueChange?, formatValue?` + 原生 input 属性/ref；输出 number，调用方保证 min ≤ max                                         |
| Tabs             | `aria-label, items: {value,label,content,disabled?}[], value/defaultValue, onValueChange`；可受控或非受控，方向键/Home/End，隐藏面板保持挂载                                                            |
| Disclosure       | `title, open?/defaultOpen?, onOpenChange?, children`；闭合内容 inert + aria-hidden，保持输入状态                                                                                                        |
| Dialog / Drawer  | `open, onOpenChange, title, description?, children, footer?, dismissible?, closeLabel?`；受控，原生 showModal/close，Escape/遮罩关闭                                                                    |
| ConfirmDialog    | `open, onOpenChange, title, description?, onConfirm, busy?, tone?: neutral/danger, confirmLabel?, cancelLabel?`；默认 neutral，删除确认显式传 danger；busy 禁用关闭/取消/确认，异步完成和错误由宿主管理 |
| Badge / Alert    | `tone: neutral/success/danger`（默认 neutral）、children；Badge 用 `emphasis: default/quiet`；Alert 可传 title，危险反馈 role=alert，其余 role=status                                                   |
| Toast            | `open, onOpenChange, children, tone?, duration?`；默认 4200ms，≤0 手动关闭；悬停和焦点分别暂停，离开后重新计时；一次使用一个提示，队列交给宿主                                                          |
| Progress         | `label?, valueLabel?, value?, max?`；省略 value 表示不确定进度，原生 progress，数值限定在范围内                                                                                                         |
| EmptyState       | `title, description?, actions?`；图标默认隐藏；宿主提供下一步操作                                                                                                                                       |
| FileDropzone     | `label?, buttonLabel?, accept?, multiple?, disabled?, maxSize?, onFiles, onReject?, name?`；maxSize 单位字节，不合格整批拒绝；输入重置以支持重复选择，以回调文件为准而非表单文件值                      |
| SelectionBar     | `count, total?, summary?, onSelectAll?, onClear?, onDone?, busy?, children?, actions?`；默认不固定定位，不拥有选中集合；busy 禁用自身操作，宿主同时禁用 children 中的业务动作                           |
| Layout           | `children, className?, aria-label?`；布局同步容器，className 提供 flex/grid 等布局；不自动添加业务布局                                                                                                  |

最小用法与真实状态示例见展示站详情页及 `src/playground.tsx`。当前展示为左目录、右实践，目录链接与实际交互区域分开。

## 动效规则

- 使用用户指定的 `framer-motion`。`src/ui/motion.tsx` 集中布局配置：240ms、cubic-bezier(0.23, 1, 0.32, 1)。纯颜色/悬浮继续用 CSS。
- Button 尺寸、ButtonGroup 外壳及 SegmentedControl 布局使用 layout；子文字单独处理位置，减少父级缩放对内容的影响。按钮原生事件通过适配层透传，避免与 Motion 的同名拖拽/动画事件冲突。
- 多个互相关联的控件用 Layout 的 LayoutGroup 同步更新；宿主不用安装强制 Provider。自定义子元素若也需要位置过渡，应使用 Motion layout 元素或库内控件。
- 分段选中层依据实际 offsetWidth/offsetLeft 测量后移动，不硬编码每项宽度；折叠区域处理高度；Toast/弹层仅短距离位移与淡入淡出。
- 尊重 prefers-reduced-motion：关闭布局移动，状态即时变化。图标动画放在包裹层，不修改上游 SVG。
- 本轮针对 React 文案、状态和数量更新造成的布局变化。不能将此视为窗口持续拖动、任意外部 CSS 变化都能自动补间的保证；Motion 在窗口调整尺寸期间会抑制布局动画。详见 [Motion 布局动画](https://motion.dev/docs/react-layout-animations)、[减少动态效果](https://motion.dev/docs/react-accessibility)。

## 工程与验证边界

按职责拆成 fields、selection、panels、feedback、file-dropzone、motion，使用已有灰阶、字体、圆角和阴影。新增少量危险/成功语义色；默认控件仍保持柔和灰色。

执行源码类型检查、22 项定向 DOM 交互测试和展示站生产构建。测试涵盖原生属性/ref、字段关联、选择和数值输出、Tabs 键盘与状态保留、折叠 inert、弹层关闭/忙碌限制、文件筛选、Toast 暂停、批量操作及原有展示导航。jsdom 的 dialog 仅模拟开关生命周期，不验证浏览器焦点陷阱或视觉动效。

未使用浏览器、未验证两个宿主项目的实际接入，也未实现 npm 库产物。Framer Motion 会增加运行时体积；保持简单组件和无额外 UI 框架，后续库构建阶段再验证按需消费、peer/external 与产物大小。

本轮展示站构建结果：JS 约 409KB（gzip 131KB），CSS 约 332KB（gzip 101KB，包含既有的中文字体分片声明）。这是包含全部交互示例的站点产物，不代表单组件或未来 npm 包的按需引入体积。

## 展示页重组与控件修正 · 2026-10-09

- 展示页改为左目录、右实践，用 SegmentedControl、SearchField、Badge、Surface、Disclosure、ExpandableCode、CopyButton 和 EmptyState 组成；取消作品画廊、分享操作和作品前后翻页。
- Token 扩展为五类，完整目录见 [Token 契约](../../tokens.md)。展示值直接读取 CSS，不在示例数据中重复定义。
- Select 由原生菜单改为 `@radix-ui/react-select` 无样式交互基础。灰阶菜单由本库 CSS 绘制；打开、浏览高亮与 Escape 取消不会触发值变更；实际确认后调用 onValueChange。空值显示 placeholder，不自动选择第一项。name、required 与隐藏原生表单输入由基础组件管理。
- **Select API 调整**：onChange(event) 改为 onValueChange(value)，ref 由 HTMLSelectElement 改为 HTMLButtonElement。选项 value 要唯一且非空；清空选择传空字符串。当前示例与测试已迁移。
- Slider 新增 `variant="filled"`，保留默认 `variant="track"`。填充款包含浅灰外壳、进度填充、刻度、竖向手柄和内部 label/output；两个样式共享原生 range、ref、onChange、onValueChange、禁用及键盘语义。
- 定向 DOM 测试扩展至 22 项，包括 Select 打开不提交、Escape 取消、确认提交、空值与 trigger ref，以及填充款 Slider。未使用浏览器，因此无法声称已复现并验收所有真实指针误选路径或像素效果。

下拉行为依据 [Radix Select](https://www.radix-ui.com/primitives/docs/components/select) 的交互契约，样式由 Uagray 维护。依赖用于避免重复实现焦点、定位与碰撞处理，不引入 Radix Themes。

重组后的展示站产物：JS gzip 约 162KB、CSS gzip 约 102KB。增加的 Select 交互基础会影响站点体积；未来库产物的单组件消费体积仍需在独立库构建时测量。

## 单件展示与配置

详情已改为 35 个单件组件条目，提供基础属性的实时配置和代码生成；旧组合示例已移除。复制/分享仍归入 Button 场景。实践画布、字段焦点及 PageShell 契约见 [playground.md](../../playground.md)。
