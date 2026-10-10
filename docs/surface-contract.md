# 环境色与表面契约

2026-10-10 用户确认环境色模型，并授权推广至规范层与全部组件。本契约取代旧版“灰底三种常态表面”和七步表面评判顺序；与旧稿、实施记录冲突时以本契约为准。

## 核心规则

**调用方只声明意图，颜色由所处环境决定。**

组件不再按“它放在哪里”选择 white / soft / plain 等外观变体。调用方表达的是职责：`emphasis="strong | default | quiet"`、`tone="neutral | success | danger"`。普通控件填充由最近的环境容器给出，比所在背景深一级；区块按环境交替，独立层与 strong 强调遵循各自角色规则。

## 三种环境

| 环境     | 背景      | 由谁建立                                                  | control / hover       | region（内容区块） |
| -------- | --------- | --------------------------------------------------------- | --------------------- | ------------------ |
| 页面     | `#fbfbfb` | 根节点，默认环境                                          | `#ececec` / `#e4e4e4` | 灰 `#f2f2f2`       |
| 灰色区域 | `#f2f2f2` | `Surface`（soft）                                         | `#e4e4e4` / `#dbdbdb` | 白 `#fff`          |
| 白色层   | `#fff`    | `Surface raised`、Dialog、Toast、Select 菜单、ColorPicker | `#f2f2f2` / `#e8e8e8` | 灰 `#f2f2f2`       |

深色主题按同一结构映射（`#151515` / `#202020` / `#303030`，control 依次为 `#2a2a2a` / `#2e2e2e` / `#3a3a3a`），不机械取反。

## 环境契约变量

组件只读取以下变量；环境容器负责重新指向它们。组件内不得直接写 `--ui-raised`、`--ui-surface` 等字面表面作为控件填充。

| 变量                                         | 用途                                                   |
| -------------------------------------------- | ------------------------------------------------------ |
| `--ui-control` / `--ui-control-hover`        | 按钮、字段、选择标记、轨道、Badge 中性底、局部单元     |
| `--ui-selected`                              | 透明组中的按下 / 当前项                                |
| `--ui-success-fill` / `--ui-danger-fill`     | 状态底，按环境配对，不把浅页面上的状态底搬到灰区域     |
| `--ui-region` / `--ui-region-hover`          | 内容区块填充：Disclosure、代码、上传区、展示卡、导航卡 |
| `--ui-region-control*`、`--ui-region-*-fill` | 区块成为其子项环境时使用的值，组件不直接消费           |

`--ui-control-on-background / on-surface / on-raised` 是三档基础值，只供环境容器引用。

## 四种角色

1. **控件**：读取 `--ui-control`。default 按钮、Input、Textarea、NumberInput、Select 触发器、SearchField、Checkbox / Radio 未选标记、Slider 字段、Segmented / Tabs 轨道、中性 Badge。不再使用描边或 inset 阴影补救灰上灰。
2. **区块**：读取 `--ui-region`，与环境交替（页面上为灰，灰区域中为白，白色层中为灰），并自动成为子项的环境；区块中的按钮、Badge 随之取得正确的一级差。区块不嵌套；需要嵌套时改为在区块内使用控件或透明组织。
3. **层**：白色独立层，带阴影或描边：选中指示块、Keycap、Toast、菜单、Dialog、Slider / Switch 滑块、展示卡外链。白色只属于层，不再是按钮或字段的样式。
4. **强调**：`emphasis="strong"` 使用 action 黑或 danger 红，跨环境不变；禁用时退回 `--ui-control` 与 disabled 文字。

## 组与工具

- soft 操作组的共同底座读取 `--ui-control`；组内非 strong 按钮自动透明，hover 使用 overlay。SelectionBar soft 相同。
- plain 组只负责排列与归属，不清空子按钮表面；按下项使用 `--ui-selected`。
- 工具条（`.ui-tool-surface`）是白色层，内部按钮按白色层环境取得 `#f2f2f2`，不再额外改色。
- Tabs / Segmented：轨道为 control，选中块为白色层；不再套第二层工具外壳。

## 常驻描边硬性规则

**常驻对象描边只允许用于白色层且具有明确强调或分离职责的对象。白底是必要条件，不是自动加描边的理由。**

控件、区块与透明对象不得使用常驻轮廓描边，包括借 border-block、inset shadow 或伪元素模拟轮廓。环境模型保证一级差，不需要描边补救。内容分隔线只表达内容之间的结构，不围合控件。focus、错误等按交互或真实状态出现的提示不属于常态装饰描边。

## 文本体例

代码、用法和 Disclosure 都是区块：标题为透明控制，复制动作与标题同级、使用 quiet，正文直接呈现，不再套卡片。分隔线是否存在由阅读结构决定，不作为所有 Disclosure 的默认值。ExpandableCode 不因展开操作获得白色外壳。

## 操作优先级

编辑表单的主要动作使用 strong 保留独立识别；次要动作使用 default；重置、取消等附属动作使用 quiet。不能以成组为由把主要动作也变成文字。旧 `variant` 仅作兼容映射：soft / white → default，plain → quiet，dark → strong，danger → strong + danger。

## 验证入口

规范页“环境矩阵”在页面、灰色区域、白色层三列中并排展示按钮、字段、选择、状态与区域全部族类。新增组件或改色前先在矩阵中加入对应行；每格填充与背景的差应一致，区块列中的子项必须随区块换档。

## 冗余演示信息禁令

基础组件与规范页示例不得默认添加初始化计数、执行流水、模拟成功消息、重复状态旁注或解释自身结构的文案。例如“已添加 0 项”“编辑已打开”不能作为通用演示模板；也不能移到隐藏 live region 规避禁令。

只有真实任务必须知道且无法从控件/内容变化获知的结果、错误、异步进度或必要的无障碍反馈才允许独立提示。选择通过选中状态表达，编辑通过实际字段表达，数量通过实际内容表达。演示没有对应业务任务时，只展示必要的控件反馈，不附带模拟业务状态。

教学图示中的“信息/对象/空间”“白底/灰底”等辨识标签用于区分比较对象，可以保留；它们不属于模板状态提示。

组件文案由宿主提供：可选标题、说明、占位提示、数量摘要和进度旁注默认省略，未提供时不渲染空文字容器。不得把演示文案写入组件默认值。Alert 的 title、Field 的 hint/error、Dialog/ConfirmDialog 的 description 按需传入；SelectionBar 用 summary 提供摘要，count/total 仅服务操作状态；Progress 用 label/valueLabel 提供标题与进度文案；FileDropzone 的 label 为可选说明，buttonLabel 为选择动作名称；NavigationCard 用 directionLabel 提供可选方向文字。SearchField 和 Select 不自动生成 placeholder。展示页与生成代码遵守同一默认值。

保留必要动作名称、内容本体、真实失败反馈和可访问名称。没有可见说明时仍必须能识别控件；不得为了清理文字删除真实输入标签、错误或忙碌状态语义。调用方需要额外业务反馈时，通过已有文案属性、children/actions 等插槽及回调组合。
