# Uagray

供其他 React 项目复用的轻量灰阶设计系统。仓库保留组件库与展示页，展示页包含规范、Token、组件预览和用法示例。尚未完成的案例与 API 调试配置保存在本机 `local/site/`，不纳入远端最新源码。

## 开发与展示

```sh
npm install
npm run dev
```

`npm run check` 检查类型；`npm run build` 构建展示站到 `dist-site/`；`npm test` 运行组件与展示页交互测试。展示页不提供案例链接、案例路由或 API 属性调试面板，组件自身交互保持可用。

## 构建与试包

```sh
npm run build:lib
npm pack
```

组件产物位于 `dist/`，包含 ESM、类型声明和独立 CSS；`.tgz` 只包含组件库产物、README 和必要元数据。展示页、字体及测试代码不进入组件包。当前保留 `private: true`，尚未发布 npm。

## 使用

在消费项目安装生成的 `.tgz` 后：

```tsx
import { Button, Surface } from "uagray";
import "uagray/styles.css";

<Surface>
  <Button onClick={handleShare}>Share</Button>
</Surface>;
```

包内字体使用系统回退，宿主可通过 `--ui-font` 和 `--ui-mono` 指定字体，不要求提供 `/fonts/`。展示站单独加载 `public/fonts/`，字体许可证随文件保留。当前声明支持 React 19，React 与 React DOM 由宿主提供；正式发布许可证仍需确定。

## 设计与来源

页面 Logo 使用 `src/assets/uagray-logo.svg` 完整字标；favicon 使用 `public/favicon.svg` 简短标记。两份 SVG 均作为展示站资产纳入仓库，不进入组件包。

设计研究最初参考 [anish’s lab](https://lab.anishfn.ink/)，不将参考站整体视觉宣称为原创。后续依据 Uagray 的设计原则和实际需求独立展开。图标采用 `@uplus-icon/react`，布局与交互动效使用 Framer Motion。

视觉准则见 [docs/visual-language.md](docs/visual-language.md)，组件契约见 [docs/design-system.md](docs/design-system.md)，Token 契约见 [docs/tokens.md](docs/tokens.md)。源码范围及构建约定见 [docs/source-boundary.md](docs/source-boundary.md)。历史展示与案例文档是开发记录，不代表相关功能已对外开放。
