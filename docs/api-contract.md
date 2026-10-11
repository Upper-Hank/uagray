# Uagray 组件 API 规范

更新日期：2026-10-11。

状态：用户已确认统一采用 `children` 与子组件组合组织内容。实施项的源码、配置台、生成代码、调用方和兼容层状态见 [逐组件实施清单](component-api.md#本轮工程落点记录)。本轮现有组件的内容与状态边界已落实；后续新增能力仍须独立登记。新增组件或调整公共 API 必须完成第 10 节的设计开发清单，并记录未决问题。

本文是通用公共 API 规则的唯一依据。[逐组件实施清单](component-api.md) 在本文规则下维护具体组件的内容入口、数量、保留能力及实施状态；新增组件须同步登记。视觉、padding、圆角、环境与动效由 [设计规范](design-system.md) 维护；编辑器状态与代码生成由 [配置台契约](playground.md) 维护。配置台的编辑能力不决定公共 API 的内容类型。

此前规范与已执行迁移保存为 [历史快照](references/history/api-contract-before-composition-2026-10-11.md)，不用于恢复已撤销的内容入口。

## 1. 已确认的原则

1. **内容统一通过组合进入。** 支持内容的组件以 `children: ReactNode` 承接文字、元素、组件及其组合。结构区域通过语义子组件表达；组件可声明允许的内容职责、数量范围与排列约束。不同时提供数据式和组合式两套公共内容接口。
2. **父组件负责承载与交互。** 父组件管理表面、边界、padding、动效及整体交互状态。语义子组件管理对应区域的排布和关联。调用方决定区域内放什么内容。
3. **普通属性声明外观、状态、行为和约束。** `tone`、`emphasis`、`size` 等声明意图，不直接开放 color、background、border、shadow、padding 或动效数值。公共尺寸和环境契约保持现行定义，组件特有语义见第 7 节。
4. **同名属性保持相同语义。** 不以同一个自定义属性名表达不同概念；类型、支持范围与默认值须在组件契约中明确。原生属性沿用 HTML 语义。现存例外不能不加说明地推广。
5. **可见内容与无障碍名称分开。** 可见标题、标签由内容或语义子组件承接；`aria-label` 是无障碍名称。子组件可以建立 `aria-labelledby`、`aria-describedby` 等关联，不能用一段默认业务文案代替名称。
6. **内容不内置业务文案。** 未提供的可选内容不生成占位节点。组件自身承担的关闭能力和复制状态播报可以有中文功能文案；调用方提供的 Button 文案由 Button 的 children 决定。
7. **状态只由负责它的组件管理。** Root 接受当前值、初始值和变化请求；子项读取上下文，不复制一套选中状态。原生字段保留原生事件；合成值使用 `onValueChange(value)`，展开使用 `onOpenChange(open)`。
8. **保留宿主与原生能力。** 有实际 DOM 节点的组件接受对应原生属性、className、style 与 ref。ref 指向实际节点；Select 根调用的 ref 继续指向 trigger，不因内容迁移改变。子组件使用上下文关联，不能依赖检查业务组件内部的 React 元素来发现内容。
9. **预设与 API 自定义配置分层。** 预设是完整示例或组合的起点，不是组件属性。配置台在 API 编辑之外提供预设入口；Button 的 action、showCount 等示例辅助项不能作为 API 同级配置。预设文案属于示例值，不是组件默认业务内容。选择预设覆盖完整配置并关闭草稿，重置恢复当前预设；当前不提供个人预设持久化。
10. **图标使用完整上游能力。** 接入 `@uplus-icon/react`，图标选择覆盖当前安装版本可加载的全部图标，不维护精选白名单或少量常用项作为唯一入口。固定组件图标优先具名或单图标导入；配置台根据上游元数据提供完整选择，并使用上游动态加载入口。配置台的全量图标资源不强制进入组件包的固定图标路径。
11. **图标保留数字尺寸。** Icon 的 size 继续为数字，单位为 CSS 像素；不改成 md/sm。省略时读取所在组合的尺寸约束，组合高度变化时，派生的按钮与图标尺寸一同变化。具体派生值优先通过共享变量和上下文传递，不在各个子项中重复写固定值；父级空间约束优先于子项显式尺寸；传入上游的数值与实际 SVG 尺寸保持一致。
12. **界面保持简洁。** 编辑器只呈现操作名称、内容及必要状态和错误反馈，不展示元信息、类型、必填标记、默认值、签名或解释性文案，也不转移到提示浮层。

## 2. 内容组成模型

### 内容开放范围

统一内容规则的表达方式，不强制所有组件接受相同的 children。每个组件及其槽位必须声明自己的开放范围；该分类用于组件契约和编辑器内部，不新增供调用方选择的模式属性。

| 范围       | 适用职责                  | 规则                                                                                 |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------ |
| 自由承载   | Surface 等内容容器        | 接受自由组合，不强制套标题或正文槽位；仍遵守实际 HTML、环境与布局契约                |
| 受约束内容 | Button 等单一语义控件     | 按允许角色和组合规则承接内容；槽位内部同样受行内语义和交互边界约束                   |
| 结构承载   | Dialog、Drawer 等分区容器 | 根声明区域职责；Body 等区域可自由组合，Title 等区域保留对应语义约束                  |
| 关联集合   | Tabs、Select 等关联条目   | 声明允许的子项及身份关联；Item、Trigger、Content 各自声明内容范围                    |
| 无内容区域 | Input 等原生输入节点      | 输入走 value，不为原生不支持的 children 伪造入口；外部标签和说明由负责关联的组合承担 |

每个槽位单独声明允许的内容：纯文字、行内内容、自由组合或指定语义子组件。不能从根组件接受 children 推导所有后代都不受限制，也不能因为根限制槽位就把 Body 的业务内容锁成固定名单。自由区域承接用户自定义组件；受约束区域的扩展必须说明新增角色或允许的内容范围，不依靠未知节点绕过契约。

### 自由内容

Surface 等自由承载组件直接渲染 children。children 可以是单个节点或多个节点，不限定为字符串，也不要求所有组件都额外提供 Body 子组件。Button 同样使用 children，但仍须遵守原生 button 的内容边界；按钮使用 Icon/Label/Count；旧 IconButton 仅保留弃用包装。children 是内容入口，不意味着所有组件都接受同样的内容结构。

```tsx
<Surface>
  <Heading>项目名称</Heading>
  <Text>项目介绍</Text>
  <Button>查看项目</Button>
</Surface>
```

输入框、数字框等原生字段没有可渲染的 children 区域，其输入仍使用 value。CopyButton 的 text、ShareButton 的 url、链接的 href 等操作数据不等同于可见内容；这些数据属性保留，不能机械改成 children。

### 结构内容

区域有固定职责或无障碍关联时，使用语义子组件。Root 仍以组件名调用，例如 `<Dialog>`、`<Tabs>`，不同时新增另一种 `<Dialog.Root>` 写法。

- Header、Body、Footer 表达区域职责；仅在组件确有对应职责时提供。
- Title、Description 表达标题与说明，并建立需要的语义关联。
- Item 表达可选择的条目，Trigger 与 Content 表达关联的触发项和内容面板。
- 子组件的 children 是该区域的内容；不再增加同义的 content、label、title 等内容属性。
- 同一内容只有一个归属入口，不提供 prop 与子组件互相覆盖的规则。
- 子组件不得重复叠加 Root 已提供的 padding、表面、标题或关闭动作。迁移沿用现有设计契约，不因拆分组件自行改动布局与动效。

### 统一槽位命名与职责

优先使用以下统一词汇。同一名称表示同一职责，组件按需采用，不要求每个组件都提供全部槽位。名称是目标命名词汇，不代表本次新增全部公共导出。

| 名称        | 统一职责                            | 边界                                                              |
| ----------- | ----------------------------------- | ----------------------------------------------------------------- |
| Header      | 顶部区域的组织                      | 不自动等于 Title，也不单独生成业务标题                            |
| Title       | 区块、层或内容对象的标题            | 不是控件动作名称；是否建立根名称关联由组件契约明确                |
| Description | 对标题、控件或内容的次要说明        | 不承接主正文；是否关联 aria-describedby 按具体语义定义            |
| Body        | 主内容区域                          | 不承接另一份标题或 Footer；内部开放范围由组件声明                 |
| Footer      | 底部区域的组织                      | 可以承接 Actions 或其他底部内容，不自动生成按钮                   |
| Label       | 控件、动作或选项的可见名称          | 不代表 aria-label；DOM 是否为原生 label 由关联对象决定            |
| Icon        | 图标内容                            | 不自动提供根组件名称；装饰或信息语义须按用途明确                  |
| Count       | 可见数量读数                        | 槽位数量与数字大小分开；不自动变成负责业务行为的 count 状态       |
| Control     | 一个字段控件的承接区域              | 使用上下文关联实际输入节点，不克隆未知业务组件；不是值数据        |
| Value       | 当前值的可见读数                    | 不承担受控 value 的存储，不从显示内容反推值                       |
| Error       | 实际错误反馈                        | 关联对应控件；校验规则和错误数据归属须由具体组件声明              |
| Actions     | 一组动作的承载区域                  | 不内置固定动作名单，不等于 Footer                                 |
| List        | 一组关联条目的组织                  | 不自动决定 ul、tablist 等 DOM 或 role，须遵循组件语义             |
| Item        | 单个集合条目                        | 关联集合按契约提供稳定身份，不以文字或下标推导身份                |
| Trigger     | 触发打开、切换等交互的节点          | 负责对应交互语义、焦点与事件，不是普通文字槽位                    |
| Content     | 与 Trigger 或选择身份关联的内容面板 | 用于 Tabs.Content 等关联内容；普通主正文优先 Body，不作为同义别名 |

不得为同一职责同时提供 Label/Text、Body/Content 等别名。简单文字简写如果允许，必须明确等价于哪个槽位，并计入同一规则。

确有无法由统一职责表达的功能时，可以新增组件特有槽位，例如确认流程中的 CancelAction、ConfirmAction。新增前必须记录：为何已有名称不足、内容边界、行为责任、数量及组合关系、名称和描述的关联。特殊槽位不得改变统一名称的既有含义；普遍复用的职责应先更新本节，再推广到其他组件。

### 内容槽位规则

采用 slot 的内容职责思路：内容统一进入 children，但每个组件按自己的语义与设计声明允许的槽位和组合规则。这里的 slot 指内容区域，不是增加 slot 对象 Props，也不是强制采用 DOM slot 或 Radix Slot 工具。

规则至少区分：

- 允许的内容角色：Icon、Label、Count、Title、Body、CancelAction 等，优先使用统一名称，具体采用情况见逐组件清单。
- 数量下限与上限：min/max 限制该角色的实例数量，不限制其文字长度或业务数值。
- 初始组合：initialCount 和初始内容属于预设或新建模板，不是每次渲染时补齐 children 的组件默认值；必须满足 min ≤ initialCount ≤ max。
- 排列与布局：允许的位置、顺序及尺寸继承关系按组件设计确定；不是所有内容都允许任意拖动。
- 跨槽位条件：数量合法之外，仍需满足组件名称、非空动作内容、动作关联及原生内容语义等要求。

“必须且只有一个”是 min=1/max=1；“可有可无、最多一个”是 min=0/max=1；“默认提供但能删除”是 min=0/max=1/initialCount=1。固定数量不等于内容不可编辑。已有 children 中显式省略的可选节点不能在渲染或切换配置时被自动补回。

下表记录规则表达方式；具体组件的结构、数量与实施状态以 [逐组件实施清单](component-api.md) 为准。当前动作组合遵循同一规则：

| 场景               | 内容角色      | min | max | initialCount    | 编辑行为                                       |
| ------------------ | ------------- | --- | --- | --------------- | ---------------------------------------------- |
| Alert 要求一个图标 | Icon          | 1   | 1   | 1               | 保留一个节点，可更换图标；不能删除或添加第二个 |
| Alert 可选标题     | Title         | 0   | 1   | 按预设为 0 或 1 | 可添加、编辑、移除；存在时不能重复添加         |
| 确认流程的取消动作 | CancelAction  | 0   | 1   | 1               | 初始提供，可修改或移除；关闭能力不依赖取消槽位 |
| 确认流程的确认动作 | ConfirmAction | 0   | 1   | 1               | 初始提供，可修改或移除；行为绑定由对应动作承担 |

Button 推荐以 Icon、Label、Count 等语义角色管理内容，而不只提供任意 Leading/Trailing 区域。角色的默认排布由组件设计决定。纯文字简写若保留，应等价于一个 Label 槽位并计入同一上限；不能成为绕过约束的第二套内容入口。纯图标模式允许没有 Label，但需要可访问名称；Label 与 Count 的存在规则不能仅由单项数量上限表达。

组合规则必须逐组件定义，不从另一组件机械继承。每个组件至少明确：允许角色与所属区域、各角色 min/max、依赖与互斥、整体有效条件、允许嵌套、排列顺序、槽位内部开放范围、内容为空或缺失的语义，以及动态增删时的处理。纯图标 Button 的名称条件和 Alert 的必需图标是各自的规则，不成为全库默认要求。

预设的 initialCount 和初始内容单独记录；不能将它们混入组件自身必须满足的结构条件。涉及本轮保留的 Select 显示或选择行为，引用现有契约，不重新制定。

库的内容契约、配置台的规则描述与生成代码必须一致。规则是组件定义和编辑器内部元数据，不作为使用者每次调用组件时传入的公共配置对象。

配置台按内容树在操作发生前严格限制添加、删除与排列；已达到 max 时不再提供同类添加入口，处于 min 时不提供删除动作。界面继续只显示内容及操作，不展示 min/max、类型或规则解释。

组件库不能用 Children.count 或逐层读取 element.type 保证任意业务 JSX 的槽位合法：React children 不包含业务组件的渲染输出。语义子组件通过上下文建立关系；数量校验、动态挂载与封装支持的通过挂载注册建立数量、归属与关联，支持封装、map 和条件渲染。不承诺 TypeScript 能静态验证任意 JSX 的数量，也不能静默裁掉多余内容或偷偷补业务节点。

### 动态内容

数据由调用方保存，通过 map 生成子组件。业务数据可以是数组；组件库不再通过 options、items、links 对象数组来定义另一套公共内容入口。

```tsx
<Select defaultValue="design">
  {categories.map((item) => (
    <Select.Item key={item.id} value={item.id} disabled={item.disabled}>
      {item.name}
    </Select.Item>
  ))}
</Select>
```

key 表达 React 节点身份，value 表达组件的选择身份。修改文案或排序不改变稳定 value；不能用 children 的文字或数组位置推导 value。

### 无障碍责任与内容来源

无障碍属性跟随承担实际语义的 DOM 节点；可见内容与关联关系可以由 children 槽位提供。不能简单规定“全部跟根走”或“全部跟 children 走”。

| 场景                 | 语义与属性归属                                                        | 内容来源与关联                                                    |
| -------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Button               | 实际 button 节点承接 aria-label、aria-labelledby、aria-describedby 等 | 可见动作名称来自 Label 或等价文字；纯图标按钮在 Button 上提供名称 |
| Dialog / Drawer      | 实际 dialog 节点承接名称和描述关联                                    | Title、Description 提供节点与稳定 ID；组件建立对应关联            |
| 字段组合             | 实际 input 等控件承接名称、描述与错误关联                             | Label 优先使用原生 label/for；说明和错误由对应节点提供            |
| Tabs 等集合          | Trigger、Item 或 Content 按其真实 role 承接相关属性                   | Root 管理关联，不将全部 aria 属性无差别下传每个子项               |
| 独立有信息含义的图标 | 图标实际语义节点承担自身名称                                          | 与动作内的装饰图标分开处理，不用图标名称代替整个动作名称          |

Button 的 aria-label 放在 Button，不放到 Icon、Label 或 Count 上代替按钮命名。有合适的可见动作名称时，优先用可见内容命名；aria-label 不作为必填的重复字段。显式 aria-labelledby/aria-label 遵循浏览器名称计算规则，组件不能自创覆盖顺序；显式名称应保留可见动作名称的含义。

动作中的装饰 Icon 不重复朗读图标名称；Count、快捷键等内容是否进入动作名称、作为描述或另作状态播报，必须由具体组件和用途确定，不能默认全部隐藏或全部拼接。名称、描述、状态播报分别声明，aria-busy 等状态不替代名称。

语义子组件可建立关系，但不得从任意 ReactNode 强行提取字符串形成另一份名称；也不能把所有可见内容自动写进 aria-label。槽位删除、条件挂载与重新排列后，引用必须保持有效。没有 Title 的 dialog 或没有 Label 的按钮，需要明确可用的替代命名路径。

## 3. 已确认的结构入口

以下是已确认的结构入口。现有组件已经完成对应入口实现。全部现有公共组件的具体内容入口及本轮实施边界见 [逐组件实施清单](component-api.md)。

| 组件             | 目标内容入口                                                 | 承担的关系                                                        |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Button           | children                                                     | 可见内容由调用方组合；内容约束及旧 icon/count 迁移提案见第 9 节   |
| Surface          | children                                                     | 自由承载；不强制标题、正文、图片或操作结构                        |
| Dialog / Drawer  | children；Header、Title、Description、Body、Footer 子组件    | 标题关联、区域排布与模态生命周期                                  |
| Select           | children；Select.Item 的 children、value、disabled           | 单选项及稳定选择值；根组件继续承接触发器与定位                    |
| SegmentedControl | children；SegmentedControl.Item 的 children、value、disabled | radiogroup / radio 选择关系                                       |
| Tabs             | children；Tabs.List、Tabs.Trigger、Tabs.Content              | tablist / tab / tabpanel 关系；Trigger 与 Content 通过 value 关联 |

卡片是组件用途称呼。仓库现有 Surface、ShowcaseCard、NavigationCard 等承担不同任务，本次不因此新增统一 Card 导出，也不把已有专用卡片自动改成同一种结构。

### Dialog / Drawer

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Header>
    <Dialog.Title>编辑项目</Dialog.Title>
  </Dialog.Header>
  <Dialog.Body>
    <Input aria-label="项目名称" />
  </Dialog.Body>
  <Dialog.Footer>
    <Button onClick={() => setOpen(false)}>取消</Button>
    <Button emphasis="strong" onClick={saveProject}>
      保存
    </Button>
  </Dialog.Footer>
</Dialog>
```

- Drawer 使用对应的 Drawer.Header、Drawer.Title、Drawer.Description、Drawer.Body、Drawer.Footer，遵守相同内容契约。
- Title 为实际标题节点，自动关联根 dialog 的可访问名称；Description 自动关联可访问说明。
- Header、Description、Footer 可以省略；Title、Description 位于 Header，各最多一个。Body、Footer、Header 各最多一个，至少存在一个实际内容区域；没有 Title 时必须由根的 aria-label 或有效 aria-labelledby 提供名称。
- 原 title、description、footer 业务内容属性迁移到对应子组件，不再作为第二套内容入口保留。
- open、onOpenChange、dismissible 及关闭的原生事件取消契约保留现有行为。Dialog/Drawer/Toast 为受控组件，不支持 defaultOpen；Disclosure 支持 defaultOpen。
- 关闭动作属于组件能力，不能随着省略 Header 而失去必要的关闭路径；其具体挂载位置沿用现有职责并与新的结构核对。Footer 内的业务按钮由调用方组成。

### Tabs

```tsx
<Tabs defaultValue="overview" aria-label="项目信息">
  <Tabs.List>
    <Tabs.Trigger value="overview">概览</Tabs.Trigger>
    <Tabs.Trigger value="files">文件</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">
    <Overview />
  </Tabs.Content>
  <Tabs.Content value="files">
    <FileList />
  </Tabs.Content>
</Tabs>
```

- Root 管理选中值；Trigger 的 value 唯一，Content 按 value 关联，不再由数组下标关联。
- 原 items[].content 与根 children 互相覆盖的内容模式取消。Root children 是结构树，面板正文只进入 Tabs.Content。
- 保留既有 tablist / tab / tabpanel、方向键、焦点和减少动态效果契约。
- 动态项与面板挂载沿用当前 Tabs 行为；编辑器的选择归一化不是库层默认回调。

## 4. 通用属性：非内容部分

本节维护语义和支持范围，不指定编辑器控件。各组件保留的类型、默认值和回调见逐组件清单；新的状态组合与统一空值策略仍待决定。

| 类别         | 属性                                                     | 含义与现行选项                                                               |
| ------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 强调         | emphasis                                                 | strong / default / quiet；组件声明支持子集                                   |
| 语义         | tone                                                     | neutral / success / danger；组件声明支持子集                                 |
| 尺度         | size                                                     | 普通控件 md / sm，默认 md；Icon 为数字 CSS 像素，省略时继承组合约束          |
| 结构形态     | variant                                                  | 组件支持的有限结构选项；Surface soft/raised 表示环境，作为明确的组件特有含义 |
| 边缘         | treatment                                                | tonal / defined / physical；只用于 Surface，合法环境由主规范约束             |
| 排列与方向   | layout、direction                                        | 组件的有限排列选项；direction 当前为 previous / next                         |
| 当前与初始值 | value / defaultValue                                     | 字段值或选择身份；合成组件 onValueChange，原生字段 onChange                  |
| 勾选         | checked / defaultChecked                                 | 原生勾选状态，原生 onChange(event)                                           |
| 展开         | open / defaultOpen                                       | 当前或初始打开状态；onOpenChange(open)，具体支持范围见逐组件清单             |
| 交互状态     | disabled、readOnly、busy                                 | 禁止交互、只读、处理中；支持范围与能力优先级见第 9 节                        |
| 数量         | count、total                                             | 当前数量与上限；SelectionBar 根保存业务数量，Count 槽位承担显示              |
| 能力         | required、multiple、dismissible、shortcut、resizable     | 表单必填、多值、允许关闭、快捷键、可纵向调整                                 |
| 数值约束     | min、max、step、maxSize、duration、collapsedHeight、rows | 数值边界；maxSize 为字节，duration 为毫秒，collapsedHeight 为像素            |
| 操作输入     | href、url、text、code、accept、name、type                | 地址、操作数据或原生配置；同名语义与特殊处理须在组件中声明                   |
| 文本语义     | level、as、ordered                                       | 标题层级 1–6、受支持标签、有序列表能力，独立于视觉体例                       |
| 宿主与语义   | className、style、ref、id、aria-_、data-_                | 原生接入与无障碍关联；不将全部原生能力做成配置项                             |

事件使用 on + 动作名称。onChange 只用于原生事件，不传简化值；合成值使用 onValueChange，展开使用 onOpenChange。onConfirm、onFiles、onReject、onSelectAll、onClear、onDone 与 formatValue 的现有签名已在逐组件清单记录；其他原生回调沿用对应 DOM 类型，不能只列属性名而不记录数据类型。

## 5. 内容属性迁移范围

| 现有入口                                                         | 目标方向                                                       | 实施状态                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| Dialog / Drawer 的 title、description、footer                    | 对应语义子组件                                                 | 已确认                                                      |
| Select、SegmentedControl 的 options                              | Item 子组件                                                    | 内容入口已确认；触发器显示与选择行为沿用现有实现            |
| Tabs 的 items 与根 children 面板覆盖                             | List / Trigger / Content                                       | 已实施；动态项与挂载按现有行为                              |
| Surface 的 children                                              | 保留自由组合                                                   | 已确认，无须新建 Body                                       |
| Button 的 children                                               | 保留 children 内容入口                                         | 已确认；内容边界及 icon/count 迁移见第 9 节                 |
| 其他 label、title、description、hint、error、summary、valueLabel | 可见内容归入 children 或语义子组件                             | 已按逐组件清单实施                                          |
| actions、footer、controls                                        | 对应区域的子组件组合                                           | 由对应区域与语义动作子组件承担                              |
| ExternalLinks.links、Pager.previous/next、专用卡片内容属性       | 子项或区域组合                                                 | 现行接口均采用子项与区域组合                                |
| 内置功能文案的 *Label                                            | 组件自有功能动作仍可有默认文案；调用方动作使用 Button children | 仅功能播报保留默认；业务动作名称进入槽位                    |
| CopyButton.text、ShareButton.url、ExpandableCode.code 等操作数据 | 不因内容统一而机械改名                                         | text/url 保留；code 改为 ExpandableCode.Body 的单一字符串源 |

新内容 API 只维护组合式入口。旧内容数据由调用方 map 转换；不同时保留旧数组属性和新子组件作为两套公共使用方案。其他既有非内容弃用别名的删除时间不受这条规则自动影响，发布与消费迁移安排另行处理。

## 6. 后续实施要求

1. 只实施已确认的组件入口和行为。涉及第 7 节及第 9 节的未定问题，先补充决定，不以示例代码猜测完整契约。
2. 根组件与子组件从 uagray 公共入口使用；保持既有无样式基础、原生语义和共享 Motion。Select 继续使用 Radix，无须为内容组合引入新依赖。
3. 不执行字符串 JSX，不通过遍历普通业务组件的内部输出来推断结构。子组件通过上下文建立关系；支持调用方 map 和组件封装，不能限制所有内容必须是静态直接子节点。
4. 更新公共类型、预览、生成代码、内部原型与真实调用方。编辑器可以维护内部条目数组或内容树，但它们不是公开 Props，代码只输出新的组合形式。
5. 配置台现有字符串 args 无法代表任意组件树；组件能力与编辑器能力分别说明，不能把 ReactNode 缩窄成 string，也不能把文本框包装成完整内容编辑器。
6. 不借内容 API 迁移调整颜色、padding、圆角、宽度、字重和动效。确有结构导致的布局差异时，依据主规范解决，不自行新增设计变体。
7. 迁移验证检查内容归属、稳定身份、键盘、名称关联、ref 与回调，以及生成代码和实例一致性。按用户要求运行类型、设计检查和必要的定向测试；浏览器和大规模验证需另行获得同意。
8. 本文是目标规范，不代表源码已符合。实施完成后再更新状态与验证记录；本次纯文档修改不运行构建或测试。

## 7. 组件特有边界

- Button.size 是 md/sm；Icon.size 是数字 CSS 像素；Input 的原生 size 是字符宽度，不改为几何枚举。
- Surface.variant 的 soft/raised 表示环境；其余 variant 按各组件实际结构声明，不共用全库选项。
- Dialog、Drawer、Toast 使用受控 open/onOpenChange；Disclosure 支持受控及 defaultOpen。没有给全部组件增加不存在的非受控能力。
- 0、false 是有效值；省略与 undefined 使用具体组件的默认；null 仅在公共类型允许的内容区域表示缺失，不自动转成输入值。
- Select 的触发器、搜索、选中项删除和空选择保持现状。编辑器的条目状态及归一化不成为公共集合 Props。
- 回调由负责交互的节点触发一次；程序化改 Props 不伪造用户事件。状态值由受控宿主更新，不同时复制到子项。

## 8. 本轮实施范围

本轮源码、配置台、生成代码与调用方按逐组件清单同步完成。旧内容 Props 删除；非内容弃用别名及 IconButton 弃用包装用于消费者过渡。没有发布、部署或进行浏览器验收。

## 9. 动作、尺寸与状态契约

### Button 内容与形态

Button 接受 Icon、Label、Count，各最多一个；至少 Icon 或 Label，Count 依赖 Label。文字/数字简写等价一个 Label。Icon 为装饰内容，Count 作为可见数量参与按钮名称；纯图标按钮在实际 Button 上提供 aria-label/aria-labelledby。

shape 支持 inline/square；省略时根据已注册角色为纯图标派生 square，其余为 inline。原生 button 中不能嵌套链接、按钮或输入等交互后代。旧 IconButton 委托同一 Button，停止发展独立接口。

busy 是交互职责，不增加 Icon 槽位：有 Icon 时以处理中指示替换它，无 Icon 时显示功能指示；可见 Label 与动作名称保留。CopyButton 的 Feedback 按 pending/success/error 各最多一个，在按钮外独立播报；不会变成另一个动作名称。

### 专用动作

ConfirmDialog 的 CancelAction 请求关闭，ConfirmAction 调用 onConfirm。调用方 onClick 可 preventDefault 取消默认动作；每次激活只执行一次。busy 阻止确认、取消与层关闭。删除动作不补回、不自动确认；删除取消仍保留非 busy 时的关闭能力。

SelectionBar 的语义动作复用 Button，由各动作自己的 onClick 连接业务；根不生成按钮。busy 禁用这些动作，total=0 禁用全选，count=0 禁用清空。普通业务子按钮自行声明可用状态。调用方负责保证业务流程完整。

### 数据与可见内容

CopyButton.text、ShareButton.url 是复制数据，不从 ReactNode 提取。ExpandableCode.Body.children:string 是可见正文和复制源的唯一归属；CopyAction、ExpandAction、CollapseAction 为可删内容节点。没有溢出时不显示切换动作；切换时焦点跟随实际动作，缺少目标动作时回到正文。

ShowcaseCard 根固定 div；Media 与 ExternalLink 是兄弟链接。Title/Description 提供主链接的名称和说明，Media 不整体隐藏其内容。Pager 的 Previous/Next 独立声明；省略不补节点，显式无 href 才显示不可用动作。

FileDropzone.Error 无 children 时接收内部拒绝消息；显式 children 时只显示宿主消息，null 表示隐藏。省略 Error 后不再自动插入消息节点，但 onReject 继续通知宿主；存在的错误关联实际文件 input 与 Trigger。

### 尺寸与上游图标

Icon 的独立默认 size=18；Button 默认图标 md=15/sm=13，FileDropzone 图标默认 22。组先扣除实际上下 inset，子按钮与图标读取可用高度；Icon 的显式 size 仍受组合上限约束，绝不单改 CSS 而保留另一个上游 size。组合几何公式与视觉常量只在设计规范和源码维护。

图标选择读取当前安装版本元数据与动态入口，覆盖可加载全集，包括上游保留的旧名称；升级依赖后同步更新候选，不维护精选名单。

### 状态按意图声明，按能力执行

保留 disabled、busy、readOnly、checked/value、open 等各自职责，不增加统一 state 枚举。hover/pressed/focus 来自真实交互，不作为组件公共开关。

| 场景                     | 有效能力                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Button disabled          | 原生 disabled；阻止激活与悬停/按压反馈，不进入普通 Tab 序列。                              |
| Button busy              | aria-busy/aria-disabled；阻止再次激活与悬停/按压反馈，保留焦点和名称。                     |
| disabled + busy          | 可以共存；disabled 决定焦点能力，busy 继续表达处理状态。                                   |
| hover + focus / pressed  | 可以由输入同时产生；按压反馈与焦点提示承担不同职责。                                       |
| readOnly 字段            | 禁止编辑，保留焦点、选择与复制；不扩展到 Button。                                          |
| checked/value + disabled | 保留值，仅禁止用户修改。                                                                   |
| open + busy              | 不全局推导关闭；ConfirmDialog 的关闭被 busy 阻止，普通 Dialog/Drawer 按 dismissible 管理。 |

CSS 与激活处理读取相同可用条件；aria-disabled 本身不能代替键盘激活拦截。复制内部状态 idle → pending → success/error → idle，处理中不重复调用剪贴板，成功与失败如实播报。

参考：[React Aria pending 按钮](https://react-aria.adobe.com/Button#pending)、[React children 边界](https://react.dev/reference/react/Children)。

## 10. 组件设计与开发必答清单

新增组件、修改公共属性或调整内容组合前，须完成以下清单；现有组件的本轮决定和待决项见 [逐组件实施清单](component-api.md)。记录保存在本规范的对应组件契约，或在本文链接的组件契约文件中；链接文件只维护该组件的具体定义，不另设一套通用规则。这些记录用于设计与工程，不显示在产品界面。

| 项目           | 必须回答的问题                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 用途与边界     | 解决什么复用需求？负责哪些能力？基础组件、专用组合和展示预设分别是什么？                                                     |
| 实际语义       | 根与交互子项使用什么 DOM/role？键盘、焦点、ref 归属是什么？                                                                  |
| 内容开放范围   | 根属于哪种承载范围？每个槽位内部允许什么？是否接受业务组件封装、条件渲染与 map？                                             |
| 槽位命名       | 使用哪些统一职责？特殊槽位为何必要？是否存在重复内容入口或同义别名？                                                         |
| 数量与有效条件 | 各槽位 min/max 是多少？什么构成有效整体？空节点、空白文字、显式 0 各代表什么？                                               |
| 组合关系       | 哪些依赖、互斥、可共存、可嵌套？顺序固定还是可调整？身份与关联怎样保持稳定？                                                 |
| 布局与继承     | 表面、padding 和间距由谁承担？尺寸、环境与状态继承哪些内容？显式子项配置怎样受到父级约束？引用设计规范，不在此复制视觉数值。 |
| 值与事件       | 支持哪些当前值/初始值？省略、undefined、null 的含义？受控与非受控行为、回调签名及触发时机？                                  |
| 状态与操作     | 支持哪些状态？哪些互斥或交叉？各状态下允许什么操作？交互途中状态改变、父级状态变化如何处理？                                 |
| 无障碍         | 名称、描述、状态分别属于哪个节点？来自哪个槽位？装饰内容怎样处理？槽位缺失和动态变化如何维持关联？                           |
| 动作与操作数据 | 内容与输入值、地址、复制源等数据怎样区分？动作由谁触发？取消、确认与关闭是什么关系？                                         |
| 预设与初始化   | 哪些节点只在新建或选择预设时提供？能否删除？切换预设和重置如何处理用户修改？                                                 |
| 规则执行       | 编辑器和组件库各自保证什么？重复、缺失、未知节点怎样处理？哪些可静态检查，哪些需要运行时或调用方遵守？                       |
| 编辑与代码     | 编辑器支持哪些内容？实例与生成代码是否来自同一配置？不能编辑的业务组合怎样保留，而不缩窄公共 API？                           |
| 验证与迁移     | 用哪些必要的定向检查证明契约？既有调用如何迁移？哪些行为按本轮决定保留？                                                     |

每个答案标记“已决定”“待决定”或“不适用”；不适用必须写理由。待决定项记录具体场景、问题、建议及影响范围，不能用“遵循规范”代替答案。

决策记录至少包括：问题、最终规则、依据或取舍、受影响组件、日期与状态。实现发现新问题时回写记录；相同职责的新组件先查已有决定，不重新猜测。

与本次实现有关的必答项必须明确后才能实施；新增能力仍需记录决定，不能从现有组件推导未声明的支持。完成清单不代表授权发布、部署或启动浏览器验证。

## 11. 参考

- [React：通过 children 传递 JSX](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)：内容组合的基础。
- [React：Children](https://react.dev/reference/react/Children)：children 是不透明结构，不读取业务组件内部输出来推断内容。
- [Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)：Trigger / Content 关联与复合组件结构的参考。
- [Radix Select](https://www.radix-ui.com/primitives/docs/components/select)：选择项、选中内容与焦点定位参考；不要求照搬全部底层部件为 Uagray 公共 API。

- [HTML button 内容边界](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)：按钮内部不能包含其他交互内容。
- [React Aria Button](https://react-aria.adobe.com/Button)：处理中阻止按压与悬停，同时保留焦点能力的参考。
- [aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled)：语义标记与实际事件阻止、焦点能力的区别。
- [Stately 并行状态](https://stately.ai/docs/parallel-states)：可共存的状态域与互斥子状态的区别；不意味着采用 XState 依赖。
- [uplus icon 上游仓库](https://github.com/Upper-Hank/uplus-icon)：资源接入信息以本仓库安装版本的 README、exports、类型与动态入口为核查依据。

- [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)：按钮名称、状态及焦点责任。
- [WAI-ARIA 名称与描述](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)：优先可见文字与原生关联，按实际语义节点提供名称。
