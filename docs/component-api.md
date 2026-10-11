# 组件 API 实施清单

2026-10-11。依据 [API 主规范](api-contract.md)，记录现有公共组件的内容迁移目标、保留能力与决策边界。本文只定义具体组件，不另设通用规则。实施项的源码、配置台、生成代码和调用方状态见文末工程记录。

## 使用与实施状态

- **实施**：本轮已指定内容契约，可以按表迁移；现有非内容属性、默认值、原生属性、ref、交互行为保持。不得借此重设计视觉或事件。
- **保留**：公共内容入口已经适用，保持 API；仅按明确范围更新编辑器或接入，不添加无用途槽位。
- **暂缓**：该组件存在影响正确实现的未决结构或行为；完成表中决策后再迁移，不机械替换 Props。

数量用 `0..1`、`1`、`0..n`、`1..n` 表达，每个范围按对应父节点计算。没有列出的槽位不自动开放。自由内容必须遵守实际 DOM 的合法内容模型。槽位内部不执行 JSX 字符串。

“实施”仍须完成主规范第 10 节清单；表格是组件的具体决定，不替代工程核对。发现与源码实际语义冲突时记录问题，不自行改变合同。暂缓一个组件不阻止其他已明确的组件。

## 本轮共同决定

1. 自由区域不强制增加 Body；有明确区域职责时才使用子组件。结构组件的文字、图标和动作全部进入指定区域，不同时保留同义内容 Props。
2. `Label` 是可见名称，`Title` 是内容标题，`Description` 是次要说明，`Body` 是正文。补充统一职责：`Control` 承接一个字段控件；`Value` 是可见值读数；`Error` 是真实错误反馈。Value 不承接受控 value，Error 的存在不自动定义全部校验逻辑。
3. 按职责排布结构区域，槽位声明顺序不重新定义布局；自由区域内部顺序由 children 决定。编辑器只允许组件明确开放的排序。带 value 的关联项保持调用方顺序与稳定身份。
4. 可选槽位省略时不生成节点或额外间距。必需角色不能用空槽位满足；文字槽位的 null、false、空白字符串均视为无内容。任意业务组件的渲染结果不能靠静态读取 children 判断，库不承诺全面静态验证。
5. 数字 0 是有效可见内容或值，不等于缺失；Count/Value 的数量限制指节点数量。Label/Title/Description 接受符合语义的 ReactNode，不缩窄为 string。
6. 新建/选择预设时才初始化业务内容。进入自定义后，删除可选节点不自动补回。原生 placeholder、复制源、地址、文件约束、受控值不是内容槽位。
7. 非内容状态和事件本轮沿用各组件现有行为；不实施主规范中的状态机提案。Dialog/Drawer/Toast 继续受控，不顺带新增 defaultOpen。已有受控组件的宿主更新回调责任保留。
8. 组件库通过语义子组件和上下文建立关系；编辑器按内容树严格限制数量。开发阶段报告可确定的重复/缺失/错误归属，禁止自动裁剪、补业务文案或执行任意 JSX。具体注册与校验机制须给出支持封装、条件挂载和 map 的实现方案；不能将读取直接子节点类型作为唯一依据。无法可靠判定的任意内容边界作为调用方契约记录，不声称完全强制。
9. 迁移后的新内容 Props 不与旧内容 Props 并存。既有非内容弃用别名沿用现行兼容，不在本轮顺带删除；发布与消费迁移由独立任务安排。

## 动作、容器与组合

来源：[components.tsx](../src/ui/components.tsx)、[motion.tsx](../src/ui/motion.tsx)。

