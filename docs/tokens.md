# Uagray Token 契约

视觉资源遵循 [视觉准则 v0.1](visual-language.md)：Base/Muted/White/Dark 是资源角色，Tonal/Defined/Physical 是边界处理，不构成颜色等级或递归嵌套规则。现有 raised 变量名保留兼容，其白色值不自动表示空间抬升。Fill、Border、Shadow 按职责分别判断；当前 shadow 组合值不代表永远绑定这三种资源。常驻描边只允许白底强调对象；灰底三类常态表面与 tone/组合决策见 [表面实施契约](surface-contract.md)，下表记录环境默认值，具体选择仍由任务与组合契约决定。

Token 的唯一值来源是 `src/ui/tokens.css`。基础值定义尺度，语义别名表达用途；保留现有变量名作为兼容别名。展示页 `src/token-practice.tsx` 只登记分类和变量名，读取实际 CSS 计算值，不维护第二份色值或尺寸表。

表面使用 background / surface / control / raised，浅色值为 #fbfbfb / #f2f2f2 / #ececec / #fff。surface 与 control 保留有限差异；大区域的视觉重量与控件不同，限制灰阶数量不意味着取消这种差异。dark 同样保留通用承载、独立分离表面的相对关系。颜色由当前承载关系与任务决定，不能据组件名称推断底色。

以下为 v0.1 本轮实施后的资源消费。灰环境只提供对比资源，不给子项自动增加边缘或阴影。

| 资源                                              | 浅页面 / 白容器            | 灰 Surface / Showcase                             |
| ------------------------------------------------- | -------------------------- | ------------------------------------------------- |
| element / element-hover（编辑与选择标记）         | control / control-hover    | raised / raised                                   |
| action-surface / action-surface-hover（普通动作） | control / control-hover    | raised / background                               |
| selected-surface                                  | 组件自己定义，不随环境改写 | 组件自己定义，不随环境改写                        |
| range-track / range-fill                          | 独立轨道与 filled 进度资源 | 同一资源，不翻白                                  |
| 状态 surface / text                               | tone 成对定义              | feedback-success/danger-surface 使用 on-gray 配对 |
| switch-surface / thumb                            | track / thumb              | 保持控件语义                                      |

白 Surface、Dialog、Toast、Select 菜单、代码与颜色编辑器重置编辑/动作资源，形成可预测的有限环境。Disclosure 默认共享基底，不声明新环境。共同操作组内部动作常态透明，局部反馈；选择、进度、状态和边界仍由各自组件负责。宿主背景不能自动推断职责；按实际对象声明资源，而非复制递归翻色规则。

border-soft 在满足白底强调条件时表达对象边缘，也可表达不围合控件的内容分隔；preview-border 是兼容别名。不得用于灰底或透明对象常驻轮廓。边缘与阴影服务于分离和识别，不因白底自动出现；白按钮、选中滑块、键帽和菜单保留明确的实体处理；静态 API 配置区只使用描边。Surface 的 treatment 将这些处理与 tone 分开。action / on-action、danger-action / on-danger 表达明确操作状态。Badge 当前消费状态前景与背景，Alert/Toast 当前复用中性表面；这些现状不能替代灰底中的实际辨识检查。Button 图标与文案共享 currentColor；size 不改变颜色；plain 与共同操作组的内部表面按组合职责使用。完整约束见 [设计规范](design-system.md)。

滚动条由 scrollbar-thumb / scrollbar-thumb-hover 语义色与 size-scrollbar（8px）控制，亮暗主题只切换语义色。`src/ui/scrollbars.css` 统一适配 Textarea、Dialog/Drawer 和显式添加 ui-scroll-area 的滚动容器，使用透明轨道、圆角滑块，悬停或容器内聚焦时加强滑块颜色；优先使用原生 thin 滚动条，WebKit 回退使用尺寸 Token。高对比模式保留系统滚动条颜色。展示页侧栏与主内容的隐藏滚动条规则继续独立生效，不覆盖宿主页面全部元素。

| 类别       | 基础值                                                                                                         | 语义用途                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Color      | gray-0/25/50/100/150/200/300/400/500/600/700/900                                                               | background、surface、control、text、body、muted、disabled，以及 danger/success 状态 |
| Typography | font / mono；font-size-xs/sm/control/body/md/lg/xl；font-weight-regular/medium；line-height-tight/body/relaxed | 标签与控件、正文、辅助文字、标题共享相应字号与字重                                  |
| Space      | space-0…12：0/2/4/6/8/12/16/20/24/32/40/48/64px                                                                | gap-control、gap-stack、padding-control、padding-panel                              |
| Radius     | radius-0…5：0/4/8/12/16/24px，radius-full：999px                                                               | radius-sm、radius-control、radius-card、radius-surface                              |
| Size       | control-sm/control/control-lg：32/36/44px；icon-sm/icon/icon-lg：14/18/24px；choice：18px；thumb：16px         | content：1200px；dialog：480px；drawer：440px                                       |

