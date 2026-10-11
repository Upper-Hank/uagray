# Uagray

供其他 React 项目复用的轻量灰阶设计系统。仓库保留组件库与展示页，展示页包含规范、Token、组件预览、API 配置和用法示例。公开案例页已删除；内部产品原型随 Git 维护，仅本机运行。独立消费验证保存在本机 `local/beta-consumer/`，不纳入远端源码。

## 开发与展示

```sh
npm install
npm run dev
```

`npm run check` 检查类型与已登记的设计源码契约；`npm run build` 构建展示站到 `dist-site/`；`npm test` 运行组件、展示页与内部原型交互测试；`npm run test:lab` 只运行内部原型测试。展示页提供组件 API 配置，不提供案例链接或案例路由。

## 构建与试包

```sh
npm run build:lib
npm pack
```

组件产物位于 `dist/`，包含 ESM、类型声明、组件样式和 `fonts.css`。`.tgz` 包含组件库产物、README 和必要元数据。展示页与测试代码不进入组件包。字体是独立入口，安装体积主要来自中文分片；不引入 `fonts.css` 时浏览器不会请求这些文件。发布工作流会确认字体入口存在，并拒绝未压缩体积超过 18 MB 的包。本仓库准备发布 `0.1.0-beta.1`，预发布版本通过 `beta` 标签提供。

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

宿主覆盖主题时，请使用当前环境变量；element、action-surface、reading-surface、object-surface、selected-surface、range-fill、choice-edge、group-hover 与 feedback-*-surface 旧别名已移除。完整环境契约见 [设计参考规范](docs/design-system.md#环境与表面)。

`uagray/fonts.css` 提供界面使用的 IBM Plex Sans、IBM Plex Sans SC（400 与 500）和 JetBrains Mono（400）。组件样式不内嵌这些文件。要换字体，不要引入 `fonts.css`，并覆盖 `--ui-font` 与 `--ui-mono`。展示站使用同一份字体。当前声明支持 React 19，React 与 React DOM 由宿主提供；本项目代码采用 MIT 许可证，字体沿用各自的 SIL Open Font License。

## 文本组件

Heading、Text、TextList 与 DescriptionList 从 `uagray` 公共入口导入，配套样式在 `uagray/styles.css`。

```tsx
import { Heading, Text, TextList, DescriptionList } from "uagray";

<>
  <Heading level={1} variant="page">
    发布检查
  </Heading>
  <Text>完成检查后保留进度。</Text>
  <TextList ordered>
    <li>确认内容</li>
    <li>检查交互</li>
  </TextList>
  <DescriptionList>
    <div>
      <dt>构建方式</dt>
      <dd>React 与 Uagray</dd>
    </div>
  </DescriptionList>
</>;
```

标题层级与视觉体例独立；正文默认 14px，有背景与边距的列表默认 13px。TextList 支持 plain 正文列表，DescriptionList 支持 plain 名称—说明排列。组件不内置业务内容，保留原生语义、属性与 ref。

## 设计与来源

页面 Logo 使用 `src/assets/uagray-logo.svg` 完整字标；favicon 使用 `public/favicon.svg` 简短标记。两份 SVG 均作为展示站资产纳入仓库，不进入组件包。

设计研究最初参考 [anish’s lab](https://lab.anishfn.ink/)，不将参考站整体视觉宣称为原创。后续依据 Uagray 的设计原则和实际需求独立展开。图标采用 `@uplus-icon/react`，布局与交互动效使用 Framer Motion。

设计与开发统一以 [设计参考规范与开发指南](docs/design-system.md) 为依据；Token 与 API 文档只提供工程映射，不另设视觉规则。源码范围及构建约定见 [docs/source-boundary.md](docs/source-boundary.md)。历史研究与开发记录收在 `docs/references/history/`，不作为现行规范或功能承诺。

## 设计生成与检查

项目 Skill 保存在 `.agents/skills/`：使用 `$uagray-generate` 按统一规范生成组件或任务页面，使用 `$uagray-check` 检查实现与组合。两者引用同一份设计规范，不携带平行规则。

`npm run verify:consumer` 在临时项目中安装当前 tarball，核查按钮、字段、选择、进度、等待、模态与提示区域的类型和生产构建。它不执行浏览器交互，不证明焦点、颜色或动画已经验收。

`npm run check:design` 定向检查已登记的圆角/inset、控件外高、CSS/Motion 与状态契约；追加 `-- --json` 输出结构化结果。`npm run test:design` 验证检查器能发现几何与动效回归。它们检查源码契约，不能代替实际视觉与交互验收。

## 内部产品原型

运行 `npm run dev:lab`，默认访问 [本机原型](http://127.0.0.1:5174)，端口占用时以终端输出的 Local 地址为准。通过 `/prototypes/` 选择原型：`/` 是参考 Linear 架构的 Atlas 项目工作空间；`/anish/` 是参考 anish’s lab 目录 / 详情架构的 Fieldnotes 展厅，`/github/` 是参考 GitHub Issues 的 Forge 问题管理；`/vercel/` 是参考 Vercel 项目设置的 Launch 配置管理。四题均使用虚构内容和真实组件交互，不引入原站素材。源码随 Git 维护，不进入公开展示站或 npm 包，独立配置不提供部署构建。详见 [使用与差距记录](lab/README.md)。