| 组件           | 状态 | 内容目标与数量                                                                     | 保留能力、关联与边界                                                                                                                                 |
| -------------- | ---- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button         | 暂缓 | 建议 Icon `0..1`、Label `0..1`、Count `0..1`；至少 Icon 或 Label；Count 依赖 Label | size md/sm、emphasis、tone neutral/danger、busy、原生 button 与 onClick；合并 IconButton、形态与确切数量待确认。文字简写若保留须等价于 Label         |
| IconButton     | 暂缓 | 当前固定单图标任务                                                                 | 与 Button 合并决定一致处理；先保持导出，不自行引入另一套新接口                                                                                       |
| ButtonGroup    | 保留 | children 自由承接动作组合                                                          | variant contained/plain、分组名称、div ref 保留；允许动作封装，不遍历业务组件猜按钮；尺寸派生策略未决，不顺带缩放                                    |
| ActionRow      | 保留 | children 自由承接动作或动作组                                                      | 保留 div 原生属性，不新增 actions 属性或重复表面                                                                                                     |
| Surface        | 保留 | children 自由内容                                                                  | variant soft/raised、treatment tonal/defined/physical 与环境契约保留；variant 改名另议                                                               |
| Keycap         | 保留 | children 行内键位内容                                                              | 原生 kbd，无默认快捷键；不再包装成 Button 的 shortcut 数据                                                                                           |
| Layout         | 保留 | children 自由组合                                                                  | 公共入口仅导出 Layout；布局动效、减少动态效果及 div ref 保留，不把内部 Motion 工具新增为组件 API                                                     |
| ExternalLinks  | 实施 | 根 Item `0..n`；每项 Label `1`、Icon `0..1`                                        | Item.href 为必需地址；Item 承担 a 语义，根 nav 名称保留；删除 links 数组入口，外链 target/rel 安全行为保留                                           |
| NavigationCard | 实施 | Title `1`、Description `0..1`                                                      | 根 href、direction previous/next 保留；directionLabel → Description。方向指示图标属于导航能力，不开放成用户必填 Icon                                 |
| Pager          | 暂缓 | 建议 Previous `0..1`、Next `0..1`，各自承接链接内容                                | 与 NavigationCard 的内容和方向职责关联；previous/next 对象迁移需先决定语义子项与内部复用方式。不按普通 Item 混掉方向                                 |
| ShowcaseCard   | 暂缓 | Title `1`、Description `0..1`、Media `1`、ExternalLink `0..1` 为拟定结构           | 现有外链存在时根从 a 变 div，ref 与内容隐藏策略受影响；Media、ExternalLink 特殊职责须先确定，不能产生嵌套链接或继续把任意正文 aria-hidden            |
| PageShell      | 实施 | Header `0..1`、Body `1`、Footer `0..1`                                             | controls → Header、原 children → Body、footer → Footer；mainId/mainAs 保留。Body 对应 main 或 div；跳转主内容及焦点目标保留，不新增嵌套 main         |
| CopyButton     | 暂缓 | 与 Button 同一内容规则；处理中/成功/失败内容待定                                   | text:string 是复制源，保留；不能从 ReactNode 提取复制源。size 默认 sm、剪贴板反馈沿用；需决定反馈内容槽位与状态替换规则后迁移                        |
| ShareButton    | 暂缓 | 跟随 CopyButton 内容契约                                                           | 当前是以 url:string 为复制源的专用动作，不新增系统分享行为；“分享”文案迁移到初始模板，不能保留隐藏业务默认值                                         |
| ExpandableCode | 暂缓 | 拟定 Body 与 ExpandAction/CollapseAction                                           | code 同时承担原始文本和显示内容；先决定代码数据与可见节点的单一归属、展开动作职责。collapsedHeight 单位 px、展开与收起逻辑保留，禁止并存两份代码来源 |

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
| Tabs             | 实施 | List `1`，List 中 Trigger `0..n`；根 Content `0..n`         | Trigger.value 唯一、disabled 可选；Content.value 唯一且须关联 Trigger；Trigger 可只有标签而不带面板。按值关联，不依赖索引。保留 value/defaultValue/onValueChange(string)、当前默认选择和挂载行为；动态策略另议                                                     |
| ColorPicker      | 保留 | 无业务 children 区域                                        | value/defaultValue:string、onValueChange(string)、disabled=false；defaultValue="#525252"。颜色字符串是操作值，内部选择面板不是外部可删内容；名称、归一化与拖动保持现有契约                                                                                         |

Field.Control 与 Slider.Value 为本轮新增特殊职责的实际应用；Value 表达读数，不意味着所有数字组件都要提供 Value 槽位。Field 的 Label、说明、Error 建立控件 ID 关联；required 是输入约束，不能靠必填文本槽位推导。

## 展开层与反馈

