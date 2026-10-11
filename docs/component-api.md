# 组件 API 实施清单

2026-10-11。依据 [API 主规范](api-contract.md)，记录现有公共组件的内容迁移目标、保留能力与决策边界。本文只定义具体组件，不另设通用规则。实施项的源码、配置台、生成代码和调用方状态见文末工程记录。

## 使用与实施状态

- **实施**：本轮已指定内容契约，可以按表迁移；现有非内容属性、默认值、原生属性、ref、交互行为保持。不得借此重设计视觉或事件。
- **保留**：公共内容入口已经适用，保持 API；仅按明确范围更新编辑器或接入，不添加无用途槽位。
- 本轮此前暂缓的组件已完成结构决策与迁移；旧阶段记录不作为当前实施禁区。

数量用 `0..1`、`1`、`0..n`、`1..n` 表达，每个范围按对应父节点计算。没有列出的槽位不自动开放。自由内容必须遵守实际 DOM 的合法内容模型。槽位内部不执行 JSX 字符串。

“实施”仍须完成主规范第 10 节清单；表格是组件的具体决定，不替代工程核对。发现与源码实际语义冲突时记录问题，不自行改变合同。本轮全部现有组件已具有明确内容边界。

## 本轮共同决定

1. 自由区域不强制增加 Body；有明确区域职责时才使用子组件。结构组件的文字、图标和动作全部进入指定区域，不同时保留同义内容 Props。
2. `Label` 是可见名称，`Title` 是内容标题，`Description` 是次要说明，`Body` 是正文。补充统一职责：`Control` 承接一个字段控件；`Value` 是可见值读数；`Error` 是真实错误反馈。Value 不承接受控 value，Error 的存在不自动定义全部校验逻辑。
3. 按职责排布结构区域，槽位声明顺序不重新定义布局；自由区域内部顺序由 children 决定。编辑器只允许组件明确开放的排序。带 value 的关联项保持调用方顺序与稳定身份。
4. 可选槽位省略时不生成节点或额外间距。必需角色不能用空槽位满足；文字槽位的 null、false、空白字符串均视为无内容。任意业务组件的渲染结果不能靠静态读取 children 判断，库不承诺全面静态验证。
5. 数字 0 是有效可见内容或值，不等于缺失；Count/Value 的数量限制指节点数量。Label/Title/Description 接受符合语义的 ReactNode，不缩窄为 string。
6. 新建/选择预设时才初始化业务内容。进入自定义后，删除可选节点不自动补回。原生 placeholder、复制源、地址、文件约束、受控值不是内容槽位。
7. 非内容状态按主规范的能力模型处理，不新增统一 state 枚举；保持各组件真实值与事件职责。Dialog/Drawer/Toast 继续受控，不顺带新增 defaultOpen。已有受控组件的宿主更新回调责任保留。
8. 组件库通过语义子组件和上下文建立关系；编辑器按内容树严格限制数量。开发阶段报告可确定的重复/缺失/错误归属，禁止自动裁剪、补业务文案或执行任意 JSX。具体注册与校验机制须给出支持封装、条件挂载和 map 的实现方案；不能将读取直接子节点类型作为唯一依据。无法可靠判定的任意内容边界作为调用方契约记录，不声称完全强制。
9. 迁移后的新内容 Props 不与旧内容 Props 并存。既有非内容弃用别名沿用现行兼容，不在本轮顺带删除；发布与消费迁移由独立任务安排。

## 动作、容器与组合

来源：[components.tsx](../src/ui/components.tsx)、[motion.tsx](../src/ui/motion.tsx)。