Space 的编号表示阶梯顺序，不表示数值必须是编号乘以 4。用于控件细节的 2px/6px 与用于区域的较大步长各有用途。尺寸变量与间距分开命名，避免一次改间距便意外改变控件高度。

嵌套组合遵循等距圆角：外圆角 = 内圆角 + 实际 inset。独立组件消费语义圆角，组合按实际轮廓用 calc() 派生，允许得到 28px 等非基础档位，不为派生尺寸新增 token。普通动作组默认 12px + 4px = 16px，小动作组及选择轨道为 8px + 4px = 12px；API 工具区为 12px + 12px = 24px；教学展示直接消费 surface 与 radius-surface，不预设内层画布。完整适用边界见 [等距圆角契约](design-system.md#等距圆角契约)。

排版保留基础尺度和语义角色，UI 字重全部统一 450。控件数值默认 control（13px）/450，状态标题默认 md（16px）/450；标签、按钮、计数、页面/弹层标题与选中目录也统一 450。font-weight-medium 保留兼容名称但引用 regular，font-weight-button 同样引用 regular。交互状态不改变字重；文本强调仅在用户明确允许的场景使用更大字重。字号、前景和布局负责必要层级，组件不各自维护字重补丁。

图标统一 DEFAULT_ICON_WEIGHT=1.25，按现有配置步长 0.25 从 1.5 降一档，继续使用官方 absoluteWeight 适配。hover、按压、选中、焦点和禁用不改变描边；图标详情页的手动 weight 配置用于显式比较，不是交互状态反馈。

Sans 与 Sans SC 当前加载 400、450、500 静态字体，常规使用官方 Text 450。中文 Text 采用 216 个官方 Unicode 分片按需加载，拉丁采用本地 WOFF2；原始文件与授权见 [字体资源](../public/fonts/ibm-plex/README.md)。已验证所有新增文件的 OS/2 字重标记为 450，不依靠浏览器合成或匹配 500。缺失的其他字重仍按 [浏览器匹配规则](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight) 处理。

当前 Button、输入、Tabs、折叠、选择、反馈及新展示布局中的常用字号、间距、圆角和控件高度已消费这些变量。对图标尺寸，`Icon size` 仍是显式接口；几何定位、原生滑块命中范围、弹层定位等必要细节不机械抽成 token。Button、ButtonGroup、Segmented、SearchField、SelectionBar 与 Toast 的 Motion 圆角样式引用 CSS 变量，不再维护独立数值；组合圆角通过现有 Radius 与 Space 的 calc() 派生。布局动画中的实际轮廓仍需视觉验收。

```css
.my-panel {
  padding: var(--ui-padding-panel);
  gap: var(--ui-gap-stack);
  border-radius: var(--ui-radius-surface);
  background: var(--ui-surface);
  font-size: var(--ui-font-size-body);
  line-height: var(--ui-line-height-body);
}
```

展示页保留「规范 / Token / 组件」，采用左侧条目目录、右侧实践与用法。Token 展示颜色、排版、间距、圆角和尺寸的直观样例，复制的是 `var(--ui-...)`，便于实际消费。已有阴影与动效变量继续服务组件，本轮不作为新的 Token 目录分类。

参考：[Spectrum Token 分类](https://spectrum.adobe.com/foundations/design-data/design-tokens)与[语义间距](https://spectrum.adobe.com/foundations/layout-and-structure/spacing/component-spacing)。本项目继续使用 CSS 变量，不增加 Token 构建工具或多层组件变量体系。

## 展示页滚动与控件尺寸

展示页采用固定视口工作区：页头固定，目录和右侧实践区各自滚动，隐藏滚动条但保留滚轮、触控及键盘访问。切换条目只重置右侧滚动位置，切换分类重置目录位置。移动端上下排列，两区仍独立滚动。

SearchField 的高度与最小高度均为 `--ui-size-control`（默认 36px），保证它在纵向 flex 布局中不会被长目录压缩。目录自身通过 `min-height: 0`、flex 与 overflow 承担滚动，Token 和组件使用同一个 SearchField 尺寸契约，不按分类覆盖高度。

展示站不渲染页脚、目录解释段落、重复分类标签和实践提示文案。PageShell 只在调用方提供 footer 时渲染页脚，不再附加库名、年份或口号；新增 className 用于宿主定义页面布局。

## 亮暗主题

组件样式通过语义变量适配亮暗：`--ui-raised` 是现有内容/选中表面的兼容变量名，不自动表示空间抬升；`--ui-action`、`--ui-on-action` 表示强调操作与其文字，danger-action 与 danger 反馈文字分开。基础灰阶和 `--ui-white` 保持原始颜色，不将整个色阶反转。暗色覆盖页面、内容、控件、文字、成功/危险状态、阴影、遮罩和焦点。

库使用 `html[data-theme="dark"]` 启用暗色，默认浅色；`color-scheme` 同步原生控件。主题属性设在根元素，使 Portal 菜单也继承同一组变量。宿主控制此属性，不要求主题 Provider。

展示站右上角的日/月按钮负责主题偏好：没有手动选择时跟随系统变化，切换后保存 `uagray-theme` 并停止跟随；存储不可用仍可在当前页面切换。首次渲染前应用主题，Token 展示监听根主题变化并重新读取实际 CSS 值。未增加主题切换时的全局颜色动画，避免干扰按钮 hover。

定向测试覆盖系统偏好、手动覆盖、偏好恢复和存储受限场景；浏览器视觉和主题下的完整可访问性尚未验收。

教学示例与组件预览直接使用灰色展示承载，不默认套白底描边画布；独立编辑画布按实际任务决定表面与边界。输入的 Tab 提示使用 focus-outline；普通输入不启用外圈。这些语义值均随亮暗主题变化。详情配置契约见 [playground.md](playground.md)。

0.5 恢复 surface=#f2f2f2，撤销上一轮 surface/control 合并。ButtonGroup plain 和 SelectionBar plain 保留功能分组而不消费独立底色。选择使用局部范围，状态文字不强制使用 Badge；规则页以文字与演示共同说明这些关系。

### 组合中的 Space 消费职责

padding-control 属于控件内容/命中范围，padding-panel 属于区域；容器 inset、组内 gap、组间间距不能互相替代。组合实际外缘包含容器与首尾子项留白，实际内容间距包含 gap 与相邻子项留白。引用同一尺度不保证实际对称，尤其是裸图标、说明文字和有 padding 的按钮混排时。

不因 plain 变体取消几何，不把小 inset 当作工具栏通用值，不为某个首尾图标新增专用间距 Token。先确定组合单元和留白责任，再消费现有尺度；相同契约覆盖不同内容与尺寸。详见设计规范的“组合留白契约”。

工具行落实上述职责：共同底座 inset 使用 space-2，信息、字段与普通动作单元横向内容留白使用 padding-control，单元间距使用 gap-control。通过 ui-toolbar-row / ui-toolbar-info / ui-toolbar-field 明确消费位置；不改变独立按钮的留白，也不把工具行契约推广为所有容器的 padding。API 配置白工具区外缘使用 space-5，浅灰参数单元内侧使用 padding-control，参数名与控件间和单元之间使用 gap-control；单元最小高度使用 size-control-lg。配置形成等宽列，内部输入透明，长文本按需展开。

胶囊选择器是表面继承的明确例外：选择底座直接消费 control、选中滑块直接消费 raised，Tabs 与 Segmented 共用这些值，不消费随父级翻转的 selected-surface。ui-tool-surface 按控件圆角与 space-2 推导紧凑工具圆角；API 的 space-5 留白由宿主推导对应外圆角。独立悬浮工具通过 Surface treatment="physical" 消费 shadow；静态配置采用 defined 描边，普通动作不因承载颜色获得阴影。edge 与 elevation 分开定义，shadow 是 Physical 组合的便利值。

轻量文字 muted 浅色使用 #696969，焦点消费相同角色；用于浅灰控件上的小字辨识，不改变文字重量。普通操作前景为 #404040，hover 为 #171717。

案例阅读角色新增 font-size-reading-title（22px）、font-size-reading-lead（15px）与 line-height-reading（1.625）。正文继续消费 body（14px），信息列表消费 control（13px），图注消费 sm（12px）。主标题与小节/简介独立分配，不修改通用 xl 尺度或控件字号。

### 灰环境反馈与对象资源

reading-surface 在浅页面使用 surface，在灰承载中使用 control。feedback-success/danger-surface 在灰环境引用 success/danger-surface-on-gray，浅色分别为 #e0e9e2 / #f0dddd，深色分别为 #2c4032 / #482e2e；语义前景保持对应 tone。Badge variant 可按职责显式采用 plain 或 white。object-surface 供独立展示/导航对象在灰环境使用 raised，白环境使用 surface。已撤销 selector-tool-surface/inset 与自动工具外壳；选择轨道直接使用 control，与外灰 surface 保持深一级对比，选中块使用 raised。以上新增值尚未完成实际视觉校准。