来源：[panels.tsx](../src/ui/panels.tsx)、[feedback.tsx](../src/ui/feedback.tsx)。

| 组件          | 状态 | 内容目标与数量                                                                     | 保留能力、关联与边界                                                                                                                                                                           |
| ------------- | ---- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disclosure    | 实施 | Trigger `1`、Body `1`、Actions `0..1`                                              | title → Trigger 的可见内容；Trigger 自身为按钮，非 Header 中任意标题。actions → Actions，与 Trigger 同级不嵌入按钮；open/defaultOpen=false/onOpenChange(boolean)、关闭时焦点回退、div ref 保留 |
| Dialog        | 实施 | Header `0..1`、Body `0..1`、Footer `0..1`；Title/Description 各 `0..1` 位于 Header | 至少有一个实际内容区域；Title 关联名称，无 Title 时根提供名称。open:boolean/onOpenChange(boolean) 必需，dismissible、关闭取消契约、dialog ref 保留；系统关闭按钮不因为缺 Header 被删除         |
| Drawer        | 实施 | 与 Dialog 同一结构，使用 Drawer 子组件                                             | 继续单独导出；同样受控。区域拆分不修改宽度、padding、动画或关闭策略                                                                                                                            |
| ConfirmDialog | 暂缓 | 拟定 Dialog 同类区域及 CancelAction/ConfirmAction 各 `0..1`；初始各 1              | onConfirm():void、busy、tone neutral/danger 及当前关闭约束暂保留；动作归属、删除后的流程有效性、busy 文案和状态播报未决。不能只替换 confirmLabel/cancelLabel 就声称完成迁移                    |
| SelectionBar  | 暂缓 | 拟定 Count `0..1`、Description `0..1`、Actions `0..1`；特定操作最多各 1            | 根 count:number、total?:number 是业务状态，保留；summary → Description。需先定 SelectAllAction/ClearAction/DoneAction 的职责、默认生成与 disabled/busy 边界；回调目前均 ():void                |
| Badge         | 实施 | Icon `0..1`、Label `1`；纯文字简写等价 Label                                       | icon → Icon，children → Label；tone neutral/success/danger、emphasis default/quiet 保留；span 非动作，不新增 Button 式状态                                                                     |
| Alert         | 实施 | Icon `1`、Title `0..1`、Body `0..1`；Title 或 Body 至少一个非空                    | title → Title、children → Body、icon → Icon；初始模板提供一个图标但不提供隐藏业务正文。tone neutral/success/danger 保留；根现有通知语义不因拆分改变，不强制让每个 Alert 都立刻播报             |
| Progress      | 实施 | Label `0..1`、Value `0..1`                                                         | label/valueLabel → 对应槽位；value?:number、max:number=100 保留，省略 value 表达现有不确定进度。名称与 ref 仍归实际 progress，而非外部 div；Value 只是显示，非进度来源                         |
| EmptyState    | 实施 | Icon `0..1`、Title `1`、Description `0..1`、Actions `0..1`                         | title/description/icon/actions → 对应槽位；删除 action 内容别名；Actions 自由组合实际动作，不自动生成业务按钮                                                                                  |
| Toast         | 实施 | Icon `0..1`、Body `1`                                                              | children/message → Body、icon → Icon；open/onOpenChange 必需，tone、duration=4200ms、暂停计时、关闭与焦点行为保留；closeLabel 为系统功能文案，暂保留，不增加 defaultOpen                       |
| ToastRegion   | 保留 | children 承接 Toast 集合                                                           | 根名称、tabIndex 默认 0、现有定位与键盘契约保留；不把单个 Toast 状态上收为第二套集合数据接口                                                                                                   |
| Spinner       | 实施 | children 为可选可见 Label，标记是固有功能                                          | label → children；无文字时根提供 aria-label。size md/sm、role=status、span ref 保留；装饰性嵌入 Button 的忙碌指示按 Button 策略另议，不自动重复播报                                            |

关闭、清除、搜索标记、旋转中的标记属于组件固有功能，不机械转成用户必须维护的 Icon 槽位。业务可见图标属于内容；两者边界必须在契约中注明。

## 文件与文字

来源：[file-dropzone.tsx](../src/ui/file-dropzone.tsx)、[typography.tsx](../src/ui/typography.tsx)、[icons.tsx](../src/ui/icons.tsx)。