| 组件           | 状态 | 内容目标与数量                                                                | 保留能力、关联与边界                                                                                                                                                                                                           |
| -------------- | ---- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button         | 实施 | Icon `0..1`、Label `0..1`、Count `0..1`；至少 Icon 或 Label；Count 依赖 Label | 文字/数字简写等价 Label；shape inline/square，未指定时纯图标派生 square。size md/sm、emphasis、tone neutral/danger、busy 与原生 button/onClick。Icon 装饰；Count 参与按钮名称。busy 保留名称，图标位显示指示，不增加内容角色。 |
| IconButton     | 兼容 | 旧单图标入口委托 Button                                                       | 已合并为 Button + Button.Icon + shape="square"；仅保留弃用包装导出供旧消费者过渡。配置台、代码及仓库非兼容测试调用使用 Button，不发展独立 API。                                                                                |
| ButtonGroup    | 保留 | children 自由承接动作组合                                                     | variant contained/plain、名称和 div ref 保留。组约束实际可用高度，子项高度通过 CSS 变量派生，图标数值通过上下文同步；显式 Icon.size 受上限约束。                                                                               |
| ActionRow      | 保留 | children 自由承接动作或动作组                                                 | 保留 div 原生属性，不新增 actions 属性或重复表面                                                                                                                                                                               |
| Surface        | 保留 | children 自由内容                                                             | variant soft/raised、treatment tonal/defined/physical 与环境契约保留；variant 改名另议                                                                                                                                         |
| Keycap         | 保留 | children 行内键位内容                                                         | 原生 kbd，无默认快捷键；不再包装成 Button 的 shortcut 数据                                                                                                                                                                     |
| Layout         | 保留 | children 自由组合                                                             | 公共入口仅导出 Layout；布局动效、减少动态效果及 div ref 保留，不把内部 Motion 工具新增为组件 API                                                                                                                               |
| ExternalLinks  | 实施 | 根 Item `0..n`；每项 Label `1`、Icon `0..1`                                   | Item.href 为必需地址；Item 承担 a 语义，根 nav 名称保留；删除 links 数组入口，外链 target/rel 安全行为保留                                                                                                                     |
| NavigationCard | 实施 | Title `1`、Description `0..1`                                                 | 根 href、direction previous/next 保留；directionLabel → Description。方向指示图标属于导航能力，不开放成用户必填 Icon                                                                                                           |
| Pager          | 实施 | Previous `0..1`、Next `0..1`                                                  | 方向由角色确定；子项接受 href 与链接原生属性、ref，children 是目标名称。省略节点不自动补不可用按钮；显式无 href 节点显示禁用按钮；根 nav ref。                                                                                 |
| ShowcaseCard   | 实施 | Title `1`、Description `0..1`、Media `1`、ExternalLink `0..1`                 | 根固定 div/ref，href 是主目标；Media 为主 a，关联 Title/Description，Media 内容不整体 aria-hidden；ExternalLink 为兄弟 a、支持自身链接属性。不会嵌套链接，标题覆盖层不拦截主链接。                                             |
| PageShell      | 实施 | Header `0..1`、Body `1`、Footer `0..1`                                        | controls → Header、原 children → Body、footer → Footer；mainId/mainAs 保留。Body 对应 main 或 div；跳转主内容及焦点目标保留，不新增嵌套 main                                                                                   |
| CopyButton     | 实施 | Button 同类角色；Feedback state=pending/success/error 各 `0..1`               | text:string 是复制源；size 默认 sm。Feedback 独立状态播报，不污染按钮名称；省略自定义播报时有功能反馈。禁止处理中重复复制，反馈 2200ms 后清除；不从 ReactNode 提取复制源。                                                     |
| ShareButton    | 实施 | 与 CopyButton 同一内容规则                                                    | url:string 为复制源；不是系统分享 API。内容由调用方提供，分享文案仅属于示例。                                                                                                                                                  |
| ExpandableCode | 实施 | Body `1`、CopyAction/ExpandAction/CollapseAction 各 `0..1`                    | Body.children:string 是显示与复制的唯一原始文本；根不再有 code。collapsedHeight 默认 210px；无溢出不显示切换动作；切换转移焦点到对应动作，缺少动作时回到正文。section ref 保留。                                               |

## 字段与选择

来源：[fields.tsx](../src/ui/fields.tsx)、[selection.tsx](../src/ui/selection.tsx)、[components.tsx](../src/ui/components.tsx)、[color-picker.tsx](../src/ui/color-picker.tsx)。

