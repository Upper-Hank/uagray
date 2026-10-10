# Uagray

供其他 React 项目复用的轻量灰阶设计系统。仓库保留组件库与展示页，展示页包含规范、Token、组件预览、API 配置和用法示例。案例页已删除。独立消费验证保存在本机 `local/beta-consumer/`，不纳入远端源码。

## 开发与展示

```sh
npm install
npm run dev
```

`npm run check` 检查类型；`npm run build` 构建展示站到 `dist-site/`；`npm test` 运行组件与展示页交互测试。展示页提供组件 API 配置，不提供案例链接或案例路由。

## 构建与试包

```sh
npm run build:lib
npm pack
```

组件产物位于 `dist/`，包含 ESM、类型声明和独立 CSS；`.tgz` 只包含组件库产物、README 和必要元数据。展示页、字体及测试代码不进入组件包。本仓库准备发布 `0.1.0-beta.1`，预发布版本通过 `beta` 标签提供。

## 使用

安装 beta 包：

```sh
npm install uagray@beta
```

使用：

```tsx
import { Button, Surface } from "uagray";
import "uagray/styles.css";
import "uagray/fonts.css";

<Surface>
  <Button onClick={handleShare}>Share</Button>
</Surface>;
```

Button 使用 `emphasis="strong | default | quiet"` 与 `tone="neutral | danger"` 表达动作意图，默认是 default / neutral。颜色由页面、Surface 或白色层环境提供。旧 `variant` 已弃用但仍兼容：soft / white → default，plain → quiet，dark → strong，danger → strong + danger；显式新属性优先。迁移后 white 不再保证白底。

宿主覆盖主题时，请使用当前环境变量；element、action-surface、reading-surface、object-surface、selected-surface、range-fill、choice-edge、group-hover 与 feedback-*-surface 旧别名已移除。完整环境契约见 [docs/surface-contract.md](docs/surface-contract.md)。

`uagray/fonts.css` 提供界面使用的 IBM Plex Sans、IBM Plex Sans SC（400 与 500）和 JetBrains Mono（400）。组件样式不内嵌这些文件。要换字体，不要引入 `fonts.css`，并覆盖 `--ui-font` 与 `--ui-mono`。展示站使用同一份字体。当前声明支持 React 19，React 与 React DOM 由宿主提供；本项目代码采用 MIT 许可证，字体沿用各自的 SIL Open Font License。

## 设计与来源

页面 Logo 使用 `src/assets/uagray-logo.svg` 完整字标；favicon 使用 `public/favicon.svg` 简短标记。两份 SVG 均作为展示站资产纳入仓库，不进入组件包。

设计研究最初参考 [anish’s lab](https://lab.anishfn.ink/)，不将参考站整体视觉宣称为原创。后续依据 Uagray 的设计原则和实际需求独立展开。图标采用 `@uplus-icon/react`，布局与交互动效使用 Framer Motion。

视觉准则见 [docs/visual-language.md](docs/visual-language.md)，组件契约见 [docs/design-system.md](docs/design-system.md)，Token 契约见 [docs/tokens.md](docs/tokens.md)。源码范围及构建约定见 [docs/source-boundary.md](docs/source-boundary.md)。历史展示与案例文档是开发记录，不代表相关功能已对外开放。
