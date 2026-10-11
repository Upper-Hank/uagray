# 历史快照：组合式内容 API 确认前

本文件保存 2026-10-11 本轮修改前的 API 规范，包含此前迁移记录。仅供追溯，不作为新的实施依据。现行目标见 [API 规范](../../api-contract.md)。

# Uagray 组件 API 规范与通用 API 名单

状态：2026-10-10 用户确认，作为组件 API 的唯一依据。已确认决定：`size` 取值为 `md | sm`；内置按钮默认文案统一中文；第 6 节迁移清单已授权，按第 7 节执行。新组件和新增属性立即遵守。颜色相关规则见 [设计参考规范](design-system.md#环境与表面)，配置台交互契约见 [playground.md](playground.md)。

## 1. 八条规则

1. **一个名字只有一个意思。** 第 3 节通用名单中的名字在所有组件中含义、类型和取值一致。名单中没有的概念先补名单，再用于组件；不为单个组件发明同义词。
2. **调用方声明意图，不声明颜色。** 外观只通过 `emphasis`、`tone`、`variant`、`size` 表达；不开放 color、background、border、shadow 等直接视觉参数。颜色由环境决定。
3. **可见与可访问分开。** `label` 永远是可见文字；只作无障碍名称时使用标准 `aria-label`。没有可见标签的控件必须要求 `aria-label`。
4. **状态三件套。** 每个可变状态使用 `x` / `defaultX` / `onXChange`：合成值控件为 `value` / `defaultValue` / `onValueChange(value)`，展开类为 `open` / `defaultOpen` / `onOpenChange(open)`。原生控件保留 `checked` / `onChange(event)`。`onChange` 只用于原生事件，不传值。
5. **事件按动作命名。** 业务动作用 `on` + 动词：`onConfirm`、`onFiles`、`onReject`、`onClear`。回调是请求，受控时宿主决定是否接受。
6. **组件不内置业务文案。** 主内容、标题、说明、占位提示默认为空，未提供时不渲染节点。只有内置按钮的功能文案可以有默认值，统一命名为 `<用途>Label`，默认使用中文，并可替换。
7. **宿主属性统一。** 每个组件接受 `className`；根节点为单个 DOM 元素的组件同时接受 `style` 与原生属性。`ref` 指向实际交互节点（NumberInput 为 input，Select 为 trigger）。
8. **布尔属性以肯定形式命名。** 布尔属性用形容词或能力名（`disabled`、`multiple`、`dismissible`），不用 `no`、`hide` 前缀；默认值取最常见情况。

## 2. 属性分组（也是配置台分组顺序）

| 分组     | 收纳                                                                     | 说明                           |
| -------- | ------------------------------------------------------------------------ | ------------------------------ |
| 内容     | 文字、插槽、数据、图标                                                   | 组件呈现什么                   |
| 视觉     | emphasis、tone、variant、treatment、size、layout、direction              | 组件以什么形态呈现，不含颜色值 |
| 状态     | value、checked、open、count、disabled、readOnly、busy                    | 当前处于什么状态               |
| 行为     | required、multiple、dismissible、shortcut、resizable、accept、type、name | 如何响应输入                   |
| 数值约束 | min、max、step、maxSize、duration、collapsedHeight、rows、total          | 数值边界                       |
| 事件     | on*、formatValue                                                         | 只读签名，不可编辑             |

## 3. 通用 API 名单

配置台控件取值：`text` 单行文本、`textarea` 多行文本、`number` 数字、`boolean` 开关、`enum` 枚举、`icon` 图标选择、`items` 对象数组编辑、`signature` 只读签名。

### 内容

| 名称                     | 类型                                     | 含义                                                                                                                                                                                                                                                        | 控件            |
| ------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `children`               | ReactNode                                | 主内容；按钮的可见文字                                                                                                                                                                                                                                      | text / textarea |
| `label`                  | ReactNode                                | 可见标签（字段、选择项、Slider）                                                                                                                                                                                                                            | text            |
| `title`                  | ReactNode                                | 区块或层的标题（Disclosure、Dialog、卡片）                                                                                                                                                                                                                  | text            |
| `description`            | ReactNode                                | 标题下的次要说明                                                                                                                                                                                                                                            | text            |
| `hint` / `error`         | ReactNode                                | 字段提示与错误。`error` 也可交给 FileDropzone，用来替换组件生成的拒绝文案                                                                                                                                                                                   | text            |
| `placeholder`            | string                                   | 空值提示，不承担名称                                                                                                                                                                                                                                        | text            |
| `summary` / `valueLabel` | ReactNode                                | 数量摘要、进度读数                                                                                                                                                                                                                                          | text            |
| `<用途>Label`            | string                                   | 内置按钮的功能文案：`confirmLabel`、`cancelLabel`、`closeLabel`、`buttonLabel`、`expandLabel`、`collapseLabel`、`directionLabel`、`busyLabel`、`statusLabel`、`selectAllLabel`、`clearLabel`、`doneLabel`、`copiedLabel`、`copyingLabel`、`copyFailedLabel` | text            |
| `icon`                   | IconName \| false                        | 内容图标；省略为组件默认，false 隐藏                                                                                                                                                                                                                        | icon            |
| `actions`                | ReactNode                                | 附属操作插槽，与主内容同级                                                                                                                                                                                                                                  | signature       |
| `footer` / `controls`    | ReactNode                                | 区域插槽                                                                                                                                                                                                                                                    | signature       |
| `options`                | `{ value, label, disabled? }[]`          | 单选数据（Select、SegmentedControl）                                                                                                                                                                                                                        | items           |
| `items`                  | `{ value, label, content, disabled? }[]` | 带内容的数据（Tabs）                                                                                                                                                                                                                                        | items           |
| `links`                  | `{ label, href, icon }[]`                | 链接数据                                                                                                                                                                                                                                                    | items           |
| `href`                   | string                                   | 链接地址                                                                                                                                                                                                                                                    | text            |
| `code` / `text` / `url`  | string                                   | 需要按纯文本处理的值                                                                                                                                                                                                                                        | textarea / text |

### 视觉

| 名称        | 取值                                 | 含义                                                                             | 控件 |
| ----------- | ------------------------------------ | -------------------------------------------------------------------------------- | ---- |
| `emphasis`  | `"strong" \| "default" \| "quiet"`   | 视觉强调：实心 / 环境填充 / 透明                                                 | enum |
| `tone`      | `"neutral" \| "success" \| "danger"` | 语义；组件只开放其支持的子集                                                     | enum |
| `variant`   | 组件自定                             | 同一组件的结构形态（例如 track / filled、contained / plain）；不得表示颜色或状态 | enum |
| `treatment` | `"tonal" \| "defined" \| "physical"` | 白色层的边缘处理，仅 Surface                                                     | enum |
| `size`      | `"md" \| "sm"`                       | 几何尺度，默认 md；不改变颜色和外部宽度                                          | enum |
| `layout`    | 组件自定                             | 标签与控件的排列（Slider）                                                       | enum |
| `direction` | `"previous" \| "next"`               | 方向                                                                             | enum |

### 状态

| 名称                         | 类型             | 含义                         | 控件     |
| ---------------------------- | ---------------- | ---------------------------- | -------- |
| `value` / `defaultValue`     | string \| number | 合成值控件的受控 / 初始值    | 按值类型 |
| `checked` / `defaultChecked` | boolean          | 原生勾选状态                 | boolean  |
| `open` / `defaultOpen`       | boolean          | 展开或打开                   | boolean  |
| `count`                      | number           | 计数（Button、SelectionBar） | number   |
| `disabled`                   | boolean          | 禁止交互                     | boolean  |
| `readOnly`                   | boolean          | 可看可选不可改，仅字段       | boolean  |
| `busy`                       | boolean          | 异步进行中，阻止重复提交     | boolean  |

### 行为

| 名称            | 类型    | 含义                    | 控件        |
| --------------- | ------- | ----------------------- | ----------- |
| `required`      | boolean | 表单必填                | boolean     |
| `multiple`      | boolean | 允许多值                | boolean     |
| `dismissible`   | boolean | 允许用户关闭，默认 true | boolean     |
| `shortcut`      | boolean | 启用快捷键              | boolean     |
| `resizable`     | boolean | 允许纵向缩放，默认 true | boolean     |
| `accept`        | string  | 文件类型                | text        |
| `type` / `name` | string  | 原生属性                | enum / text |

### 数值约束

| 名称                       | 类型   | 含义                 | 控件   |
| -------------------------- | ------ | -------------------- | ------ |
| `min` / `max` / `step`     | number | 数值范围与步长       | number |
| `total`                    | number | 计数上限             | number |
| `maxSize`                  | number | 文件大小上限（字节） | number |
| `duration`                 | number | 停留时长（毫秒）     | number |
| `collapsedHeight` / `rows` | number | 收起高度、行数       | number |

### 事件与函数

| 名称                                                                                     | 签名                        | 用于       |
| ---------------------------------------------------------------------------------------- | --------------------------- | ---------- |
| `onClick` / `onChange`                                                                   | 原生事件                    | 原生元素   |
| `onValueChange`                                                                          | `(value) => void`           | 合成值控件 |
| `onOpenChange`                                                                           | `(open: boolean) => void`   | 展开类     |
| `onConfirm` / `onFiles` / `onReject` / `onSelect` / `onSelectAll` / `onClear` / `onDone` | 动作数据                    | 业务动作   |
| `formatValue`                                                                            | `(value: number) => string` | 读数格式化 |

### 文本结构

| 名称      | 类型                       | 含义                                       | 控件    |
| --------- | -------------------------- | ------------------------------------------ | ------- |
| `level`   | 1 \| 2 \| 3 \| 4 \| 5 \| 6 | 原生标题层级，独立于视觉体例               | number  |
| `as`      | 组件支持的原生标签子集     | 选择根节点语义；Text 支持 p / span         | enum    |
| `ordered` | boolean                    | 有序列表能力，true 为 ol，默认 false 为 ul | boolean |

### 宿主与语义

`className`、`style`、`ref`、`id`、`aria-label`、`aria-labelledby`、`data-*`。配置台不展示，但每个组件按规则 7 支持。

## 4. 配置台的编辑呈现

配置台按语义提供可视化编辑方式，元数据中的 control 保留底层值类别，不强制直接呈现为表单字段。呈现与几何统一见 [主规范](design-system.md#展示与设计实践)，编辑状态见 [配置台契约](playground.md)。

| 编辑方式   | 用于                                              | 操作与状态                                                      |
| ---------- | ------------------------------------------------- | --------------------------------------------------------------- |
| 内容块     | title、label、children、description、文案与长文本 | 添加、摘要、弹窗编辑；可选内容移除；保存/取消草稿               |
| 色样选择   | tone                                              | 按组件支持的语义子集选择；保留名称与选中标记                    |
| 形态选择   | emphasis、size                                    | 实际强调程度与尺度样本                                          |
| 其他枚举   | variant、type、layout、direction 等               | 短枚举分段选择，长枚举下拉                                      |
| 数值编辑   | 数值约束、value、count、Icon 的 size              | 步进、边界与关联值归一化                                        |
| 状态与能力 | 布尔属性                                          | 开关、效果说明；状态与行为分别归组                              |
| 图标选择   | icon、Icon 的 name                                | 搜索与预览；省略/隐藏/指定按组件能力提供                        |
| 集合管理   | options、items                                    | 摘要、弹窗增删与排序、稳定标识校验、单项禁用与内容编辑          |
| 只读签名   | 事件、函数与未提供可编辑结构的插槽                | 签名仅供元数据与代码生成使用，不在配置区呈现，不执行 JSX 字符串 |

界面只呈现参数名称与编辑对象，不展示类型、必填标记、默认值、事件签名及解释性文案。真实类型、必填、组件默认值与示例值仅保存在内部元数据中；示例辅助配置独立分组并从真实 API 输出中剔除，条件显示仍由组件元数据声明。ReactNode 当前仅编辑文本，能力边界记录在文档中，不在界面重复标注；当前不提供任意组件树编辑。links 等示例组合仍按现有文本字段承接，不冒充新的公共数组 API。

## 5. 组件 API 名单（目标）

`*` 为必填。带「改」的名字已经按第 6 节进入源码，标记只用于对照旧调用。宿主属性按规则 7 省略不列。

### 操作

| 组件         | 内容                                                                                                                                              | 视觉                                        | 状态 / 行为 / 约束   | 事件                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------- | ---------------------------- |
| Button       | children, icon, count                                                                                                                             | emphasis, tone(neutral\|danger), size「改」 | disabled, busy, type | onClick                      |
| IconButton   | icon*, aria-label*「改」                                                                                                                          | emphasis, tone, size「改」                  | disabled, busy       | onClick                      |
| CopyButton   | text*, children, icon, copiedLabel（默认「已复制」）, copyingLabel（默认「正在复制…」）, copyFailedLabel（默认「复制失败」）                      | emphasis, size                              | —                    | —                            |
| ShareButton  | url*, children「改」                                                                                                                              | —                                           | —                    | —                            |
| ButtonGroup  | children*, aria-label*「改」                                                                                                                      | variant(contained\|plain)「改」             | —                    | —                            |
| SelectionBar | summary, actions, children, aria-label（默认「批量操作」）, selectAllLabel（默认「全选」）, clearLabel（默认「清空」）, doneLabel（默认「完成」） | variant(contained\|plain)                   | count*, total, busy  | onSelectAll, onClear, onDone |

ActionRow 接受 children 与原生 div 属性、className、style、ref；不增加视觉 Props。它排列完整任务单元，子项 size 必须按同一操作轴明确选择；完整外高与内部空间遵循主规范的外部尺度契约，不因底座自动提升外高。组内几何由 ButtonGroup / Pager 承接，ActionRow 不覆盖子控件尺寸。

### 字段

| 组件         | 内容                           | 视觉                                                | 状态 / 行为 / 约束                                                 | 事件                       |
| ------------ | ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------ | -------------------------- |
| Field        | label*, hint, error, children* | —                                                   | required, id                                                       | —                          |
| Input        | placeholder                    | —                                                   | value, defaultValue, disabled, readOnly, required, type, name      | onChange                   |
| Textarea     | placeholder                    | —                                                   | value, defaultValue, disabled, readOnly, required, resizable, rows | onChange                   |
| NumberInput  | —                              | —                                                   | value, defaultValue, disabled, readOnly, min, max, step            | onValueChange              |
| Select       | options*, placeholder          | —                                                   | value, defaultValue, disabled, required, name                      | onValueChange              |
| SearchField  | placeholder, aria-label*       | —                                                   | value, defaultValue, disabled, shortcut                            | onValueChange              |
| Slider       | label                          | variant(track\|filled), layout(field\|inline\|bare) | value, defaultValue, disabled, min, max, step                      | onValueChange, formatValue |
| ColorPicker  | aria-label*                    | —                                                   | value, defaultValue, disabled                                      | onValueChange              |
| FileDropzone | label, buttonLabel, error      | —                                                   | disabled, multiple, accept, maxSize, name                          | onFiles*, onReject         |

### 选择

| 组件             | 内容                          | 视觉 | 状态 / 行为 / 约束                             | 事件                |
| ---------------- | ----------------------------- | ---- | ---------------------------------------------- | ------------------- |
| Checkbox / Radio | label                         | —    | checked, defaultChecked, disabled, name, value | onChange            |
| Switch           | label                         | —    | checked, defaultChecked, disabled              | onChange            |
| SegmentedControl | options*, aria-label*「改」   | —    | value, defaultValue「改」                      | onValueChange「改」 |
| Tabs             | items*, children, aria-label* | —    | value, defaultValue                            | onValueChange       |

### 状态反馈

| 组件        | 内容                                                       | 视觉                                 | 状态 / 行为 / 约束         | 事件          |
| ----------- | ---------------------------------------------------------- | ------------------------------------ | -------------------------- | ------------- |
| Badge       | children*, icon                                            | tone, emphasis(default\|quiet)「改」 | —                          | —             |
| Alert       | title, children*, icon                                     | tone                                 | —                          | —             |
| Toast       | children*, icon, closeLabel（默认「关闭提示」）            | tone                                 | open*, duration            | onOpenChange* |
| ToastRegion | children*, aria-label（默认「通知」）                      | —                                    | —                          | —             |
| Spinner     | label 或 aria-label*                                       | size                                 | —                          | —             |
| Progress    | label, valueLabel                                          | —                                    | value（省略为不确定）, max | —             |
| EmptyState  | title*, description, actions「改」, icon（默认隐藏）「改」 | —                                    | —                          | —             |

### 区块与层

| 组件            | 内容                                                                                                                                              | 视觉                                   | 状态 / 行为 / 约束 | 事件                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------ | ------------------------- |
| Disclosure      | title*, children*, actions                                                                                                                        | —                                      | open, defaultOpen  | onOpenChange              |
| Dialog / Drawer | title*, description, children*, footer, closeLabel                                                                                                | —（Dialog 不再公开 variant）「改」     | open*, dismissible | onOpenChange*             |
| ConfirmDialog   | title*, description, confirmLabel（默认「确认」）, cancelLabel, busyLabel（默认「处理中…」）, statusLabel（默认「操作处理中」，忙碌时的读屏状态） | tone(neutral\|danger)                  | open*, busy        | onOpenChange*, onConfirm* |
| ExpandableCode  | code*, expandLabel, collapseLabel（默认「收起全文」）, aria-label（默认「可展开文本」）                                                           | —                                      | collapsedHeight    | —                         |
| Surface         | children                                                                                                                                          | variant(soft\|raised)「改」, treatment | —                  | —                         |

### 文本体例

| 组件            | 内容                               | 视觉 / 结构                            | 状态 | 事件 |
| --------------- | ---------------------------------- | -------------------------------------- | ---- | ---- |
| Heading         | children*                          | level(1–6)，variant(page\|section)     | —    | —    |
| Text            | children*                          | as(p\|span)，variant(body\|supporting) | —    | —    |
| TextList        | children*（原生 li）               | ordered，variant(contained\|plain)     | —    | —    |
| DescriptionList | children*（原生 div / dt / dd 行） | variant(contained\|plain)              | —    | —    |

Text 的 variant 表达正文或辅助文字的排版角色，不接受任意色值；Heading 的 level 表达文档层级，variant 表达视觉层级。文本列表的 variant 表达有共同承载与直接正文排列两种结构。默认 Heading 为 level=2 / section，Text 为 p / body，两个列表为 contained；所有组件保留原生属性、style、className 和实际根节点 ref。有序 TextList 保留 ol 的 start / reversed 等原生能力。

### 导航与展示

| 组件           | 内容                                                | 视觉                      | 状态 / 行为 / 约束 | 事件 |
| -------------- | --------------------------------------------------- | ------------------------- | ------------------ | ---- |
| Pager          | previous, next（`{ title, href }`）                 | variant(contained\|plain) | —                  | —    |
| NavigationCard | title*, href*, directionLabel                       | direction*                | —                  | —    |
| ShowcaseCard   | title*, href*, description, children*, externalLink | —                         | —                  | —    |
| ExternalLinks  | links*, aria-label                                  | —                         | —                  | —    |

### 基础

| 组件      | 内容                        | 视觉                                 | 状态 / 行为 / 约束 | 事件 |
| --------- | --------------------------- | ------------------------------------ | ------------------ | ---- |
| Icon      | name*                       | size（数字）, weight, absoluteWeight | —                  | —    |
| Keycap    | children*                   | —                                    | —                  | —    |
| Layout    | children*, aria-label「改」 | —                                    | —                  | —    |
| PageShell | children*, controls, footer | —                                    | mainId, mainAs     | —    |

## 6. 迁移清单

Progress 的 `aria-label`、`aria-labelledby` 与 `aria-describedby` 传给实际 progress 元素；显式名称优先于可见 label，关联名称存在时不添加默认名称。未指定名称时保留 label 或「进度」的兼容默认值。ref 仍指向 progress。

Toast 更新回调或 children 不重新计时；打开、时长与暂停状态变化才重新计时。暂停结束后从完整 duration 开始。新通知使用新实例或关闭/重开。ToastRegion 可通过 tabIndex 控制区域定位，默认 0；队列由宿主管理。

改名在 beta 期间保留旧名并标记 `@deprecated`，配置台与生成代码只输出新名。旧名保留到 `1.0.0` 删除；在此之前不新增旧名用法。若已记录的消费方更早完成迁移，可以在该版本提前删除，并写入 CHANGELOG。仓库示例、预览和生成代码已经只用新名。

### 命名一致性

| 组件                                                                              | 当前                               | 目标                                                      | 违反规则             |
| --------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------- | -------------------- |
| Button、IconButton、CopyButton                                                    | `size="default \| small"`          | `size="md \| sm"`                                         | 1                    |
| IconButton、ButtonGroup、SegmentedControl、Tabs、SearchField、Layout、ColorPicker | `label` 作无障碍名称               | `aria-label`                                              | 3                    |
| SearchField、SegmentedControl、Tabs                                               | `onChange(value)`                  | `onValueChange(value)`                                    | 4                    |
| SearchField、SegmentedControl、Tabs                                               | 仅受控                             | 补 `defaultValue`                                         | 4                    |
| ButtonGroup、SelectionBar                                                         | `tone="soft \| plain"`             | `variant="contained \| plain"`                            | 1（tone 只表示语义） |
| Surface                                                                           | `tone="soft \| raised"`            | `variant="soft \| raised"`                                | 1                    |
| Badge                                                                             | `variant="soft \| plain \| white"` | `emphasis="default \| quiet"`；white 删除（白色只属于层） | 2                    |
| CopyButton                                                                        | `variant="soft \| plain"`、`label` | `emphasis="default \| quiet"`、`children`                 | 1、2                 |
| ConfirmDialog                                                                     | `danger: boolean`，默认 true       | `tone="neutral \| danger"`，默认 neutral                  | 1、6                 |
| Toast                                                                             | `message: string`                  | `children`                                                | 1                    |
| EmptyState                                                                        | `action`，icon 默认 grid           | `actions`，icon 默认隐藏                                  | 1、6                 |
| ExpandableCode                                                                    | `label`                            | `expandLabel`                                             | 3                    |
| Dialog                                                                            | 公开 `variant="dialog \| drawer"`  | 内部实现，Drawer 独立导出                                 | 1                    |

### 默认文案

| 组件                                         | 当前默认                                           | 目标默认                                                                                                                 |
| -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CopyButton / ShareButton                     | Copy / Share，以及 Copied / Copy failed / Copying… | 复制 / 分享；状态默认「已复制」「复制失败」「正在复制…」，可分别用 `copiedLabel`、`copyFailedLabel`、`copyingLabel` 替换 |
| ExpandableCode                               | Show full text                                     | 展开全文                                                                                                                 |
| ConfirmDialog confirmLabel                   | 确认删除                                           | 确认                                                                                                                     |
| NavigationCard、ExternalLinks 的内置英文名称 | Previous / Next 等                                 | 中文，可通过 `directionLabel` / `aria-label` 替换                                                                        |

### 宿主属性

每个导出组件接受 `className`。根节点是单个 DOM 元素时，同时接受 `style` 与该元素的原生属性；`ref` 指向实际交互节点。组件先调用宿主回调，再执行自己的关闭、暂停或复制。Dialog 的取消和背景点击若已被宿主 `preventDefault`，则不再请求关闭。Toast 的暂停不因 `preventDefault` 而取消。CopyButton 在宿主 `preventDefault` 后不再写入剪贴板。

### 受控与校验

- ColorPicker 受控时显示 `value`。宿主拒绝这次更新后，面板回到当前 `value`。没有可见名称时必须传入 `aria-label`。
- NumberInput 未完成的输入只保留草稿，不调用 `onValueChange`。受控 `value` 变成另一个数字时，丢弃未完成草稿并显示新值；同一次 `value` 的重渲染保留空草稿。失焦时若草稿不是完整数字，丢弃草稿并显示当前 `value`。完整数字按 `min` / `max` 夹紧后提交。宿主拒绝完整数字后，显示回到当前 `value`。
- Slider 只通过 `onValueChange` 提交。
- SearchField 的 `shortcut` 只聚焦文档中第一个未禁用的实例。
- Tabs 的 `content` 可省略。传入 `children` 时，这一块内容担任当前面板。
- FileDropzone 传入 `error` 后显示宿主文案，并仍然调用 `onReject`。

## 7. 实施说明

本节记录已经执行的迁移，不是新的待办。

### 顺序

1. 命名一致性：第 6 节命名表全部条目，一次完成。
2. 默认文案与宿主属性。
3. P0 受控缺陷。

每步单独提交，提交前运行 `npm run check` 与 `npx vitest run src`。

### 涉及位置

| 位置                                                                          | 要做的事                                                                                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/ui/*.tsx`                                                                | 改属性名与类型；旧名保留为 `@deprecated` 可选属性，在函数内映射到新名，新名优先             |
| `src/ui/*.css`                                                                | 仅当类名含旧取值时同步（例如 `ui-button--small`、`ui-button-group--plain`）；不改颜色与几何 |
| `src/playground-catalog.ts`                                                   | 每个组件的字段、默认值、必填、回调和示例字段写在同一条 `meta` 记录里，并与第 5 节一致       |
| `src/playground-code.ts`、`src/playground.tsx`                                | 预览与生成代码只使用新名                                                                    |
| `src/context-matrix.tsx`、`src/spec-practice.tsx`、`src/App.tsx` 及其他调用方 | 改用新名，仓库内不再出现弃用属性                                                            |
| `src/*.test.ts(x)`、`src/ui/*.test.tsx`                                       | 断言改为新名；每个弃用别名补一条映射测试                                                    |
| `docs/playground.md`、`docs/design-system.md`                                 | 只同步受影响的属性名                                                                        |

### 约束

- 弃用映射：同时传新旧名时取新名；旧值映射见第 6 节，Badge `variant="white"` 映射为 `emphasis="default"`。
- `aria-label` 必填的组件把它声明为必填类型，不再从 `label` 推导 `title`。IconButton 用 `aria-label` 作为可访问名称。
- ConfirmDialog 默认 tone 改为 neutral 后，仓库内所有删除确认显式传 `tone="danger"`。
- 不新增第 3 节名单以外的属性；遇到名单无法覆盖的需求，停止并记录，交给用户决定。
- 迁移不改变视觉。若某个改名导致视觉变化，视为缺陷。

### 验收

- `rg` 在 `src/`（不含 `src/ui` 中的弃用映射）找不到第 6 节任何旧名或旧取值。
- 配置台每个组件的参数与第 5 节一致，生成代码可直接复制运行。
- 类型检查与全部测试通过。

DescriptionList 使用原生 dl 根节点并透传原生属性与 ref，children 承接 div 包裹的 dt/dd 行；不引入业务数据结构。Pager 默认 contained，plain 不增加底座 inset，只适用于无需共同表面的动作关系；不得为等高移除已确认需要的共同底座，组合决策遵循主规范。