| 组件             | 状态 | 内容目标与数量                                              | 保留能力、关联与边界                                                                                                                                                                                                                                               |
| ---------------- | ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Field            | 实施 | Label `0..1`、Control `1`、Description `0..1`、Error `0..1` | label/hint/error → 对应槽位。无 Label 时 Control 必须有名称；只管理一个字段，多个字段分别建立 Field。Control 使用上下文关联，不克隆未知业务节点；根 div ref、控件实际 ref 分开                                                                                     |
| Input            | 保留 | 无 children 区域                                            | 原生 input 的 value/defaultValue/onChange、disabled/readOnly/required/name/type 等保留；可与 Field 组合，不增加 Input.Label                                                                                                                                        |
| Textarea         | 保留 | 无业务 children 区域                                        | value/defaultValue/onChange 沿用；rows 默认 3、resizable 默认 true、原生 textarea ref 保留；输入内容不是 Body                                                                                                                                                      |
| NumberInput      | 保留 | 无 children 区域                                            | value/defaultValue/min/max/step:number；onValueChange(number)。defaultValue=0、step=1；编辑草稿、提交归一化沿用，不重做空值语义                                                                                                                                    |
| SearchField      | 保留 | 无业务 children 区域；搜索与清除标记属于固有功能            | value/defaultValue:string、onValueChange(string)、placeholder、shortcut=false；实际 input ref 和现有快捷键行为保留，旧 label 名称别名只作兼容                                                                                                                      |
| Slider           | 实施 | Label `0..1`、Value `0..1`                                  | label → Label；可见读数由 Value 槽位承接，读取根值上下文，不从读数反推 value。保留 value/defaultValue/min/max/step、onValueChange(number)、formatValue(number):string、layout field/inline/bare、variant track/filled；默认值 0/0/100/1，原生 range 与名称关联保留 |
| Checkbox         | 实施 | children 为单一可见 Label；不额外要求 Checkbox.Label 包装   | label → children，行内非交互内容；没有可见标签时实际 input 必须有名称。checked/defaultChecked、onChange(ChangeEvent<HTMLInputElement>)、name/value 与原生表单语义保留                                                                                              |
| Radio            | 实施 | children 为单一可见 Label                                   | 同 Checkbox 内容边界；checked、name、value、onChange 与原生单选分组行为保留，不新增自定义 RadioGroup 状态模型                                                                                                                                                      |
| Switch           | 实施 | children 为单一可见 Label                                   | checked/defaultChecked、onChange(ChangeEvent<HTMLInputElement>) 保留；defaultChecked=false、input role=switch、控件名称归属保留                                                                                                                                    |
| Select           | 实施 | Item `0..n`，每项 children 为选项内容                       | Item.value:string 必需且唯一、disabled 可选；根 value/defaultValue/onValueChange(string)、name/required/placeholder、trigger ref 保留。defaultValue=""；触发器显示、搜索、删除选中项、空选择行为本轮不动，不额外开放交互后代                                       |
| SegmentedControl | 实施 | Item `0..n`；每项 Label `1`、Count `0..1`                   | Item.value:string 必需且唯一、disabled 可选；root value/defaultValue/onValueChange(string)、radiogroup 名称、键盘行为保留。默认首个可用值或空值沿用；不可只用 Count 命名选项                                                                                       |
| Tabs             | 实施 | List `1`，List 中 Trigger `0..n`；根 Content `0..n`         | Trigger.value 唯一、disabled 可选；Content.value 唯一且须关联 Trigger；Trigger 可只有标签而不带面板。按值关联，不依赖索引。保留 value/defaultValue/onValueChange(string)、当前默认选择和挂载行为；动态策略沿用现状                                                 |
| ColorPicker      | 保留 | 无业务 children 区域                                        | value/defaultValue:string、onValueChange(string)、disabled=false；defaultValue="#525252"。颜色字符串是操作值，内部选择面板不是外部可删内容；名称、归一化与拖动保持现有契约                                                                                         |

Field.Control 与 Slider.Value 为本轮新增特殊职责的实际应用；Value 表达读数，不意味着所有数字组件都要提供 Value 槽位。Field 的 Label、说明、Error 建立控件 ID 关联；required 是输入约束，不能靠必填文本槽位推导。

## 展开层与反馈

来源：[panels.tsx](../src/ui/panels.tsx)、[feedback.tsx](../src/ui/feedback.tsx)。