| 组件            | 状态 | 内容目标与数量                                     | 保留能力、关联与边界                                                                                                                                                                                                   |
| --------------- | ---- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FileDropzone    | 暂缓 | 拟定 Description `0..1`、Trigger `1`、Error `0..1` | label/buttonLabel/error 内容入口需迁移，但 Error 与内部自动拒绝消息如何共存未决；不能形成隐式覆盖。accept/name:string、multiple/disabled=false、maxSize:number 字节、onFiles(File[])、onReject(string)、div ref 暂保留 |
| Heading         | 保留 | children 标题行内内容                              | level 1–6 默认 2、variant page/section 默认 section；语义级别与视觉体例分开；实际 heading ref 保留                                                                                                                     |
| Text            | 保留 | children 遵守 p/span 原生内容范围                  | as p/span、variant body/supporting 保留；不强制增加 Label 或 Body                                                                                                                                                      |
| TextList        | 保留 | children 为合法 li 集合，可由业务封装生成          | ordered、variant contained/plain 保留；不新增字符串数组入口，不用 element.type 只允许静态直接 li                                                                                                                       |
| DescriptionList | 保留 | children 遵守 dl/dt/dd 的原生描述关系              | variant contained/plain 保留；不新增 label/description 数组 Props，不错误强制所有 dt/dd 一对一                                                                                                                         |
| Icon            | 实施 | 无业务 children 区域                               | name 覆盖当前安装 uplus 可加载集合；size:number、weight:number、absoluteWeight:boolean 保留。独立默认 size=18、weight=1、absoluteWeight=true 保留；组合派生数值与显式 size 优先级未决，先不重写布局                    |

## 关键目标用法与责任边界

以下仅展示目标 API，不代表当前源码已经支持。它们说明内容归属，不是另一套预设 Props。

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
- defaultValue/defaultChecked/defaultOpen 只用于初始化，不能持续覆盖用户操作。已有默认选择与归一化在本轮保留；新的统一空值和状态模型尚未决定。
- 表中所有预设文案与 initialCount 只影响新建模板。未知现有默认值需从源码核对并补入记录，不能拿展示 exampleValue 代替。
- Input 的原生 size 是字符宽度，不能被配置台当作 md/sm 几何尺寸。方向、结构 variant、环境 variant 暂保留现有支持范围，不扩展全库共同选项。

## 交付实施者的定向检查

1. 公共入口与实际导出对齐；新语义子组件从公共入口可用。仅导出的 Layout 属于公共 Motion API，其他内部动效工具不因此进入清单。
2. 迁移后的内容只有一个入口；规定的计数按所属根或条目验证，必需节点不能删除，可选节点删除不自动补回。
3. Label/Title 与实际控件或层建立有效关联；名称未被装饰图标污染；Progress 的 aria 与 ref 不误落到 div。
4. 支持 map、业务组件封装、条件渲染；不能靠检查任意子节点的内部渲染结果确定角色，也不能用类型断言声称完全验证 JSX。
5. 根 padding 和区域 padding 不叠加，省略区域不保留无用间距；使用当前设计变量，不在本轮自行改变几何。
6. 预览、内容树和生成代码一致；生成代码不包含预设选择属性或旧内容对象数组。不要求示例编辑器支持任意 JSX 执行。
7. 按变更运行类型检查、设计检查和必要定向交互测试；浏览器与大规模验证仍需用户同意。暂缓组件保持现有调用，不以部分迁移造成破坏。

## 未决问题与实施禁区

