# 参考站直接核查记录

核查日期：2026-10-09。来源：[anish’s lab](https://lab.anishfn.ink/)。

这是参考实践的证据记录，不是 Uagray 的规范，也不是原作者设计意图的声明。经用户授权，直接读取页面 DOM、计算样式、公开样式声明，并操作搜索、分段切换、颜色浮层、菜单和展开按钮。没有复制作品、图标路径或页面代码到组件库。

证据标记：**测量**为计算样式/DOM；**声明**为页面使用的 CSS 类和样式规则；**操作**为操作后验证的状态；**用户观察**为此前用户提供的数据。hover 的主要证据是样式声明，不能把它说成逐帧鼠标测量。布局移动、按压动画的完整时间曲线尚未测定。

## 覆盖范围

首页以及全部 10 个首页入口均已访问、清点控件：

| 页面 | 本轮核查对象 |
| --- | --- |
| [首页](https://lab.anishfn.ink/) | Segmented、搜索、快捷键、清除搜索、外链组、作品卡片 |
| [Action camera](https://lab.anishfn.ink/action-camera) | 白工具条、Share、翻页组、正文、图组、资料行、导航卡片 |
| [Handdrawn frames](https://lab.anishfn.ink/handdrawn-frames) | 缩略图选择、色板、颜色浮层、缩放滑块、工具条 |
| [My icons](https://lab.anishfn.ink/my-icons) | 展开内容、复制/展开按钮、末尾不可用箭头 |
| [Folder maker](https://lab.anishfn.ink/folder-maker) | 文件入口、白工具条、深色动作、禁用样式、展示列表 |
| [Dia gradient](https://lab.anishfn.ink/dia-gradient) | 色板选择、计数加减、禁用样式 |
| [Pixel art 3D](https://lab.anishfn.ink/pixel-art) | 工具选择、禁用动作、网格尺寸菜单、色板 |
| [Morfe card](https://lab.anishfn.ink/morfe-card) | 缩略图选择与文本动作共用白工具条 |
| [Video cube](https://lab.anishfn.ink/video-cube) | 色板、持续开关状态、播放按钮、滑块 |
| [Axolotl pond](https://lab.anishfn.ink/axolotl-pond) | 详情架构、起始分页状态 |
| [Knob HUD](https://lab.anishfn.ink/knob-hud) | 圆形操作按钮与作品内拟物按钮的区别 |

清点不等于穷尽所有作品内部状态。未触发上传、分享、下载、麦克风，也未完整运行作品内业务流程。HUD 含独立材质和动态按钮状态，不能用默认一次测量替代所有状态。

## 01 公共颜色与边缘

根节点计算变量：页面 `#FBFBFB`；表面 `#F2F2F2`，表面 hover `#E8E8E8`；控件底座 `#ECECEC`，控件 hover `#E4E4E4`；焦点色 `#171717`。

文本并非只有两档：neutral-900 `#171717`，neutral-700 `#404040`，neutral-600 `#525252`，neutral-500 `#737373`，neutral-400 `#A1A1A1`，neutral-300 `#D4D4D4`。现代浏览器计算样式也可能返回等价的 lab 色值。少数语义角色复用这些值，不意味着每一档都应该成为 Uagray 的公开 API。

白色滑块、快捷键、工具条、展开文本容器复用 `shadow-surface`。其可见细边缘不是 CSS border，而是阴影的一部分：

```css
0 0 0 1px rgb(0 0 0 / 6%),
0 1px 2px -1px rgb(0 0 0 / 6%),
0 2px 4px rgb(0 0 0 / 4%)
```

颜色浮层使用另一套较强阴影：1px/6% 黑色边缘、`0 4px 8px -2px`/6%、`0 12px 24px -4px`/8%。因此普通白表面与真正浮层有层级差异。技术上 border 为零，不代表视觉上没有描边；核对规范要看可见边缘。

## 02 Segmented

证据：首页 `[role="radiogroup"]`、`[role="radio"]` 和选中项子 span。

| 对象 | 测量/声明 |
| --- | --- |
| 底座 | #ECECEC，36px 高，4px 内边距，2px 项间距，12px 圆角 |
| 项 | 28px 高，左右 10px，8px 圆角，透明底色 |
| 标签 | 13px/19.5px，400；常态 #525252，hover/选中 #171717 |
| 计数 | 11px，固定 #525252，tabular numbers；与标签分离着色 |
| 当前项 | 独立白色子层，8px 圆角，公共轻阴影；按钮自己不铺白底 |
| 颜色过渡 | 150ms，cubic-bezier(.4,0,.2,1)，color/opacity |

操作 Components → All：checked 状态与独立白色子层随当前项改变，计数保留自己的颜色声明。输入搜索后计数会更新，零结果分类成为 disabled；disabled 样式为 opacity .4。这与“hover/选中不改变计数颜色”不是同一个问题。

用户观察补充：滑块移动和变宽平滑、无回弹；hover/点击已选项无额外反馈；hover 进入退出均短暂渐变。滑块移动的具体 duration/easing 尚未测定，不能用标签的 150ms 代替。

## 03 Share 与箭头组

证据：Action camera 的 Share button、`nav[aria-label="Pieces"]` 和内部链接。

| 对象 | 常态 | hover 声明 | 尺寸 |
| --- | --- | --- | --- |
| Share | #ECECEC / #404040 | #E4E4E4 / #171717 | 高 36px、圆角 12px；文本 13px/400 |
| 翻页组 | #ECECEC | 整体不改变 | 高 36px、圆角 12px、内边距 3px、gap 4px |
| 内部箭头 | 透明 / #404040 | 黑色 6% 覆盖 / #171717 | 30px 方形、圆角 9px |

箭头 hover 约呈 #DEDEDE，但实际声明是透明黑色叠加，不是固定灰值。常态子按钮没有自己的底块。二者颜色过渡均为 150ms，默认曲线 cubic-bezier(.4,0,.2,1)。箭头未声明 active 缩放；Share 点击缩放来自用户观察，本轮未测出其比例或曲线。

My icons 末尾不可用箭头：30px 静态 span，neutral-400，非链接，没有 hover 类。原站并非保留一个 disabled button。外链组则另有 active scale .96，过渡采用 ease-out；不能把它推广给翻页箭头。

## 04 搜索与焦点

证据：首页 input 及其 label、kbd、Clear search button。

- 搜索底座也是 36px 高、12px 圆角、#ECECEC；左右内边距为 14px/6px。
- 输入 14px/21px、400，透明背景；内容 #171717，placeholder #525252。图标常态 #737373，focus-within 时 #171717。
- 白快捷键是 kbd，不是 button：高 24px、圆角 6px、Mono 12px/500、#737373，公共轻阴影。
- 输入 camera 后出现 Clear search；搜索结果缩为一个，分类计数更新；清除后恢复全部结果。清除按钮 24px 方形，圆角 6px，常态透明/#737373，hover 黑色 6%/#171717。
- 原站 field-focus 使用 **focus-within**：2px/50% 的 #171717 外圈，再加 5px/5% 黑色外层。实际输入后已读到该阴影，并非仅 Tab 显示；过渡为 200ms ease-out。
- 通用 focus-ring 则使用 **focus-visible**：2px outline、offset 2px。两个焦点机制并不相同。

这与用户已确定的 Uagray“仅 Tab 定位显示轻提示”不同；原站事实不能覆盖该决定。快捷键与清除按钮的退出动画关系、快捷键可见性完整时序未逐帧测量。

## 05 白色工具条与预览选择

相机、相框、渐变、卡片、视频与文件案例重复出现：白底、16px 外圆角、6px 内边距、公共轻阴影。典型内部动作高 36px、10px 内圆角，常态透明，hover 使用 4% 或 5% 黑色覆盖；整组高度通常 48px。部分容器查询将内部控件降为 32px，并非全站固定尺寸。

预览/色板选择使用独立 **2px #171717 选中轮廓**，过渡 opacity 150ms，保留预览内容原色；它与 Segmented 的白色指示器是两种选中表达。色块本身另有轻微 inset 边缘。

Video cube 的 Float 持续开启状态反而使用黑色 6% 背景和深色文字。不能宣称原站完全没有组内灰底；准确说法是常态多数透明，少数状态有局部职责。

普通工具动作多为 13px/400，但 Morfe card 的 Turn over 是 14px/500。Folder maker 的主要动作是深底白字，禁用后浅灰底白字；加减按钮的禁用态则是浅色前景、禁止 hover 铺底。原站自身存在差异，是否保留需要后续讨论。

## 06 浮层、滑块和展开内容

- 相框 Custom ink：实际操作打开 dialog。白浮层宽 212px、圆角 16px、内边距 12px、间距 12px；饱和度/亮度区 188×124px，Hue 条 188×12px，下方仅 HEX。它不包含 Figma 那种完整多格式/透明度配置，不能拿它替代用户对 ColorPicker 的功能需求。
- Pixel art 网格菜单：实际操作打开 menu。白底宽 144px、圆角 14px、padding 4px、gap 2px、浮层阴影；选项高 32px、圆角 10px、文本 13px，hover 黑色 5% 与深色文字；选中用勾选标识。
- 相框 Zoom：slider 热区 80×24px，视觉轨道仅 4px 高，两端留 6px；轨道 #E5E5E5，已填充 #171717，白色圆拇指 14px，带细边缘与阴影。不能把轨道高度当点击区域高度。
- My icons：白展开文本容器有公共轻阴影；复制/展开按钮用 #F2F2F2，hover #E8E8E8，32px 高、8px 圆角、12px/400；正文 Mono 12px/21.6px。操作展开后按钮变为 Show less 且 aria-expanded=true。不是所有辅助按钮都使用 #ECECEC。

## 07 页面架构与文字层级

Action camera 测量：页面背景 #FBFBFB；main 最大宽度 1800px，响应式水平 padding 16/24/40px。作品承载区、阅读文字、辅助图组、资料行、前后导航是不同区域，正文不套额外卡片。

标题 22px/500；小节标题 15px/500；简介 15px/24.375px/400，正文 14px/22.75px/400；文本限制 68ch。导航卡片 #F2F2F2、16px 圆角、16px padding，不带公共阴影；资料行以 6% 黑色分隔线建立行关系。

首页作品区域 24px 圆角、#F2F2F2；其作品内容、拟物遥控器和插画拥有自己的视觉语言，不应抽成通用控件规范。HUD 默认圆形控件实测 76px，复用白底公共轻阴影；其他动态状态未穷尽。

## 本轮可讨论的提炼，而非采用决定

1. **先决定哪一层承担边界。** 共用底座之后，内部常态通常不再重复铺底；hover/选中只新增必要局部差异。
2. **白色不是固定状态。** 它承担选中、工具组、内容、浮层等不同职责；边缘强弱与所在关系有关。
3. **状态反馈分开设计。** 文字变化、局部背景、移动指示器、选中轮廓、焦点和按压没有统一打包出现。
4. **少量共享关系比全局单值更关键。** 外内圆角、内边距、共用外部高度、标签与辅助计数的对比共同建立秩序。
5. **参考也有例外。** 字号、字重、focus-within、深色禁用动作、持续开启底块需要独立评判，不直接照搬。

待后续研究：移动与按压动画精确参数、减少动态效果覆盖、键盘完整路径、所有触发后业务状态。当前没有证据就不宣称已经确认。