| 组件          | 状态 | 内容目标与数量                                                                        | 保留能力、关联与边界                                                                                                                                                                                                           |
| ------------- | ---- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Disclosure    | 实施 | Trigger `1`、Body `1`、Actions `0..1`                                                 | title → Trigger 的可见内容；Trigger 自身为按钮，非 Header 中任意标题。actions → Actions，与 Trigger 同级不嵌入按钮；open/defaultOpen=false/onOpenChange(boolean)、关闭时焦点回退、div ref 保留                                 |
| Dialog        | 实施 | Header `0..1`、Body `0..1`、Footer `0..1`；Title/Description 各 `0..1` 位于 Header    | 至少有一个实际内容区域；Title 关联名称，无 Title 时根提供名称。open:boolean/onOpenChange(boolean) 必需，dismissible、关闭取消契约、dialog ref 保留；系统关闭按钮不因为缺 Header 被删除                                         |
| Drawer        | 实施 | 与 Dialog 同一结构，使用 Drawer 子组件                                                | 继续单独导出；同样受控。区域拆分不修改宽度、padding、动画或关闭策略                                                                                                                                                            |
| ConfirmDialog | 实施 | Dialog 同类区域；CancelAction/ConfirmAction 各 `0..1`，模板初始各 1                   | 取消请求 onOpenChange(false)，确认调用 onConfirm():void；每次最多一次，可 preventDefault 取消。删除动作不会补回或执行业务。busy 阻止取消、确认、Escape 和背景关闭，确认仍可聚焦；关闭能力不依赖取消槽位。tone neutral/danger。 |
| SelectionBar  | 实施 | Count/Description/Actions 各 `0..1`；SelectAllAction/ClearAction/DoneAction 各 `0..1` | 根 count:number/total?:number 是业务数据，保留；Count 可读根 count。动作的原生 onClick 由调用方绑定，根不自动生成按钮或执行批量操作；busy 禁用语义动作，total=0 禁用全选、count=0 禁用清空。普通业务子动作自行声明状态。       |
| Badge         | 实施 | Icon `0..1`、Label `1`；纯文字简写等价 Label                                          | icon → Icon，children → Label；tone neutral/success/danger、emphasis default/quiet 保留；span 非动作，不新增 Button 式状态                                                                                                     |
| Alert         | 实施 | Icon `1`、Title `0..1`、Body `0..1`；Title 或 Body 至少一个非空                       | title → Title、children → Body、icon → Icon；初始模板提供一个图标但不提供隐藏业务正文。tone neutral/success/danger 保留；根现有通知语义不因拆分改变，不强制让每个 Alert 都立刻播报                                             |
| Progress      | 实施 | Label `0..1`、Value `0..1`                                                            | label/valueLabel → 对应槽位；value?:number、max:number=100 保留，省略 value 表达现有不确定进度。名称与 ref 仍归实际 progress，而非外部 div；Value 只是显示，非进度来源                                                         |
| EmptyState    | 实施 | Icon `0..1`、Title `1`、Description `0..1`、Actions `0..1`                            | title/description/icon/actions → 对应槽位；删除 action 内容别名；Actions 自由组合实际动作，不自动生成业务按钮                                                                                                                  |
| Toast         | 实施 | Icon `0..1`、Body `1`                                                                 | children/message → Body、icon → Icon；open/onOpenChange 必需，tone、duration=4200ms、暂停计时、关闭与焦点行为保留；closeLabel 为系统功能文案，暂保留，不增加 defaultOpen                                                       |
| ToastRegion   | 保留 | children 承接 Toast 集合                                                              | 根名称、tabIndex 默认 0、现有定位与键盘契约保留；不把单个 Toast 状态上收为第二套集合数据接口                                                                                                                                   |
| Spinner       | 实施 | children 为可选可见 Label，标记是固有功能                                             | label → children；无文字时根提供 aria-label。size md/sm、role=status、span ref 保留；装饰性嵌入 Button 的忙碌指示按 Button 策略另议，不自动重复播报                                                                            |

关闭、清除、搜索标记、旋转中的标记属于组件固有功能，不机械转成用户必须维护的 Icon 槽位。业务可见图标属于内容；两者边界必须在契约中注明。

## 文件与文字

来源：[file-dropzone.tsx](../src/ui/file-dropzone.tsx)、[typography.tsx](../src/ui/typography.tsx)、[icons.tsx](../src/ui/icons.tsx)。

