# Uagray API 规范草案与审计

状态：公共 API 迁移建议供用户讨论确认。2026-10-10 已实施本地调试元数据、固定配置区、结构化选项、Button emphasis/tone 与代码同步；现行调试契约见 [playground.md](playground.md)。以下旧审计问题不代表均仍存在。本次审计覆盖 37 个展示条目及 CopyButton/ShareButton 辅助导出。以下“建议”是目标契约，不表示当前组件已经符合，也不自动授权批量破坏性迁移。

组件 API、展示页配置、生成代码必须分别审核。TypeScript 组件声明定义可用能力；展示页选择常用配置并提供示例数据；代码生成把配置转成真实调用。三者一致，不要求把每个原生属性都做成配置控件。

## 1. 内容与语义

- 基础控件默认呈现自身，不内置业务标签、解释、示例数据、标题或“已选/处理中”等可见辅助内容。
- `label?: ReactNode` 只表示可见标签，未提供时不渲染节点、不保留间距。Input/Select 等外部标签由 Field 组合。
- `aria-label` / `aria-labelledby` 负责无障碍名称。没有可见标签仍须由使用方提供名称；placeholder 不承担名称职责。
- 现有 Tabs/SegmentedControl/ButtonGroup/SearchField 的 label 只作无障碍名称，不能直接套用“删除 label”规则。建议迁移为标准 aria 属性，避免同名异义。
- IconButton 的无障碍名称、选项自身的 label、Disclosure 的触发内容是必要语义。Dialog 必须有可访问标题；可见标题不需要时须另提供名称，不能简单移除标题与关联。
- 提示、错误、辅助操作分别通过 `hint`、`error`、`action`/`children` 组合；不因有标签就自动生成说明、读数或图标。
- CopyButton 等有明确操作含义的辅助组件可保留功能性文案默认值，并提供替换能力；语言不能在同一公共组件内混用。装饰图标默认关闭；状态语义图标若保留自动选择，必须明确记录并支持 false 关闭。

## 2. 状态与事件

