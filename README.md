# Uagray

供其他项目复用的轻量灰阶设计系统。核心是简洁的组件接口、统一的视觉气质和按实际需求扩充的组件。当前包含 37 个组件条目、8 组规范与 Token，以及 4 个独立案例页面（含索引）。设计研究参考 anish’s lab。

```sh
npm install
npm run dev
```

- `npm run format`：格式化源码与规范
- `npm run check`：TypeScript 检查
- `npm test`：定向交互测试
- `npm run build`：生产构建

视觉方向见 [视觉语言与组件设计准则 v0.1](docs/visual-language.md)，具体行为与组合要求见 [组件与组合契约](docs/design-system.md)。核心准则为 P01–P10，新增外观须先证明必要性并经过组合验证。全站本轮实施与 Surface API 迁移见 [打磨记录](docs/visual-polish.md)。

## 项目定位

`src/ui` 是组件库，展示页用于查看组件状态与交互。优先维护组件复用能力和视觉一致性，扩充顺序见 [组件演进规则](docs/component-roadmap.md)。当前交付为源码组件库，尚未提供独立 npm 发布产物。架构要求与当前缺口见 [架构评估](docs/architecture.md)。

Uagray 的后续组件以自身的设计原则与实际需求独立展开。参考站是最初的研究来源，复刻其页面或固定组件清单不再是目标。

## 使用

从 `src/ui` 导入组件；组件入口自动加载 tokens 与组件样式。应用需设置 `font-family: var(--ui-font)` 和页面背景。字体默认由 `/fonts/` 提供，移植时复制 `public/fonts` 或更换字体变量。

```tsx
import { Button, Surface, SegmentedControl } from "./ui";

<Surface>
  <Button icon="share" onClick={handleShare}>
    Share
  </Button>
</Surface>;
```

详细规则见 [docs/design-system.md](docs/design-system.md)。组件源码与样式位于 `src/ui/`，展示页独立位于 `src/App.tsx` 和 `src/app.css`。筛选、搜索、复制、展开与 hash 详情导航均可用。

## 来源与精度

色值、字体、尺寸、圆角和白色表面阴影依据原站公开 CSS；图标使用与 uplus-ui 相同版本的 `@uplus-icon/react@0.1.0-beta.0`，已移除原站 SVG 路径与标识。展示页文案与示例布局为本项目编写，未复制原站展示作品。布局、选中层与折叠使用 Framer Motion，遵循 Uagray 的 240ms 缓出规则；未复刻原站全部弹簧与跨页 morph 效果。

未使用浏览器验收 Uagray 的视觉与动态体验；后续不以一比一复刻原站为目标。字体采用 SIL OFL，许可证随文件保存在 `public/fonts/`。

## 设计来源与使用边界

灰阶表面、控件比例与留白的设计研究参考 [anish’s lab](https://lab.anishfn.ink/)，原作者为 Anish。组件逻辑与展示页代码由本项目编写，图标来自 Uplus Icon。当前版本仍保留较接近参考站的控件外观；替换图标和署名不意味着已经获得原作的使用授权，也不将整套视觉宣称为原创。对外作为独立产品发布前，应继续发展自己的页面编排、比例和品牌表达；如需沿用对方独特的视觉组合，应联系作者明确许可。

## 本轮组件扩充

新增 21 个导出：Layout、Field/Input/Textarea/Select、Checkbox/Radio/Switch/Slider、Tabs/Disclosure、Dialog/Drawer/ConfirmDialog、Badge/Alert/Toast/Progress/EmptyState、FileDropzone、SelectionBar。根据 uplus-icon 和 my-font 的实际需求提炼，组件不绑定业务请求与路由。清单、属性及动效边界见 [需求驱动组件批次](docs/component-batch.md)。

展示页采用左目录、右实践；Token 包含颜色、排版、间距、圆角与尺寸，见 [Token 契约](docs/tokens.md)。Select 采用无样式 Radix Select，值变更使用 onValueChange；Slider 支持 track / filled 两种样式。

组件详情提供单件实践与基础 API 配置，配置同步更新实例和用法代码。实践画布使用描边和主题表面；字段仅 Tab 定位时显示轻量外圈。规则见 [实践与 API 配置](docs/playground.md)。

设计规则见 [设计与组件契约](docs/design-system.md)，原始截图与核对重点见 [本地参考档案](docs/references/anish-lab/README.md)。参考图片仅用于研究，不进入展示页或组件发布资产。

第一批组合案例与 ColorPicker 契约见 [案例测试说明](docs/cases.md)，从展示站「案例」链接进入独立索引、参考详情架构、编辑工作台与虚拟 SaaS。

当前 API 的逐项审计与待确认契约见 [API 规范草案](docs/api-contract.md)，覆盖全部组件条目、展示配置及生成用法；草案中的建议尚未全部实施。