| 组件            | 状态 | 内容目标与数量                                          | 保留能力、关联与边界                                                                                                                                                                                                                                                                                             |
| --------------- | ---- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FileDropzone    | 实施 | Icon `1`、Description `0..1`、Trigger `1`、Error `0..1` | Icon 可替换。Trigger 开文件选择器；Error 无 children 时显示内部拒绝消息，显式 children 控制宿主错误，null 隐藏且不回退。省略 Error 不生成消息节点，onReject 仍通知宿主。错误 ID 与 input/Trigger 说明关联；accept/name、multiple/disabled=false、maxSize 字节、onFiles(File[])、onReject(string)、div ref 保留。 |
| Heading         | 保留 | children 标题行内内容                                   | level 1–6 默认 2、variant page/section 默认 section；语义级别与视觉体例分开；实际 heading ref 保留                                                                                                                                                                                                               |
| Text            | 保留 | children 遵守 p/span 原生内容范围                       | as p/span、variant body/supporting 保留；不强制增加 Label 或 Body                                                                                                                                                                                                                                                |
| TextList        | 保留 | children 为合法 li 集合，可由业务封装生成               | ordered、variant contained/plain 保留；不新增字符串数组入口，不用 element.type 只允许静态直接 li                                                                                                                                                                                                                 |
| DescriptionList | 保留 | children 遵守 dl/dt/dd 的原生描述关系                   | variant contained/plain 保留；不新增 label/description 数组 Props，不错误强制所有 dt/dd 一对一                                                                                                                                                                                                                   |
| Icon            | 实施 | 无业务 children 区域                                    | name 覆盖当前安装 uplus 可加载集合；size:number、weight:number、absoluteWeight:boolean 保留。独立默认 size=18、weight=1、absoluteWeight=true 保留；省略时读取所在控制环境；组合上限优先于显式数字，上游与真实 SVG size 一致                                                                                      |

## 关键目标用法与责任边界

以下展示现行组合 API。它们说明内容归属，不是另一套预设 Props。

```tsx
<Field required>
  <Field.Label>项目名称</Field.Label>
  <Field.Control>
    <Input value={name} onChange={(event) => setName(event.target.value)} />
  </Field.Control>
  <Field.Description>用于识别项目</Field.Description>
  {error && <Field.Error>{error}</Field.Error>}
</Field>

<Alert tone="danger">
  <Alert.Icon><Icon name="warning" /></Alert.Icon>
  <Alert.Title>保存失败</Alert.Title>
  <Alert.Body>请稍后重试。</Alert.Body>
</Alert>

<Disclosure>
  <Disclosure.Trigger>详细信息</Disclosure.Trigger>
  <Disclosure.Body><ProjectDetails /></Disclosure.Body>
</Disclosure>

<Progress value={completed} max={total}>
  <Progress.Label>上传进度</Progress.Label>
  <Progress.Value>{completed}/{total}</Progress.Value>
</Progress>
```

- Field.Control 是控件上下文的承接，不为包装而增加 DOM 或第二层 padding；字段业务组件可以封装 Input，但必须消费这套关联。一个 Field 不共享同一 ID 给多个输入。Field.Error 建立实际 input 的错误与描述关联，根 div 不代替 input 接受这些属性。
- Slider.Value 在无 children 时显示根的当前数字经 formatValue 格式化的结果；显式 children 是该读数区域的内容，不成为根 value 的来源。formatValue 保留原签名，编辑器不能让一个静态读数冒充另一份可编辑状态。Progress.Value 同样只承担可见读数，可省略或显式提供内容；进度的真实语义来自 value/max。
- Alert.Icon 只承担图标角色并读取 Alert 的尺寸环境；不增加填色底座或额外区域 padding。Alert 的图标是用户可替换的内容，Disclosure 的展开指示是内部功能标记，两者不混为同一可删除节点。
- Disclosure.Trigger 自身复用 Button 的基础行为，children 只承接名称；根通过上下文连接 Body 的 ID、展开状态与焦点回退。旁侧 Actions 独立于 Trigger，不嵌套在 button 内。
- 文本例子是示例内容，不是组件默认值。Alert 本轮没有 Actions 槽位；需要真实复用需求时先登记规则，不自行塞入正文冒充独立操作区域。

## 当前值、回调与默认值的记录边界

表中未声明改变的非内容属性沿用源码，包括原生事件、受控值、默认值和 ref。不得把“保留”解释为所有组件都采用同一 busy 策略，或顺带增加 readOnly、disabled、defaultOpen 等支持。

- 原生文本、勾选事件继续传原生 ChangeEvent；合成值继续传具体值。SearchField 是现有合成字符串控件，NumberInput 是合成数字控件，不因底层 input 而改事件签名。
- 所有回调只由负责该行为的节点触发一次，不能 Root 与子组件各触发一次；程序化改 Props 不伪造用户事件。受控值由宿主更新，变化请求不自动覆写宿主值。
- defaultValue/defaultChecked/defaultOpen 只用于初始化，不能持续覆盖用户操作。已有默认选择与归一化在本轮保留；省略/undefined 使用现有默认；0/false 是有效值；不为原生不支持的 null 增加隐式转换。
- 表中所有预设文案与 initialCount 只影响新建模板。未知现有默认值需从源码核对并补入记录，不能拿展示 exampleValue 代替。
- Input 的原生 size 是字符宽度，不能被配置台当作 md/sm 几何尺寸。方向、结构 variant、环境 variant 暂保留现有支持范围，不扩展全库共同选项。