遵循 [React 单一状态来源](https://react.dev/learn/sharing-state-between-components)：每个公开状态必须有明确所有者，受控值由宿主决定；回调是改变请求，不代表宿主一定接受。

| 组件种类                                                                           | 建议契约                                                      | 回调内容                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------- |
| 原生 Input/Textarea/Checkbox/Radio/Switch                                          | 保留 value/defaultValue 或 checked/defaultChecked 与 onChange | 原生 React 事件                 |
| 合成值控件 NumberInput/Select/Slider/ColorPicker/Tabs/SegmentedControl/SearchField | value/defaultValue/onValueChange                              | 实际值，分别为 number 或 string |
| 展开状态 Disclosure/Dialog/Drawer                                                  | open/defaultOpen/onOpenChange                                 | boolean                         |
| 明确业务动作                                                                       | onConfirm/onFiles/onReject 等                                 | 对应动作的数据                  |

保留原生事件便于表单接入；合成控件不能用 onChange 同时表示事件与字符串。Select 的模式与 [Radix Select](https://www.radix-ui.com/primitives/docs/components/select) 对齐。

- `default*` 只初始化非受控状态；受控值优先，不能在运行中悄悄转为非受控。
- 交互中的草稿、拖拽、焦点等可留在内部，但草稿不能永久覆盖宿主的受控值。
- 可编辑控件应支持受控/非受控；复杂弹层先保持明确的受控入口，是否扩展 defaultOpen 单独决定，不为统一形式自动增加状态层。
- `disabled` 禁止交互；`readOnly` 在有明确只读含义的字段中保留查看与选择能力。不把 readOnly 强加给菜单、按钮等。
- 数字默认值、空输入、NaN、越界、step、无效选项必须分别记录。NumberInput 需讨论空值是 null，还是草稿仅到失焦后提交；展示页的 clamp 不能代替公共组件边界。
- 颜色输出格式、文件集合、错误信息均须有确定契约，不将演示辅助值直接输出。

## 3. 外观、尺寸与布局

| API                         | 唯一职责                                                 |
| --------------------------- | -------------------------------------------------------- |
| variant                     | 呈现方式，例如软底、透明、实体；不表示业务动作           |
| tone                        | 状态语义，例如 neutral/success/danger                    |
| surface（建议用于 Surface） | 表面角色；替换 Surface 当前含义不同的 tone               |
| size                        | 同一组件的几何尺度，映射尺寸 Token；不改变颜色或外部宽度 |
| className/style             | 宿主布局与必要扩展；原生控件遵守对应 DOM 语义            |

Button 已使用 emphasis="strong|default|quiet" 与 tone="neutral|danger"，旧 variant 仅作弃用兼容。本地调试与代码生成消费新属性，不提供任意 color/background/borderColor 参数。

边界与层级是组件视觉契约，不把白底自动等同描边。Surface 已公开有限的 treatment，详见本轮已实施补充；不能为了统一 API 而给全部控件增加 border/shadow 开关。详情页画布的边框属于展示层。

建议 size 使用 sm/md/lg（仅实现真实支持的档位），现有 default/small 迁移时明确对应 Token。需要改变公共尺寸先改 Token，不在详情页另写高度。图标尺寸/描边有专属数值参数，不与控件 size 档位混淆。

默认宽度按职责：按钮/标签随内容，字段/Slider/Progress/Alert 填充宿主，浮层受视口约束。无需全库 width/fullWidth 参数。宿主精确宽度使用布局、className/style；对 NumberInput 这种外包 div 的控件要明确 className/style 与 ref 分别落在根容器还是实际 input，不能暗中分裂同类属性。

## 4. 图标与插槽

- `icon` 表示内容图标。undefined 使用已记录默认行为，false 明确隐藏；默认无图标的组件不必要求传 false。
- 当前 string 为 Uagray 注册的 IconName，仅包含适配层实际接入图标，不等同上游所有图标。
- 建议讨论增加 ReactElement 插槽，允许直接传入官方 Uplus 图标而不把整套资源注册进包。保留统一尺寸、描边与 currentColor 契约；不引入字符串动态全量图标映射。
- 关闭、展开、选中标记等结构图标维持确定语义；内容图标可配，不要求所有箭头都开放同一 icon 参数。
- 主内容使用 children；明确区域使用 title/description/footer/action 等命名插槽。可组合内容优先 ReactNode，字符串只用于确实要按文本处理的值。
- Tabs/SegmentedControl 的 value 是稳定标识，与显示文字分开。Tabs 内容完全来自调用方，禁止自动复写标签作为面板文字。

## 5. 公共属性与 ref

叶子控件保留合理的原生属性、name、id、aria-_、data-_ 和 ref；选择属性冲突时 Omit 原生项再声明语义类型。合成组件只接收职责明确的属性，不盲目扩散所有 DOM 属性到多个节点。

根容器应提供 className 与可控布局扩展；ref 指向实际交互节点（NumberInput 为 input、Select 为 trigger），并在文档中明示。复合组件的根/输入分别命名，仅在存在真实双层布局需求时增加接口，不一律引入复杂 slotProps。

## 6. 详情页配置规范

当前“API”区域主要是交互配置，并非完整 API 文档。建议：

1. 每个真实参数记录 name/type/required/default/说明。默认值是组件默认，示例值单独记录；空字符串、undefined、false 的语义不能互换。
2. 保留原始参数名。基础控件编辑真实参数；事件与复杂 ReactNode/对象通过简短签名、结构和用法说明，不伪装成字符串参数。
3. action（按钮场景）、lastDisabled、unit、indeterminate、previous/next 布尔等展示辅助项移到独立“示例配置”；不是组件原有同名类型的参数，不列入真实 API 配置。
4. options/items 作为对象数组需保留真实形状。按行编辑可以是示例工具，但要明确 label/value/disabled/content 的结构。Tabs items 是必需对象，不是多行文本 API。
5. 组件、当前配置、生成用法同一语义：none -> false，auto -> 省略；示例辅助项必须剔除；重置恢复示例值，不称为恢复组件默认。
6. 不一律展开所有可选区域。Field、读数、动作、说明与图标是否显示分别表达；不存在的可选内容不产生占位。
7. 几何设置使用 NumberInput；枚举 Select；布尔 Switch；文本 Input/Textarea。参数逐行排布，复用 Disclosure/Surface，统一间距和表面契约。

建议给 catalog 增加 prop/example 分类以及 type/required/defaultValue/exampleValue 等元数据；不引入运行时 TypeScript 反射或完整文档框架。公共 Props 类型仍是能力依据，元数据和代码生成使用定向校验维护一致性。

## 7. 当前问题及优先级

| 优先级 | 已核对问题                                                                                    | 处理方向                                          |
| ------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| P0     | ColorPicker 收到 value 时交互仍直接更新内部颜色，宿主不接受请求时可与受控值不一致             | 修复真实受控所有权，保留内部 HSB 编辑语义         |
| P0     | NumberInput 的 draft/步进提交也可暂时覆盖受控 value；空输入契约未说明                         | 明确草稿、提交、空值和拒绝更新行为                |
| P1     | label 同时表示可见内容和无障碍名称                                                            | 拆分职责；可见标签可选，名称保留                  |
| P1     | SearchField/Tabs/SegmentedControl 的 onChange 接收值；原生字段的同名函数接收事件              | 合成控件统一 onValueChange，原生控件保留事件      |
| P1     | Slider/Progress 默认绑定标签与输出，Progress 还输出“处理中…”                                  | 可见 label 可选，showValue 单独选择，状态语义保留 |
| P1     | API 面板没有完整类型、必填、组件默认信息，示例初始值看起来像默认值                            | 补元数据与简短契约，保持配置区简洁                |
| P1     | 演示 action/lastDisabled/unit/indeterminate 等与真实参数混列                                  | 单独示例配置，生成器转换为真实调用                |
| P2     | Surface tone 与反馈 tone 含义不同；Button variant 混合状态和颜色                              | 定义唯一职责后统一迁移                            |
| P2     | 部分组合组件缺少 className/style/ref 支持；NumberInput 的 className 在外层而 style 下传 input | 定义属性落点，不强造全库 width API                |
| P2     | 部分组件只能受控，部分双模式；ExpandableCode 的展开状态完全内部                               | 按复用需求补齐并记录，弹层模式单独决定            |
| P2     | 通用控件包含默认英文搜索、中文选择提示、业务删除确认、上传文案等                              | 业务文案交给宿主，功能性默认文案明确且可改        |
| P2     | 图标选择只覆盖有限 registry；结构与内容图标未统一说明                                         | 注册清单共享，内容图标插槽待讨论                  |

## 8. 全部条目审计

“当前问题”描述本次读取到的代码；“建议”是待确认方向。此表不是完整原生属性清单。

| 条目                                        | 当前 API/问题                                                              | 建议                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Badge                                       | children/tone/icon；图标默认无；背景已有状态 Token                         | 保留内容最小契约，补根容器属性；状态/外观分工清楚                             |
| Alert                                       | title?/children/tone/icon，默认自动图标，缺根容器扩展                      | title/内容各自组合；可选图标默认策略明确                                      |
| Button                                      | 原生属性+icon/count/size/variant，count 是附加内容                         | 保留原生 onClick；count=0 也合法；展示自动点赞不是 API                        |
| IconButton                                  | label 是 aria 名称且同时变 title                                           | 名称必需；tooltip 与无障碍名称不要强制绑定                                    |
| ButtonGroup                                 | children/label，label 是 group 名称                                        | 标准 aria 名称，补根容器布局入口                                              |
| Checkbox                                    | 原生 input 属性，强制 label ReactNode                                      | 可见 label 可选；无文案使用 aria 名称；无空 span                              |
| Radio                                       | 同 Checkbox                                                                | 同 Checkbox；保留 name/value 原生分组语义                                     |
| Switch                                      | 原生事件+checked/defaultChecked，强制可见 label                            | 可见标签可选，保留 boolean 与原生事件                                         |
| Input                                       | 原生属性，Field 提供标签/错误上下文                                        | 不新增自带 label；type=number 与 NumberInput 的职责需说明                     |
| Textarea                                    | 原生属性+rows=3/resizable=true                                             | 保留当前纵向 resize 契约，不额外绑定说明                                      |
| NumberInput                                 | onValueChange(number)，defaultValue=0，草稿与 min/max/step                 | 优先明确定向提交/空值/受控拒绝；布局属性落点                                  |
| Select                                      | options 对象数组，Radix trigger ref，defaultValue=""，placeholder="请选择" | placeholder 不默认填文案；保留 onValueChange 与原生表单关联                   |
| Slider                                      | label 必需，track/filled，value/defaultValue，原生 onChange+onValueChange  | 可见 label 与输出独立；修复未合并的 style；值回调为主要契约，原生事件含义明示 |
| Progress                                    | label 必需，value undefined 表示不确定，默认显示读数/处理中                | label/showValue 可选；不确定状态保留原生 progress 语义                        |
| SearchField                                 | label 为 aria 名称，onChange(string)，仅受控，默认 Search                  | 标准名称；onValueChange；默认无提示文字；快捷键显式开启                       |
| SegmentedControl                            | options/value/onChange(string)，group label，仅受控                        | onValueChange，稳定 value，不用 label 作 ID，默认状态策略记录                 |
| Tabs                                        | items 必须含 content，value/onChange(string)，label 为 tablist 名称        | onValueChange，内容由调用方提供，语义面板与标签关联保留                       |
| Disclosure                                  | title 必需ReactNode，open/defaultOpen/onOpenChange                         | 触发内容语义保留；补根容器扩展，视觉遵循统一表面规则                          |
| Dialog                                      | open/onOpenChange/title，description/footer/dismissible/closeLabel/variant | 必须有可访问标题；defaultOpen 是否支持单独决定；variant 与 Drawer API 边界    |
| Drawer                                      | 包装 Dialog，移除 variant                                                  | 保持独立条目；布局、关闭、焦点契约与 Dialog 相同                              |
| ConfirmDialog                               | 受控，title/description/onConfirm，busy/danger，默认“确认删除”             | 默认不能假定删除场景；取消/确认文案可配，busy 语义保留                        |
| Toast                                       | open/onOpenChange/message/tone/duration/icon                               | 内容字符串是否改 children 待讨论；停留/聚焦暂停保持；操作内容组合             |
| EmptyState                                  | title 必需，description/action，可配 icon 但默认 grid                      | 装饰 icon 默认无；业务标题由宿主提供，不内置示例动作                          |
| FileDropzone                                | label 可选但有默认提示，按钮固定“选择文件”，内部 plus，无布局/图标入口     | 主控件与提示/按钮文案拆分，可关闭或替换内容图标，保留文件校验                 |
| SelectionBar                                | count/total/busy 和三业务回调，内置全选/清空/完成及已选文案                | 作为可选组合组件；动作由 children 组合，数量提示可选                          |
| ExpandableCode                              | code/label/collapsedHeight，内部复制与展开，无法控制 open                  | 名称与真实 code 内容对齐；open 可复用、复制/展开动作配置按需求决定            |
| Pager                                       | previous/next 对象，固定前后语义，缺根属性                                 | 保留对象数据；缺项禁用可记录；布尔控制仅属示例                                |
| NavigationCard                              | direction/title/href，自带 Previous/Next 文案                              | 文案由可覆盖语义配置提供，卡片宽度由宿主                                      |
| ShowcaseCard                                | title/description/href/children，description 必需                          | 描述可选，无描述不占位；不把具体展示内容内置                                  |
| ExternalLinks                               | links 对象数组；导航名固定英文                                             | aria 名称可设，数据项维持 label/href/icon 结构                                |
| Surface                                     | tone=soft/raised + treatment + 原生 div 属性/ref                           | 角色与状态 tone 分开；边界和层级规范待确定                                    |
| ColorPicker                                 | value/defaultValue/onValueChange/label/disabled/className                  | 先修受控语义；无可见标签与色板已实现；保留辅助名称                            |
| Icon                                        | name/size/weight/absoluteWeight + SVG 属性；默认18/1.5/true                | 保留官方适配，说明 name registry 边界，避免全量打包                           |
| Keycap                                      | children，缺根属性                                                         | 只呈现提供内容；根属性按实际扩展需求补齐                                      |
| Layout                                      | children/className/label，label 指 group 名称                              | 仅组织布局；使用标准 aria 名称，不自动增加表面                                |
| PageShell                                   | controls/children/footer/className/mainId/mainAs；默认大页头/最小高度      | 必要语义与布局分离；无 controls 不制造空头部，尺寸由统一页面 Token/宿主决定   |
| CopyButton/ShareButton（Button 的示例场景） | Copy 有 text/label/icon/size；Share 仅 url，实际复制链接                   | 与 Button 场景分开说明；不把分享 API 误写成原生系统分享                       |

## 9. 建议迁移顺序与验收

1. 用户确认：原生事件/合成值回调分工、可见标签策略、variant/tone/surface 的职责、数字空值与默认值。
2. 优先修受控一致性；采用“宿主拒绝更新”定向测试，而非只测试宿主接受回调的路径。
3. 实施可选标签/读数与名称分工，迁移调用方及生成代码；不影响 Tab 键可访问性。
4. 分离真实 API/示例配置，补类型、默认值与必要结构说明；代码生成针对关键转换校验。
5. 表面规范确定后迁移外观 API，与 Token 一起修，避免先增参数再想视觉语义。

仅文档审计不运行构建或测试，不使用浏览器。后续实现按改动执行类型检查和必要定向行为验证。

## 已实现组合接口补充 · 0.5

- ButtonGroup：tone="soft"（默认）提供共同底座，tone="plain" 保留功能组但不铺底；plain 组中按钮 aria-pressed 表达局部选择。
- SelectionBar：tone="plain"（默认）按内容宽度排列，不强加底座；tone="soft" 增加共同底座。actions 由宿主组合，total 与三个业务回调可选。

这些为已实现接口，覆盖上文相应组件的旧现状说明；其他迁移建议仍是草案。

Disclosure 增加可选 actions:ReactNode 和 className:string。actions 是标题按钮旁的同级辅助操作区域，用于复制等操作，不参与展开切换且不嵌套按钮。标题使用透明 Button 语义；open/defaultOpen/onOpenChange 契约不变。组件详情用法不再叠加 ExpandableCode，展示页使用 Disclosure + 完整可滚动 pre，代码继续随配置同步。

## v0.1 已实施 API 补充 · 2026-10-10

用户允许调整 API，要求逐项说明。本轮新增 Surface.treatment?:"tonal"|"defined"|"physical"（默认 tonal）与导出的 SurfaceProps，Surface 支持原生 div 属性及 ref；现有 tone="soft"|"raised" 保留兼容，颜色不自动携带边缘/阴影。其余公共组件接口保留。

ui-tool-surface 从自动实体处理改为几何样式；需要边界的调用方传 defined，需要实体感的传 physical。所有仓库调用已同步，详见 [迁移表](visual-polish.md)。Outline 等候选按钮/字段未新增，不开放任意 surface/border/shadow 组合开关。

Tabs 详情新增 contents 是展示辅助项；生成用法将它变为 items[].content，不输出 contents 属性。参数编辑保留原生语义和自然 Tab 顺序，API 参数横向成完整编辑单元，长文本按需展开，替代上文历史的逐行配置方案。
