# Uagray

供其他 React 项目复用的轻量灰阶设计系统。远端源码以 `src/ui/` 组件、样式、Token 和组件交互测试为核心。尚未完成的展示页、API 配置演示、代码生成与案例页保存在本机 `local/site/`，不纳入 Git 或 npm 包。

## 构建与试包

```sh
npm install
npm run check
npm run build
npm pack
```

`build` 生成 ESM、类型声明和独立 CSS；`npm pack` 生成可安装的本地 `.tgz`。当前保留 `private: true`，尚未发布 npm。包清单只包含 `dist/`、README 和 npm 必要元数据。组件测试可用 `npm test` 运行，不包含本地页面测试。

## 使用

在消费项目安装生成的 `.tgz` 后：

```tsx
import { Button, Surface } from "uagray";
import "uagray/styles.css";

<Surface>
  <Button onClick={handleShare}>Share</Button>
</Surface>;
```

字体使用系统回退，宿主可通过 `--ui-font` 和 `--ui-mono` 指定字体。包不要求宿主提供 `/fonts/`。当前声明支持 React 19，React 与 React DOM 由宿主提供；正式发布许可证仍需确定。

## 设计与来源

设计研究最初参考 [anish’s lab](https://lab.anishfn.ink/)，不将参考站整体视觉宣称为原创。后续依据 Uagray 的设计原则和实际需求独立展开。图标采用 `@uplus-icon/react`，布局与交互动效使用 Framer Motion。

视觉准则见 [docs/visual-language.md](docs/visual-language.md)，组件契约见 [docs/design-system.md](docs/design-system.md)，Token 契约见 [docs/tokens.md](docs/tokens.md)。`docs/` 中历史展示与案例说明是开发记录，不代表相关页面已对外提供。推送边界及历史说明见 [docs/source-boundary.md](docs/source-boundary.md)。