## 交付实施者的定向检查

1. 公共入口与实际导出对齐；新语义子组件从公共入口可用。仅导出的 Layout 属于公共 Motion API，其他内部动效工具不因此进入清单。
2. 迁移后的内容只有一个入口；规定的计数按所属根或条目验证，必需节点不能删除，可选节点删除不自动补回。
3. Label/Title 与实际控件或层建立有效关联；名称未被装饰图标污染；Progress 的 aria 与 ref 不误落到 div。
4. 支持 map、业务组件封装、条件渲染；不能靠检查任意子节点的内部渲染结果确定角色，也不能用类型断言声称完全验证 JSX。
5. 根 padding 和区域 padding 不叠加，省略区域不保留无用间距；使用当前设计变量，不在本轮自行改变几何。
6. 预览、内容树和生成代码一致；生成代码不包含预设选择属性或旧内容对象数组。不要求示例编辑器支持任意 JSX 执行。
7. 按变更运行类型检查、设计检查和必要定向交互测试；浏览器与大规模验证仍需用户同意。兼容别名仅用于旧消费者，仓库调用使用新入口。

## 本轮结构决定

用户授权本轮直接完成全部 API 后，D1–D7 按统一原则落实，取代此前的暂缓状态。

| 编号 | 实施决定                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| D1   | Button 管理 Icon/Label/Count；旧 IconButton 只留弃用包装。纯图标命名在实际 Button 上；busy 保留名称与焦点。                     |
| D2   | 语义动作子组件负责交互，初始动作在模板中声明；删除不补回、不触发业务。调用方仍负责最终业务流程和受控更新。                      |
| D3   | ExpandableCode.Body 独占原始字符串；ShowcaseCard 固定 div 和兄弟链接；Pager 用方向子项。                                        |
| D4   | 子项显式尺寸先受组合可用空间约束；实际派生数值传给上游 Icon，保持 absoluteWeight 正确。                                         |
| D5   | 意图状态可交叉，交互能力由具体组件派生；不增加 hover/pressed 公共开关或全局 state 枚举。受控支持沿用组件已有范围。              |
| D6   | Error 明确选择内部反馈、宿主反馈或省略；不存在隐式内容覆盖。                                                                    |
| D7   | 预设入口在 API 区域外；选择覆盖完整配置并清理草稿，重置恢复当前预设；普通编辑不补删除节点。当前只提供内置预设，不保存个人预设。 |

Select 触发器、搜索、删除选中项及空选择行为保持现状。Surface.variant 的环境意义已登记为组件特有语义，不扩展为通用颜色开关。Dialog/Drawer/Toast 继续要求受控 open/onOpenChange；Disclosure 支持 open/defaultOpen。没有将所有组件强制改为同一默认值模型。

工具导出 normalizeHex、iconNames、DEFAULT_ICON_WEIGHT 和公共类型不计入组件数量。IconSizeContext 为内部实现，不从包入口导出。

## 本轮工程落点记录

- 原 21 个实施组件继续使用组合入口；此前暂缓的 10 个入口已完成，其中 IconButton 合入 Button 并保留弃用包装。其余 15 个组件保持合适的原生或自由 children 入口。
- 配置台按语义角色编辑，必需内容不可删除，可选内容删除不补回。Button 的复制/分享预设在 API 编辑外；Count 是内容块，0 有效，无 Label 时不可添加。
- 生成代码与预览读取同一已提交配置，输出公共 children/语义子组件，不输出旧内容 Props 或预设辅助属性。
- 仓库调用与定向测试已切换。非内容弃用别名保留；仅 IconButton 包装保留旧 icon 内容参数，不作为新配置入口。
- 无障碍引用按当前挂载节点建立和清理；反馈与动作名称分开，复制反馈在按钮外播报。
- 验证：`npm run build:lib` 通过（含类型检查、36 项设计源码契约检查及公共类型声明构建）；9 个定向测试文件、126 项测试通过，覆盖组合规则、状态交互、预览/代码一致性及内部调用场景。未运行浏览器或大规模消费验收，不宣称完成光学与实际布局验收。

参考：[React children 的边界](https://react.dev/reference/react/Children)、[React Aria 处理中按钮](https://react-aria.adobe.com/Button#pending)。