| 编号 | 问题                                                           | 影响范围                                    | 本轮处理                                                 |
| ---- | -------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| D1   | Button/IconButton 是否合并、方形形态、内容上限与 busy 内容替换 | Button、IconButton、CopyButton、ShareButton | 暂缓；已有建议不能冒充确认                               |
| D2   | 专用动作的行为归属、删除后的流程完整性及默认内容               | ConfirmDialog、SelectionBar                 | 暂缓；普通 Dialog 和内容区域可以先迁移                   |
| D3   | 操作数据与正文归属、双链接卡片语义、方向子项                   | ExpandableCode、ShowcaseCard、Pager         | 暂缓各自结构，不强行套通用槽位                           |
| D4   | 约束高度的派生规则与子项显式尺寸优先级                         | ButtonGroup、Button、Icon 及其他组合        | 保留现有尺寸，完整图标范围可独立实施                     |
| D5   | 状态组合、继承、受控支持和统一空值策略                         | 有状态组件                                  | 本轮保留当前行为；不实施状态机提案                       |
| D6   | 文件拒绝消息的自动反馈与 Error 槽位责任                        | FileDropzone                                | 暂缓内容迁移；现有文件接收与校验行为保留                 |
| D7   | 预设覆盖、保存和重置的完整策略                                 | 配置台                                      | 本轮仅确认预设独立、初始化与删除不补回；编辑器的策略另议 |

这些是明确的剩余决策，不是要求实施者自行探索的隐含任务。Select 的触发器显示、删除选中项与空选择不在本轮决策范围。

工具导出 `normalizeHex`、`iconNames`、`DEFAULT_ICON_WEIGHT` 以及公共类型不计入 46 个组件；保留其既有用途。图标全集接入时同步核对 IconName/iconNames，不能只扩大选择器而保持旧类型白名单。

## 本轮决策记录

- 已决定：为全部现有公共组件建立内容边界清单；用实施/保留/暂缓表达工程范围。
- 已决定：补充 Control、Value、Error 统一职责；在 Field、Slider、Progress 等实际需要处使用。
- 已决定：结构槽位按职责排布，字段按实际 input/progress/button 等节点关联名称；不从 arbitrary ReactNode 提取业务字符串。
- 已决定：纯文字的 Checkbox/Radio/Switch/Spinner 可直接用 children，等价 Label；不为它们强制增加包装层。
- 已决定：CopyButton.text、ShareButton.url、输入 value、文件约束保留为操作数据；复杂双重职责仍单独记录。
- 待决定：D1–D7；不能以规范已更新为由自动执行。

参考：[React 输入与标签](https://react.dev/reference/react-dom/components/input)、[WAI-ARIA Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)。具体源码默认值核对于本仓库工作区，不意味着已发布版本具备目标接口。

## 本轮工程落点记录

实施组件：Icon、Field、Slider、Checkbox、Radio、Switch、Select、SegmentedControl、Tabs、Disclosure、Dialog、Drawer、Badge、Alert、Progress、EmptyState、Toast、Spinner、ExternalLinks、NavigationCard、PageShell。

| 范围 | 状态 |
| --- | --- |
| 源码 | 已完成。内容由 children 与语义子组件注册；槽位数量、归属、重复值和名称关联在开发环境报告。自定义 id 与 DOM id 一致，卸载时移除注册。 |
| 配置台 | 已完成。实施组件按槽位编辑和预览；条目数组只存在于编辑器内部。必需槽位不能删除，达到集合上限后不能继续添加，可选槽位删除后不自动补回。 |
| 生成代码 | 已完成。与预览共用同一配置，输出 children 与语义子组件，不输出旧内容 Props 或 options/items/links 数组 Props。 |
| 调用方 | 已完成。`src`、`lab` 与测试中的实施组件旧内容用法已改为组合。暂缓组件只在内部适配已迁移组件。 |
| 兼容层 | 已删除实施组件的旧内容 Props、旧数组入口和覆盖分支。非内容弃用别名保留，包括 variant、aria-label/onChange 别名、Dialog `variant="drawer"`、ConfirmDialog `danger`。 |

- 图标候选、`IconName`、`iconNames`、预览和生成代码读取当前安装的 `@uplus-icon` 元数据。
- 保留组件的公共 API 未改。暂缓组件保持原接口：Button、IconButton、CopyButton、ShareButton、ExpandableCode、Pager、ShowcaseCard、ConfirmDialog、SelectionBar、FileDropzone。
- FileDropzone 仍使用 Alert 展示拒绝消息，并显式提供原先自动出现的危险图标，避免改变暂缓组件的外观。D6 的 Error 槽位责任未实施。
- 已执行 `tsc -b`、`npm run check:design`（36 项通过）和 `vitest run src lab`（147 项通过）。未修改检查器，未运行 `test:design`。浏览器、真实布局、光学和消费场景验证未执行。
