# 参考站公开实现核查

日期：2026-10-09。用户要求进一步确认原站是否有基础 Token、如何实现。

## 证据范围

本轮实际读取页面 HTML、公开 CSS 和页面引用的 JavaScript 构建产物。它们包含可辨认的组件逻辑和共享模块导出，但仍是压缩后的部署代码，不是原始 Git 仓库。已检查的脚本没有 sourceMappingURL；没有据此猜测源码文件名或完整目录结构。

公开资源：

- [全站 CSS](https://lab.anishfn.ink/_next/static/immutable/chunks/41bcl9a6pjwwe.css)
- [首页组件逻辑](https://lab.anishfn.ink/_next/static/immutable/chunks/0e995_m1xzt4w.js)
- [包含共享动画导出的脚本](https://lab.anishfn.ink/_next/static/immutable/chunks/00l1dyp9sxr9j.js)
- [共享页面框架等代码](https://lab.anishfn.ink/_next/static/immutable/chunks/04pd7-l45y84x.js)
- [详情页框架和 Share 等逻辑](https://lab.anishfn.ink/_next/static/immutable/chunks/1mkz3uvm41mp3.js)
- [颜色浮层等逻辑](https://lab.anishfn.ink/_next/static/immutable/chunks/168_2epl1774q.js)

资源路径随部署可能改变。原始下载仅用于临时检查，没有将参考站构建代码加入 Uagray 产品。以下记录可定位的关键符号与测量，结合 [直接核查记录](reference-inspection.md) 使用。

## 01 确实存在基础 Token

CSS :root 明确定义：

| 变量 | 值 | 作用 |
| --- | --- | --- |
| --background | #FBFBFB | 页面背景 |
| --foreground | #707070 | 基础前景 |
| --surface | #F2F2F2 | 内容/作品表面 |
| --surface-hover | #E8E8E8 | 表面反馈 |
| --control | #ECECEC | 控件底座 |
| --control-hover | #E4E4E4 | 控件反馈 |
| --chip | #E4E4E4 | 小标签底色，与 hover 同值但角色不同 |
| --focus | #171717 | 焦点 |

另外包含 neutral-200 至 neutral-950 的基础灰阶、白/黑、字体、spacing、normal/medium 字重、行高、默认过渡等变量。`--spacing` 为 .25rem。

部署 CSS 有 Tailwind 的 theme/base/utilities 分层及工具变量。bg-control 直接读取 --control；bg-chip 读取 --chip；bg-surface 读取 --surface；部分 --color-* 别名连接语义变量。说明它采用“基础尺度 + 少量语义角色 + 工具类消费”的组织方式。没有证据证明这些基础尺度全由作者自行设计。

不是所有值都经过 Token：组件中仍直接使用 12/8/16px 圆角、13/11px 字号、30px 图标按钮等任意值。不能将它描述为完全 Token 化的组件库。

## 02 边缘与阴影按组合复用

`shadow-surface` 为共享轻阴影，包含 1px/6% 黑色外缘及两层轻阴影；白色快捷键、选中滑块、工具条、展开内容共用它。

`shadow-popover` 工具类是更强的浮层阴影：同样的细边缘，但扩散到 4px/8px 和 12px/24px 两层。部署 CSS 未显示一个同名的根节点 --shadow-popover 变量，不能将工具类和根 Token 混为一谈。

组内 hover 常写黑色 4%/5%/6% 覆盖，直接与所在白色或灰色底座合成；并非每一种合成结果都有独立灰色 Token。选中预览使用 neutral-900 的 2px ring，是另一种边缘语义。

## 03 存在共享动画配置

构建模块导出 easeOut、press、iconSwap、rise、riseGroup、riseIn、riseItem，消费位置明确可见。

| 配置 | 公开实现 |
| --- | --- |
| easeOut | [.23, 1, .32, 1] |
| press | scale .96 |
| iconSwap | opacity、scale .25→1、blur 4→0；spring duration .3、bounce 0 |
| rise / riseIn | y 12→0、blur 6→0、opacity 0→1；duration .55 |
| riseGroup | 上述进入效果，加 stagger .04、delayChildren .06 |
| riseItem | y 10→0、blur 4→0、opacity 0→1；duration .5 |

颜色 feedback 留给 CSS，常用 150ms。移动、进入/退出、按压、图标替换使用 Motion 的 motion 元素和 AnimatePresence。模块使用 useReducedMotion 的位置也存在，但不能因此认定全站每个动画都完整适配减少动态效果。

## 04 Segmented 的关键实现

首页分段函数是专门的分类控件，value/onChange/counts 驱动；没有发现它在该产物中作为通用 Segmented 导出。

- 各项是原生 button，radio 角色、aria-checked、roving tabIndex；方向键跳过不可用分类并切换、聚焦。
- 根据 value 只在选中项渲染白色 motion.span；共享 layoutId 与组件 useId 关联。
- 滑块 transition 明确为 spring、duration .35、bounce 0。因此“使用 spring”不等于视觉回弹，用户观察的无回弹与源码一致。
- 标签 color 用 CSS 150ms；计数自己保持 neutral-600。计数内容变化另外使用 AnimatePresence：进入 y 6→0/blur 2→0，200ms；退出 y -6/blur 2，100ms。
- 与标签不同，白色指示器仅由当前 value 决定，hover 不触发它移动。

这补齐上一轮“滑块动画参数未知”的记录。350ms 不能拿来替代文字的 150ms，计数更新动画也不能误认为计数 hover 变色。

## 05 搜索与 Share 的实现

搜索的 query 和 focus 是独立 React state。无内容且未聚焦时显示 kbd；聚焦但空内容时不显示 kbd；有内容时显示清除按钮。kbd/清除使用 AnimatePresence + iconSwap。清除按钮 pointerdown preventDefault 保留输入焦点，点击清空后显式 focus；Escape 清空并 blur。快捷键监听 / 和 Cmd/Ctrl+K。

Share 使用 motion.button，whileTap 消费共享 press，即 .96。颜色反馈仍用 CSS。成功后以 iconSwap 替换图标并改变文案，定时恢复。翻页是链接，不使用这一 whileTap。

## 06 复用发生在哪些层

构建导出可辨认 PiecePage、Brand、Footer、IconLinks、SkipLink、container/headerClass 等共享组织。PiecePage 接收 slug/info/children，集中组织作品区、标题、动作、说明、前后导航；各作品将自己的交互作为 children 传入。存在页面过渡、相邻作品预加载与键盘导航处理。

这是有共享基础的实际项目，而不是每页完全独立画一遍；但同时有页面专用分类控件、硬编码尺寸和作品专属视觉。部署代码不足以证明它拥有我们需要的发布 API、组件契约和完整 Token 文档。

## 与规范讨论的关系

值得继续研究的是：语义颜色少而明确；边缘组合可复用；同组常态减少重复填色；CSS 颜色反馈与布局动画分工；状态由组件逻辑决定，而非任意叠加样式。

这些是从公开实现中提炼的组织方式。是否采用各色值、尺寸、焦点、阴影、动画仍由后续讨论决定；本轮未改 Uagray 实现。
